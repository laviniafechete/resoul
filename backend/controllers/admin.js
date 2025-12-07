const bcrypt = require("bcrypt");

const User = require("../models/user");
const Course = require("../models/course");
const Profile = require("../models/profile");
const RatingAndReview = require("../models/ratingAndReview");

const JOIN_ALLOWED_TYPES = ["Student", "Instructor", "Corporate"];

// List users by type (Student or Instructor)
exports.listUsers = async (req, res) => {
  try {
    const { type } = req.query;
    if (!JOIN_ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use Student, Instructor or Corporate",
      });
    }
    const users = await User.find({ accountType: type }).select(
      "firstName lastName email active approved createdAt"
    );
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not list users",
      error: error.message,
    });
  }
};

// Create a corporate user (admin managed)
exports.createCorporateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profile = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: "Corporate",
      additionalDetails: profile._id,
      approved: true,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(201).json({
      success: true,
      message: "Corporate user created successfully",
      data: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        active: user.active,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not create corporate user",
      error: error.message,
    });
  }
};

// Toggle active flag for any user
exports.toggleActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.active = !user.active;
    await user.save();
    return res
      .status(200)
      .json({ success: true, data: { userId: user._id, active: user.active } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not toggle active",
      error: error.message,
    });
  }
};

// Activate user account (for users who registered but didn't receive OTP email)
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Activate the user
    user.active = true;
    user.approved = true; // Also approve them
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User account activated successfully",
      data: {
        userId: user._id,
        active: user.active,
        approved: user.approved,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not activate user",
      error: error.message,
    });
  }
};

// Toggle approved flag (useful for instructors)
exports.toggleApproved = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.approved = !user.approved;
    await user.save();
    return res.status(200).json({
      success: true,
      data: { userId: user._id, approved: user.approved },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not toggle approved",
      error: error.message,
    });
  }
};

// Enroll a student to a course (admin-granted, free)
exports.enrollStudentToCourse = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.body;
    if (!courseId)
      return res
        .status(400)
        .json({ success: false, message: "courseId is required" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.accountType !== "Student")
      return res
        .status(400)
        .json({ success: false, message: "Only students can be enrolled" });

    const course = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    );
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    await User.findByIdAndUpdate(userId, { $addToSet: { courses: courseId } });

    return res.status(200).json({
      success: true,
      message: "Student enrolled to course",
      data: { userId, courseId },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not enroll student",
      error: error.message,
    });
  }
};

// List all courses with instructor
exports.listAllCourses = async (req, res) => {
  try {
    const courses = await Course.find(
      {},
      "courseName price instructor status createdAt"
    ).populate("instructor", "firstName lastName email");
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not list courses",
      error: error.message,
    });
  }
};

// Delete a course
exports.deleteCourseByAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    await Course.findByIdAndDelete(courseId);
    return res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not delete course",
      error: error.message,
    });
  }
};

exports.listPendingReviews = async (req, res) => {
  try {
    const reviews = await RatingAndReview.find({ approved: false })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "firstName lastName email" })
      .populate({ path: "course", select: "courseName" })
      .exec();

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load pending reviews",
      error: error.message,
    });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await RatingAndReview.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.approved) {
      return res.status(400).json({
        success: false,
        message: "Review already approved",
      });
    }

    review.approved = true;
    review.approvedAt = new Date();
    review.approvedBy = req.user.id;
    await review.save();

    await Course.findByIdAndUpdate(review.course, {
      $addToSet: { ratingAndReviews: review._id },
    });

    return res.status(200).json({
      success: true,
      message: "Review aprobat",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not approve review",
      error: error.message,
    });
  }
};

exports.removeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await RatingAndReview.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    await RatingAndReview.deleteOne({ _id: reviewId });

    if (review.approved) {
      await Course.findByIdAndUpdate(review.course, {
        $pull: { ratingAndReviews: reviewId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review eliminat",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not remove review",
      error: error.message,
    });
  }
};

// Reassign course to another instructor
exports.reassignCourseInstructor = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { instructorId } = req.body;
    if (!instructorId)
      return res
        .status(400)
        .json({ success: false, message: "instructorId is required" });

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid instructor" });
    }

    const updated = await Course.findByIdAndUpdate(
      courseId,
      { instructor: instructorId },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    return res
      .status(200)
      .json({ success: true, message: "Course reassigned", data: updated._id });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not reassign course",
      error: error.message,
    });
  }
};

// Create course for instructor (admin uploads course for instructor)
exports.createCourseForInstructor = async (req, res) => {
  try {
    const {
      instructorId,
      courseName,
      courseDescription,
      price,
      category,
      whatYouWillLearn,
      instructions,
      tag,
    } = req.body;

    if (
      !instructorId ||
      !courseName ||
      !courseDescription ||
      !price ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "instructorId, courseName, courseDescription, price, and category are required",
      });
    }

    // Verify instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid instructor" });
    }

    // Create course
    const course = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorId,
      price: Number(price),
      category,
      whatYouWillLearn: whatYouWillLearn || "",
      instructions: instructions || [],
      tag: tag || [],
      status: "Published", // Admin creates published courses
      studentsEnrolled: [],
      sold: 0,
    });

    // Add course to instructor's courses
    await User.findByIdAndUpdate(instructorId, {
      $addToSet: { courses: course._id },
    });

    return res.status(200).json({
      success: true,
      message: "Course created for instructor",
      data: { courseId: course._id, instructorId },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not create course for instructor",
      error: error.message,
    });
  }
};

// Toggle course visibility (Published/Draft)
exports.toggleCourseVisibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Toggle status
    const newStatus = course.status === "Published" ? "Draft" : "Published";
    course.status = newStatus;
    await course.save();

    return res.status(200).json({
      success: true,
      message: `Course ${
        newStatus === "Published" ? "published" : "unpublished"
      } successfully`,
      data: {
        courseId: course._id,
        status: newStatus,
        courseName: course.courseName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not toggle course visibility",
      error: error.message,
    });
  }
};
