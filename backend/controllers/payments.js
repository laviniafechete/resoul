const { getStripe } = require("../config/stripe");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
require("dotenv").config();

const User = require("../models/user");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const {
  sanitizeCourseForUser,
  computeCoursePricing,
  getUserContextFromRequest,
} = require("../utils/pricing");

const { default: mongoose } = require("mongoose");
const { randomUUID } = require("crypto");

// ================ create Stripe Checkout Session ================
exports.capturePayment = async (req, res) => {
  // extract courseIds & userId
  const { coursesId } = req.body;
  if (!Array.isArray(coursesId) || coursesId.length === 0) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please provide at least one courseId",
      });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: missing user" });
  }

  // Preload all courses in one query
  let courses;
  try {
    courses = await Course.find({ _id: { $in: coursesId } })
      .populate({
        path: "courseContent",
        select: "subSection",
        populate: {
          path: "subSection",
          select: "pricingRules",
        },
      })
      .exec();
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching courses",
        error: error.message,
      });
  }
  if (courses.length !== coursesId.length) {
    return res
      .status(404)
      .json({ success: false, message: "One or more courses were not found" });
  }
  const context = getUserContextFromRequest(req);

  const paidCourses = [];
  const freeCourses = [];
  const line_items = [];

  for (const course of courses) {
    const sanitized = sanitizeCourseForUser(
      course,
      context.accountType,
      context.plan,
      { strict: true }
    );

    if (!sanitized.accessible) {
      return res.status(403).json({
        success: false,
        message: `Nu ai acces la cursul ${course.courseName}`,
      });
    }

    const pricing = computeCoursePricing(sanitized.matchedRules, course.price);

    if (pricing.isFree) {
      freeCourses.push(course._id.toString());
      continue;
    }

    const amount = Math.round(Number(pricing.displayPrice || 0) * 100);
    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: `Prețul pentru ${course.courseName} este prea mic pentru a fi procesat.`,
      });
    }

    paidCourses.push(course._id.toString());
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: course.courseName,
          description: course.courseDescription?.slice(0, 200) || "",
        },
        unit_amount: amount,
      },
      quantity: 1,
    });
  }

  const allCourseIds = [...new Set([...paidCourses, ...freeCourses])];

  if (allCourseIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Nu există cursuri valide pentru plată",
    });
  }

  // Check existing enrollment
  const uid = new mongoose.Types.ObjectId(userId);
  if (
    courses.some((c) => (c.studentsEnrolled || []).includes(uid))
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Student is already enrolled in at least one selected course",
      });
  }

  if (paidCourses.length === 0) {
    try {
      await enrollStudents(allCourseIds, userId);
      return res.status(200).json({
        success: true,
        freeEnrollment: true,
        message: "Cursurile gratuite au fost adăugate în cont",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Nu am putut înscrie utilizatorul în curs",
        error: error.message,
      });
    }
  }

  try {
    const stripe = getStripe();

    // Log Stripe host and masked key for debugging
    const stripeHost = stripe._apiBase || "unknown";
    const stripeKey = process.env.STRIPE_SECRET_KEY || "not set";
    const maskedKey =
      stripeKey.length > 8
        ? stripeKey.slice(0, 4) + "..." + stripeKey.slice(-4)
        : stripeKey;
    console.log(
      `[Stripe HealthCheck] Stripe Host: ${stripeHost}, Stripe Key: ${maskedKey}`
    );

    // Create a fresh idempotency key per attempt to avoid reusing completed sessions
    const idempotencyKey = `chk_${userId}_${randomUUID()}`;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url: `${process.env.FRONTEND_URL}/dashboard/enrolled-courses?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard/cart?status=cancelled`,
        metadata: {
          userId,
          coursesId: JSON.stringify(allCourseIds),
        },
      },
      { idempotencyKey }
    );

    return res
      .status(200)
      .json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    const errType = error.type || "UnknownType";
    const errCode = error.code || "UnknownCode";
    const errRawMsg = error.raw?.message || "No raw message";
    const errMsg = error.message || "Could not create Stripe session";
    console.error(
      `[Stripe Error] Type: ${errType}, Code: ${errCode}, Raw Message: ${errRawMsg}, Message: ${errMsg}`
    );
    return res.status(500).json({
      success: false,
      message: "Could not create Stripe session",
      error: {
        type: errType,
        code: errCode,
        rawMessage: errRawMsg,
        message: errMsg,
      },
    });
  }
};

// ================ Stripe webhook to fulfill enrollment ================
exports.verifyPayment = async (req, res) => {
  try {
    const { coursesId, userId } = req.body;
    if (!Array.isArray(coursesId) || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Payment data missing" });
    }
    await enrollStudents(coursesId, userId);
    return res
      .status(200)
      .json({ success: true, message: "Enrollment completed" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, error: error.stack });
  }
};

// ================ enroll Students to course after payment ================
const enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    throw new Error("Please provide data for courses and userId");
  }

  for (const courseId of courses) {
    // Enroll student to course (idempotent)
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    );
    if (!enrolledCourse) throw new Error("Course not found");

    // Ensure course progress exists once per (user, course)
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });
    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId,
        completedVideos: [],
      });
    }

    // Attach course and progress to user (idempotent)
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    // Send enrollment email (best-effort, non-blocking on failure)
    try {
      const enrolledStudent = await User.findById(userId).select(
        "email firstName"
      );
      if (enrolledStudent?.email) {
        await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName || ""}`
          )
        );
      }
    } catch (_) {
      /* ignore email failures */
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    const enrolledStudent = await User.findById(userId).select(
      "email firstName"
    );
    if (!enrolledStudent?.email) {
      return res
        .status(404)
        .json({ success: false, message: "User email not found" });
    }
    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName || ""}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Could not send email",
        error: error.message,
      });
  }
};

// ================ Stripe Webhook (prod) ================
exports.stripeWebhookHandler = async (req, res) => {
  const stripe = getStripe();
  const sig =
    req.headers["stripe-signature"] || req.headers["Stripe-Signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const coursesId = JSON.parse(session.metadata?.coursesId || "[]");
      if (userId && Array.isArray(coursesId) && coursesId.length > 0) {
        await enrollStudents(coursesId, userId);
        // Send payment success email
        try {
          const user = await User.findById(userId).select("email firstName");
          if (user?.email) {
            await mailSender(
              user.email,
              "Payment Successful - Course Enrolled",
              paymentSuccessEmail(
                user.firstName || "Student",
                session.amount_total / 100,
                session.id,
                session.payment_intent
              )
            );
          }
        } catch (_) {
          /* ignore email failures */
        }
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, error: error.stack });
  }
};

// ================ Fallback: complete enrollment by session_id (after success redirect) ================
exports.completeCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing session_id" });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Stripe session not found" });
    }

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const userId = session.metadata?.userId;
    const coursesId = JSON.parse(session.metadata?.coursesId || "[]");

    if (!userId || !Array.isArray(coursesId) || coursesId.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing metadata to enroll" });
    }

    await enrollStudents(coursesId, userId);
    // Send payment success email
    try {
      const user = await User.findById(userId).select("email firstName");
      if (user?.email) {
        await mailSender(
          user.email,
          "Payment Successful - Course Enrolled",
          paymentSuccessEmail(
            user.firstName || "Student",
            session.amount_total / 100,
            session.id,
            session.payment_intent
          )
        );
      }
    } catch (_) {
      /* ignore email failures */
    }
    return res
      .status(200)
      .json({ success: true, message: "Enrollment completed by session" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================ Get Purchase History ================
exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get user's enrolled courses with payment info
    const user = await User.findById(userId).populate({
      path: "courses",
      select: "courseName courseDescription price createdAt",
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Format purchase history
    const purchases = user.courses.map((course) => ({
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      amount: course.price * 100, // Convert to cents for display
      paymentId: `stripe_${course._id}`, // Mock payment ID
      createdAt: course.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch purchase history",
      error: error.message,
    });
  }
};

// ================ Stripe Healthcheck Endpoint ================
exports.stripeHealth = async (req, res) => {
  try {
    const stripe = getStripe();

    // Log Stripe host and masked key for debugging
    const stripeHost = stripe._apiBase || "unknown";
    const stripeKey = process.env.STRIPE_SECRET_KEY || "not set";
    const maskedKey =
      stripeKey.length > 8
        ? stripeKey.slice(0, 4) + "..." + stripeKey.slice(-4)
        : stripeKey;
    console.log(
      `[Stripe HealthCheck] Stripe Host: ${stripeHost}, Stripe Key: ${maskedKey}`
    );

    // Test connection by retrieving account info
    const account = await stripe.accounts.retrieve();
    const resolvedHost = process.env.STRIPE_API_HOST || "api.stripe.com";

    return res.status(200).json({
      success: true,
      message: "Stripe connection successful",
      stripeHost,
      accountId: account.id,
      accountEmail: account.email || "not available",
      resolvedHost: resolvedHost,
    });
  } catch (error) {
    console.error(`[Stripe HealthCheck Error] ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: "Stripe connection failed",
      error: error.message,
      stack: error.stack,
    });
  }
};

exports.enrollStudents = enrollStudents;
