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
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Star,
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

// ─── Brand Color Palette ──────────────────────────────────────────
const CARD_COLORS = [
  { from: "#1a4da1", to: "#2B59C3", light: "#EFF6FF", border: "#BFDBFE", glow: "rgba(26,77,161,0.22)" },
  { from: "#0d9488", to: "#14b8a6", light: "#F0FDFA", border: "#99F6E4", glow: "rgba(13,148,136,0.22)" },
  { from: "#7c3aed", to: "#9333ea", light: "#F5F3FF", border: "#DDD6FE", glow: "rgba(124,58,237,0.22)" },
  { from: "#ea580c", to: "#f97316", light: "#FFF7ED", border: "#FED7AA", glow: "rgba(234,88,12,0.22)" },
  { from: "#0891b2", to: "#06b6d4", light: "#ECFEFF", border: "#A5F3FC", glow: "rgba(8,145,178,0.22)" },
  { from: "#059669", to: "#10b981", light: "#ECFDF5", border: "#6EE7B7", glow: "rgba(5,150,105,0.22)" },
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
function BookmarkButton({ jobId, savedJobIds }: { jobId: string; savedJobIds: string[] }) {
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
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 border ${
        isSaved
          ? "bg-blue-600 border-blue-500 text-white shadow-lg"
          : "bg-white/20 border-white/30 text-white hover:bg-white/35 backdrop-blur-sm"
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

// ─── Premium Job Card ──────────────────────────────────────────────
function JobCard({ job, savedJobIds, index }: { job: any; savedJobIds: string[]; index: number }) {
  const color = getCardColor(index);
  const country = getCountryFromLocation(job.location, job.country);
  const flag = getCountryFlag(job.location, job.country);
  const initial = job.title?.charAt(0)?.toUpperCase() ?? "J";
  const description = (job.about ?? job.desc ?? "").trim();
  const hasImage = !!job.image;

  return (
    <Link href={`/jobs/${job.slug}`} className="h-full block">
      <div
        className="group relative bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 cursor-pointer h-full flex flex-col"
        style={{
          borderRadius: "20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = `0 16px 48px ${color.glow}, 0 2px 8px rgba(0,0,0,0.06)`;
          el.style.transform = "translateY(-6px)";
          el.style.borderColor = color.border;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
          el.style.transform = "translateY(0)";
          el.style.borderColor = "";
        }}
      >

        {/* ── Banner / Image Area ── */}
        <div className="relative h-44 flex items-center justify-center overflow-hidden shrink-0">

          {hasImage ? (
            <>
              <img src={getImageUrl(job.image)} alt={job.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <>
              {/* Soft layered gradient header */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(145deg, ${color.from}f0 0%, ${color.to} 60%, ${color.to}bb 100%)`,
                }}
              />
              {/* Decorative abstract circles */}
              <div
                className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
                style={{ background: "rgba(255,255,255,0.7)" }}
              />
              <div
                className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full opacity-15"
                style={{ background: "rgba(255,255,255,0.5)" }}
              />
              <div
                className="absolute top-1/2 right-14 w-12 h-12 rounded-full opacity-10"
                style={{ background: "rgba(255,255,255,0.8)" }}
              />

              {/* Elevated company logo/initial */}
              {job.logo && job.logo.startsWith("http") ? (
                <div className="relative z-10 p-2 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/40 shadow-xl">
                  <img
                    src={job.logo}
                    alt={job.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                </div>
              ) : (
                <div
                  className="relative z-10 w-16 h-16 rounded-2xl bg-white/25 border-2 border-white/40 flex items-center justify-center font-black text-3xl text-white shadow-xl backdrop-blur-sm"
                >
                  {initial}
                </div>
              )}
            </>
          )}

          {/* Country Badge — top right */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/96 dark:bg-gray-900/96 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/60">
            <span className="text-base leading-none">{flag}</span>
            <span className="text-[11px] font-extrabold text-gray-800 dark:text-white max-w-[90px] truncate tracking-tight">
              {country}
            </span>
          </div>

          {/* Bookmark — top left */}
          <div className="absolute top-3 left-3 z-20">
            <BookmarkButton jobId={job._id} savedJobIds={savedJobIds} />
          </div>

          {/* Job Type chip — bottom left */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold bg-black/25 text-white border border-white/25 rounded-full px-3 py-1 backdrop-blur-sm">
              <Briefcase size={9} />
              {job.type}
            </span>
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="flex flex-col flex-1 p-5 gap-3">

          {/* Title & Company */}
          <div>
            <h3
              className="font-extrabold text-[15px] text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200"
              style={{ letterSpacing: "-0.1px" }}
            >
              {job.title}
            </h3>
            {(job.company || job.category) && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 size={11} className="text-gray-400 shrink-0" />
                <span className="text-[11.5px] text-gray-400 truncate font-semibold">
                  {job.company || job.category}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {description ? (
            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1 min-h-0">
              {description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          {/* Thin divider */}
          <div
            className="h-px w-full"
            style={{ background: "linear-gradient(to right, transparent, #e2e8f0, transparent)" }}
          />

          {/* Location row */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-3 border"
            style={{ background: color.light, borderColor: color.border, borderRadius: "14px" }}
          >
            <MapPin size={13} style={{ color: color.from }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-0.5">
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
                className="text-[11px] font-bold shrink-0 px-2.5 py-1 rounded-full"
                style={{ background: color.from + "18", color: color.from }}
              >
                {job.salary}
              </span>
            )}
          </div>

          {/* Apply CTA */}
          <button
            className="w-full py-3 rounded-2xl text-white text-[13px] font-extrabold tracking-wide transition-all duration-200 group-hover:opacity-95 group-hover:shadow-xl active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              boxShadow: `0 4px 18px ${color.glow}`,
              letterSpacing: "0.3px",
            }}
          >
            Apply Now →
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse"
      style={{ borderRadius: "20px" }}
    >
      <div className="h-44 bg-gray-200 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-xl w-5/6" />
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Main Jobs Page ────────────────────────────────────────────────
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
  const { data: savedJobs = [] } = useGetSavedJobsQuery(undefined, { skip: !user });
  const savedJobIds = savedJobs.map((j: any) => j._id);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job: any) => {
      const matchesSearch =
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "" || job.category === selectedCategory;
      const matchesType = selectedType === "" || job.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allJobs, search, selectedCategory, selectedType]);

  const jobTypes = Array.from(new Set(allJobs.map((j: any) => j.type).filter(Boolean)));
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters = !!(selectedCategory || selectedType || search);

  const goToPage = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors">

      {/* ══════════════════════════════════════════════════════════
          PREMIUM HERO
      ══════════════════════════════════════════════════════════ */}
      <div
        className="relative px-4 sm:px-6 py-14 sm:py-20 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f1e45 0%, #1a4da1 55%, #2B59C3 100%)",
        }}
      >
        {/* Ambient orbs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-5"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Top badge */}
          <div
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles size={13} className="text-blue-200" />
            <span className="text-blue-100 text-xs font-extrabold tracking-widest uppercase">
              Global Opportunities
            </span>
          </div>

          <h1
            className="text-white text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight"
            style={{ letterSpacing: "-1px" }}
          >
            Discover Jobs{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #93c5fd, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Worldwide
            </span>
          </h1>
          <p className="text-blue-300 text-sm sm:text-base mb-10 max-w-xl leading-relaxed">
            Access thousands of aviation &amp; engineering opportunities across multiple countries.
            Find your perfect career match.
          </p>

          {/* Search bar */}
          <div
            className="flex items-center bg-white dark:bg-gray-900 overflow-hidden shadow-2xl max-w-2xl border border-white/10"
            style={{ borderRadius: "16px" }}
          >
            <div className="pl-4 pr-2 flex items-center shrink-0">
              <Search size={17} className="text-gray-400" />
            </div>
            <input
              id="jobs-search-input"
              type="text"
              placeholder="Search job title, company or location…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 border-none outline-none text-sm text-gray-700 dark:text-gray-200 py-4 px-2 bg-transparent"
            />
            <button
              id="jobs-search-btn"
              className="font-extrabold text-sm px-6 py-4 transition-all shrink-0 text-white hover:opacity-90 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #1a4da1, #2B59C3)" }}
            >
              <Search size={14} />
              Search
            </button>
          </div>

          {/* Quick stats strip */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: "Live Jobs", value: allJobs.length || "—" },
              { label: "Countries", value: "40+" },
              { label: "Industries", value: categories.length || "—" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-lg font-black text-white"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {s.value}
                </span>
                <span className="text-blue-300 text-xs font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Filter Bar */}
        <div
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 px-5 py-4 border border-gray-100 dark:border-gray-800"
          style={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Showing{" "}
              <span className="font-extrabold" style={{ color: "#1a4da1" }}>
                {filteredJobs.length}
              </span>{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"} available
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              id="jobs-category-filter"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
              style={{ borderRadius: "10px" }}
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
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
              style={{ borderRadius: "10px" }}
            >
              <option value="">All Types</option>
              {jobTypes.map((type: any) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                id="jobs-clear-filters-btn"
                onClick={() => { setSelectedCategory(""); setSelectedType(""); setSearch(""); }}
                className="flex items-center gap-1.5 text-xs text-red-500 font-bold px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30 transition-all"
                style={{ borderRadius: "10px" }}
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Job Grid */}
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <div
            className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            style={{ borderRadius: "20px" }}
          >
            <p className="text-red-400 font-semibold">Failed to load jobs. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div
                className="text-center py-24 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700"
                style={{ borderRadius: "24px" }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "#EFF6FF", borderRadius: "16px" }}
                >
                  <Search size={28} style={{ color: "#1a4da1", opacity: 0.5 }} />
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-bold text-base mb-1.5">
                  No jobs found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filters
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSelectedCategory(""); setSelectedType(""); setSearch(""); }}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                    style={{ color: "#1a4da1", borderColor: "#BFDBFE", background: "#EFF6FF" }}
                  >
                    <X size={13} />
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  id="jobs-prev-btn"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-blue-400 hover:text-blue-700 transition-all"
                  style={{ borderRadius: "12px" }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    id={`jobs-page-btn-${i + 1}`}
                    onClick={() => goToPage(i + 1)}
                    className={`w-10 h-10 text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? "text-white shadow-lg"
                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-400 hover:text-blue-700"
                    }`}
                    style={{
                      borderRadius: "12px",
                      ...(currentPage === i + 1
                        ? { background: "linear-gradient(135deg, #1a4da1, #2B59C3)", boxShadow: "0 4px 16px rgba(26,77,161,0.35)" }
                        : {}),
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  id="jobs-next-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-blue-400 hover:text-blue-700 transition-all"
                  style={{ borderRadius: "12px" }}
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
