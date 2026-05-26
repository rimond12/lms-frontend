"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Search,
  MapPin,
  X,
  Globe,
  Bookmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { toast } from "react-hot-toast";

// API Hooks
import { useGetAllJobsQuery } from "@/app/redux/api/jobsApi/jobsApi";
import {
  useToggleSaveJobMutation,
  useGetSavedJobsQuery,
} from "@/app/redux/api/jobsApi/SavedJobsApi";
import { useGetJobCategoriesQuery } from "@/app/redux/api/jobsApi/JobCategoryApi";
import { useUser } from "@/app/[locale]/@auth/user.provider";

const ITEMS_PER_PAGE = 9;

// ─── Color Palette ────────────────────────────────────────────────
const CARD_COLORS = [
  { from: "#1a4da1", to: "#2B59C3", light: "#EFF6FF", border: "#BFDBFE" },
  { from: "#0d9488", to: "#14b8a6", light: "#F0FDFA", border: "#99F6E4" },
  { from: "#7c3aed", to: "#9333ea", light: "#F5F3FF", border: "#DDD6FE" },
  { from: "#ea580c", to: "#f97316", light: "#FFF7ED", border: "#FED7AA" },
  { from: "#0891b2", to: "#06b6d4", light: "#ECFEFF", border: "#A5F3FC" },
  { from: "#059669", to: "#10b981", light: "#ECFDF5", border: "#6EE7B7" },
];

function getCardColor(index: number) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

// ─── Country & Flag Helpers ────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  "usa": "🇺🇸", "united states": "🇺🇸", "america": "🇺🇸",
  "uk": "🇬🇧", "united kingdom": "🇬🇧", "england": "🇬🇧", "britain": "🇬🇧",
  "canada": "🇨🇦",
  "australia": "🇦🇺",
  "germany": "🇩🇪",
  "france": "🇫🇷",
  "uae": "🇦🇪", "dubai": "🇦🇪", "abu dhabi": "🇦🇪",
  "qatar": "🇶🇦", "doha": "🇶🇦",
  "saudi": "🇸🇦", "saudi arabia": "🇸🇦", "riyadh": "🇸🇦",
  "bangladesh": "🇧🇩", "dhaka": "🇧🇩",
  "india": "🇮🇳", "delhi": "🇮🇳", "mumbai": "🇮🇳",
  "singapore": "🇸🇬",
  "malaysia": "🇲🇾", "kuala lumpur": "🇲🇾",
  "oman": "🇴🇲", "muscat": "🇴🇲",
  "kuwait": "🇰🇼",
  "bahrain": "🇧🇭",
  "remote": "🌐", "worldwide": "🌐", "global": "🌐",
};

function getCountryFlag(location: string | undefined, country?: string): string {
  const src = country || location;
  if (!src) return "🌍";
  const lower = src.toLowerCase();
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (lower.includes(key)) return flag;
  }
  return "🌍";
}

function getCountryFromLocation(location: string | undefined, country?: string): string {
  if (country) return country;
  if (!location) return "Worldwide";
  const parts = location.split(",");
  return parts[parts.length - 1].trim() || location;
}

// ─── Bookmark Button ──────────────────────────────────────────────
function BookmarkButton({
  jobId,
  savedJobIds,
}: {
  jobId: string;
  savedJobIds: string[];
}) {
  const { user } = useUser();
  const [toggleSave, { isLoading }] = useToggleSaveJobMutation();
  const isSaved = savedJobIds.includes(jobId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save jobs");
      return;
    }
    try {
      await toggleSave(jobId).unwrap();
      toast.success(isSaved ? "Job removed" : "Job saved!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-md ${
        isSaved
          ? "bg-blue-600 text-white"
          : "bg-white/25 text-white hover:bg-white/40 backdrop-blur-sm"
      }`}
    >
      {isLoading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Bookmark size={13} fill={isSaved ? "white" : "none"} />
      )}
    </button>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────
function JobCard({
  job,
  savedJobIds,
  index,
}: {
  job: any;
  savedJobIds: string[];
  index: number;
}) {
  const color = getCardColor(index);
  const country = getCountryFromLocation(job.location, job.country);
  const flag = getCountryFlag(job.location, job.country);
  const initial = job.title?.charAt(0)?.toUpperCase() ?? "J";
  const description = (job.about ?? job.desc ?? "").trim();
  const hasImage = !!job.image;

  return (
    <Link href={`/jobs/${job.slug}`} className="h-full block">
      <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full flex flex-col">

        {/* ── Banner / Image Area ──────────────────────────────── */}
        <div className="relative h-40 flex items-center justify-center overflow-hidden shrink-0">

          {/* Background: uploaded image or gradient */}
          {hasImage ? (
            <>
              <img src={getImageUrl(job.image)} alt={job.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/5" />
            </>
          ) : (
            <>
              <div className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)` }} />
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border-[12px] border-white/10" />
              <div className="absolute -bottom-8 -left-6 w-32 h-32 rounded-full border-[10px] border-white/10" />
              <div className="absolute top-1/2 right-12 w-10 h-10 rounded-full border-4 border-white/10" />
              {/* Logo / Initial only shown when no image */}
              {job.logo && job.logo.startsWith("http") ? (
                <img src={job.logo} alt={job.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-white/30 relative z-10" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center font-black text-3xl text-white shadow-xl backdrop-blur-sm relative z-10">
                  {initial}
                </div>
              )}
            </>
          )}

          {/* Country Badge – top right */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg border border-white/60">
            <span className="text-base leading-none">{flag}</span>
            <span className="text-[11.5px] font-extrabold text-gray-800 dark:text-white max-w-[90px] truncate">
              {country}
            </span>
          </div>

          {/* Bookmark – top left */}
          <div className="absolute top-3 left-3 z-20">
            <BookmarkButton jobId={job._id} savedJobIds={savedJobIds} />
          </div>

          {/* Job Type Chip – bottom left */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-1 backdrop-blur-sm">
              <Briefcase size={10} />
              {job.type}
            </span>
          </div>
        </div>

        {/* ── Card Body ────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-4 gap-3">

          {/* Title & Company */}
          <div>
            <h3 className="font-extrabold text-[14px] text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">
              {job.title}
            </h3>
            {(job.company || job.category) && (
              <div className="flex items-center gap-1 mt-1">
                <Building2 size={11} className="text-gray-400 shrink-0" />
                <span className="text-[11px] text-gray-400 truncate font-medium">
                  {job.company || job.category}
                </span>
              </div>
            )}
          </div>

          {/* Short Description */}
          {description ? (
            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1 min-h-0">
              {description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          {/* Country / Location Highlight Row */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
            style={{ background: color.light, borderColor: color.border }}
          >
            <Globe size={14} style={{ color: color.from }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9.5px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">
                {job.country ? "Country" : "Location"}
              </p>
              <p
                className="text-[12.5px] font-extrabold truncate leading-tight"
                style={{ color: color.from }}
              >
                {flag} {job.country ?? job.location ?? "Worldwide"}
              </p>
            </div>
            {job.salary && (
              <span
                className="text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-full"
                style={{ background: color.from + "18", color: color.from }}
              >
                {job.salary}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <button
            className="w-full py-2.5 rounded-xl text-white text-[12.5px] font-bold transition-all duration-200 group-hover:opacity-90 group-hover:shadow-lg active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              boxShadow: `0 4px 14px ${color.from}33`,
            }}
          >
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse w-5/6" />
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function JobsPage() {
  const { user } = useUser();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const { data: categories = [] } = useGetJobCategoriesQuery();
  const {
    data: allJobs = [],
    isLoading: jobsLoading,
    isError,
  } = useGetAllJobsQuery({ status: "published" });
  const { data: savedJobs = [] } = useGetSavedJobsQuery(undefined, {
    skip: !user,
  });
  const savedJobIds = savedJobs.map((j: any) => j._id);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job: any) => {
      const matchesSearch =
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || job.category === selectedCategory;
      const matchesType = selectedType === "" || job.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allJobs, search, selectedCategory, selectedType]);

  const jobTypes = Array.from(
    new Set(allJobs.map((j: any) => j.type).filter(Boolean)),
  );
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const goToPage = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative px-4 sm:px-6 py-12 sm:py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f1e45 0%, #1a4da1 55%, #2B59C3 100%)",
        }}
      >
        {/* Blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none opacity-10"
          style={{
            background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-4">
            <Globe size={13} className="text-blue-200" />
            <span className="text-blue-100 text-xs font-bold tracking-wider uppercase">
              Global Opportunities
            </span>
          </div>

          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight">
            Discover Jobs{" "}
            <span className="text-blue-300">Worldwide</span>
          </h1>
          <p className="text-blue-300 text-sm sm:text-base mb-8 max-w-xl leading-relaxed">
            Access thousands of aviation &amp; engineering opportunities across
            multiple countries. Find your perfect career match.
          </p>

          {/* Search */}
          <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl max-w-2xl border border-white/10">
            <div className="pl-4 pr-2 flex items-center shrink-0">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              id="jobs-search-input"
              type="text"
              placeholder="Search job title, country or location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 border-none outline-none text-sm text-gray-700 dark:text-gray-200 py-4 px-2 bg-transparent"
            />
            <button
              id="jobs-search-btn"
              className="font-bold text-sm px-5 py-4 transition-all shrink-0 text-white hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #1a4da1, #2B59C3)",
              }}
            >
              Find Job
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-16">

        {/* Filter Bar */}
        <div className="mb-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Showing{" "}
              <span
                className="font-extrabold"
                style={{ color: "#1a4da1" }}
              >
                {filteredJobs.length}
              </span>{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"} available
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              id="jobs-category-filter"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-blue-300 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            <select
              id="jobs-type-filter"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-blue-300 transition-colors"
            >
              <option value="">All Types</option>
              {jobTypes.map((type: any) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {(selectedCategory || selectedType || search) && (
              <button
                id="jobs-clear-filters-btn"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedType("");
                  setSearch("");
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 font-bold px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-red-100 dark:border-red-900/30"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-400 font-semibold">
            Failed to load jobs. Please try again.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentJobs.map((job: any, i: number) => (
                <JobCard
                  key={job._id}
                  job={job}
                  savedJobIds={savedJobIds}
                  index={(currentPage - 1) * ITEMS_PER_PAGE + i}
                />
              ))}
            </div>

            {/* Empty State */}
            {currentJobs.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-bold text-base mb-1">
                  No jobs found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  id="jobs-prev-btn"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-blue-400 hover:text-blue-700 transition-all"
                >
                  <ChevronLeft size={15} /> Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    id={`jobs-page-btn-${i + 1}`}
                    onClick={() => goToPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? "text-white shadow-lg"
                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-400 hover:text-blue-700"
                    }`}
                    style={
                      currentPage === i + 1
                        ? {
                            background:
                              "linear-gradient(135deg, #1a4da1, #2B59C3)",
                          }
                        : {}
                    }
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  id="jobs-next-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-blue-400 hover:text-blue-700 transition-all"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
