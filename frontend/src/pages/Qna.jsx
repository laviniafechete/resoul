import React from "react";
import { useLocation } from "react-router-dom";

import QnaForm from "../components/core/QnA/QnaForm";

const Qna = () => {
  const location = useLocation();
  const context = location.state?.context || {};

  return (
    <div className="w-11/12 max-w-5xl mx-auto py-16 text-white">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">
          Q&A
        </p>
        <h1 className="text-3xl font-semibold lg:text-4xl">
          Întreabă echipa ReSoul
        </h1>
        <p className="text-base text-richblack-200 lg:text-lg">
          Indiferent de tipul de cont sau de lecția la care lucrezi, poți
          trimite aici întrebările tale. Echipa primește imediat mesajul și îți
          va răspunde pe emailul cu care ești autentificat(ă).
        </p>
      </div>

      <QnaForm context={context} variant="page" allowManualContext />
    </div>
  );
};

export default Qna;
