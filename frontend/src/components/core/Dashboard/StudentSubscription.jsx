import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchStudentSubscriptionPlan,
  startStudentSubscriptionCheckout,
  confirmStudentSubscription,
} from "../../../services/operations/subscriptionAPI";
import { setUser } from "../../../slices/profileSlice";

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (_) {
    return null;
  }
};

export default function StudentSubscription() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const isSubscriber = user?.subscriptionPlan === "Subscriber";
  const activeUntil = formatDate(user?.subscriptionActiveUntil);

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      const data = await fetchStudentSubscriptionPlan(token);
      setPlan(data);
      setLoading(false);
    };

    loadPlan();
  }, [token]);

  useEffect(() => {
    const status = searchParams.get("status");
    const sessionId = searchParams.get("session_id");

    if (status === "success" && sessionId) {
      (async () => {
        try {
          await confirmStudentSubscription(sessionId, token, dispatch);
          setStatusMessage("Abonamentul a fost confirmat cu succes.");
        } catch (error) {
          setStatusMessage(
            error?.message || "Nu am putut confirma abonamentul."
          );
        } finally {
          setSearchParams({});
        }
      })();
    }
  }, [searchParams, token, dispatch, setSearchParams]);

  const handleSubscribe = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setProcessing(true);
    try {
      const result = await startStudentSubscriptionCheckout(token);
      if (result.autoActivated && result.user) {
        dispatch(setUser(result.user));
        setStatusMessage("Abonamentul a fost activat instantaneu.");
        navigate("/dashboard/subscription");
        return;
      }

      if (result.url) {
        window.location.assign(result.url);
      }
    } catch (error) {
      setStatusMessage(error?.message || "Nu am putut iniția abonamentul.");
    } finally {
      setProcessing(false);
    }
  };

  const benefits = useMemo(() => {
    if (!plan?.benefits || !Array.isArray(plan.benefits)) return [];
    return plan.benefits.filter(Boolean);
  }, [plan]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-richblack-100">
          Abonamentul meu
        </h1>
        <p className="mt-2 text-sm text-richblack-300">
          Beneficiază de acces gratuit sau reduceri la cursurile marcate pentru
          abonați.
        </p>
      </div>

      {statusMessage && (
        <div className="rounded-md border border-caribbeangreen-200/60 bg-caribbeangreen-100/10 px-4 py-3 text-sm text-caribbeangreen-100">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-richblack-700 bg-richblack-800 p-8 text-center text-richblack-200">
          Se încarcă detaliile abonamentului...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <section className="space-y-4 rounded-lg border border-brand-primary/40 bg-brand-primary/5 p-6">
            <h2 className="text-2xl font-semibold text-brand-primary">
              {plan?.price > 0
                ? `${Number(plan.price).toFixed(2)} ${
                    plan.currency || "RON"
                  }/lună`
                : "Abonament gratuit"}
            </h2>
            <p className="text-sm text-richblack-200">{plan?.description}</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-richblack-100">
              {benefits.length ? (
                benefits.map((benefit) => <li key={benefit}>{benefit}</li>)
              ) : (
                <li>
                  Beneficiile vor fi afișate aici imediat ce administratorul le
                  configurează.
                </li>
              )}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={processing || isSubscriber}
              className="mt-4 rounded-md bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubscriber
                ? "Ești deja abonat"
                : processing
                ? "Se procesează..."
                : "Devino abonat"}
            </button>
          </section>

          <section className="space-y-4 rounded-lg border border-richblack-700 bg-richblack-800 p-6">
            <h2 className="text-xl font-semibold text-richblack-5">
              Starea abonamentului
            </h2>
            <div className="space-y-2 text-sm text-richblack-200">
              <p>
                <span className="font-medium text-richblack-50">Status:</span>{" "}
                {isSubscriber ? "Activ" : "Neactiv"}
              </p>
              {activeUntil && (
                <p>
                  <span className="font-medium text-richblack-50">
                    Valabil până la:
                  </span>{" "}
                  {activeUntil}
                </p>
              )}
              <p>
                <span className="font-medium text-richblack-50">
                  Plan curent:
                </span>{" "}
                {user?.subscriptionPlan || "Default"}
              </p>
            </div>

            <div className="rounded-md border border-richblack-700 bg-richblack-900 p-4 text-sm text-richblack-200">
              <p className="font-semibold text-richblack-50">
                Cum funcționează?
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Selectezi abonamentul și finalizezi plata.</li>
                <li>Ai acces instant la cursurile gratuite pentru abonați.</li>
                <li>
                  Cursurile cu reducere 50% vor afișa automat prețul redus la
                  achiziție.
                </li>
              </ol>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
