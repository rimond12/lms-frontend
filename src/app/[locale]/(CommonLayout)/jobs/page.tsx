"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, Search, MapPin, X } from "lucide-react";
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

// ─── Bookmark Button ──────────────────────────────────────────────
function BookmarkIcon({
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
      className="bg-transparent border-none cursor-pointer p-0.5 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin text-blue-700" />
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={isSaved ? "#1d4ed8" : "none"}
          stroke={isSaved ? "#1d4ed8" : "#aaa"}
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────
function JobCard({ job, savedJobIds }: { job: any; savedJobIds: string[] }) {
  const initial = job.logo ?? job.title?.charAt(0) ?? "J";
  const color = job.color ?? "#1d4ed8";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0"
          style={{
            background: color + "18",
            border: `1.5px solid ${color}30`,
            color: color,
          }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="font-bold text-[13px] text-gray-800 dark:text-white leading-snug truncate">
                {job.title}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {job.category || job.company}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9.5px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-2 py-0.5 whitespace-nowrap">
                {job.type}
              </span>
              <BookmarkIcon jobId={job._id} savedJobIds={savedJobIds} />
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 m-0">
        {job.about ?? job.desc}
      </p>
      {job.location && (
        <div className="flex items-center gap-1 text-[10.5px] text-gray-500 dark:text-gray-400">
          <MapPin size={11} /> {job.location}
        </div>
      )}
      <Link href={`/jobs/${job.slug}`}>
        <button className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg py-2 font-bold text-xs transition-colors mt-1 cursor-pointer">
          Details
        </button>
      </Link>
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

  // 3. Logic: Filter Jobs
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans transition-colors">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 px-4 sm:px-6 py-8 sm:py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <h1 className="text-white text-lg sm:text-xl font-bold mb-1.5">
            Access 10,000+ of aviation jobs worldwide
          </h1>
          <p className="text-blue-300 text-xs sm:text-[12.5px] mb-5">
            Match with roles that fit your skills and ambitions.
          </p>

          <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg max-w-2xl">
            <div className="pl-3 pr-1 flex items-center shrink-0">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search job title or location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 border-none outline-none text-xs sm:text-[12.5px] text-gray-700 dark:text-gray-200 py-3 px-2 bg-transparent"
            />
            <button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 sm:px-5 py-3 transition-colors shrink-0">
              Find Job
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 pb-12">
        {/* Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Showing{" "}
            <span className="text-blue-700 font-bold">
              {filteredJobs.length}
            </span>{" "}
            jobs
          </span>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Dynamic Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-[11px] font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            {/* Job Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-[11px] font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value="">Job Type</option>
              {jobTypes.map((type: any) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {(selectedCategory || selectedType || search) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedType("");
                  setSearch("");
                }}
                className="flex items-center gap-1 text-[11px] text-red-500 font-bold px-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {jobsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-700" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-400 font-medium">
            Failed to load data. Please try again.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentJobs.map((job: any) => (
                <JobCard key={job._id} job={job} savedJobIds={savedJobIds} />
              ))}
            </div>

            {currentJobs.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  No jobs found matching your criteria
                </p>
              </div>
            )}

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs disabled:opacity-30"
                >
                  {" "}
                  Prev{" "}
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-blue-700 text-white shadow-lg" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs disabled:opacity-30"
                >
                  {" "}
                  Next{" "}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
