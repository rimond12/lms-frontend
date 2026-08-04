"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
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
  const locale = useLocale();
  const isBn = locale === "bn";

  // Prefer CMS Bn field when locale is bn, then CMS En field, then i18n fallback
  const titlePrefix    = (isBn ? cms?.titlePrefixBn    : cms?.titlePrefix)    || t("titlePrefix");
  const titleHighlight = (isBn ? cms?.titleHighlightBn : cms?.titleHighlight) || t("titleHighlight");
  const subtitle       = (isBn ? cms?.subtitleBn       : cms?.subtitle)       || t("subtitle");
  const technicalTab   = (isBn ? cms?.technicalTabBn   : cms?.technicalTab)   || t("technicalTab");
  const languageTab    = (isBn ? cms?.languageTabBn    : cms?.languageTab)    || t("languageTab");
  const detailsLink    = (isBn ? cms?.detailsLinkBn    : cms?.detailsLink)    || t("detailsLink");

  const [activeTab, setActiveTab] = useState<"technical" | "language">("technical");
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out" });

    // Rotation interval for online course cards' highlights
    const interval = setInterval(() => {
      setHighlightIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch 6 courses dynamically depending on active tab category
  const categorySlug = activeTab === "technical" ? "technical-courses" : "language-courses";
  const { data, isLoading, isError } = useGetCoursesQuery({ limit: 6, category: categorySlug });
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
              onClick={() => setActiveTab("technical")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "technical"
                ? "bg-white dark:bg-gray-700 text-[#1a4da1] dark:text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <Video className="w-4 h-4" />
              {technicalTab}
            </button>
            <button
              onClick={() => setActiveTab("language")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "language"
                ? "bg-white dark:bg-gray-700 text-[#1a4da1] dark:text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <BookOpen className="w-4 h-4" />
              {languageTab}
            </button>
          </div>
        </div>

        {/* Courses Display Grid */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
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
                  {courses.map((course: any, idx: number) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      highlightIndex={highlightIndex}
                    />
                  ))}
                </div>
              )}
            </motion.div>
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
