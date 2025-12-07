const Course = require("../models/course");
const User = require("../models/user");
const Category = require("../models/category");
const Section = require("../models/section");
const SubSection = require("../models/subSection");
const CourseProgress = require("../models/courseProgress");
const { enrollStudents } = require("./payments");

const {
  uploadImageToCloudinary,
  deleteResourceFromCloudinary,
} = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const {
  sanitizeCourseForUser,
  computeCoursePricing,
  getUserContextFromRequest,
  normalizeRules,
  DEFAULT_RULE,
} = require("../utils/pricing");

const unrestrictedRoles = new Set(["Admin", "Instructor"]);

const prepareCourseForResponse = (courseDoc, context, { strictOverride } = {}) => {
  const { accountType, plan } = context;
  const strict =
    typeof strictOverride === "boolean"
      ? strictOverride
      : !unrestrictedRoles.has(accountType);

  const sanitizeResult = sanitizeCourseForUser(
    courseDoc,
    accountType,
    plan,
    { strict }
  );

  const pricing = computeCoursePricing(
    sanitizeResult.matchedRules,
    courseDoc.price
  );

  return {
    course: sanitizeResult.course,
    matchedRules: sanitizeResult.matchedRules,
    accessible: sanitizeResult.accessible,
    segment: sanitizeResult.segment,
    plan,
    pricing,
  };
};

// ================ create new course ================
exports.createCourse = async (req, res) => {
  try {
    // extract data
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      instructions: _instructions,
      status,
      tag: _tag,
    } = req.body;

    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag);
    const instructions = JSON.parse(_instructions);

    // console.log("tag = ", tag)
    // console.log("instructions = ", instructions)

    // get thumbnail of course
    const thumbnail = req.files?.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail ||
      !instructions.length ||
      !tag.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fileds are required",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    // decide instructor id
    // if admin creates the course, allow overriding via body.instructorId
    const instructorId =
      req.user?.accountType === "Admin" && req.body?.instructorId
        ? req.body.instructorId
        : req.user.id;

    // validate instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res.status(400).json({
        success: false,
        message: "Invalid instructorId provided",
      });
    }

    // check given category is valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(401).json({
        success: false,
        message: "Category Details not found",
      });
    }

    // upload thumbnail to cloudinary
    const thumbnailDetails = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create new course - entry in DB
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorId,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      tag,
      status,
      instructions,
      thumbnail: thumbnailDetails.secure_url,
      createdAt: Date.now(),
    });

    // add course id to instructor courses list, this is bcoz - it will show all created courses by instructor
    await User.findByIdAndUpdate(
      instructorId,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // Add the new course to the Categories
    await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // return response
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "New Course created successfully",
    });
  } catch (error) {
    console.log("Error while creating new course");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while creating new course",
    });
  }
};

// ================ show all courses ================
exports.getAllCourses = async (req, res) => {
  try {
    const context = getUserContextFromRequest(req);

    const allCoursesDocs = await Course.find(
      {},
      {
        courseName: true,
        courseDescription: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
        category: true,
      }
    )
      .populate({
        path: "instructor",
        select: "firstName lastName email image",
      })
      .populate({
        path: "courseContent",
        select: "subSection",
        populate: {
          path: "subSection",
          select: "pricingRules",
        },
      })
      .exec();

    const courses = [];

    allCoursesDocs.forEach((courseDoc) => {
      const { course, pricing, accessible } = prepareCourseForResponse(
        courseDoc,
        context
      );

      if (!accessible && !unrestrictedRoles.has(context.accountType)) {
        return;
      }

      const docObj = courseDoc.toObject();
      courses.push({
        _id: docObj._id,
        courseName: docObj.courseName,
        courseDescription: docObj.courseDescription,
        price: docObj.price,
        thumbnail: docObj.thumbnail,
        instructor: docObj.instructor,
        ratingAndReviews: docObj.ratingAndReviews,
        studentsEnrolled: docObj.studentsEnrolled,
        pricing,
      });
    });

    return res.status(200).json({
      success: true,
      data: courses,
      message: "Data for all courses fetched successfully",
    });
  } catch (error) {
    console.log("Error while fetching data of all courses");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while fetching data of all courses",
    });
  }
};

// ================ Get Course Details ================
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const context = getUserContextFromRequest(req);

    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }

    const { course, pricing } = prepareCourseForResponse(courseDetails, context);
    const accessibleSections = course?.courseContent || [];

    if (
      !unrestrictedRoles.has(context.accountType) &&
      accessibleSections.length === 0
    ) {
      return res.status(403).json({
        success: false,
        message: "Curs indisponibil pentru acest rol",
      });
    }

    let totalDurationInSeconds = 0;
    accessibleSections.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        if (!Number.isNaN(timeDurationInSeconds)) {
          totalDurationInSeconds += timeDurationInSeconds;
        }
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails: { ...course, pricing },
        totalDuration,
      },
    });
  } catch (error) {
    console.log("Error while fetching data of all courses");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while fetching data of all courses",
    });
  }
};

exports.enrollFreeCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Lipsește courseId",
      });
    }

    const context = getUserContextFromRequest(req);

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "pricingRules",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Cursul nu a fost găsit",
      });
    }

    const { pricing, course } = prepareCourseForResponse(courseDetails, context);

    if (!pricing.isFree) {
      return res.status(400).json({
        success: false,
        message: "Cursul nu este gratuit pentru rolul tău",
      });
    }

    const alreadyEnrolled = (courseDetails.studentsEnrolled || []).some(
      (id) => id.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(200).json({
        success: true,
        message: "Ești deja înscris la curs",
      });
    }

    await enrollStudents([courseId], req.user.id);

    return res.status(200).json({
      success: true,
      message: "Te-am înscris cu succes la curs",
      data: {
        courseDetails: course,
        pricing,
      },
    });
  } catch (error) {
    console.error("Could not enroll user to free course", error);
    return res.status(500).json({
      success: false,
      message: "Nu am putut înscrie utilizatorul la curs",
      error: error.message,
    });
  }
};

// ================ Get Full Course Details ================
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const context = {
      accountType: req.user.accountType,
      plan: req.user.subscriptionPlan || "Default",
    };
    // console.log('courseId userId  = ', courseId, " == ", userId)

    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    //   console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    const { course, pricing } = prepareCourseForResponse(courseDetails, context);

    //   count total time duration of course
    let totalDurationInSeconds = 0;
    const accessibleSubSectionIds = new Set();
    (course.courseContent || []).forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        if (!Number.isNaN(timeDurationInSeconds)) {
          totalDurationInSeconds += timeDurationInSeconds;
        }
        accessibleSubSectionIds.add(String(subSection._id));
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    const completedVideos = (courseProgressCount?.completedVideos || []).filter(
      (videoId) => accessibleSubSectionIds.has(String(videoId))
    );

    return res.status(200).json({
      success: true,
      data: {
        courseDetails: { ...course, pricing },
        totalDuration,
        completedVideos,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      // console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    // updatedAt
    course.updatedAt = Date.now();

    //   save data
    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // success response
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating course",
      error: error.message,
    });
  }
};

// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
      // totalDurationInSeconds:totalDurationInSeconds,
      message: "Courses made by Instructor fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // delete course thumbnail From Cloudinary
    await deleteResourceFromCloudinary(course?.thumbnail);

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          const subSection = await SubSection.findById(subSectionId);
          if (subSection) {
            await deleteResourceFromCloudinary(subSection.videoUrl); // delete course videos From Cloudinary
          }
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while Deleting course",
      error: error.message,
    });
  }
};
