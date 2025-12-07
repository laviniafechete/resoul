const express = require("express");
const router = express.Router();

const {
  getStudentSubscriptionPlan,
  updateStudentSubscriptionPlan,
  createStudentSubscriptionSession,
  confirmStudentSubscription,
} = require("../controllers/subscription");
const { auth, isAdmin, isStudent } = require("../middleware/auth");

router.get("/plan", getStudentSubscriptionPlan);
router.post("/plan", auth, isAdmin, updateStudentSubscriptionPlan);
router.post("/checkout", auth, isStudent, createStudentSubscriptionSession);
router.post("/confirm", auth, isStudent, confirmStudentSubscription);

module.exports = router;

