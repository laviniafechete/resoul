import React from "react";
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";

const LearningGridArray = [
  {
    order: -1,
    heading: "Învățare conștientă pentru o viață în echilibru",
    description:
      "La ReSoul, credem că adevărata învățare începe din interior. Prin cursuri create de mentori dedicați și pasionați, îți oferim un spațiu în care poți explora, învăța și crește în propriul ritm, indiferent unde te afli. Fiecare lecție e un pas spre claritate, echilibru și o viață trăită cu sens.",
    BtnText: "Descoperă cursurile noastre",
    BtnLink: "/",
  },
  {
    order: 1,
    heading: "Cursuri pentru suflet și minte",
    description:
      "Fiecare curs e conceput pentru a aduce echilibru între gând, emoție și acțiune — combinând introspecția cu pași practici.",
  },
  {
    order: 2,
    heading: "Metode bazate pe conștiență",
    description:
      "Experiențele de învățare sunt ghidate de practici de mindfulness, reflecție și exerciții menite să aducă calm și claritate.",
  },
  {
    order: 3,
    heading: "Mentori autentici",
    description:
      "Toți mentorii ReSoul sunt oameni care trăiesc ceea ce predau — prezenți, empatici și dedicați transformării personale.",
  },
  {
    order: 4,
    heading: "Certificare interioară",
    description:
      "Adevărata recunoaștere vine din progresul tău. Urmărește-ți transformarea, nu doar completarea unui curs.",
  },
  {
    order: 5,
    heading: "Progres personalizat",
    description:
      "Învață în ritmul tău. Platforma îți oferă un parcurs adaptat nevoilor tale și obiectivelor personale.",
  },
];

const LearningGrid = () => {
  return (
    <div className="grid mx-auto w-[350px] lg:w-fit grid-cols-1 lg:grid-cols-4 mb-12">
      {LearningGridArray.map((card, i) => {
        return (
          <div
            key={i}
            className={`${i === 0 && "lg:col-span-2 lg:h-[294px]"}  ${
              card.order % 2 === 1
                ? "bg-richblack-700 h-[294px]"
                : card.order % 2 === 0
                ? "bg-richblack-800 h-[294px]"
                : "bg-transparent"
            } ${card.order === 3 && "lg:col-start-2"}  `}
          >
            {card.order < 0 ? (
              <div className="lg:w-[90%] flex flex-col gap-3 pb-10 lg:pb-0">
                <div className="text-4xl font-semibold ">
                  {card.heading}
                  <HighlightText text={card.highlightText} />
                </div>
                <p className="text-richblack-300 font-medium">
                  {card.description}
                </p>

                <div className="w-fit mt-2">
                  <CTAButton active={true} linkto={card.BtnLink}>
                    {card.BtnText}
                  </CTAButton>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col gap-8">
                <h1 className="text-richblack-5 text-lg">{card.heading}</h1>

                <p className="text-richblack-300 font-medium">
                  {card.description}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningGrid;
