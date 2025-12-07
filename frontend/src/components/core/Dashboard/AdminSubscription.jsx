import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  fetchStudentSubscriptionPlan,
  updateStudentSubscriptionPlan,
} from "../../../services/operations/subscriptionAPI";

const formatBenefits = (benefits) => (Array.isArray(benefits) ? benefits.join("\n") : "");

export default function AdminSubscription() {
  const { token } = useSelector((state) => state.auth);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    price: "",
    currency: "RON",
    description: "",
    benefitsText: "",
    billingCycleInDays: 30,
    isActive: true,
  });

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      const data = await fetchStudentSubscriptionPlan(token);
      if (data) {
        setPlan(data);
        setForm({
          price: data.price?.toString() ?? "0",
          currency: data.currency || "RON",
          description: data.description || "",
          benefitsText: formatBenefits(data.benefits),
          billingCycleInDays: data.billingCycleInDays || 30,
          isActive: data.isActive ?? true,
        });
      }
      setLoading(false);
    };

    loadPlan();
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const benefitsList = useMemo(() => {
    return form.benefitsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [form.benefitsText]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const payload = {
        price: Number(form.price) || 0,
        currency: form.currency,
        description: form.description,
        benefits: benefitsList,
        billingCycleInDays: Number(form.billingCycleInDays) || 30,
        isActive: form.isActive,
      };

      const updatedPlan = await updateStudentSubscriptionPlan(payload, token);
      if (updatedPlan) {
        setPlan(updatedPlan);
      }
    } catch (error) {
      /* errors handled in service */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-10 space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-richblack-5">
          Configurare abonament studenți
        </h1>
        <p className="mt-2 text-sm text-richblack-300">
          Gestionează prețul, descrierea și beneficiile abonamentului lunar
          pentru studenți.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-richblack-700 bg-richblack-800 p-8 text-center text-richblack-200">
          Se încarcă detaliile planului...
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border border-richblack-700 bg-richblack-800 p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-richblack-300">
                Preț abonament (RON)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  className="form-style"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-richblack-300">
                Monedă
                <input
                  type="text"
                  name="currency"
                  value={form.currency}
                  onChange={handleInputChange}
                  className="form-style"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-richblack-300">
                Durata ciclului (zile)
                <input
                  type="number"
                  min="1"
                  name="billingCycleInDays"
                  value={form.billingCycleInDays}
                  onChange={handleInputChange}
                  className="form-style"
                />
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-richblack-300">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Plan activ
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-richblack-300">
              Descriere
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={4}
                className="form-style resize-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-richblack-300">
              Beneficii (unul pe linie)
              <textarea
                name="benefitsText"
                value={form.benefitsText}
                onChange={handleInputChange}
                rows={5}
                className="form-style resize-none"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-brand-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează planul"}
              </button>
            </div>
          </form>

          <aside className="space-y-4 rounded-lg border border-brand-primary/40 bg-brand-primary/5 p-6">
            <h2 className="text-xl font-semibold text-brand-primary">
              Rezumat plan
            </h2>
            <div className="space-y-2 text-sm text-richblack-200">
              <p>
                <span className="font-medium text-richblack-50">Preț:</span>{" "}
                {Number(form.price) <= 0
                  ? "Gratuit"
                  : `${Number(form.price).toFixed(2)} ${form.currency}`}
              </p>
              <p>
                <span className="font-medium text-richblack-50">Ciclu:</span>{" "}
                {form.billingCycleInDays} zile
              </p>
              <p>
                <span className="font-medium text-richblack-50">Status:</span>{" "}
                {form.isActive ? "Activ" : "Inactiv"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-richblack-50">
                Beneficii afișate utilizatorilor
              </h3>
              {benefitsList.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-richblack-200">
                  {benefitsList.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-richblack-400">
                  Adaugă cel puțin un beneficiu pentru a evidenția abonamentul.
                </p>
              )}
            </div>

            {plan?.updatedAt && (
              <p className="text-xs text-richblack-400">
                Ultima actualizare: {new Date(plan.updatedAt).toLocaleString("ro-RO")}
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

