const mongoose = require("mongoose");

const PRICING_BENEFITS = ["FullPrice", "Free", "HalfPrice"];

const PRICING_PLANS = ["Default", "Subscriber"];

const AUDIENCE_SEGMENTS = ["Student", "Corporate"];

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  timeDuration: {
    type: String,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  pricingRules: {
    type: [
      {
        audience: {
          type: String,
          enum: AUDIENCE_SEGMENTS,
          required: true,
          default: "Student",
        },
        plan: {
          type: String,
          enum: PRICING_PLANS,
          required: true,
          default: "Default",
        },
        benefit: {
          type: String,
          enum: PRICING_BENEFITS,
          required: true,
          default: "FullPrice",
        },
      },
    ],
    default: [
      {
        audience: "Student",
        plan: "Default",
        benefit: "FullPrice",
      },
    ],
  },
});

module.exports = mongoose.model("SubSection", subSectionSchema);
module.exports.AUDIENCE_SEGMENTS = AUDIENCE_SEGMENTS;
module.exports.PRICING_PLANS = PRICING_PLANS;
module.exports.PRICING_BENEFITS = PRICING_BENEFITS;
