const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Course = require('../models/course');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const {
  AUDIENCE_SEGMENTS,
  PRICING_PLANS,
  PRICING_BENEFITS,
} = require('../models/subSection');

const DEFAULT_RULE = {
  audience: AUDIENCE_SEGMENTS[0],
  plan: PRICING_PLANS[0],
  benefit: PRICING_BENEFITS[0],
};

const normalizeRule = (inputRule) => {
  const rule = inputRule && typeof inputRule === 'object' ? inputRule : {};

  const audience = AUDIENCE_SEGMENTS.includes(rule.audience)
    ? rule.audience
    : DEFAULT_RULE.audience;

  const plan = PRICING_PLANS.includes(rule.plan)
    ? rule.plan
    : DEFAULT_RULE.plan;

  const benefit = PRICING_BENEFITS.includes(rule.benefit)
    ? rule.benefit
    : DEFAULT_RULE.benefit;

  return { audience, plan, benefit };
};

const parsePricingRulesPayload = (payload) => {
  if (!payload) {
    return [{ ...DEFAULT_RULE }];
  }

  let parsed = payload;
  if (typeof payload === 'string') {
    try {
      parsed = JSON.parse(payload);
    } catch (error) {
      parsed = null;
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [{ ...DEFAULT_RULE }];
  }

  const normalized = parsed
    .map(normalizeRule)
    .filter(Boolean);

  return normalized.length ? normalized : [{ ...DEFAULT_RULE }];
};

const syncCourseAudience = async (sectionId) => {
  try {
    const course = await Course.findOne({ courseContent: sectionId });
    if (!course) {
      return;
    }

    const sections = await Section.find({ _id: { $in: course.courseContent } }).populate({
      path: 'subSection',
      select: 'pricingRules',
    });

    const audienceSet = new Set();

    sections.forEach((section) => {
      section.subSection?.forEach((sub) => {
        const rules = Array.isArray(sub.pricingRules) && sub.pricingRules.length
          ? sub.pricingRules
          : [DEFAULT_RULE];
        rules.forEach((rule) => {
          audienceSet.add(rule.audience);
        });
      });
    });

    if (audienceSet.size === 0) {
      audienceSet.add(DEFAULT_RULE.audience);
    }

    course.audience = Array.from(audienceSet);
    await course.save();
  } catch (error) {
    console.error('Failed to sync course audience', error);
  }
};

exports.createSubSection = async (req, res) => {
  try {
    const { title, description, sectionId } = req.body;

    const videoFile = req.files.video;

    if (!title || !description || !videoFile || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const videoFileDetails = await uploadImageToCloudinary(
      videoFile,
      process.env.FOLDER_NAME
    );

    const pricingRules = parsePricingRulesPayload(req.body.pricingRules);

    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration: videoFileDetails.duration,
      description,
      videoUrl: videoFileDetails.secure_url,
      pricingRules,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate('subSection');

    await syncCourseAudience(sectionId);

    res.status(200).json({
      success: true,
      data: updatedSection,
      message: 'SubSection created successfully',
    });
  } catch (error) {
    console.log('Error while creating SubSection');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while creating SubSection',
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;

    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: 'subSection ID is required to update',
      });
    }

    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: 'SubSection not found',
      });
    }

    if (req.body.pricingRules !== undefined) {
      subSection.pricingRules = parsePricingRulesPayload(req.body.pricingRules);
    }

    if (title) {
      subSection.title = title;
    }

    if (description) {
      subSection.description = description;
    }

    if (req.files && (req.files.videoFile !== undefined || req.files.video !== undefined)) {
      const video = req.files.videoFile || req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = uploadDetails.duration;
    }

    await subSection.save();

    const updatedSection = await Section.findById(sectionId).populate('subSection');

    await syncCourseAudience(sectionId);

    return res.json({
      success: true,
      data: updatedSection,
      message: 'Section updated successfully',
    });
  } catch (error) {
    console.error('Error while updating the section');
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while updating the section',
    });
  }
};



// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        // delete from DB
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate('subSection')

        await syncCourseAudience(sectionId);

        // In frontned we have to take care - when subsection is deleted we are sending ,
        // only section data not full course details as we do in others 

        // success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,

            error: error.message,
            message: "An error occurred while deleting the SubSection",
        })
    }
}