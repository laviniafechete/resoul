const SubscriptionPlan = require("../models/subscriptionPlan");
const User = require("../models/user");
const { getStripe } = require("../config/stripe");

const STUDENT_PLAN_KEY = "StudentSubscription";

const ensureStudentPlan = async () => {
  let plan = await SubscriptionPlan.findOne({ name: STUDENT_PLAN_KEY });
  if (!plan) {
    plan = await SubscriptionPlan.create({
      name: STUDENT_PLAN_KEY,
      price: 99,
      currency: "RON",
      description: "Abonament lunar pentru studenți",
      benefits: [
        "Acces gratuit la cursurile marcate pentru abonați",
        "Reduceri speciale la cursurile premium",
      ],
      billingCycleInDays: 30,
    });
  }
  return plan;
};

exports.getStudentSubscriptionPlan = async (req, res) => {
  try {
    const plan = await ensureStudentPlan();
    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Failed to load subscription plan", error);
    return res.status(500).json({
      success: false,
      message: "Nu am putut încărca planul de abonament",
      error: error.message,
    });
  }
};

exports.updateStudentSubscriptionPlan = async (req, res) => {
  try {
    const {
      price,
      currency,
      description,
      benefits,
      billingCycleInDays,
      isActive,
    } = req.body;

    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Prețul trebuie să fie o valoare pozitivă",
      });
    }

    const payload = {
      price: Number(price),
    };

    if (currency) payload.currency = currency.toUpperCase();
    if (description !== undefined) payload.description = description;
    if (Array.isArray(benefits)) payload.benefits = benefits;
    if (billingCycleInDays) payload.billingCycleInDays = billingCycleInDays;
    if (typeof isActive === "boolean") payload.isActive = isActive;

    const plan = await SubscriptionPlan.findOneAndUpdate(
      { name: STUDENT_PLAN_KEY },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      data: plan,
      message: "Planul a fost actualizat",
    });
  } catch (error) {
    console.error("Failed to update subscription plan", error);
    return res.status(500).json({
      success: false,
      message: "Nu am putut actualiza planul",
      error: error.message,
    });
  }
};

exports.createStudentSubscriptionSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Utilizator neautentificat" });
    }

    if (req.user.subscriptionPlan === "Subscriber") {
      return res.status(400).json({
        success: false,
        message: "Ești deja abonat",
      });
    }

    const plan = await ensureStudentPlan();

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Planul de abonament este dezactivat momentan",
      });
    }

    const price = Number(plan.price) || 0;

    if (price <= 0) {
      const now = new Date();
      const activeUntil = new Date(
        now.getTime() + (plan.billingCycleInDays || 30) * 24 * 60 * 60 * 1000
      );

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscriptionPlan: "Subscriber",
          subscriptionStatus: "Active",
          subscriptionActiveUntil: activeUntil,
        },
        { new: true }
      ).populate("additionalDetails");

      return res.status(200).json({
        success: true,
        data: {
          autoActivated: true,
          plan,
          user: updatedUser,
        },
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (plan.currency || "RON").toLowerCase(),
            product_data: {
              name: "Abonament Student",
              description: plan.description || "",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/subscription?status=cancelled`,
      metadata: {
        userId,
        planId: plan._id.toString(),
        type: "student-subscription",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        plan,
      },
    });
  } catch (error) {
    console.error("Failed to create subscription session", error);
    return res.status(500).json({
      success: false,
      message: "Nu am putut iniția plata abonamentului",
      error: error.message,
    });
  }
};

exports.confirmStudentSubscription = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Lipștește sesiunea de plată",
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesiunea Stripe nu a fost găsită",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Plata nu a fost finalizată",
      });
    }

    if (session.metadata?.type !== "student-subscription") {
      return res.status(400).json({
        success: false,
        message: "Sesiunea nu aparține unui abonament",
      });
    }

    const userId = session.metadata?.userId;
    if (!userId || userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Această sesiune nu aparține contului tău",
      });
    }

    let plan = null;
    if (session.metadata?.planId) {
      plan = await SubscriptionPlan.findById(session.metadata.planId);
    }
    if (!plan) {
      plan = await ensureStudentPlan();
    }

    const now = new Date();
    const activeUntil = new Date(
      now.getTime() + (plan.billingCycleInDays || 30) * 24 * 60 * 60 * 1000
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        subscriptionPlan: "Subscriber",
        subscriptionStatus: "Active",
        subscriptionActiveUntil: activeUntil,
      },
      { new: true }
    ).populate("additionalDetails");

    return res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
        plan,
        subscription: {
          activeUntil,
        },
      },
    });
  } catch (error) {
    console.error("Failed to confirm subscription", error);
    return res.status(500).json({
      success: false,
      message: "Nu am putut confirma abonamentul",
      error: error.message,
    });
  }
};

