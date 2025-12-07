const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
};

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
};

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  PURCHASE_HISTORY_API: BASE_URL + "/payment/purchase-history",
};

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  ADMIN_STATS_API: BASE_URL + "/course/admin-stats",
  ENROLL_FREE_COURSE_API: BASE_URL + "/course/enroll/free",
};

// ADMIN ENDPOINTS
export const adminEndpoints = {
  LIST_USERS_API: (type) =>
    `${BASE_URL}/admin/users?type=${encodeURIComponent(type)}`,
  TOGGLE_ACTIVE_API: (userId) =>
    `${BASE_URL}/admin/users/${userId}/toggle-active`,
  TOGGLE_APPROVED_API: (userId) =>
    `${BASE_URL}/admin/users/${userId}/toggle-approved`,
  ACTIVATE_USER_API: (userId) => `${BASE_URL}/admin/users/${userId}/activate`,
  ENROLL_STUDENT_API: (userId) => `${BASE_URL}/admin/users/${userId}/enroll`,
  CREATE_CORPORATE_USER_API: `${BASE_URL}/admin/users/corporate`,
  LIST_COURSES_API: `${BASE_URL}/admin/courses`,
  DELETE_COURSE_API: (courseId) => `${BASE_URL}/admin/courses/${courseId}`,
  REASSIGN_COURSE_API: (courseId) =>
    `${BASE_URL}/admin/courses/${courseId}/reassign`,
  TOGGLE_COURSE_VISIBILITY_API: (courseId) =>
    `${BASE_URL}/admin/courses/${courseId}/toggle-visibility`,
  CREATE_COURSE_FOR_INSTRUCTOR_API: `${BASE_URL}/admin/courses/create-for-instructor`,
  LIST_PENDING_REVIEWS_API: `${BASE_URL}/admin/reviews/pending`,
  APPROVE_REVIEW_API: (reviewId) =>
    `${BASE_URL}/admin/reviews/${reviewId}/approve`,
  DELETE_REVIEW_API: (reviewId) => `${BASE_URL}/admin/reviews/${reviewId}`,
};

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
};

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
};

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
};
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
};

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
};

export const subscriptionEndpoints = {
  GET_STUDENT_PLAN: BASE_URL + "/subscription/plan",
  UPDATE_STUDENT_PLAN: BASE_URL + "/subscription/plan",
  SUBSCRIPTION_CHECKOUT: BASE_URL + "/subscription/checkout",
  SUBSCRIPTION_CONFIRM: BASE_URL + "/subscription/confirm",
};

export const qnaEndpoints = {
  SUBMIT_QNA: BASE_URL + "/qna",
};
