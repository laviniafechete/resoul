const express = require("express");
const router = express.Router();

// Import required controllers

// course controllers
const {
  createCourse,
  getCourseDetails,
  getAllCourses,
  getFullCourseDetails,
  editCourse,
  deleteCourse,
  getInstructorCourses,
  enrollFreeCourse,
} = require("../controllers/course");

const { updateCourseProgress } = require("../controllers/courseProgress");

// categories Controllers
const {
  createCategory,
  showAllCategories,
  getCategoryPageDetails,
} = require("../controllers/category");

// sections controllers
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

// subSections controllers
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/subSection");

// rating controllers
const {
  createRating,
  getAverageRating,
  getAllRatingReview,
} = require("../controllers/ratingAndReview");

// Middlewares
const {
  auth,
  isAdmin,
  isInstructor,
  isStudent,
} = require("../middleware/auth");

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
// Courses can Only be Created by Instructors

// Instructors can create courses; Admins can also create on behalf of instructors
router.post("/createCourse", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return createCourse(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "Only Instructor or Admin can create course",
  });
});

//Add a Section to a Course
// Allow Admins to build course content as well
router.post("/addSection", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return createSection(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});
// Update a Section
router.post("/updateSection", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return updateSection(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});
// Delete a Section
router.post("/deleteSection", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return deleteSection(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});

// Add a Sub Section to a Section
router.post("/addSubSection", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return createSubSection(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});
// Edit Sub Section
router.post("/updateSubSection", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return updateSubSection(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});
// Delete Sub Section
router.post("/deleteSubSection", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return deleteSubSection(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});

// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);
// Get all Courses
router.get("/getAllCourses", getAllCourses);
// get full course details
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
router.post("/enroll/free", auth, enrollFreeCourse);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return getInstructorCourses(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});

// Edit Course routes
router.post("/editCourse", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return editCourse(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});

// Delete a Course
router.delete("/deleteCourse", auth, (req, res, next) => {
  if (
    req.user.accountType === "Instructor" ||
    req.user.accountType === "Admin"
  ) {
    return deleteCourse(req, res, next);
  }
  return res.status(401).json({
    success: false,
    message: "This Page is protected only for Instructor",
  });
});

// update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", getCategoryPageDetails);

// Admin statistics route
router.get("/admin-stats", auth, isAdmin, async (req, res) => {
  try {
    const Course = require("../models/course");
    const User = require("../models/user");
    const Category = require("../models/category");

    // Get counts
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ accountType: "Student" });
    const totalInstructors = await User.countDocuments({
      accountType: "Instructor",
    });
    const totalCategories = await Category.countDocuments();

    // Calculate total revenue based on actual enrollments
    const courses = await Course.find({}, "price studentsEnrolled");
    const totalRevenue = courses.reduce((sum, course) => {
      const enrollments = course.studentsEnrolled
        ? course.studentsEnrolled.length
        : 0;
      return sum + course.price * enrollments;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalInstructors,
        totalCategories,
        totalRevenue,
      },
    });
  } catch (error) {
    console.log("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
      error: error.message,
    });
  }
});

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingReview);

module.exports = router;
