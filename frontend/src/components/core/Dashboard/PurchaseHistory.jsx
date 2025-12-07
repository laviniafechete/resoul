import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { studentEndpoints } from "../../../services/apis";

export default function PurchaseHistory() {
  const { token } = useSelector((state) => state.auth);
  const [purchases, setPurchases] = useState(null);
  const [loading, setLoading] = useState(true);

  const getPurchaseHistory = async () => {
    try {
      setLoading(true);
      const response = await apiConnector(
        "GET",
        studentEndpoints.PURCHASE_HISTORY_API,
        null,
        { Authorization: `Bearer ${token}` }
      );
      setPurchases(response?.data?.data || []);
    } catch (error) {
      console.log("Could not fetch purchase history:", error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPurchaseHistory();
  }, []);

  if (loading) {
    return (
      <div className="grid h-[50vh] w-full place-content-center text-center text-richblack-300 text-3xl">
        Loading purchase history...
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="grid h-[50vh] w-full place-content-center text-center text-richblack-300 text-3xl">
        Nu ai nicio achizitie.
      </div>
    );
  }

  return (
    <>
      <div className="text-4xl text-richblack-300 font-boogaloo text-center sm:text-left">
        Istoricul achizitiilor
      </div>

      <div className="my-8 text-richblack-300">
        {/* Headings */}
        <div className="flex rounded-t-2xl text-richblack-600">
          <p className="w-[30%] px-5 py-3">Course</p>
          <p className="w-[20%] px-2 py-3">Amount</p>
          <p className="w-[20%] px-2 py-3">Payment ID</p>
          <p className="w-[20%] px-2 py-3">Date</p>
          <p className="w-[10%] px-2 py-3">Status</p>
        </div>

        {/* Purchase Items */}
        {purchases.map((purchase, i, arr) => (
          <div
            key={i}
            className={`flex flex-col sm:flex-row sm:items-center border border-brand-primary ${
              i === arr.length - 1 ? "rounded-b-2xl" : "rounded-none"
            }`}
          >
            <div className="flex sm:w-[30%] items-center gap-4 px-5 py-3">
              <div className="flex flex-col gap-2">
                <p className="font-semibold">
                  {purchase.courseName || "Unknown Course"}
                </p>
                <p className="text-xs text-richblack-300">
                  {purchase.courseDescription?.length > 50
                    ? `${purchase.courseDescription.slice(0, 50)}...`
                    : purchase.courseDescription || "Fara descriere"}
                </p>
              </div>
            </div>

            <div className="sm:w-[20%] px-2 py-3">
              RON {(purchase.amount / 100).toFixed(2)}
            </div>

            <div className="sm:w-[20%] px-2 py-3 text-xs text-richblack-300">
              {purchase.paymentId?.slice(0, 20)}...
            </div>

            <div className="sm:w-[20%] px-2 py-3 text-sm">
              {new Date(purchase.createdAt).toLocaleDateString()}
            </div>

            <div className="sm:w-[10%] px-2 py-3">
              <span className="text-green-400 text-sm">Completat</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
