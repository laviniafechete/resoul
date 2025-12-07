import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="border border-brand-primary text-richblack-300 rounded-xl p-7 lg:p-14 flex gap-3 flex-col">
      <h1 className="text-4xl leading-10 font-semibold text-richblack-300 ">
        Ai o idee? Avem abilitățile să facem o echipă bună
      </h1>
      <p className="">
        Spune-ne mai multe despre tine și despre ce ai în minte.
      </p>

      <div className="mt-7">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactForm;
