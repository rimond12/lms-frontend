"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  successStoriesData,
  successStoriesFilters,
} from "@/data/successStoriesData";
import { VideoCard } from "@/components/shared/SuccessVideoCard";
import type { SuccessStory } from "@/types/successStory";
import EngineeringSuccess from "../EngineeringSuccess/EngineeringSuccess";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";

const SuccessStories: React.FC = () => {
  const t = useTranslations("successStories");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.successStories;
  const heading = cms?.heading || t("heading");
  const headingHighlight = cms?.headingHighlight || t("headingHighlight");
  const subheading = cms?.subheading || t("subheading");

  const [activeFilter, setActiveFilter] = useState<string>("সব");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const filteredStories: SuccessStory[] =
    activeFilter === "সব"
      ? successStoriesData
      : successStoriesData.filter((s) => s.category === activeFilter);

  const slidesPerViewDesktop = 3;
  const totalPages = Math.ceil(filteredStories.length / slidesPerViewDesktop);

  const handlePageClick = (pageIndex: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(pageIndex * slidesPerViewDesktop);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setActiveIndex(0);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800">
            {heading}{" "}
            <span className="text-blue-700">{headingHighlight}</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-700 mx-auto mt-3 rounded-full" />
          <p className="text-gray-500 mt-3 text-sm md:text-base px-4">
            {subheading}
          </p>
        </div>

        {/* White Container */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-blue-100 overflow-hidden">
          {/* Filter Bar */}
          <div className="bg-blue-700 px-4 sm:px-8 py-4 sm:py-5 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-white font-bold text-sm sm:text-lg italic uppercase tracking-wide text-center md:text-left shrink-0">
              {t("filterLabel")}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {successStoriesFilters.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterChange(item.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 border ${
                    activeFilter === item.value
                      ? "bg-white text-blue-700 border-white shadow-md"
                      : "border-white/40 text-white hover:bg-white/20"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Swiper Section */}
          <div className="px-4 sm:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6">
            {filteredStories.length === 0 ? (
              <div className="text-center py-16 text-gray-400 font-semibold text-sm sm:text-base">
                {t("empty")}
              </div>
            ) : (
              <>
                <div className="relative group">
                  {/* Prev Button — desktop only */}
                  <button className="success-prev absolute left-[-16px] sm:left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-blue-700 text-white p-2.5 sm:p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-900 hidden md:flex items-center justify-center">
                    <FaChevronLeft size={12} />
                  </button>

                  {/* Next Button — desktop only */}
                  <button className="success-next absolute right-[-16px] sm:right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-blue-700 text-white p-2.5 sm:p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-900 hidden md:flex items-center justify-center">
                    <FaChevronRight size={12} />
                  </button>

                  <Swiper
                    modules={[Navigation, Autoplay, Pagination]}
                    spaceBetween={16}
                    slidesPerView={1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    navigation={{
                      nextEl: ".success-next",
                      prevEl: ".success-prev",
                    }}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    breakpoints={{
                      640: { slidesPerView: 1, spaceBetween: 16 },
                      768: { slidesPerView: 2, spaceBetween: 20 },
                      1024: { slidesPerView: 3, spaceBetween: 24 },
                    }}
                  >
                    {filteredStories.map(
                      (story: SuccessStory, index: number) => (
                        <SwiperSlide key={story.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: index * 0.08,
                              duration: 0.4,
                            }}
                          >
                            <VideoCard video={story} />
                          </motion.div>
                        </SwiperSlide>
                      ),
                    )}
                  </Swiper>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
                  <button className="success-prev w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-700 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all">
                    <FaChevronLeft size={12} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i: number) => {
                    const isActive =
                      activeIndex >= i * slidesPerViewDesktop &&
                      activeIndex < (i + 1) * slidesPerViewDesktop;
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageClick(i)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-blue-700 text-white shadow-lg shadow-blue-200"
                            : "bg-white text-blue-700 border-2 border-blue-700 hover:bg-blue-700 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}

                  <button className="success-next w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-700 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all">
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* CTA Footer */}
          <div className="text-center pb-8 sm:pb-10 pt-4 px-4 sm:px-6 border-t border-blue-50">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/success-stories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-900 text-white px-6 sm:px-7 py-2.5 sm:py-3 text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all group"
              >
                {t("viewAll")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/all-courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white px-6 sm:px-7 py-2.5 sm:py-3 text-sm font-bold rounded-xl transition-all duration-200"
              >
                {t("viewCourses")}
              </Link>
            </div>
          </div>
        </div>

        <div>
          <EngineeringSuccess />
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
