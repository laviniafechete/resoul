import { toast } from "react-hot-toast";

import { apiConnector } from "../apiConnector";
import { qnaEndpoints } from "../apis";

const { SUBMIT_QNA } = qnaEndpoints;

export const submitQnaQuestion = async (payload = {}) => {
  const toastId = toast.loading("Se trimite întrebarea...");
  try {
    const response = await apiConnector("POST", SUBMIT_QNA, payload);
    toast.success(
      response?.data?.message ||
        "Întrebarea ta a fost trimisă către echipa ReSoul."
    );
    return response?.data;
  } catch (error) {
    console.log("Could not submit Q&A question", error);
    toast.error(
      error?.response?.data?.message ||
        "Nu am reușit să trimitem întrebarea. Încearcă din nou."
    );
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

