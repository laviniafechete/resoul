import React from "react";
import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { BsFillCaretRightFill } from "react-icons/bs";
import { FaShareSquare } from "react-icons/fa";

import { addToCart } from "../../../slices/cartSlice";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import Img from "./../../common/Img";

function CourseDetailsCard({
  course,
  setConfirmationModal,
  handleBuyCourse,
  onStartCourse,
}) {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { thumbnail: ThumbnailImage, _id: courseId, pricing } = course;

  const isEnrolled = Array.isArray(user?.courses)
    ? user.courses.includes(courseId)
    : false;
  const isFree = pricing?.isFree;
  const isDiscounted = pricing?.isDiscounted;
  const displayPrice = pricing?.displayPrice ?? course?.price;
  const originalPrice = pricing?.originalPrice ?? course?.price;
  const benefitLabel =
    pricing?.benefit === "HalfPrice"
      ? "Reducere 50%"
      : pricing?.benefit === "Free"
      ? "Gratuit"
      : null;
  const planLabel = pricing?.plan === "Subscriber" ? "pentru abonați" : "";

  const handleShare = () => {
    copy(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.");
      return;
    }
    if (token) {
      dispatch(addToCart(course));
      return;
    }
    setConfirmationModal({
      text1: "Nu esti logat!",
      text2: "Te rog sa te loghezi pentru a adauga in cos",
      btn1Text: "Logheaza-te",
      btn2Text: "Anuleaza",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };
  console.log(isEnrolled, "isEnrolled!!!");

  const handlePrimaryAction = () => {
    if (isEnrolled) {
      if (onStartCourse) {
        onStartCourse();
      } else {
        navigate("/dashboard/enrolled-courses");
      }
      return;
    }
    handleBuyCourse();
  };

  return (
    <>
      <div
        className={`flex flex-col gap-4 rounded-2xl border border-brand-primary p-4 text-richblack-300 `}
      >
        <Img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="space-y-2 pb-4">
            {benefitLabel && (
              <span className="inline-block rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold text-brand-primary">
                {benefitLabel} {planLabel}
              </span>
            )}
            {isFree ? (
              <p className="text-3xl font-semibold text-caribbeangreen-200">
                Gratuit
              </p>
            ) : (
              <div className="flex items-baseline gap-2 text-3xl font-semibold">
                {isDiscounted && (
                  <span className="text-base text-richblack-400 line-through">
                    Ron {originalPrice}
                  </span>
                )}
                <span>Ron {displayPrice}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {isFree ? (
              <button
                className="text-center text-[16px] px-6 py-3 rounded-md font-bold bg-brand-primary text-white hover:scale-95 transition-all duration-200"
                onClick={handlePrimaryAction}
              >
                {isEnrolled ? "Vezi cursul" : "Începe gratuit"}
              </button>
            ) : (
              <>
                <button
                  className="text-center text-[16px] px-6 py-3 rounded-md font-bold bg-brand-primary text-white hover:scale-95 transition-all duration-200"
                  onClick={handlePrimaryAction}
                >
                  {isEnrolled ? "Vezi cursul" : "Cumpara acum"}
                </button>
                {!isEnrolled && (
                  <button
                    onClick={handleAddToCart}
                    className="text-center text-[13px] px-6 py-3 rounded-md font-bold bg-richblack-800 hover:scale-95 transition-all duration-200"
                  >
                    Adauga in cos
                  </button>
                )}
              </>
            )}
          </div>

          <div className={``}>
            <p className={`my-2 text-xl font-semibold `}>Cerintele cursului:</p>
            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, i) => {
                return (
                  <p className={`flex gap-2 text-center items-center`} key={i}>
                    <BsFillCaretRightFill />
                    <span>{item}</span>
                  </p>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-brand-primary"
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetailsCard;
