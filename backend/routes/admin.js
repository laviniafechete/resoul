const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middleware/auth");
const {
  listUsers,
  createCorporateUser,
  toggleActive,
  toggleApproved,
  activateUser,
  enrollStudentToCourse,
  listAllCourses,
  deleteCourseByAdmin,
  reassignCourseInstructor,
  createCourseForInstructor,
  toggleCourseVisibility,
  listPendingReviews,
  approveReview,
  removeReview,
} = require("../controllers/admin");

// All routes protected for admins
router.get("/users", auth, isAdmin, listUsers); // ?type=Student|Instructor|Corporate
router.post("/users/corporate", auth, isAdmin, createCorporateUser);
router.patch("/users/:userId/toggle-active", auth, isAdmin, toggleActive);
router.patch("/users/:userId/toggle-approved", auth, isAdmin, toggleApproved);
router.patch("/users/:userId/activate", auth, isAdmin, activateUser);
router.post("/users/:userId/enroll", auth, isAdmin, enrollStudentToCourse);

router.get("/courses", auth, isAdmin, listAllCourses);
router.delete("/courses/:courseId", auth, isAdmin, deleteCourseByAdmin);
router.patch(
  "/courses/:courseId/reassign",
  auth,
  isAdmin,
  reassignCourseInstructor
);
router.patch(
  "/courses/:courseId/toggle-visibility",
  auth,
  isAdmin,
  toggleCourseVisibility
);
router.post(
  "/courses/create-for-instructor",
  auth,
  isAdmin,
  createCourseForInstructor
);

router.get("/reviews/pending", auth, isAdmin, listPendingReviews);
router.post("/reviews/:reviewId/approve", auth, isAdmin, approveReview);
router.delete("/reviews/:reviewId", auth, isAdmin, removeReview);

module.exports = router;
