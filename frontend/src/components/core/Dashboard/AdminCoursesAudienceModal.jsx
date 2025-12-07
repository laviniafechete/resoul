import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-hot-toast";

import {
  getFullDetailsOfCourse,
  updateSubSection,
} from "../../../services/operations/courseDetailsAPI";
import {
  VIDEO_AUDIENCE_OPTIONS,
  VIDEO_PRICING_PLAN_OPTIONS,
  VIDEO_PRICING_BENEFIT_OPTIONS,
  VIDEO_AUDIENCE,
  VIDEO_PRICING_PLAN,
  VIDEO_PRICING_BENEFIT,
} from "../../../utils/constants";

const DEFAULT_RULE = {
  audience: VIDEO_AUDIENCE.STUDENT,
  plan: VIDEO_PRICING_PLAN.DEFAULT,
  benefit: VIDEO_PRICING_BENEFIT.FULL_PRICE,
};

const normalizeRule = (rule) => {
  if (!rule || typeof rule !== "object") {
    return { ...DEFAULT_RULE };
  }
  const audience =
    VIDEO_AUDIENCE_OPTIONS.find((opt) => opt.value === rule.audience)?.value ||
    DEFAULT_RULE.audience;
  const plan =
    VIDEO_PRICING_PLAN_OPTIONS.find((opt) => opt.value === rule.plan)?.value ||
    DEFAULT_RULE.plan;
  const benefit =
    VIDEO_PRICING_BENEFIT_OPTIONS.find((opt) => opt.value === rule.benefit)?.value ||
    DEFAULT_RULE.benefit;
  return { audience, plan, benefit };
};

export default function AdminCoursesAudienceModal({ courseId, onClose }) {
  const { token } = useSelector((state) => state.auth);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const [rulesState, setRulesState] = useState({});
  const [originalRules, setOriginalRules] = useState({});

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getFullDetailsOfCourse(courseId, token);
        if (!result || !result?.courseDetails) {
          throw new Error("Nu s-au putut încărca detaliile cursului");
        }
        const course = result.courseDetails;
        setCourseData(course);

        const initial = {};
        course.courseContent?.forEach((section) => {
          section.subSection?.forEach((sub) => {
            initial[sub._id] =
              Array.isArray(sub.pricingRules) && sub.pricingRules.length
                ? sub.pricingRules.map(normalizeRule)
                : [{ ...DEFAULT_RULE }];
          });
        });
        setRulesState(initial);
        setOriginalRules(initial);
      } catch (error) {
        console.error("Failed to load course details", error);
        toast.error(
          error?.message || "Nu am putut încărca detaliile cursului. Încearcă din nou."
        );
        onClose?.();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, token, onClose]);

  const handleRuleChange = (subId, ruleIndex, key, value) => {
    setRulesState((prev) => {
      const current = prev[subId] ? [...prev[subId]] : [{ ...DEFAULT_RULE }];
      current[ruleIndex] = {
        ...current[ruleIndex],
        [key]: value,
      };
      return { ...prev, [subId]: current };
    });
  };

  const handleAddRule = (subId) => {
    setRulesState((prev) => {
      const current = prev[subId] ? [...prev[subId]] : [];
      current.push({ ...DEFAULT_RULE });
      return { ...prev, [subId]: current };
    });
  };

  const handleRemoveRule = (subId, ruleIndex) => {
    setRulesState((prev) => {
      const current = prev[subId] ? [...prev[subId]] : [];
      if (current.length <= 1) return prev;
      current.splice(ruleIndex, 1);
      return { ...prev, [subId]: current };
    });
  };

  const hasChanges = useMemo(() => {
    const map = {};
    Object.keys(rulesState).forEach((subId) => {
      const current = (rulesState[subId] || []).map(normalizeRule);
      const original = (originalRules[subId] || []).map(normalizeRule);
      if (current.length !== original.length) {
        map[subId] = true;
        return;
      }
      map[subId] = current.some((rule, index) => {
        const base = original[index];
        return (
          rule.audience !== base.audience ||
          rule.plan !== base.plan ||
          rule.benefit !== base.benefit
        );
      });
    });
    return map;
  }, [rulesState, originalRules]);

  const handleSave = async (sectionId, subSectionId) => {
    const rules = (rulesState[subSectionId] || []).map(normalizeRule);
    if (!rules.length) {
      toast.error("Adaugă cel puțin o regulă");
      return;
    }
    const invalid = rules.some((rule) => !rule.audience || !rule.plan || !rule.benefit);
    if (invalid) {
      toast.error("Completează audiența, planul și beneficiul pentru fiecare regulă");
      return;
    }

    const formData = new FormData();
    formData.append("sectionId", sectionId);
    formData.append("subSectionId", subSectionId);
    formData.append("pricingRules", JSON.stringify(rules));

    try {
      setSaving(subSectionId);
      const updatedSection = await updateSubSection(formData, token);
      if (!updatedSection) {
        throw new Error("Nu am putut salva modificarea");
      }

      setCourseData((prev) => {
        if (!prev) return prev;
        const updatedContent = prev.courseContent.map((section) =>
          section._id === sectionId ? updatedSection : section
        );
        return { ...prev, courseContent: updatedContent };
      });

      const normalized = {};
      updatedSection.subSection?.forEach((sub) => {
        normalized[sub._id] =
          Array.isArray(sub.pricingRules) && sub.pricingRules.length
            ? sub.pricingRules.map(normalizeRule)
            : [{ ...DEFAULT_RULE }];
      });

      setRulesState((prev) => ({ ...prev, ...normalized }));
      setOriginalRules((prev) => ({ ...prev, ...normalized }));

      toast.success("Reguli actualizate");
    } catch (error) {
      console.error("Failed to update pricing rules", error);
      toast.error(
        error?.message || "Nu am putut actualiza regulile. Încearcă din nou."
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-brand-primary/40 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-text">
              Configurare audiență & preț
            </h2>
            <p className="text-sm text-brand-text/70">
              Segmentezi accesul și beneficiile de preț pentru fiecare lecție.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-brand-text transition hover:bg-lavender-100"
            aria-label="Închide"
          >
            <RxCross2 size={22} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="py-10 text-center text-brand-text">Se încarcă...</div>
          ) : !courseData ? (
            <div className="py-10 text-center text-brand-text">
              Nu am găsit detalii pentru acest curs.
            </div>
          ) : (
            courseData.courseContent?.map((section) => (
              <div
                key={section._id}
                className="mb-6 rounded-xl border border-brand-primary/40 bg-lavender-50/60"
              >
                <div className="border-b border-brand-primary/30 px-4 py-3">
                  <h3 className="text-lg font-semibold text-brand-text">
                    {section.sectionName || "Secțiune"}
                  </h3>
                </div>

                <div className="divide-y divide-brand-primary/20">
                  {section.subSection?.map((sub) => {
                    const rules = rulesState[sub._id] || [{ ...DEFAULT_RULE }];
                    const changed = hasChanges[sub._id];

                    return (
                      <div key={sub._id} className="px-4 py-4">
                        <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-brand-text">{sub.title}</p>
                            <p className="text-xs text-brand-text/60">
                              {sub.timeDuration ? `${sub.timeDuration} sec` : ""}
                            </p>
                          </div>
                          <button
                            disabled={saving === sub._id || !changed}
                            onClick={() => handleSave(section._id, sub._id)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              changed
                                ? "bg-brand-primary text-white hover:opacity-90"
                                : "bg-brand-primary/30 text-white/70 cursor-not-allowed"
                            } ${saving === sub._id ? "animate-pulse" : ""}`}
                          >
                            {saving === sub._id ? "Se salvează..." : "Salvează"}
                          </button>
                        </div>

                        <div className="space-y-4">
                          {rules.map((rule, ruleIndex) => (
                            <div
                              key={`${sub._id}-${ruleIndex}`}
                              className="rounded-xl border border-brand-primary/30 bg-white p-4"
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <p className="text-sm font-semibold text-brand-text">
                                  Regula {ruleIndex + 1}
                                </p>
                                {rules.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRule(sub._id, ruleIndex)}
                                    className="text-xs text-brand-primary underline"
                                  >
                                    Elimină
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col gap-4 md:flex-row">
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs uppercase tracking-wide text-brand-text/60">
                                    Audiență
                                  </label>
                                  <select
                                    value={rule.audience}
                                    onChange={(e) =>
                                      handleRuleChange(sub._id, ruleIndex, "audience", e.target.value)
                                    }
                                    className="form-style w-full"
                                  >
                                    {VIDEO_AUDIENCE_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs uppercase tracking-wide text-brand-text/60">
                                    Plan
                                  </label>
                                  <select
                                    value={rule.plan}
                                    onChange={(e) =>
                                      handleRuleChange(sub._id, ruleIndex, "plan", e.target.value)
                                    }
                                    className="form-style w-full"
                                  >
                                    {VIDEO_PRICING_PLAN_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs uppercase tracking-wide text-brand-text/60">
                                    Beneficiu
                                  </label>
                                  <select
                                    value={rule.benefit}
                                    onChange={(e) =>
                                      handleRuleChange(sub._id, ruleIndex, "benefit", e.target.value)
                                    }
                                    className="form-style w-full"
                                  >
                                    {VIDEO_PRICING_BENEFIT_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddRule(sub._id)}
                          className="mt-3 text-xs font-semibold text-brand-primary underline"
                        >
                          Adaugă regulă
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-brand-primary/30 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-brand-primary px-5 py-2 text-sm text-brand-primary transition hover:bg-brand-primary/10"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}

