import React from "react";

import FoundingStory from "../assets/Images/FoundingStory.png";
import BannerImage1 from "../assets/Images/aboutus1.webp";
import BannerImage2 from "../assets/Images/aboutus2.webp";
import BannerImage3 from "../assets/Images/aboutus3.webp";

import Footer from "../components/common/Footer";
import ContactFormSection from "../components/core/AboutPage/ContactFormSection";
import LearningGrid from "../components/core/AboutPage/LearningGrid";
import Quote from "../components/core/AboutPage/Quote";
import StatsComponenet from "../components/core/AboutPage/Stats";
import HighlightText from "../components/core/HomePage/HighlightText";
import Img from "../components/common/Img";
import ReviewSlider from "./../components/common/ReviewSlider";

import { motion } from "framer-motion";
import { fadeIn } from "../components/common/motionFrameVarients";

const About = () => {
  return (
    <div>
      <section className="bg-richblack-700">
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-white">
          <motion.header className="mx-auto py-20 text-4xl font-semibold lg:w-[70%]">
            <motion.p
              variants={fadeIn("down", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
            >
              {" "}
              Descoperă claritatea interioară și echilibrul prin învățare
              conștientă
            </motion.p>

            <motion.p
              variants={fadeIn("up", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="mx-auto mt-3 text-center text-base font-medium text-richblack-300 lg:w-[95%]"
            >
              La ReSoul, credem că fiecare pas spre tine însuți este o formă de
              creștere. Platforma noastră reunește cursuri de dezvoltare
              personală, mindfulness, coaching și echilibru interior, create
              pentru a te ajuta să trăiești mai conștient, mai prezent și mai
              împăcat cu tine.
            </motion.p>
          </motion.header>

          <div className="sm:h-[70px] lg:h-[150px]"></div>

          <div className=" absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-5">
            <Img src={BannerImage1} alt="" />
            <Img src={BannerImage2} alt="" />
            <Img src={BannerImage3} alt="" />
          </div>
        </div>
      </section>

      <section className="border-b border-richblack-700">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="h-[100px] "></div>
          <Quote />
        </div>
      </section>

      <section>
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="flex flex-col items-center gap-10 lg:flex-row justify-between">
            <motion.div
              variants={fadeIn("right", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="my-24 flex lg:w-[50%] flex-col gap-10"
            >
              <h1 className="text-richblack-300 bg-clip-text text-4xl font-semibold lg:w-[70%] ">
                Povestea noastră
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                Suntem o comunitate de oameni care cred în puterea introspecției
                și în echilibrul dintre minte, corp și suflet. Fiecare mentor de
                pe platformă este ales pentru autenticitate, experiență și
                dorința de a aduce lumină în viețile celorlalți. Împreună,
                construim un spațiu sigur, cald și plin de inspirație.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn("left", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
            >
              <Img
                src={FoundingStory}
                alt="FoundingStory"
                className="shadow-[0_0_20px_0] shadow-[#FC6767]"
              />
            </motion.div>
          </div>

          <div className="flex flex-col items-center lg:gap-10 lg:flex-row justify-between">
            <div className="my-24 flex lg:w-[40%] flex-col gap-10">
              <h1 className="text-richblack-300 bg-clip-text text-4xl font-semibold lg:w-[70%] ">
                Viziunea noastră
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                Visul nostru este să redefinim modul în care oamenii învață să
                aibă grijă de ei înșiși; cu blândețe, conștiență și echilibru.
                Ne dorim ca ReSoul să devină un refugiu digital, un loc unde
                învățarea se transformă într-o experiență personală de creștere
                și reconectare cu sinele. Credem că adevărata educație nu
                înseamnă acumulare de informații, ci transformare interioară.
              </p>
            </div>

            <div className="my-24 flex lg:w-[40%] flex-col gap-10">
              <h1 className="text-richblack-300 bg-clip-text text-4xl font-semibold lg:w-[70%] ">
                Misiunea noastră
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                Misiunea noastră merge dincolo de simpla livrare de cursuri.
                Vrem să construim o comunitate vibrantă de oameni care se susțin
                reciproc, care învață unii de la alții și care aleg conștient un
                stil de viață echilibrat și prezent. Prin cursurile, ghidurile
                și sesiunile noastre, oferim instrumente reale pentru a cultiva
                pacea interioară, claritatea mentală și bucuria de a trăi în
                prezent.{" "}
              </p>
            </div>
          </div>
        </div>
      </section>

      <StatsComponenet />

      <section className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white">
        <LearningGrid />
        <ContactFormSection />
      </section>

      {/* Reviws from Other Learner */}
      <div className=" my-20 px-5 text-white ">
        <h1 className="text-center text-4xl font-semibold mt-8">
          Feedback de la comunitatea noastră
        </h1>
        <ReviewSlider />
      </div>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default About;
