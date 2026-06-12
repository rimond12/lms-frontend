"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  MapPin,
  Clock,
  Calendar,
  Phone,
  ArrowRight,
  BookOpen,
  Award,
  Video,
  CheckCircle,
} from "lucide-react";

import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import CourseCard from "@/components/shared/CourseCard";
import AppImage from "@/components/ui/AppImage";

interface IOfflineCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  bannerImage: string;
  duration: string;
  level: string;
  tags: string[];
  price: number;
  discountedPrice: number;
  location: string;
  timing: string;
  startDate: string;
  tools: string[];
}

const CourseModules: React.FC = () => {
  const t = useTranslations("courseModules");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.courseModules;

  const titlePrefix = cms?.titlePrefix || t("titlePrefix");
  const titleHighlight = cms?.titleHighlight || t("titleHighlight");
  const subtitle = cms?.subtitle || t("subtitle");
  const onlineTab = cms?.onlineTab || t("onlineTab");
  const offlineTab = cms?.offlineTab || t("offlineTab");
  const detailsLink = cms?.detailsLink || t("detailsLink");

  const [activeTab, setActiveTab] = useState<"online" | "offline">("online");
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out" });
    
    // Rotation interval for online course cards' highlights
    const interval = setInterval(() => {
      setHighlightIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch 6 courses dynamically depending on active tab (online or offline)
  const { data, isLoading, isError } = useGetCoursesQuery({ limit: 6, courseType: activeTab });
  const courses = data?.data || [];

  const formatStartDate = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-950/20 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            {titlePrefix}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a4da1] to-[#133a7a] dark:from-blue-400 dark:to-blue-600">
              {titleHighlight}
            </span>
          </h2>
          <div className="w-20 h-1.5 bg-[#1a4da1] dark:bg-blue-500 mx-auto mt-4 rounded-full" />
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-4 leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex justify-center mb-10 md:mb-14" data-aos="fade-up">
          <div className="bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 w-full max-w-md shadow-inner border border-gray-300/30 dark:border-gray-700/30">
            <button
              onClick={() => setActiveTab("online")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "online"
                  ? "bg-white dark:bg-gray-700 text-[#1a4da1] dark:text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Video className="w-4 h-4" />
              {onlineTab}
            </button>
            <button
              onClick={() => setActiveTab("offline")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "offline"
                  ? "bg-white dark:bg-gray-700 text-[#1a4da1] dark:text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {offlineTab}
            </button>
          </div>
        </div>

        {/* Courses Display Grid */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "online" ? (
              <motion.div
                key="online-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-pulse shadow-sm h-[480px]"
                      >
                        <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                        <div className="p-6 space-y-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isError || courses.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-800 p-8 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 font-semibold">{t("noCourses")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {courses.map((course: any) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        highlightIndex={highlightIndex}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="offline-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-pulse shadow-sm h-[480px]"
                      >
                        <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                        <div className="p-6 space-y-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isError || courses.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-800 p-8 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 font-semibold">{t("noCourses")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {courses.map((course: any, idx: number) => {
                      const whatsAppText = encodeURIComponent(
                        `Hello CADD CORE, I am interested in enrolling in the offline course: "${course.title}". Please send me details regarding classes, batch timing, and discount offer.`
                      );
                      const whatsAppLink = `https://wa.me/8801610473379?text=${whatsAppText}`;

                      const displayImage = course.bannerImage || course.photoUrl || "https://images.unsplash.com/photo-1503387762-592dedb8c310?w=600&auto=format&fit=crop&q=60";
                      const displayDesc = course.shortDescription || course.description || "";
                      const displayLocation = course.location || course.locations || course.venueName || "Purana Paltan Branch, Dhaka";
                      const displayTiming = course.timing || course.duration || "Fri & Sat (03:00 PM - 05:30 PM)";
                      const displayTags = course.tags || [];

                      return (
                        <motion.div
                          key={course._id}
                          className="group flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#1a4da1] dark:hover:border-blue-500 hover:-translate-y-2 flex flex-col shadow-sm hover:shadow-xl relative"
                          data-aos="zoom-in"
                          data-aos-delay={idx * 100}
                        >
                          {/* Image section */}
                          <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                            <img
                              src={displayImage}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Offline badge */}
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1.5" />
                              {t("offlineBadge")}
                            </div>

                            {/* Price Badge */}
                            {course.price && course.price > 0 && (
                              <div className="absolute top-3 left-3 bg-white text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-md border border-blue-100">
                                {t("currencySymbol")}
                                {(course.discountedPrice ?? course.price).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="p-5 flex flex-col flex-1">
                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 h-12 group-hover:text-[#1a4da1] dark:group-hover:text-blue-400 transition-colors duration-300">
                              {course.title}
                            </h3>

                            {/* Short Description */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                              {displayDesc}
                            </p>

                            {/* Metadata Details */}
                            <div className="space-y-2 mb-5 text-[12px] text-gray-600 dark:text-gray-300 border-t border-b border-gray-100 dark:border-gray-700 py-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1a4da1] dark:text-blue-400 shrink-0" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {t("branchLabel")}:
                                </span>
                                <span className="truncate">{displayLocation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#1a4da1] dark:text-blue-400 shrink-0" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {t("timingLabel")}:
                                </span>
                                <span className="truncate">{displayTiming}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#1a4da1] dark:text-blue-400 shrink-0" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {t("startDateLabel")}:
                                </span>
                                <span>{formatStartDate(course.startDate)}</span>
                              </div>
                            </div>

                            {/* Tools Badge List */}
                            <div className="mb-6">
                              <div className="flex flex-wrap gap-1.5">
                                {displayTags.slice(0, 3).map((tag: string, tIdx: number) => (
                                  <span
                                    key={tIdx}
                                    className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Footer - WhatsApp Action Button */}
                            <div className="mt-auto pt-2">
                              <a
                                href={whatsAppLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 duration-200"
                              >
                                <Phone className="w-4 h-4" />
                                {t("inquireWhatsApp")}
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Explore All CTA */}
        <div className="text-center mt-12 md:mt-16" data-aos="fade-up">
          <Link
            href="/all-courses"
            className="inline-flex items-center gap-2 bg-[#1a4da1] hover:bg-[#133a7a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-bold text-sm md:text-base shadow-lg shadow-blue-200/50 dark:shadow-none transition-all duration-300 active:scale-95 group/btn"
          >
            {detailsLink}
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CourseModules;
