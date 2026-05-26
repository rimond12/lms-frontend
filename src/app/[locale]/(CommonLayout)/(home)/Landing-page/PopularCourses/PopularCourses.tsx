"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  FaRegClock,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import type { ICourse } from "@/types/course";

const PopularCourses: React.FC = () => {
  const t = useTranslations("popularCourses");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.popularCourses;

  const headingPrefix = cms?.headingPrefix || t("headingPrefix");
  const headingHighlight = cms?.headingHighlight || t("headingHighlight");
  const seeAllText = cms?.seeAllText || t("seeAllButton");

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out" });
  }, []);

  const { data, isLoading, isError } = useGetCoursesQuery({ limit: 8 });
  const courses: ICourse[] = data?.data || [];

  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return "/images/course-thumbnail.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;
    const base =
      process.env.NEXT_PUBLIC_FILE_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "https://api.caddcore.cloud";
    const clean = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${base}${clean}`;
  };

  // ---- Loading State ----
  if (isLoading) {
    return (
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
              {headingPrefix}{" "}
              <span className="text-blue-700">{headingHighlight}</span>
            </h2>
            <div className="w-16 md:w-20 h-1.5 bg-blue-700 mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-44 md:h-52 bg-gray-200" />
                <div className="p-4 md:p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ---- Error State ----
  if (isError) {
    return (
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-red-500 font-semibold">{t("errorMessage")}</p>
        </div>
      </section>
    );
  }

  // ---- Empty State ----
  if (courses.length === 0) {
    return (
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 font-semibold">{t("emptyMessage")}</p>
        </div>
      </section>
    );
  }

  // ---- Main Render ----
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12" data-aos="fade-down">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            {headingPrefix}{" "}
            <span className="text-blue-700">{headingHighlight}</span>
          </h2>
          <div className="w-16 md:w-20 h-1.5 bg-blue-700 mx-auto mt-3 rounded-full" />
        </div>

        {/* Slider */}
        <div className="relative group px-0 md:px-4" data-aos="fade-up">
          {/* Nav Buttons — desktop only */}
          <button className="swiper-prev-popular absolute left-[-44px] top-1/2 -translate-y-1/2 z-30 bg-blue-700 text-white p-3 md:p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-800 hidden md:block">
            <FaChevronLeft />
          </button>
          <button className="swiper-next-popular absolute right-[-44px] top-1/2 -translate-y-1/2 z-30 bg-blue-700 text-white p-3 md:p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-800 hidden md:block">
            <FaChevronRight />
          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            navigation={{
              nextEl: ".swiper-next-popular",
              prevEl: ".swiper-prev-popular",
            }}
            pagination={{ clickable: true, el: ".custom-pagination-popular" }}
            breakpoints={{
              480: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 28 },
            }}
            className="pb-12"
          >
            {courses.map((course: ICourse, index: number) => (
              <SwiperSlide key={course._id}>
                <div
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                  className="group h-auto min-h-[480px] sm:h-[510px] md:h-[530px] bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-700 hover:-translate-y-2 flex flex-col mb-4 shadow-sm"
                >
                  {/* Image */}
                  <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={getImageUrl(course.photoUrl || course.bannerImage)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/course-thumbnail.jpg";
                      }}
                    />

                    {/* LIVE Badge */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-blue-700 text-white text-[9px] md:text-[10px] font-bold px-2.5 md:px-3 py-1 rounded-full flex items-center shadow-md">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse mr-1" />
                      {t("liveBadge")}
                    </div>

                    {/* Price Badge */}
                    {course.price && course.price > 0 && (
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white text-blue-700 text-[10px] md:text-[11px] font-bold px-2.5 md:px-3 py-1 rounded-full shadow-md border border-blue-100">
                        {t("currencySymbol")}
                        {(
                          course.discountedPrice ?? course.price
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-6 flex flex-col flex-1">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 h-12 md:h-14 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {course.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 md:gap-3 text-[12px] md:text-[13px] text-gray-600 mb-4 md:mb-6">
                      {course.duration && (
                        <div className="flex items-center space-x-1">
                          <FaRegClock className="text-blue-700" />
                          <span>{course.duration}</span>
                        </div>
                      )}
                      {course.level && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] md:text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-100 capitalize">
                          {course.level}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="mb-4 md:mb-6">
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 md:mb-3">
                          {t("tagsLabel")}
                        </p>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {course.tags
                            .slice(0, 4)
                            .map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 text-[10px] md:text-[11px] font-semibold px-2.5 md:px-3 py-1 rounded-full border border-blue-100"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href={`/all-courses/${course.slug}`}
                        className="text-blue-700 font-bold text-xs md:text-sm flex items-center group/btn"
                      >
                        {t("detailsLink")}
                        <FaArrowRight className="ml-1.5 md:ml-2 text-[10px] md:text-xs transition-transform group-hover/btn:translate-x-1" />
                      </Link>

                      {course.accessType === "free" && (
                        <span className="text-green-600 text-[10px] md:text-xs font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          {t("freeBadge")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="custom-pagination-popular flex justify-center gap-2 mt-2 md:mt-4" />
        </div>

        {/* See All Button */}
        <div className="text-center mt-8 md:mt-12" data-aos="fade-up">
          <Link
            href="/all-courses"
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-7 md:px-10 py-3 md:py-3.5 rounded-full font-bold text-sm md:text-base shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {seeAllText}
          </Link>
        </div>
      </div>

      <style>{`
        .swiper-pagination-bullet-active {
          background: #1a4da1 !important;
          width: 25px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </section>
  );
};

export default PopularCourses;
