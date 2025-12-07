import { toast } from "react-hot-toast";
import { studentEndpoints, profileEndpoints, courseEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
// Stripe does not require a logo here; kept for potential UI use
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const { COURSE_PAYMENT_API, COURSE_VERIFY_API } = studentEndpoints;

// ================ buyCourse ================
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Loading...");
  try {
    if (!Array.isArray(coursesId) || coursesId.length === 0) {
      throw new Error("Select at least one course.");
    }

    // Check if already enrolled (prevent duplicate purchases)
    const enrolledResponse = await apiConnector(
      "GET",
      profileEndpoints.GET_USER_ENROLLED_COURSES_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    
    const enrolledCourseIds = enrolledResponse?.data?.data?.map(course => course._id) || [];
    const alreadyEnrolled = coursesId.filter(courseId => enrolledCourseIds.includes(courseId));
    
    if (alreadyEnrolled.length > 0) {
      toast.dismiss(toastId);
      toast.error(`You are already enrolled in ${alreadyEnrolled.length} course(s). Please refresh the page.`);
      return;
    }

    // initiate Stripe session
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { coursesId },
      { Authorization: `Bearer ${token}` }
    );

    const { success, url, message, freeEnrollment } = orderResponse?.data || {};

    if (freeEnrollment) {
      toast.success(
        message || "Cursurile gratuite au fost adăugate în contul tău."
      );
      dispatch?.(resetCart());
      navigate("/dashboard/enrolled-courses");
      return;
    }

    if (!success || !url) {
      throw new Error(message || "Could not create Stripe session.");
    }

    // optional UX flag
    dispatch?.(setPaymentLoading(true));

    // Redirect to Stripe Checkout
    window.location.assign(url);
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Payment initialization failed.";
    toast.error(msg);
  } finally {
    toast.dismiss(toastId);
  }
}


// ================ verify payment ================
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));

    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("payment Successful, you are addded to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}

// ================ verify payment by Stripe sessionId (optional client-side confirmation) ================
export async function verifyPaymentBySessionId(sessionId, token, navigate, dispatch) {
  if (!sessionId) return;
  const toastId = toast.loading("Verifying payment...");
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      { sessionId },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Verification failed.");
    }

    toast.success("Payment successful! You’re enrolled.");
    dispatch(resetCart());
    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || "Could not verify payment.";
    toast.error(msg);
  } finally {
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
  }
}

export async function enrollInFreeCourse(courseId, token, dispatch) {
  const toastId = toast.loading("Se procesează înscrierea...");
  try {
    const response = await apiConnector(
      "POST",
      courseEndpoints.ENROLL_FREE_COURSE_API,
      { courseId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Nu am putut înscrie cursul");
    }

    toast.success(response?.data?.message || "Te-am înscris la curs");
    dispatch?.(resetCart());
    return response?.data?.data;
  } catch (error) {
    toast.error(error?.message || "Nu am putut înscrie cursul");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}