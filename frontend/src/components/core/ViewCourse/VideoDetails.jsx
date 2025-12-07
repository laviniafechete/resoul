import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";

import "video-react/dist/video-react.css";
import { BigPlayButton, Player } from "video-react";

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import { setCourseViewSidebar } from "../../../slices/sidebarSlice";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import { toast } from "react-hot-toast";
import { setToken } from "../../../slices/authSlice";
import { setUser } from "../../../slices/profileSlice";
import { resetCart } from "../../../slices/cartSlice";

import IconBtn from "../../common/IconBtn";
import QnaForm from "../QnA/QnaForm";

import { HiMenuAlt1 } from "react-icons/hi";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);
  const allowProgressTracking = user?.accountType === ACCOUNT_TYPE.STUDENT;

  const coursePricing = courseEntireData?.pricing;
  const subscriptionPlan = user?.subscriptionPlan || "Default";
  const subscriptionStatus = user?.subscriptionStatus || "Inactive";
  const accountType = user?.accountType;

  const [videoData, setVideoData] = useState([]);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  const qnaContext = useMemo(
    () => ({
      courseId,
      sectionId,
      subSectionId,
      courseTitle:
        courseEntireData?.courseName ||
        courseEntireData?.title ||
        courseEntireData?.name ||
        "",
      subSectionTitle: videoData?.title || "",
    }),
    [
      courseId,
      sectionId,
      subSectionId,
      courseEntireData?.courseName,
      courseEntireData?.title,
      courseEntireData?.name,
      videoData?._id,
      videoData?.title,
    ]
  );

  const handleCorporateSignup = () => {
    dispatch(setToken(null));
    dispatch(setUser(null));
    dispatch(resetCart());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Te-am deconectat. Creează-ți contul de student.");
    navigate("/signup");
  };

  useEffect(() => {
    (async () => {
      if (!courseSectionData.length) return;
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`);
      } else {
        // console.log("courseSectionData", courseSectionData)
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        );
        // console.log("filteredData", filteredData)
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        );
        // console.log("filteredVideoData = ", filteredVideoData)
        if (filteredVideoData) setVideoData(filteredVideoData[0]);
        setPreviewSource(courseEntireData.thumbnail);
        setVideoEnded(false);
      }
    })();
  }, [courseSectionData, courseEntireData, location.pathname]);

  let ctaConfig = null;
  if (coursePricing) {
    if (accountType === ACCOUNT_TYPE.STUDENT) {
      if (
        coursePricing.plan === "Subscriber" &&
        subscriptionPlan === "Subscriber"
      ) {
        ctaConfig = {
          title: "Acces prin abonament",
          description:
            subscriptionStatus === "Active"
              ? "Lecture este inclusă în abonamentul tău activ. Profită de avantajele pentru abonați."
              : "Această lecție este marcată pentru abonați.",
          action: {
            label: "Gestionează abonamentul",
            onClick: () => navigate("/dashboard/subscription"),
          },
        };
      } else if (coursePricing.isFree) {
        ctaConfig = {
          title: "Lecture gratuită",
          description:
            "Această lecție este disponibilă gratuit pentru toți studenții.",
        };
      } else {
        ctaConfig = {
          title: "Curs achiziționat",
          description:
            "Ai acces complet la acest curs și îți poți urmări progresul.",
        };
      }
    } else if (accountType === ACCOUNT_TYPE.CORPORATE) {
      if (coursePricing.benefit === "Free") {
        ctaConfig = {
          title: "Acces corporate!",
          description:
            "Acest conținut este disponibil gratuit pentru conturile corporate. Pentru acces extins la platformă, creează un cont de student.",
          action: {
            label: "Creează cont student",
            onClick: handleCorporateSignup,
          },
        };
      } else {
        ctaConfig = {
          title: "Conținut premium",
          description:
            "Această lecție aparține unui curs plătit destinat studenților. Contactează administratorul pentru a obține acces complet.",
        };
      }
    } else if (accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      ctaConfig = {
        title: "Mod instructor",
        description:
          "Vizualizezi lecția în modul instructor. Studenții vor vedea progresul lor aici.",
      };
    }
  }

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true;
    } else {
      return false;
    }
  };

  // go to the next video
  const goToNextVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length;

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    // console.log("no of subsections", noOfSubsections)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id;

      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id;
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id;
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      );
    }
  };

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length;

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  // go to the previous video
  const goToPrevVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      );
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id;
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length;
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      );
    }
  };

  // handle Lecture Completion
  const handleLectureCompletion = async () => {
    if (!allowProgressTracking) return;
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  };

  const { courseViewSidebar } = useSelector((state) => state.sidebar);

  // this will hide course video , title , desc, if sidebar is open in small device
  // for good looking i have try this
  if (courseViewSidebar && window.innerWidth <= 640) return;

  return (
    <div className="flex flex-col gap-5 text-white">
      {/* open - close side bar icons */}
      <div
        className="sm:hidden text-white absolute left-7 top-3 cursor-pointer "
        onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}
      >
        {!courseViewSidebar && <HiMenuAlt1 size={33} />}
      </div>

      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          autoPlay
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {/* Render When Video Ends */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {allowProgressTracking &&
                !completedLectures.includes(subSectionId) && (
                  <IconBtn
                    disabled={loading}
                    onclick={() => handleLectureCompletion()}
                    text={!loading ? "Marcheaza ca completat" : "Se incarca..."}
                    customClasses="text-xl max-w-max px-4 mx-auto"
                  />
                )}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  if (playerRef?.current) {
                    // set the current time of the video to 0
                    playerRef?.current?.seek(0);
                    setVideoEnded(false);
                  }
                }}
                text="Uita-te din nou"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />

              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      <h1 className="mt-4 text-3xl font-semibold text-richblack-300">
        {videoData?.title}
      </h1>
      <p className="pt-2 pb-6 text-richblack-300">{videoData?.description}</p>

      {ctaConfig && (
        <div className="mb-6 rounded-lg border border-brand-primary/30 bg-brand-primary/5 p-5 text-sm text-richblack-200">
          <h3 className="text-lg font-semibold text-brand-primary">
            {ctaConfig.title}
          </h3>
          <p className="mt-2 leading-relaxed">{ctaConfig.description}</p>
          {ctaConfig.action && (
            <button
              type="button"
              onClick={() => ctaConfig.action.onClick()}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
            >
              {ctaConfig.action.label}
            </button>
          )}
        </div>
      )}

      <QnaForm
        context={qnaContext}
        variant="inline"
        allowManualContext={false}
      />
    </div>
  );
};

export default VideoDetails;
