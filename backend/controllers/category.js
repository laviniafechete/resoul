const Category = require("../models/category");
const Course = require("../models/course");
const {
  sanitizeCourseForUser,
  computeCoursePricing,
  getUserContextFromRequest,
} = require("../utils/pricing");

const unrestrictedRoles = new Set(["Admin", "Instructor"]);

const prepareCourseSnapshot = (courseDoc, context, { strictOverride } = {}) => {
  const strict =
    typeof strictOverride === "boolean"
      ? strictOverride
      : !unrestrictedRoles.has(context.accountType);

  const result = sanitizeCourseForUser(
    courseDoc,
    context.accountType,
    context.plan,
    { strict }
  );

  const pricing = computeCoursePricing(result.matchedRules, courseDoc.price);

  return {
    course: result.course,
    pricing,
    accessible: result.accessible,
  };
};

// ================ create Category ================
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await Category.create({
      name,
      description,
    });

    res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.log("Error while creating Category");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while creating Category",
      error: error.message,
    });
  }
};

// ================ get All Category ================
exports.showAllCategories = async (req, res) => {
  try {
    const context = getUserContextFromRequest(req);
    const includeEmpty = req.query.includeEmpty === "true";

    const categories = await Category.find({}, { name: 1, description: 1 })
      .populate({
        path: "courses",
        match: {
          status: "Published",
        },
        populate: {
          path: "courseContent",
          select: "subSection",
          populate: {
            path: "subSection",
            select: "pricingRules",
          },
        },
        select: "price courseContent",
      })
      .sort({ name: 1 })
      .exec();

    const filtered = categories
      .map((category) => {
        if (includeEmpty) {
          return {
            _id: category._id,
            name: category.name,
            description: category.description,
          };
        }

        const accessibleCourses = (category.courses || []).filter(
          (courseDoc) => {
            if (unrestrictedRoles.has(context.accountType)) {
              return true;
            }

            const { accessible } = prepareCourseSnapshot(courseDoc, context);
            return accessible;
          }
        );

        if (!accessibleCourses.length) {
          return null;
        }
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: filtered,
      message: "All allCategories fetched successfully",
    });
  } catch (error) {
    console.log("Error while fetching all allCategories");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching all allCategories",
    });
  }
};

// ================ Get Category Page Details ================
exports.getCategoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const context = getUserContextFromRequest(req);

    const selectedCategoryDoc = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: [
          "ratingAndReviews",
          {
            path: "instructor",
            select: "firstName lastName image",
          },
          {
            path: "courseContent",
            select: "subSection",
            populate: {
              path: "subSection",
              select: "pricingRules",
            },
          },
        ],
      })
      .exec();

    if (!selectedCategoryDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const selectedCourses = [];
    (selectedCategoryDoc.courses || []).forEach((courseDoc) => {
      const { course, pricing, accessible } = prepareCourseSnapshot(
        courseDoc,
        context
      );
      if (!accessible && !unrestrictedRoles.has(context.accountType)) {
        return;
      }
      const docObj = courseDoc.toObject();
      selectedCourses.push({
        ...docObj,
        pricing,
      });
    });

    if (selectedCourses.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "No courses found for the selected category.",
      });
    }

    const selectedCategory = {
      _id: selectedCategoryDoc._id,
      name: selectedCategoryDoc.name,
      description: selectedCategoryDoc.description,
      courses: selectedCourses,
    };

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: [
          {
            path: "instructor",
            select: "firstName lastName image",
          },
          {
            path: "courseContent",
            select: "subSection",
            populate: {
              path: "subSection",
              select: "pricingRules",
            },
          },
        ],
      })
      .exec();

    let differentCategory = null;

    for (const candidate of categoriesExceptSelected) {
      const preparedCourses = [];

      (candidate.courses || []).forEach((courseDoc) => {
        const { course, pricing, accessible } = prepareCourseSnapshot(
          courseDoc,
          context
        );
        if (!accessible && !unrestrictedRoles.has(context.accountType)) {
          return;
        }
        const docObj = courseDoc.toObject();
        preparedCourses.push({
          ...docObj,
          pricing,
        });
      });

      if (preparedCourses.length) {
        differentCategory = {
          _id: candidate._id,
          name: candidate.name,
          description: candidate.description,
          courses: preparedCourses,
        };
        break;
      }
    }

    const topCoursesRaw = await Course.find({ status: "Published" })
      .populate({
        path: "instructor",
        select: "firstName lastName image",
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

    const topCourses = [];
    topCoursesRaw.forEach((courseDoc) => {
      const { course, pricing, accessible } = prepareCourseSnapshot(
        courseDoc,
        context,
        { strictOverride: false }
      );
      if (!accessible && !unrestrictedRoles.has(context.accountType)) {
        return;
      }
      topCourses.push({
        ...courseDoc.toObject(),
        pricing,
      });
    });

    topCourses.sort(
      (a, b) =>
        (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0)
    );

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses: topCourses.slice(0, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
