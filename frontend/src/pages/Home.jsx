import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

// import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button";
// import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import TimelineSection from "../components/core/HomePage/TimelineSection";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import Footer from "../components/common/Footer";
// import ExploreMore from '../components/core/HomePage/ExploreMore'
import ReviewSlider from "../components/common/ReviewSlider";
import Course_Slider from "../components/core/Catalog/Course_Slider";

import { getCatalogPageData } from "../services/operations/pageAndComponentData";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";

import { MdOutlineRateReview } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";

import { motion } from "framer-motion";
import { fadeIn } from "./../components/common/motionFrameVarients";

// background random images
import backgroundImg1 from "../assets/Images/random bg img/bg1.png";
import backgroundImg2 from "../assets/Images/random bg img/bg2.png";
import backgroundImg3 from "../assets/Images/random bg img/bg3.png";
// import backgroundImg4 from '../assets/Images/random bg img/coding bg4.jpg'
// import backgroundImg5 from '../assets/Images/random bg img/coding bg5.jpg'
// import backgroundImg6 from '../assets/Images/random bg img/coding bg6.jpeg'
// import backgroundImg7 from '../assets/Images/random bg img/coding bg7.jpg'
// import backgroundImg8 from '../assets/Images/random bg img/coding bg8.jpeg'
// import backgroundImg9 from '../assets/Images/random bg img/coding bg9.jpg'
// import backgroundImg10 from '../assets/Images/random bg img/coding bg10.jpg'
// import backgroundImg111 from '../assets/Images/random bg img/coding bg11.jpg'

const randomImges = [
  backgroundImg1,
  backgroundImg2,
  backgroundImg3,
  // backgroundImg4,
  // backgroundImg5,
  // backgroundImg6,
  // backgroundImg7,
  // backgroundImg8,
  // backgroundImg9,
  // backgroundImg10,
  // backgroundImg111,
];

// hardcoded

const Home = () => {
  // get background random images
  const [backgroundImg, setBackgroundImg] = useState(null);

  useEffect(() => {
    const bg = randomImges[Math.floor(Math.random() * randomImges.length)];
    setBackgroundImg(bg);
  }, []);

  // console.log('bg ==== ', backgroundImg)

  // get courses data
  const [CatalogPageData, setCatalogPageData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const findTopCategory = async () => {
      try {
        // 1) fetch all categories (ids)
        const res = await apiConnector(
          "GET",
          courseEndpoints.COURSE_CATEGORIES_API
        );
        const categories = res?.data?.data || [];
        if (!categories.length) return;

        // 2) for each category, fetch its catalog data and track course count
        const results = [];
        for (const cat of categories) {
          try {
            const data = await getCatalogPageData(cat._id, dispatch);
            const count = data?.selectedCategory?.courses?.length || 0;
            if (count > 0) {
              results.push({ id: cat._id, count, data });
            }
          } catch (error) {
            console.log(`Failed to fetch data for category ${cat._id}:`, error);
            // Skip categories that return 404 or other errors
          }
        }

        // 3) pick the category with max courses
        let max = { id: null, count: -1, data: null };
        for (const r of results) {
          if (r.count > max.count) max = r;
        }

        if (max.id) {
          setCatalogPageData(max.data);
        } else {
          // If no category has courses, try to get any category data for fallback
          try {
            const fallbackData = await getCatalogPageData(
              categories[0]._id,
              dispatch
            );
            setCatalogPageData(fallbackData);
          } catch (error) {
            console.log("No valid category data found");
          }
        }

        // 4) Get all courses for "Top inscrieri" section
        try {
          const allCoursesRes = await apiConnector(
            "GET",
            courseEndpoints.GET_ALL_COURSE_API
          );
          if (allCoursesRes?.data?.success) {
            const courses = allCoursesRes.data.data || [];
            // Sort by studentsEnrolled length (most enrolled first)
            const sortedCourses = courses
              .filter((course) => course.status === "Published")
              .sort(
                (a, b) =>
                  (b.studentsEnrolled?.length || 0) -
                  (a.studentsEnrolled?.length || 0)
              )
              .slice(0, 10);
            setAllCourses(sortedCourses);
          }
        } catch (error) {
          console.log("Error fetching all courses:", error);
        }
      } catch (e) {
        console.log("Error finding top category:", e);
      }
    };

    findTopCategory();
  }, [dispatch]);

  // console.log('================ CatalogPageData?.selectedCourses ================ ', CatalogPageData)

  return (
    <React.Fragment>
      {/* background random image */}
      <div>
        <div className="absolute inset-0 h-screen overflow-hidden">
          <img
            src={backgroundImg}
            alt="Background"
            className="h-full w-full object-cover object-top md:object-[center_20%]"
          />
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#F8F7F4]/90 to-transparent"></div>
        </div>
      </div>

      <div className=" ">
        {/*Section1  */}
        <div className="relative z-10 min-h-screen justify-center mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-brand-text">
          <Link to={"/signup"}>
            <div
              className="z-0 group p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200
                                        transition-all duration-200 hover:scale-95 w-fit"
            >
              <div
                className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                              transition-all duration-200 group-hover:bg-richblack-900"
              >
                <p>Alătură-te ca mentor</p>
                <FaArrowRight />
              </div>
            </div>
          </Link>

          <motion.div
            variants={fadeIn("left", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className="text-center text-white font-lato text-4xl lg:text-5xl font-semibold mt-7 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          >
            Redescoperă-ți echilibrul și claritatea interioară
            {/* <HighlightText text={"Coding Skills"} /> */}
          </motion.div>

          <motion.div
            variants={fadeIn("right", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className="mt-4 w-[90%] text-center font-lato text-base lg:text-lg text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
          >
            Transformă-ți viața prin cursuri de dezvoltare personală,
            mindfulness și coaching. Îți oferim instrumente reale pentru a trăi
            mai conștient, mai prezent și mai împlinit.{" "}
          </motion.div>

          <div className="flex flex-row gap-7 mt-8">
            <CTAButton active={true} linkto={"/signup"}>
              Începe călătoria ta
            </CTAButton>

            <CTAButton active={false} linkto={"/login"}>
              Explorează cursurile noastre
            </CTAButton>
          </div>
        </div>

        {/* animated code */}
        <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between">
          {/* Code block 1 */}
          {/* <div className=''>
                        <CodeBlocks
                            position={"lg:flex-row"}
                            heading={
                                <div className='text-3xl lg:text-4xl font-semibold'>
                                    Unlock Your
                                    <HighlightText text={"coding potential "} />
                                    with our online courses
                                </div>
                            }
                            subheading={
                                "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
                            }
                            ctabtn1={
                                {
                                    btnText: "try it yourself",
                                    linkto: "/signup",
                                    active: true,
                                }
                            }
                            ctabtn2={
                                {
                                    btnText: "learn more",
                                    linkto: "/login",
                                    active: false,
                                }
                            }

                            codeblock={`<<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n</head>\n<body>\n<h1><ahref="/">Header</a>\n</h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</a><ahref="three/">Three</a>\n</nav>`}
                            codeColor={"text-yellow-25"}
                            backgroundGradient={"code-block1-grad"}
                        />
                    </div> */}

          {/* Code block 2 */}
          {/* <div>
                        <CodeBlocks
                            position={"lg:flex-row-reverse"}
                            heading={
                                <div className="w-[100%] text-3xl lg:text-4xl font-semibold lg:w-[50%]">
                                    Start
                                    <HighlightText text={"coding in seconds"} />
                                </div>
                            }
                            subheading={
                                "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
                            }
                            ctabtn1={{
                                btnText: "Continue Lesson",
                                link: "/signup",
                                active: true,
                            }}
                            ctabtn2={{
                                btnText: "Learn More",
                                link: "/signup",
                                active: false,
                            }}
                            codeColor={"text-white"}
                            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
                            backgroundGradient={"code-block2-grad"}
                        />
                    </div> */}

          <LearningLanguageSection />

          {/* course slider */}
          <div className="mx-auto box-content w-full max-w-maxContentTab px- py-12 lg:max-w-maxContent">
            <h2 className="text-richblack-300 mb-6 text-2xl ">
              Cursuri populare pentru tine
            </h2>
            <Course_Slider
              Courses={CatalogPageData?.selectedCategory?.courses}
            />
          </div>
          <div className="mx-auto box-content w-full max-w-maxContentTab px- py-12 lg:max-w-maxContent">
            <h2 className="text-richblack-300 mb-6 text-2xl ">Top inscrieri</h2>
            <Course_Slider
              Courses={
                allCourses.length > 0
                  ? allCourses
                  : CatalogPageData?.mostSellingCourses
              }
            />
          </div>

          {/* <ExploreMore /> */}
        </div>

        {/*Section 2  */}
        <div className="bg-pure-greys-5 text-richblack-700 ">
          <div className="homepage_bg h-[310px]">
            <div className="w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto">
              <div className="h-[150px]"></div>
              <div className="flex flex-row gap-7 text-white ">
                <CTAButton active={true} linkto={"/signup"}>
                  <div className="flex items-center gap-3">
                    Explorează catalogul nostru
                    <FaArrowRight />
                  </div>
                </CTAButton>
                <CTAButton active={false} linkto={"/signup"}>
                  <div>Descoperă cursurile noastre</div>
                </CTAButton>
              </div>
            </div>
          </div>

          <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7">
            <div className="flex flex-col lg:flex-row gap-5 mb-10 mt-[95px]">
              <div className="text-3xl lg:text-4xl font-semibold w-full lg:w-[45%]">
                Descoperă abilitățile de care ai nevoie pentru o viață
                echilibrată
              </div>

              <div className="flex flex-col gap-10 w-full lg:w-[40%] items-start">
                <div className="text-[16px]">
                  Trăim într-o lume în care echilibrul interior și claritatea
                  mentală sunt la fel de importante ca succesul profesional.
                  Platforma noastră te ajută să îți dezvolți abilități esențiale
                  pentru o viață conștientă și împlinită.{" "}
                </div>
                <CTAButton active={true} linkto={"/signup"}>
                  <div>Descoperă cursurile noastre</div>
                </CTAButton>
              </div>
            </div>

            {/* leadership */}
            <TimelineSection />
          </div>
        </div>

        {/*Section 3 */}
        <div className="mt-14 w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-8 first-letter bg-lavender-100 text-white">
          <InstructorSection />

          {/* Reviws from Other Learner */}
          <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
            Feedback de la comunitatea noastră{" "}
            <MdOutlineRateReview className="text-brand-primary" />
          </h1>
          <ReviewSlider />
        </div>

        {/*Footer */}
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default Home;
