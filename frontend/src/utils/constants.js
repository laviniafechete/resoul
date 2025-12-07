export const ACCOUNT_TYPE = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin",
  CORPORATE: "Corporate",
};

export const COURSE_STATUS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

export const VIDEO_AUDIENCE = {
  STUDENT: "Student",
  CORPORATE: "Corporate",
};

export const VIDEO_AUDIENCE_OPTIONS = [
  {
    label: "Studenți",
    value: VIDEO_AUDIENCE.STUDENT,
  },
  {
    label: "Corporate",
    value: VIDEO_AUDIENCE.CORPORATE,
  },
];

export const VIDEO_PRICING_PLAN = {
  DEFAULT: "Default",
  SUBSCRIBER: "Subscriber",
};

export const VIDEO_PRICING_PLAN_OPTIONS = [
  {
    label: "Standard",
    value: VIDEO_PRICING_PLAN.DEFAULT,
    helper: "Utilizator fără abonament",
  },
  {
    label: "Abonat",
    value: VIDEO_PRICING_PLAN.SUBSCRIBER,
    helper: "Utilizator cu abonament activ",
  },
];

export const VIDEO_PRICING_BENEFIT = {
  FULL_PRICE: "FullPrice",
  FREE: "Free",
  HALF_PRICE: "HalfPrice",
};

export const VIDEO_PRICING_BENEFIT_OPTIONS = [
  {
    label: "Preț întreg",
    value: VIDEO_PRICING_BENEFIT.FULL_PRICE,
    helper: "Se achită prețul listat",
  },
  {
    label: "Gratuit",
    value: VIDEO_PRICING_BENEFIT.FREE,
    helper: "Acces gratuit pentru segment",
  },
  {
    label: "-50%",
    value: VIDEO_PRICING_BENEFIT.HALF_PRICE,
    helper: "Reducere 50% pentru segment",
  },
];