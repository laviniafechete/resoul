import React from "react";
import progress1 from "../../../assets/Images/progress1.png";
import progress2 from "../../../assets/Images/progress2.png";
import progress3 from "../../../assets/Images/progress3.png";
import CTAButton from "../HomePage/Button";

const LearningLanguageSection = () => {
  return (
    <div className="mt-[130px] mb-10">
      <div className="flex flex-col gap-5 items-center">
        <div className="text-3xl lg:text-4xl font-semibold text-center text-richblack-300">
          Platformă completă pentru dezvoltarea ta personală
        </div>

        <div className="lg:text-center text-richblack-600 mx-auto text-base font-medium lg:w-[70%]">
          Accesează cursuri structurate de mindfulness, echilibru interior și
          coaching. Monitorizează-ți progresul, stabilește obiective clare și
          descoperă metode practice pentru o evoluție constantă, totul într-un
          spațiu digital dedicat creșterii tale.{" "}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center mt-5 gap-6 lg:gap-12">
          <img
            src={progress1}
            alt="KnowYourProgressImage"
            className="object-contain max-w-[300px] rotate-[-20deg]"
          />
          <img
            src={progress2}
            alt="KnowYourProgressImage"
            className="object-contain max-w-[300px]"
          />
          <img
            src={progress3}
            alt="KnowYourProgressImage"
            className="object-contain max-w-[300px] rotate-[20deg] mt-10 mb-10 lg:mt-0 lg:mb-0"
          />
        </div>

        <div className="w-fit">
          <CTAButton active={true} linkto={"/signup"}>
            <div>Descoperă cursurile noastre</div>
          </CTAButton>
        </div>
      </div>
    </div>
  );
};

export default LearningLanguageSection;
