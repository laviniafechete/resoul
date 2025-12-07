import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { subscriptionEndpoints } from "../apis";
import { setUser } from "../../slices/profileSlice";

export const fetchStudentSubscriptionPlan = async (token) => {
  try {
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;
    const response = await apiConnector(
      "GET",
      subscriptionEndpoints.GET_STUDENT_PLAN,
      null,
      headers
    );
    return response?.data?.data || null;
  } catch (error) {
    console.error("Failed to load subscription plan", error);
    return null;
  }
};

export const updateStudentSubscriptionPlan = async (payload, token) => {
  const toastId = toast.loading("Se salvează planul...");
  try {
    const response = await apiConnector(
      "POST",
      subscriptionEndpoints.UPDATE_STUDENT_PLAN,
      payload,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Nu am putut salva planul");
    }

    toast.success(response?.data?.message || "Planul a fost actualizat");
    return response?.data?.data;
  } catch (error) {
    const message = error?.message || "Nu am putut salva planul";
    toast.error(message);
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const startStudentSubscriptionCheckout = async (token) => {
  const toastId = toast.loading("Se inițiază plata abonamentului...");
  try {
    const response = await apiConnector(
      "POST",
      subscriptionEndpoints.SUBSCRIPTION_CHECKOUT,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Nu am putut iniția plata abonamentului"
      );
    }

    const payload = response?.data?.data || {};
    const { url, sessionId, plan, autoActivated, user } = payload;

    if (autoActivated) {
      toast.dismiss(toastId);
      toast.success("Abonamentul a fost activat");
      return { autoActivated: true, plan, user, sessionId: null, url: null };
    }

    if (!url) {
      throw new Error("Link de plată indisponibil");
    }

    toast.dismiss(toastId);
    return { url, sessionId, plan };
  } catch (error) {
    toast.dismiss(toastId);
    toast.error(error?.message || "Nu am putut iniția plata abonamentului");
    throw error;
  }
};

export const confirmStudentSubscription = async (
  sessionId,
  token,
  dispatch
) => {
  const toastId = toast.loading("Confirmăm abonamentul...");
  try {
    const response = await apiConnector(
      "POST",
      subscriptionEndpoints.SUBSCRIPTION_CONFIRM,
      { sessionId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Nu am putut confirma abonamentul"
      );
    }

    const updatedUser = response?.data?.data?.user;
    if (updatedUser && dispatch) {
      dispatch(setUser(updatedUser));
    }

    toast.success("Abonamentul este activ");
    return response?.data?.data;
  } catch (error) {
    toast.error(error?.message || "Nu am putut confirma abonamentul");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

