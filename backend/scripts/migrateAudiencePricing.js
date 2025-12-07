/*
  Migration script to backfill pricingRules metadata
  Run with: node scripts/migrateAudiencePricing.js
*/

const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Course = require("../models/course");
const Section = require("../models/section");
const SubSection = require("../models/subSection");

const DEFAULT_RULE = {
  audience: "Student",
  plan: "Default",
  benefit: "FullPrice",
};

const normalizeRule = (rule) => {
  if (!rule || typeof rule !== "object") {
    return { ...DEFAULT_RULE };
  }
  const audience =
    typeof rule.audience === "string" ? rule.audience : DEFAULT_RULE.audience;
  const plan = typeof rule.plan === "string" ? rule.plan : DEFAULT_RULE.plan;
  const benefit =
    typeof rule.benefit === "string" ? rule.benefit : DEFAULT_RULE.benefit;
  return { audience, plan, benefit };
};

const parseList = (value, fallback) => {
  if (!value) return [...fallback];
  if (Array.isArray(value) && value.length) return value;
  if (typeof value === "string" && value.trim().length) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [...fallback];
};

const buildRulesFromLegacy = (audiences, pricingOptions) => {
  const audienceList = parseList(audiences, [DEFAULT_RULE.audience]);
  const legacyPricing = new Set(parseList(pricingOptions, []));

  const rules = [];

  const pushUnique = (rule) => {
    if (
      !rules.some(
        (existing) =>
          existing.audience === rule.audience &&
          existing.plan === rule.plan &&
          existing.benefit === rule.benefit
      )
    ) {
      rules.push(rule);
    }
  };

  audienceList.forEach((audience) => {
    let hasDefaultRule = false;
    let hasSubscriberRule = false;

    if (legacyPricing.has("FreeForEveryone")) {
      pushUnique({ audience, plan: "Default", benefit: "Free" });
      pushUnique({ audience, plan: "Subscriber", benefit: "Free" });
      hasDefaultRule = true;
      hasSubscriberRule = true;
    }

    if (legacyPricing.has("FreeForSubscribers")) {
      pushUnique({ audience, plan: "Subscriber", benefit: "Free" });
      hasSubscriberRule = true;
    }

    if (legacyPricing.has("HalfOffSubscribers")) {
      pushUnique({ audience, plan: "Subscriber", benefit: "HalfPrice" });
      hasSubscriberRule = true;
    }

    if (legacyPricing.has("FullPrice")) {
      pushUnique({ audience, plan: "Default", benefit: "FullPrice" });
      hasDefaultRule = true;
    }

    if (!hasDefaultRule) {
      pushUnique({ audience, plan: "Default", benefit: "FullPrice" });
    }

    if (!hasSubscriberRule) {
      pushUnique({ audience, plan: "Subscriber", benefit: "FullPrice" });
    }
  });

  return rules.length ? rules : [{ ...DEFAULT_RULE }];
};

const transformLegacyRulesArray = (legacyRules) => {
  let transformed = [];
  legacyRules.forEach((rule) => {
    if (Array.isArray(rule?.audience) || Array.isArray(rule?.pricing)) {
      transformed = transformed.concat(
        buildRulesFromLegacy(rule.audience, rule.pricing)
      );
    } else if (rule && typeof rule === "object") {
      transformed.push(normalizeRule(rule));
    }
  });
  return transformed.length ? transformed : [{ ...DEFAULT_RULE }];
};

async function migrate() {
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let updatedCourses = 0;
  let updatedSubSections = 0;

  const subSections = await SubSection.find({});
  for (const sub of subSections) {
    let nextRules = [];

    if (Array.isArray(sub.pricingRules) && sub.pricingRules.length) {
      const containsLegacy = sub.pricingRules.some(
        (rule) => Array.isArray(rule?.audience) || Array.isArray(rule?.pricing)
      );
      if (containsLegacy) {
        nextRules = transformLegacyRulesArray(sub.pricingRules);
      } else {
        nextRules = sub.pricingRules.map(normalizeRule);
      }
    } else {
      nextRules = buildRulesFromLegacy(sub.audience, sub.pricingOptions);
    }

    sub.pricingRules = nextRules;
    updatedSubSections += 1;

    if (sub.audience !== undefined) {
      sub.set("audience", undefined);
    }
    if (sub.pricingOptions !== undefined) {
      sub.set("pricingOptions", undefined);
    }

    await sub.save();
  }

  const courses = await Course.find({});
  for (const course of courses) {
    const sections = await Section.find({ _id: { $in: course.courseContent } })
      .populate({
        path: "subSection",
        select: "pricingRules",
      })
      .exec();

    const audienceSet = new Set();
    sections.forEach((section) => {
      section.subSection?.forEach((sub) => {
        const rules =
          Array.isArray(sub.pricingRules) && sub.pricingRules.length
            ? sub.pricingRules
            : [DEFAULT_RULE];
        rules.forEach((rule) => audienceSet.add(rule.audience));
      });
    });

    if (audienceSet.size === 0) {
      audienceSet.add(DEFAULT_RULE.audience);
    }

    course.audience = Array.from(audienceSet);
    await course.save();
    updatedCourses += 1;
  }

  console.log("Migration completed");
  console.log(`SubSections processed: ${updatedSubSections}`);
  console.log(`Courses updated with aggregated audience: ${updatedCourses}`);
}

migrate()
  .catch((error) => {
    console.error("Migration failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
