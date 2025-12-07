import { useEffect } from "react";
import { RiEditBoxLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { formattedDate } from "../../../utils/dateFormatter";
import IconBtn from "../../common/IconBtn";
import Img from "./../../common/Img";
import AdminReviews from "./AdminReviews";

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <h1 className="mb-14 text-4xl font-medium text-richblack-300 font-boogaloo text-center sm:text-left">
        Profilul meu
      </h1>

      <div className="flex items-center justify-between rounded-2xl border-[1px] border-brand-primary p-8 px-3 sm:px-12">
        <div className="flex items-center gap-x-4">
          <Img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-richblack-300 capitalize">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="text-sm text-richblack-300">{user?.email}</p>
          </div>
        </div>

        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings");
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      <div className="my-10 flex flex-col gap-y-10 rounded-2xl border-[1px] border-brand-primary p-8 px-7 sm:px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-300">Descriere</p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings");
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <p
          className={`${
            user?.additionalDetails?.about
              ? "text-richblack-300"
              : "text-richblack-400"
          } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? "Scrie ceva despre tine"}
        </p>
      </div>

      <div className="my-10 flex flex-col gap-y-10 rounded-2xl border-[1px] border-brand-primary p-8 px-7 sm:px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-300">
            Informatii personale
          </p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings");
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <div className="flex max-w-[500px] justify-between ">
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-richblack-600">Prenume</p>
              <p className="text-sm font-semibold text-richblack-300 capitalize">
                {user?.firstName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">Tip de cont</p>
              <p className="text-sm font-semibold text-richblack-300 capitalize">
                {user?.accountType}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">Email</p>
              <p className="text-sm font-semibold text-richblack-300">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">Gen</p>
              <p className="text-sm font-semibold text-richblack-300">
                {user?.additionalDetails?.gender ?? "Adauga genul"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-richblack-600">Nume</p>
              <p className="text-sm font-semibold text-richblack-300 capitalize">
                {user?.lastName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">
                Numar de telefon
              </p>
              <p className="text-sm font-semibold text-richblack-300">
                {user?.additionalDetails?.contactNumber ??
                  "Adauga numarul de telefon"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">Data de nastere</p>
              <p className="text-sm font-semibold text-richblack-300">
                {formattedDate(user?.additionalDetails?.dateOfBirth) ??
                  "Adauga data de nastere"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {user?.accountType === "Admin" ? (
        <div className="my-10 rounded-2xl border-[1px] border-brand-primary p-8 px-7 sm:px-12">
          <AdminReviews />
        </div>
      ) : null}
    </>
  );
}
