const jwt = require("jsonwebtoken");
const DEFAULT_RULE = {
  audience: "Student",
  plan: "Default",
  benefit: "FullPrice",
};

const BENEFIT_PRIORITY = {
  Free: 0,
  HalfPrice: 1,
  FullPrice: 2,
};

const normalizeRule = (rule) => {
  if (!rule || typeof rule !== "object") {
    return { ...DEFAULT_RULE };
  }
  const audience = typeof rule.audience === "string" ? rule.audience : DEFAULT_RULE.audience;
  const plan = typeof rule.plan === "string" ? rule.plan : DEFAULT_RULE.plan;
  const benefit = typeof rule.benefit === "string" ? rule.benefit : DEFAULT_RULE.benefit;
  return { audience, plan, benefit };
};

const normalizeRules = (rules) => {
  if (!Array.isArray(rules) || rules.length === 0) {
    return [{ ...DEFAULT_RULE }];
  }
  return rules.map(normalizeRule);
};

const getSegmentForAccountType = (accountType) => {
  if (accountType === "Corporate") return "Corporate";
  return "Student";
};

const getApplicableRule = (rules, segment, plan, { allowFallback = false } = {}) => {
  const normalized = normalizeRules(rules);
  const segmentMatches = normalized.filter((rule) => rule.audience === segment);
  let candidates = segmentMatches;

  if (!candidates.length && allowFallback) {
    candidates = normalized;
  }

  if (!candidates.length) return null;

  const exactPlanMatches = candidates.filter((rule) => rule.plan === plan);
  if (exactPlanMatches.length) {
    return exactPlanMatches.sort(
      (a, b) => BENEFIT_PRIORITY[a.benefit] - BENEFIT_PRIORITY[b.benefit]
    )[0];
  }

  const defaultPlanMatches = candidates.filter((rule) => rule.plan === DEFAULT_RULE.plan);
  if (defaultPlanMatches.length) {
    return defaultPlanMatches.sort(
      (a, b) => BENEFIT_PRIORITY[a.benefit] - BENEFIT_PRIORITY[b.benefit]
    )[0];
  }

  return candidates.sort(
    (a, b) => BENEFIT_PRIORITY[a.benefit] - BENEFIT_PRIORITY[b.benefit]
  )[0];
};

const computeBenefitPrice = (benefit, basePrice) => {
  const price = Number(basePrice) || 0;
  switch (benefit) {
    case "Free":
      return 0;
    case "HalfPrice":
      return Math.max(0, Math.round(price * 0.5));
    case "FullPrice":
    default:
      return price;
  }
};

const sanitizeCourseForUser = (
  courseDoc,
  accountType,
  plan,
  { strict = true } = {}
) => {
  const courseObject =
    courseDoc && typeof courseDoc.toObject === "function"
      ? courseDoc.toObject()
      : courseDoc;

  if (!courseObject) {
    return { course: null, matchedRules: [], accessible: false };
  }

  const segment = getSegmentForAccountType(accountType);
  const allowFallback = !strict;
  const matchedRules = [];

  const sanitizedSections = (courseObject.courseContent || [])
    .map((section) => {
      const sanitizedSubsections = [];

      (section.subSection || []).forEach((sub) => {
        const normalizedRules = normalizeRules(sub.pricingRules);
        const appliedRule =
          getApplicableRule(normalizedRules, segment, plan, { allowFallback }) ||
          (allowFallback ? normalizeRule(normalizedRules[0]) : null);

        if (!appliedRule && strict) {
          return;
        }

        if (appliedRule) {
          matchedRules.push(appliedRule);
        }

        sanitizedSubsections.push({
          ...sub,
          pricingRules: normalizedRules,
          appliedRule: appliedRule || normalizeRule(normalizedRules[0]),
        });
      });

      if (sanitizedSubsections.length || !strict) {
        return {
          ...section,
          subSection: sanitizedSubsections,
        };
      }
      return null;
    })
    .filter(Boolean);

  const accessible = matchedRules.length > 0;

  return {
    course: { ...courseObject, courseContent: sanitizedSections },
    matchedRules,
    accessible,
    segment,
    plan,
  };
};

const computeCoursePricing = (matchedRules, basePrice) => {
  if (!Array.isArray(matchedRules) || matchedRules.length === 0) {
    const originalPrice = Number(basePrice) || 0;
    return {
      benefit: "FullPrice",
      plan: DEFAULT_RULE.plan,
      audience: DEFAULT_RULE.audience,
      displayPrice: originalPrice,
      originalPrice,
      isFree: false,
      isDiscounted: false,
      discountPercentage: 0,
      badge: null,
    };
  }

  const bestRule = [...matchedRules].sort(
    (a, b) => BENEFIT_PRIORITY[a.benefit] - BENEFIT_PRIORITY[b.benefit]
  )[0];

  const originalPrice = Number(basePrice) || 0;
  const displayPrice = computeBenefitPrice(bestRule.benefit, originalPrice);

  let badge = null;
  if (bestRule.benefit === "Free") {
    badge = "Gratuit";
  } else if (bestRule.benefit === "HalfPrice") {
    badge = "-50%";
  }

  return {
    benefit: bestRule.benefit,
    plan: bestRule.plan,
    audience: bestRule.audience,
    displayPrice,
    originalPrice,
    isFree: displayPrice === 0,
    isDiscounted: bestRule.benefit === "HalfPrice",
    discountPercentage: bestRule.benefit === "HalfPrice" ? 50 : 0,
    badge,
  };
};

const getUserContextFromRequest = (req) => {
  if (req?.user) {
    return {
      accountType: req.user.accountType || "Student",
      plan: req.user.subscriptionPlan || "Default",
    };
  }

  const headerToken = req?.header?.("Authorization") || req?.headers?.authorization;
  if (headerToken) {
    const token = headerToken.replace("Bearer ", "").trim();
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {
          accountType: decoded?.accountType || "Student",
          plan: decoded?.subscriptionPlan || "Default",
        };
      } catch (error) {
        // ignore malformed token, fallback to defaults
      }
    }
  }

  return { accountType: "Student", plan: "Default" };
};

module.exports = {
  DEFAULT_RULE,
  BENEFIT_PRIORITY,
  normalizeRule,
  normalizeRules,
  getSegmentForAccountType,
  getApplicableRule,
  computeBenefitPrice,
  sanitizeCourseForUser,
  computeCoursePricing,
  getUserContextFromRequest,
};
