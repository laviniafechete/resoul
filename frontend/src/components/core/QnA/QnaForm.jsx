import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { submitQnaQuestion } from "../../../services/operations/qnaAPI";

const QnaForm = ({
  context = {},
  variant = "page",
  allowManualContext = true,
}) => {
  const { user } = useSelector((state) => state.profile);

  const [question, setQuestion] = useState("");
  const [courseTitle, setCourseTitle] = useState(context.courseTitle || "");
  const [videoTitle, setVideoTitle] = useState(context.subSectionTitle || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState(null);

  useEffect(() => {
    setCourseTitle(context.courseTitle || "");
    setVideoTitle(context.subSectionTitle || "");
  }, [
    context?.courseId,
    context?.subSectionId,
    context?.courseTitle,
    context?.subSectionTitle,
  ]);

  const containerClasses =
    variant === "inline"
      ? "rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5"
      : "rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-10 space-y-6";

  const hasContext = useMemo(() => {
    return Boolean(
      context?.courseTitle ||
        context?.subSectionTitle ||
        context?.courseId ||
        courseTitle ||
        videoTitle
    );
  }, [
    context?.courseId,
    context?.courseTitle,
    context?.subSectionTitle,
    courseTitle,
    videoTitle,
  ]);

  const buildPayload = () => {
    const payload = {
      question: question.trim(),
      courseId: context?.courseId,
      sectionId: context?.sectionId,
      subSectionId: context?.subSectionId,
      courseTitle: (courseTitle || context?.courseTitle || "").trim(),
      subSectionTitle: (videoTitle || context?.subSectionTitle || "").trim(),
    };

    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === undefined ||
        payload[key] === null ||
        payload[key] === ""
      ) {
        delete payload[key];
      }
    });

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) {
      toast.error("Te rugăm să completezi întrebarea.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQnaQuestion(buildPayload());
      setQuestion("");
      setLastSubmittedAt(new Date());
    } catch (error) {
      // Feedback is handled inside submitQnaQuestion
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={containerClasses}>
      <header className="space-y-2 text-white">
        <p className="text-xs uppercase tracking-wider text-brand-primary">
          Întrebări & răspunsuri
        </p>
        <h2 className="text-xl font-semibold lg:text-2xl">
          {variant === "inline"
            ? "Ai o nelămurire despre această lecție?"
            : "Ai o întrebare pentru echipa ReSoul?"}
        </h2>
        <p className="text-sm text-richblack-200">
          Trimitem automat numele, audiența și emailul din contul tău împreună
          cu întrebarea. Răspunsul va veni direct pe email.
        </p>
      </header>

      {user && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-richblack-200">
          <div className="flex flex-wrap gap-3">
            <p>
              <span className="text-white font-medium">Nume:</span>{" "}
              {user.firstName} {user.lastName}
            </p>
            <p>
              <span className="text-white font-medium">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="text-white font-medium">Audiență:</span>{" "}
              {user.accountType}
            </p>
          </div>
        </div>
      )}

      {hasContext && (
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-sm text-richblack-200">
          <p className="text-white font-medium mb-2">Contextul întrebării</p>
          <ul className="list-disc pl-5 space-y-1">
            {(courseTitle || context?.courseTitle) && (
              <li>
                Curs:{" "}
                <span className="text-white">
                  {courseTitle || context?.courseTitle}
                </span>
              </li>
            )}
            {(videoTitle || context?.subSectionTitle) && (
              <li>
                Lecție:{" "}
                <span className="text-white">
                  {videoTitle || context?.subSectionTitle}
                </span>
              </li>
            )}
          </ul>
          {allowManualContext && (
            <p className="mt-2 text-xs text-richblack-200">
              Poți edita aceste câmpuri pentru a oferi mai multe detalii.
            </p>
          )}
        </div>
      )}

      {allowManualContext && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-richblack-200">
            Curs (opțional)
            <input
              type="text"
              value={courseTitle}
              onChange={(event) => setCourseTitle(event.target.value)}
              placeholder="Introdu numele cursului"
              className="mt-2 w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-brand-primary"
            />
          </label>
          <label className="text-sm text-richblack-200">
            Lecție / video (opțional)
            <input
              type="text"
              value={videoTitle}
              onChange={(event) => setVideoTitle(event.target.value)}
              placeholder="Introdu lecția la care te referi"
              className="mt-2 w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-brand-primary"
            />
          </label>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="text-sm text-richblack-200">
          Întrebarea ta
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Scrie întrebarea cât mai clar. Include detalii utile pentru a primi un răspuns rapid."
            rows={variant === "inline" ? 4 : 6}
            className="mt-2 w-full rounded-2xl border border-white/15 bg-richblack-800/40 px-4 py-3 text-white outline-none focus:border-brand-primary"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? "Se trimite..." : "Trimite întrebarea"}
          </button>
          {lastSubmittedAt && (
            <p className="text-xs text-richblack-300">
              Ultima întrebare trimisă la{" "}
              {lastSubmittedAt.toLocaleString("ro-RO")}
            </p>
          )}
        </div>
      </form>
    </section>
  );
};

export default QnaForm;

