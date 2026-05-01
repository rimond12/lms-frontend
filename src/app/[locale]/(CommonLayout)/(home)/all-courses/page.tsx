"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Filter,
  X,
  Zap,
  Award,
  ChevronDown,
  LayoutGrid,
  BarChart,
  Clock,
  Video,
  Briefcase,
  CheckCircle,
  Book,
  Settings,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import CategoryTabs from "@/components/shared/CategoryTabs";
import CourseCard from "@/components/shared/CourseCard";

// Skeleton
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

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; icon?: string }[];
}

const FilterDropdown = ({
  label,
  icon,
  value,
  onChange,
  options,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
          isOpen || value
            ? "bg-blue-50 text-[#1a4da1] shadow-sm ring-1 ring-blue-100"
            : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {icon && (
          <span
            className={`transition-colors ${value || isOpen ? "text-[#1a4da1]" : "text-gray-500"}`}
          >
            {icon}
          </span>
        )}
        <span>{selectedOption ? selectedOption.label : label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#1a4da1]" : "text-gray-400"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1.5"
          >
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              <button
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors mb-1 ${
                  !value
                    ? "bg-blue-50 text-[#1a4da1] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{label}</span>
                {!value && <CheckCircle size={14} />}
              </button>
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    value === option.value
                      ? "bg-blue-50 text-[#1a4da1] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                  </div>
                  {value === option.value && <CheckCircle size={14} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Video Card
const VideoCard = ({
  videoUrl,
  fallbackImage,
}: {
  videoUrl?: string;
  fallbackImage: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : fallbackImage;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-100 aspect-video lg:h-[320px] w-full group bg-gray-900">
      {isPlaying && videoId ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <>
          <AppImage
            photoUrl={thumbnailUrl}
            alt="Video Thumbnail"
            width={600}
            height={400}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

          {videoId && (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center z-10 group/btn focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping duration-1000 opacity-75"></span>
                <span className="absolute inline-flex h-full w-full rounded-full bg-white/20 animate-pulse duration-2000"></span>
                <div className="relative flex items-center justify-center w-full h-full bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:bg-white">
                  {/* ✅ Royal blue play icon */}
                  <PlayCircle
                    className="w-8 h-8 lg:w-10 lg:h-10 text-[#1a4da1] fill-[#1a4da1]/10 ml-1"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </button>
          )}

          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-white/50 flex items-center gap-3 z-20 pointer-events-none">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"
                />
              ))}
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900">10k+ Engineers</p>
              <p className="text-gray-500 scale-90 origin-left">
                Trusted by students
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main Page
export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null,
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    searchParams.get("subcategory") || null,
  );

  const itemsPerPage = 12;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanged = false;
    if (selectedCategory && params.get("category") !== selectedCategory) {
      params.set("category", selectedCategory);
      hasChanged = true;
    } else if (!selectedCategory && params.has("category")) {
      params.delete("category");
      hasChanged = true;
    }
    if (
      selectedSubCategory &&
      params.get("subcategory") !== selectedSubCategory
    ) {
      params.set("subcategory", selectedSubCategory);
      hasChanged = true;
    } else if (!selectedSubCategory && params.has("subcategory")) {
      params.delete("subcategory");
      hasChanged = true;
    }
    if (hasChanged) {
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedCategory, selectedSubCategory, router, searchParams]);

  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(selectedType && { type: selectedType }),
    ...(selectedLevel && { level: selectedLevel }),
    ...(searchTerm && { searchTerm }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedSubCategory && { subcategory: selectedSubCategory }),
  };

  const { data, isLoading, error } = useGetCoursesQuery(queryParams);
  const courses = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalCount = data?.meta?.total || 0;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedType,
    selectedLevel,
    selectedCategory,
    selectedSubCategory,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedLevel("");
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const hasFilters =
    searchTerm ||
    selectedType ||
    selectedLevel ||
    selectedCategory ||
    selectedSubCategory;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <div className="bg-white pt-8 pb-12 lg:pt-10 lg:pb-14 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* ✅ Blue gradient accents */}
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
              {/* ✅ Blue badge */}
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50">
                <Award size={16} className="text-[#1a4da1]" />
                <span className="text-xs font-bold text-[#1a4da1] uppercase tracking-wider">
                  Engineering Excellence
                </span>
              </div>

              <h1 className="text-3xl lg:text-[42px] lg:leading-[1.1] font-extrabold text-gray-900 tracking-tight">
                Design the World with <br className="hidden lg:block" />
                {/* ✅ Blue gradient heading */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a4da1] to-[#133a7a]">
                  Civil Engineering Mastery
                </span>
              </h1>

              <p className="text-base text-gray-600 max-w-lg leading-relaxed font-medium">
                Master industry-standard software like{" "}
                <span className="text-gray-900 font-semibold">
                  AutoCAD, Revit, ETABS
                </span>{" "}
                & more. From structural analysis to architectural modeling,
                build your career with practical skills.
              </p>

              <div className="flex flex-wrap gap-3 mt-1">
                {/* ✅ Blue Browse Courses button */}
                <button
                  onClick={() =>
                    document
                      .getElementById("browse-courses")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-6 py-2.5 bg-[#1a4da1] text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-[#133a7a] hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  <Book size={18} />
                  Browse Courses
                </button>
                <button className="px-6 py-2.5 bg-white text-gray-900 border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2">
                  {/* ✅ Blue play icon */}
                  <PlayCircle size={18} className="text-[#1a4da1]" />
                  Watch Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <VideoCard
                videoUrl="https://www.youtube.com/watch?v=g9v6Tm_URNs"
                fallbackImage="https://cdn.mos.cms.futurecdn.net/steVjWGx3vYPjMpJL2jVcV-650-80.jpg.webp"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* SEARCH & CATEGORIES BAR */}
      <div
        id="browse-courses"
        className="top-0 z-40 bg-white/80 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:bg-white/60"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col xl:flex-row items-center h-auto xl:h-[72px] py-3 xl:py-0 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto shrink-0">
              {/* Search */}
              <div className="relative w-full md:w-64 group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4da1] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border-none focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg text-sm transition-all placeholder:text-gray-500 font-medium"
                />
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-[#1a4da1] bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <X size={15} />
                  <span className="hidden lg:inline">Clear</span>
                </button>
              )}
            </div>

            <div className="hidden xl:block w-px h-8 bg-gray-200 mx-2"></div>

            <div className="flex-1 w-full overflow-hidden">
              <CategoryTabs
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
                onCategoryChange={setSelectedCategory}
                onSubCategoryChange={setSelectedSubCategory}
                variant="premium"
                showSubCategories={false}
                showIcons={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-blue-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-[#1a4da1]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to load courses
            </h3>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        ) : courses.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
            className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-4"
          >
            {courses.map((course: any) => (
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
              No courses found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Clear Filters
            </button>
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
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
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
