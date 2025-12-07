import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import IconBtn from "../../../../common/IconBtn";
import Upload from "../Upload";
import {
  VIDEO_AUDIENCE,
  VIDEO_AUDIENCE_OPTIONS,
  VIDEO_PRICING_PLAN,
  VIDEO_PRICING_PLAN_OPTIONS,
  VIDEO_PRICING_BENEFIT,
  VIDEO_PRICING_BENEFIT_OPTIONS,
} from "../../../../../utils/constants";

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

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);

  const [rules, setRules] = useState([DEFAULT_RULE]);
  const initialRulesRef = useRef([DEFAULT_RULE]);

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData.videoUrl);
      const initial = Array.isArray(modalData.pricingRules) && modalData.pricingRules.length
        ? modalData.pricingRules.map(normalizeRule)
        : [DEFAULT_RULE];
      setRules(initial);
      initialRulesRef.current = initial;
    }
  }, []);

  const isFormUpdated = () => {
    const currentValues = getValues();
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ) {
      return true;
    }

    const normalizedCurrent = rules.map(normalizeRule);
    const original = initialRulesRef.current || [DEFAULT_RULE];

    if (normalizedCurrent.length !== original.length) {
      return true;
    }

    for (let i = 0; i < normalizedCurrent.length; i++) {
      const current = normalizedCurrent[i];
      const base = original[i];
      if (
        current.audience !== base.audience ||
        current.plan !== base.plan ||
        current.benefit !== base.benefit
      ) {
        return true;
      }
    }

    return false;
  };

  const handleRuleChange = (index, key, value) => {
    setRules((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return next;
    });
  };

  const handleAddRule = () => {
    setRules((prev) => [...prev, { ...DEFAULT_RULE }]);
  };

  const handleRemoveRule = (index) => {
    setRules((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleEditSubsection = async () => {
    const currentValues = getValues();
    const formData = new FormData();
    formData.append("sectionId", modalData.sectionId);
    formData.append("subSectionId", modalData._id);
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle);
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc);
    }
    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo);
    }

    const normalizedRules = rules.map(normalizeRule);
    if (
      JSON.stringify(normalizedRules) !==
      JSON.stringify(initialRulesRef.current || [DEFAULT_RULE])
    ) {
      formData.append("pricingRules", JSON.stringify(normalizedRules));
    }

    setLoading(true);
    const result = await updateSubSection(formData, token);
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      );
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
      initialRulesRef.current = normalizedRules;
    }
    setModalData(null);
    setLoading(false);
  };

  const onSubmit = async (data) => {
    if (view) return;

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("Nu există modificări de salvat");
      } else {
        await handleEditSubsection();
      }
      return;
    }

    const normalizedRules = rules.map(normalizeRule);

    const invalidRule = normalizedRules.some(
      (rule) => !rule.audience || !rule.plan || !rule.benefit
    );
    if (invalidRule) {
      toast.error("Completează audiența, planul și beneficiul pentru fiecare regulă");
      return;
    }

    const formData = new FormData();
    formData.append("sectionId", modalData);
    formData.append("title", data.lectureTitle);
    formData.append("description", data.lectureDesc);
    formData.append("video", data.lectureVideo);
    formData.append("pricingRules", JSON.stringify(normalizedRules));

    setLoading(true);
    const result = await createSubSection(formData, token);
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result : section
      );
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
    }
    setModalData(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-lavender-100">
        <div className="flex items-center justify-between rounded-t-lg bg-brand-primary p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Vizualizează"} {add && "Adaugă"} {edit && "Editează"} o
            lecție
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10"
        >
          <Upload
            name="lectureVideo"
            label="Videoul lecturii"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />

          <div className="flex flex-col space-y-2">
            <label
              className="text-sm text-richblack-300"
              htmlFor="lectureTitle"
            >
              Titlul lecturii {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Introduceți titlul lecturii"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Titlul lecturii este obligatoriu
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-300" htmlFor="lectureDesc">
              Descrierea lecturii {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Introduceți descrierea lecturii"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Descrierea lecturii este obligatorie
              </span>
            )}
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="rounded-xl border border-brand-primary/40 bg-white p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <p className="text-sm font-semibold text-brand-text">
                    Regula {index + 1}
                  </p>
                  {!view && rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(index)}
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
                      disabled={view || loading}
                      value={rule.audience}
                      onChange={(e) => handleRuleChange(index, "audience", e.target.value)}
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
                      disabled={view || loading}
                      value={rule.plan}
                      onChange={(e) => handleRuleChange(index, "plan", e.target.value)}
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
                      disabled={view || loading}
                      value={rule.benefit}
                      onChange={(e) => handleRuleChange(index, "benefit", e.target.value)}
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
                <p className="mt-3 text-xs text-brand-text/60">
                  Segmentele fără regulă nu vor vedea lecția.
                </p>
              </div>
            ))}

            {!view && (
              <button
                type="button"
                onClick={handleAddRule}
                className="text-xs font-semibold text-brand-primary underline"
              >
                Adaugă regulă
              </button>
            )}
          </div>

          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={
                  loading
                    ? "Se încarcă..."
                    : edit
                    ? "Salvează modificările"
                    : "Salvează"
                }
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
