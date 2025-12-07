import React, { useEffect, useState } from "react";
// Icons
// import { FaRegStar, FaStar } from "react-icons/fa"
// import ReactStars from "react-rating-stars-component"
import { Link } from "react-router-dom";

import GetAvgRating from "../../../utils/avgRating";
import RatingStars from "../../common/RatingStars";
import Img from "./../../common/Img";

function Course_Card({ course, Height }) {
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews);
    setAvgReviewCount(count);
  }, [course]);

  const pricing = course?.pricing;
  const isFree = pricing?.isFree;
  const isDiscounted = pricing?.isDiscounted;
  const displayPrice = pricing?.displayPrice ?? course?.price;
  const originalPrice = pricing?.originalPrice ?? course?.price;
  const badge = pricing?.badge;
  const planLabel =
    pricing?.plan === "Subscriber" ? "pentru abonați" : "";

  return (
    <div className="hover:scale-[1.03] transition-all duration-200 z-50 ">
      <Link to={`/courses/${course._id}`}>
        <div className="">
          <div className="rounded-lg">
            <Img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full rounded-xl object-cover `}
            />
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl text-richblack-800">{course?.courseName}</p>
            <p className="text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lavender-300">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} />
              <span className="text-richblack-400">
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>
            <div className="flex items-center gap-2">
              {badge && (
                <span className="rounded-full bg-brand-primary/20 px-3 py-1 text-xs font-semibold text-brand-primary">
                  {badge} {planLabel}
                </span>
              )}
            </div>
            {isFree ? (
              <p className="text-xl font-semibold text-caribbeangreen-200">Gratuit</p>
            ) : (
              <div className="flex items-baseline gap-2">
                {isDiscounted && (
                  <span className="text-sm text-richblack-400 line-through">
                    Ron {originalPrice}
                  </span>
                )}
                <span className="text-xl font-semibold text-richblack-800">
                  Ron {displayPrice}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Course_Card;
