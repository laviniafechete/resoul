import React, { useEffect, useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
// import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmationModal from "../components/common/ConfirmationModal";
import Footer from "../components/common/Footer";
import RatingStars from "../components/common/RatingStars";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard";
import { formatDate } from "../services/formatDate";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import {
  buyCourse,
  enrollInFreeCourse,
} from "../services/operations/studentFeaturesAPI";

import GetAvgRating from "../utils/avgRating";
import { ACCOUNT_TYPE } from "./../utils/constants";
import { addToCart } from "../slices/cartSlice";

import { GiReturnArrow } from "react-icons/gi";
import { MdOutlineVerified } from "react-icons/md";
import Img from "./../components/common/Img";
import toast from "react-hot-toast";

function CourseDetails() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.profile);
  const { paymentLoading } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Getting courseId from url parameter
  const { courseId } = useParams();
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const startCourseFromContent = (courseData) => {
    const sections = courseData?.courseContent || [];
    if (!Array.isArray(sections) || sections.length === 0) {
      toast("Nu există lecții disponibile pentru rolul tău în acest curs.");
      return;
    }

    const firstSection = sections.find(
      (section) =>
        Array.isArray(section?.subSection) && section.subSection.length
    );

    if (!firstSection) {
      toast("Nu există lecții disponibile pentru rolul tău în acest curs.");
      return;
    }

    const firstLecture = firstSection.subSection[0];
    if (!firstLecture) {
      toast("Nu există lecții disponibile pentru rolul tău în acest curs.");
      return;
    }

    const courseIdToUse = courseData?._id || courseId;

    navigate(
      `/view-course/${courseIdToUse}/section/${firstSection._id}/sub-section/${firstLecture._id}`
    );
  };

  useEffect(() => {
    const fectchCourseDetailsData = async () => {
      setIsLoadingDetails(true);
      try {
        const res = await fetchCourseDetails(courseId);
        setResponse(res);
        const fetched = res?.data?.courseDetails;
        if (fetched && !fetched._id) {
          fetched._id = fetched._id || courseId;
        }
        setErrorInfo(null);
      } catch (error) {
        console.log("Could not fetch Course Details", error);
        setResponse(null);
        setErrorInfo({
          message: error?.message || "Acest curs nu este disponibil momentan.",
          status: error?.status,
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fectchCourseDetailsData();
  }, [courseId]);

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails?.ratingAndReviews);
    setAvgReviewCount(count);
  }, [response]);
  // console.log("avgReviewCount: ", avgReviewCount)

  // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0));
  const handleActive = (id) => {
    // console.log("called", id)
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    );
  };

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  useEffect(() => {
    let lectures = 0;
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0;
    });
    setTotalNoOfLectures(lectures);
  }, [response]);

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Loading skeleton
  if (paymentLoading || loading || isLoadingDetails) {
    return (
      <div className={`mt-24 p-5 flex flex-col justify-center gap-4  `}>
        <div className="flex flex-col sm:flex-col-reverse  gap-4 ">
          <p className="h-44 sm:h-24 sm:w-[60%] rounded-xl skeleton"></p>
          <p className="h-9 sm:w-[39%] rounded-xl skeleton"></p>
        </div>

        <p className="h-4 w-[55%] lg:w-[25%] rounded-xl skeleton"></p>
        <p className="h-4 w-[75%] lg:w-[30%] rounded-xl skeleton"></p>
        <p className="h-4 w-[35%] lg:w-[10%] rounded-xl skeleton"></p>

        {/* Floating Courses Card */}
        <div
          className="right-[1.5rem] top-[20%] hidden lg:block lg:absolute min-h-[450px] w-1/3 max-w-[410px] 
            translate-y-24 md:translate-y-0 rounded-xl skeleton"
        ></div>

        <p className="mt-24 h-60 lg:w-[60%] rounded-xl skeleton"></p>
      </div>
    );
  }

  if (errorInfo) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center text-brand-text">
        <h1 className="mb-4 text-3xl font-semibold">
          {errorInfo.status === 403
            ? "Acces restricționat"
            : "Nu am putut încărca cursul"}
        </h1>
        <p className="mb-6 max-w-xl text-brand-text/80">{errorInfo.message}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-brand-primary px-5 py-2 text-brand-primary transition hover:bg-brand-primary/10"
          >
            Înapoi
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-brand-primary px-5 py-2 text-white transition hover:opacity-90"
          >
            Mergi acasă
          </button>
        </div>
      </div>
    );
  }

  if (!response?.data?.courseDetails) {
    return null;
  }

  // extract course data
  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    tag,
  } = response.data.courseDetails;

  const pricing = response?.data?.courseDetails?.pricing;
  const isFree = pricing?.isFree;
  const isDiscounted = pricing?.isDiscounted;
  const displayPrice = pricing?.displayPrice ?? price;
  const originalPrice = pricing?.originalPrice ?? price;
  const planLabel =
    pricing?.plan === "Subscriber" ? "(beneficiu pentru abonați)" : "";

  // Buy Course handler
  const handleBuyCourse = async () => {
    if (!token) {
      setConfirmationModal({
        text1: "Nu esti logat!",
        text2: "Va rugam sa va logati pentru a continua.",
        btn1Text: "Logare",
        btn2Text: "Anulare",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      });
      return;
    }

    const coursesId = [courseId];

    if (pricing?.isFree) {
      try {
        const enrollmentResult = await enrollInFreeCourse(
          courseId,
          token,
          dispatch
        );

        if (enrollmentResult?.courseDetails) {
          startCourseFromContent(enrollmentResult.courseDetails);
        } else {
          startCourseFromContent(response?.data?.courseDetails);
        }
      } catch (_) {
        // handled in service
      }
      return;
    }

    buyCourse(token, coursesId, user, navigate, dispatch);
  };

  const handleStartCourse = () => {
    startCourseFromContent(response?.data?.courseDetails);
  };

  // Add to cart Course handler
  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.");
      return;
    }
    if (token) {
      dispatch(addToCart(response?.data.courseDetails));
      return;
    }
    setConfirmationModal({
      text1: "Nu esti logat!",
      text2: "Va rugam sa va logati pentru a adauga in cos",
      btn1Text: "Logare",
      btn2Text: "Anulare",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  return (
    <>
      <div className={`relative w-full`}>
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative ">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-cente py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            {/* Go back button */}
            <div
              className="mb-5 lg:mt-10 lg:mb-0 z-[100]  "
              onClick={() => navigate(-1)}
            >
              <GiReturnArrow className="w-10 h-10 text-brand-primary hover:brand-primary cursor-pointer" />
            </div>

            {/* will appear only for small size */}
            <div className="relative block max-h-[30rem] lg:hidden">
              <Img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
            </div>

            {/* Course data */}
            <div
              className={`mb-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-300`}
            >
              <p className="text-4xl font-bold text-richblack-600 sm:text-[42px]">
                {courseName}
              </p>
              <p className="text-richblack-300">{courseDescription}</p>
              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-brand-primary">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span>{`(${ratingAndReviews.length} recenzii)`}</span>
                <span>{`${studentsEnrolled.length} studenti inrolati`}</span>
              </div>
              <p>
                Creat de{" "}
                <span className="font-semibold underline">
                  {instructor.firstName} {instructor.lastName}
                </span>
              </p>
              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2 font-semibold text-2xl">
                  {isFree ? (
                    <span className="text-caribbeangreen-200">Gratuit</span>
                  ) : (
                    <>
                      {isDiscounted && (
                        <span className="text-base text-richblack-300 line-through">
                          Ron {originalPrice}
                        </span>
                      )}
                      <span>Ron {displayPrice}</span>
                    </>
                  )}
                </p>
                {pricing?.benefit === "HalfPrice" && (
                  <span className="rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold text-brand-primary">
                    -50% {planLabel}
                  </span>
                )}
                {pricing?.benefit === "Free" && (
                  <span className="rounded-full bg-caribbeangreen-100/20 px-3 py-1 text-xs font-semibold text-caribbeangreen-200">
                    Gratuit {planLabel}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2">
                  {" "}
                  <BiInfoCircle /> Creat la {formatDate(createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  {" "}
                  <HiOutlineGlobeAlt /> Romana
                </p>
              </div>
            </div>

            {/* will appear only for small size */}
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-300">
                Ron {price}
              </p>
              <button
                className="bg-brand-primary text-white hover:bg-brand-primary hover:text-white rounded-md px-4 py-2"
                onClick={handleBuyCourse}
              >
                Cumpara acum
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-richblack-800 text-white hover:bg-richblack-800 hover:text-white rounded-md px-4 py-2"
              >
                Adauga in cos
              </button>
            </div>
          </div>

          {/* Floating Courses Card */}
          <div className="right-[1.5rem] top-[60px] mx-auto hidden lg:block lg:absolute min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
              onStartCourse={handleStartCourse}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto box-content px-4 text-start text-richblack-300 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* What will you learn section */}
          <div className="my-8 border border-brand-primary rounded-xl p-8">
            <p className="text-3xl font-semibold">Ce vei invata</p>
            <div className="mt-3">
              {whatYouWillLearn &&
                whatYouWillLearn.split("\n").map((line, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <p className="font-bold">{index + 1}.</p>
                    <p className="ml-2">{line}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col lg:flex-row gap-4">
            <p className="text-xl font-bold">Etichete</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tag &&
                tag.map((item, ind) => (
                  <div
                    key={ind}
                    className="p-[4px] bg-brand-primary rounded-full"
                  >
                    <p
                      key={ind}
                      className="p-[4px] text-white text-center font-semibold"
                    >
                      {item}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] mt-9">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">Continutul cursului</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`sectioni`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecturi`}
                  </span>
                  <span>{response.data?.totalDuration} Durata totala</span>
                </div>
                <button
                  className="text-brand-primary"
                  onClick={() => setIsActive([])}
                >
                  Inchide toate sectiunile
                </button>
              </div>
            </div>

            {/* Course Details Accordion - section Subsection */}
            <div className="py-4 ">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Autor</p>
              <div className="flex items-center gap-4 py-4">
                <Img
                  src={instructor.image}
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="text-lg capitalize flex items-center gap-2 font-semibold">
                    {`${instructor.firstName} ${instructor.lastName}`}
                    <span>
                      <MdOutlineVerified className="w-5 h-5 text-[#00BFFF]" />
                    </span>
                  </p>
                  <p className="text-richblack-3000">
                    {instructor?.additionalDetails?.about}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}

export default CourseDetails;
