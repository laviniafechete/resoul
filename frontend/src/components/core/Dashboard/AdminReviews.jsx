import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  adminEndpoints,
} from "../../../services/apis";
import { apiConnector } from "../../../services/apiConnector";
import { setUser } from "../../../slices/profileSlice";

const Heading = ({ children }) => (
  <h2 className="text-lg font-semibold text-richblack-50">{children}</h2>
);

const ReviewRow = ({ review, onApprove, onReject, approving, rejecting }) => {
  const createdAt = review.createdAt
    ? new Date(review.createdAt).toLocaleString("ro-RO")
    : "-";

  return (
    <div className="rounded-xl border border-brand-primary/40 bg-richblack-800 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-richblack-100">
            {review.user?.firstName} {review.user?.lastName}
          </p>
          <p className="text-xs text-richblack-300">{review.user?.email}</p>
        </div>
        <div className="space-y-1 text-right text-sm text-richblack-200">
          <p className="font-semibold text-brand-primary">
            Curs: {review.course?.courseName || "-"}
          </p>
          <p>Rating: {review.rating}</p>
          <p className="text-xs text-richblack-400">Trimis la: {createdAt}</p>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm text-richblack-200">
        {review.review}
      </p>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <button
          type="button"
          onClick={() => onReject(review._id)}
          disabled={rejecting}
          className="rounded-md border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-200 transition hover:bg-pink-200/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {rejecting ? "Se elimină..." : "Șterge"}
        </button>
        <button
          type="button"
          onClick={() => onApprove(review._id)}
          disabled={approving}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {approving ? "Se aprobă..." : "Aprobă"}
        </button>
      </div>
    </div>
  );
};

export default function AdminReviews() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const isAdmin = user?.accountType === "Admin";

  useEffect(() => {
    if (!isAdmin || !token) {
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await apiConnector(
          "GET",
          adminEndpoints.LIST_PENDING_REVIEWS_API,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );

        if (!response?.data?.success) {
          throw new Error(response?.data?.message || "Nu am putut încărca feedback-urile");
        }

        setReviews(response?.data?.data || []);
      } catch (error) {
        toast.error(error?.message || "Nu am putut încărca feedback-urile");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, isAdmin]);

  const handleApprove = async (reviewId) => {
    setApproving(reviewId);
    try {
      const response = await apiConnector(
        "POST",
        adminEndpoints.APPROVE_REVIEW_API(reviewId),
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Nu am putut aproba feedback-ul");
      }

      toast.success("Feedback aprobat");
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
    } catch (error) {
      toast.error(error?.message || "Nu am putut aproba feedback-ul");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (reviewId) => {
    setRejecting(reviewId);
    try {
      const response = await apiConnector(
        "DELETE",
        adminEndpoints.DELETE_REVIEW_API(reviewId),
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Nu am putut șterge feedback-ul");
      }

      toast.success("Feedback eliminat");
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
    } catch (error) {
      toast.error(error?.message || "Nu am putut șterge feedback-ul");
    } finally {
      setRejecting(null);
    }
  };

  const isEmpty = useMemo(() => !reviews.length, [reviews]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Heading>Feedback-uri în așteptare</Heading>
        <p className="text-sm text-richblack-300">
          Aproiază sau respinge recenziile trimise de studenți înainte ca acestea să apară public.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-richblack-700 bg-richblack-800 p-6 text-center text-sm text-richblack-200">
          Se încarcă feedback-urile...
        </div>
      ) : isEmpty ? (
        <div className="rounded-lg border border-richblack-700 bg-richblack-800 p-6 text-center text-sm text-richblack-200">
          Nu există feedback-uri în așteptare.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewRow
              key={review._id}
              review={review}
              onApprove={handleApprove}
              onReject={handleReject}
              approving={approving === review._id}
              rejecting={rejecting === review._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
