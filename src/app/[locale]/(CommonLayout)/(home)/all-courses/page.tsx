"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Award,
  Book,
  PlayCircle,
  GraduationCap,
  Languages,
} from "lucide-react";
import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import { useTranslations } from "next-intl";
import CourseCard from "@/components/shared/CourseCard";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-10 bg-gray-200 rounded w-full mt-4" />
    </div>
  </div>
);

// ─── Category meta — maps slug to display info ────────────────────────────────
const CATEGORY_META: Record<
  string,
  { label: string; labelBn: string; icon: React.ReactNode; color: string; bg: string }
> = {
  "technical-courses": {
    label: "Technical Training",
    labelBn: "টেকনিক্যাল ট্রেনিং",
    icon: <GraduationCap size={20} />,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-100",
  },
  "language-courses": {
    label: "Language Learning",
    labelBn: "ভাষা শিক্ষা",
    icon: <Languages size={20} />,
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-100",
  },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const t = useTranslations("courses");
  const searchParams = useSearchParams();
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Read category slug directly from URL — server accepts slug natively
  const urlCategory = searchParams.get("category") || null;
  const categoryMeta = urlCategory ? CATEGORY_META[urlCategory] ?? null : null;

  const itemsPerPage = 12;

  // Rotate highlight effect on cards
  useEffect(() => {
    const interval = setInterval(() => setHighlightIndex((p) => p + 1), 2500);
    return () => clearInterval(interval);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [urlCategory, searchTerm]);

  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(searchTerm && { searchTerm }),
    ...(urlCategory && { category: urlCategory }), // send slug directly — server resolves it
  };

  const { data, isLoading, isFetching, error } = useGetCoursesQuery(queryParams);
  const courses = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  // Show prev courses only during active refetch to prevent flicker;
  // when API finishes with 0 results → show empty state (NOT old list)
  const prevCoursesRef = React.useRef<any[]>([]);
  const displayCourses = isFetching ? prevCoursesRef.current : courses;
  React.useEffect(() => {
    if (!isFetching) prevCoursesRef.current = courses;
  }, [isFetching, courses]);

  const showSkeleton = isLoading && displayCourses.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── HEADER ── */}
      <div className="bg-white pt-8 pb-12 lg:pt-10 lg:pb-14 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-5"
            >
              {/* Badge — shows category name if filtered */}
              <div className={`inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border ${categoryMeta ? categoryMeta.bg : "bg-blue-50 border-blue-100/50"}`}>
                <Award size={16} className={categoryMeta ? categoryMeta.color : "text-[#1a4da1]"} />
                <span className={`text-xs font-bold uppercase tracking-wider ${categoryMeta ? categoryMeta.color : "text-[#1a4da1]"}`}>
                  {categoryMeta ? categoryMeta.label : t("badge")}
                </span>
              </div>

              {/* Heading — shows category-specific title when filtered */}
              <h1 className="text-3xl lg:text-[42px] lg:leading-[1.1] font-extrabold text-gray-900 tracking-tight">
                {categoryMeta ? (
                  <>
                    {categoryMeta.icon && (
                      <span className={`inline-flex mr-3 ${categoryMeta.color}`}>
                        {categoryMeta.icon}
                      </span>
                    )}
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#1a4da1] to-[#133a7a]`}>
                      {categoryMeta.label}
                    </span>
                    <span className="block text-lg font-medium text-gray-500 mt-1">
                      {categoryMeta.labelBn}
                    </span>
                  </>
                ) : (
                  <>
                    {t("heading")} <br className="hidden lg:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a4da1] to-[#133a7a]">
                      {t("headingHighlight")}
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base text-gray-600 max-w-lg leading-relaxed font-medium">
                {t("description")}
              </p>

              <div className="flex flex-wrap gap-3 mt-1">
                <button
                  onClick={() =>
                    document.getElementById("browse-courses")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-6 py-2.5 bg-[#1a4da1] text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-[#133a7a] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  <Book size={18} />
                  {t("browseBtn")}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-100 aspect-video lg:h-[320px] w-full"
            >
              <img
                src="/images/immigrant-banner.png"
                alt="Immigrant Jobs World"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR (no category tabs) ── */}
      <div
        id="browse-courses"
        className="bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm group">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4da1] transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border-none focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg text-sm transition-all placeholder:text-gray-500 font-medium"
              />
            </div>

            {/* Clear search */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-[#1a4da1] bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors whitespace-nowrap"
              >
                <X size={15} />
                <span className="hidden lg:inline">{t("clear")}</span>
              </button>
            )}

            {/* Active filter pill */}
            {categoryMeta && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${categoryMeta.bg} ${categoryMeta.color}`}>
                {categoryMeta.icon}
                {categoryMeta.label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── COURSE GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Fetch progress bar */}
        {isFetching && !showSkeleton && (
          <div className="w-full h-0.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full w-1/2 bg-[#1a4da1] rounded-full animate-fetch-progress" />
          </div>
        )}

        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-blue-200 p-8 text-center">
            <X className="w-8 h-8 text-[#1a4da1] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to load courses</h3>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        ) : displayCourses.length > 0 ? (
          <motion.div
            key={`${urlCategory}-${searchTerm}-${currentPage}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
          >
            {displayCourses.map((course: any) => (
              <CourseCard
                key={course._id}
                course={course}
                highlightIndex={highlightIndex}
              />
            ))}
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="inline-flex bg-gray-50 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {categoryMeta
                ? `No ${categoryMeta.label} courses found`
                : t("noCourses")}
            </h3>
            <p className="text-gray-500 mb-6">
              {categoryMeta
                ? `No courses have been assigned to the "${categoryMeta.label}" category yet.`
                : t("tryAdjusting")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-center gap-2 mt-16">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              ←
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#1a4da1] text-white shadow-md shadow-blue-200"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
