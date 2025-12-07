import React, { useState, useEffect } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { NavbarLinks } from "../../../data/navbar-links";
import logo from "../../assets/Logo/OficialLogoAlb.svg";
import { fetchCourseCategories } from "./../../services/operations/courseDetailsAPI";
import { ACCOUNT_TYPE } from "../../utils/constants";

import ProfileDropDown from "../core/Auth/ProfileDropDown";
import MobileProfileDropDown from "../core/Auth/MobileProfileDropDown";

import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";

const Navbar = () => {
  // console.log("Printing base url: ", import.meta.env.VITE_APP_BASE_URL);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  // console.log('USER data from Navbar (store) = ', user)
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSublinks = async () => {
    try {
      setLoading(true);
      const res = await fetchCourseCategories({ token });
      // const result = await apiConnector("GET", categories.CATEGORIES_API);
      // const result = await apiConnector('GET', 'http://localhost:4000/api/v1/course/showAllCategories');
      // console.log("Printing Sublinks result:", result);
      setSubLinks(res);
    } catch (error) {
      console.log("Could not fetch the category list = ", error);
      setSubLinks([]);
    }
    setLoading(false);
  };

  // console.log('data of store  = ', useSelector((state)=> state))

  useEffect(() => {
    fetchSublinks();
  }, [token]);

  // when user click Navbar link then it will hold yellow color
  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  // when user scroll down , we will hide navbar , and if suddenly scroll up , we will show navbar
  const [showNavbar, setShowNavbar] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  });

  // control Navbar
  const controlNavbar = () => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY) setShowNavbar("hide");
      else setShowNavbar("show");
    } else setShowNavbar("top");

    setLastScrollY(window.scrollY);
  };

  return (
    <>
      <nav
        className={`fixed z-40 w-full translate-y-0 border-b border-white/60 bg-white/90 backdrop-blur-md shadow-soft transition-all ${showNavbar}`}
      >
        {/* <nav className={` fixed flex items-center justify-center w-full h-16 z-[10] translate-y-0 transition-all text-white ${showNavbar}`}> */}
        <div className="mx-auto flex h-14 w-11/12 max-w-maxContent items-center justify-between text-brand-text">
          {/* logo */}
          <Link to="/">
            <img src={logo} width={160} height={42} loading="lazy" />
          </Link>

          {/* Nav Links - visible for only large devices*/}
          <ul className="hidden gap-x-2 sm:flex text-brand-text">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1 ${
                      matchRoute("/catalog/:catalogName")
                        ? "bg-lavender-100 text-brand-text"
                        : "hover:bg-lavender-100 text-white hover:text-brand-text"
                    }`}
                  >
                    <p>{link.title}</p>
                    <MdKeyboardArrowDown />
                    {/* drop down menu */}
                    <div
                      className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em]
                                                    flex-col rounded-xl border border-white/50 bg-white/90 p-4 text-brand-text shadow-soft opacity-0 transition-all duration-150 group-hover:visible
                                                    group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]"
                    >
                      <div className="absolute left-[50%] top-0 z-[100] h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded border border-white/50 bg-white/90"></div>
                      {loading ? (
                        <p className="text-center ">Loading...</p>
                      ) : subLinks.length ? (
                        <>
                          {subLinks?.map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-lavender-100"
                              key={i}
                            >
                              <p>{subLink.name}</p>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <p className="text-center">No Courses Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "bg-lavender-100 text-brand-text"
                          : "text-white hover:text-brand-text hover:bg-lavender-100"
                      } rounded-xl px-3 py-1`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Login/SignUp/Dashboard */}
          <div className="flex gap-x-4 items-center">
            {user && user?.accountType !== "Instructor" && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-[1.9rem] text-white hover:bg-lavender-100 hover:text-brand-text rounded-full p-2 duration-200" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-brand-primary text-center text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token === null && (
              <Link to="/login">
                {/* <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md focus:outline-8 outline-yellow-50'> */}
                <button
                  className={`rounded-xl px-3 py-2 transition ${
                    matchRoute("/login")
                      ? "border-2 border-brand-primary text-brand-primary"
                      : "border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                  }`}
                >
                  Logare
                </button>
              </Link>
            )}
            {token === null && (
              <Link to="/signup">
                {/* <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'> */}
                <button
                  className={`rounded-xl px-3 py-2 transition ${
                    matchRoute("/signup")
                      ? "bg-brand-primary text-white"
                      : "bg-brand-primary text-white hover:opacity-90"
                  }`}
                >
                  Înregistrare
                </button>
              </Link>
            )}

            {/* for large devices */}
            {token !== null && <ProfileDropDown />}

            {/* for small devices */}
            {token !== null && <MobileProfileDropDown />}
          </div>
        </div>
      </nav>
      {/* spacer to offset fixed navbar height */}
      <div className="h-14 w-full" />
    </>
  );
};

export default Navbar;
