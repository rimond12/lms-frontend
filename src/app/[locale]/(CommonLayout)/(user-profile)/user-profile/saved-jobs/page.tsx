"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  MapPin,
  Clock,
  Search,
  Briefcase,
  Building2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import {
  useGetSavedJobsQuery,
  useToggleSaveJobMutation,
} from "@/app/redux/api/jobsApi/SavedJobsApi";
import type { IJob } from "@/types/job";
import { toast } from "react-hot-toast";

const CATEGORIES = ["All", "Engineering", "Design", "Data", "Marketing"];
const JOB_TYPES: Array<"All" | "Full time" | "Part time" | "Internship"> = [
  "All",
  "Full time",
  "Part time",
  "Internship",
];

// ─── Job Card ─────────────────────────────────────────────────────
function JobCard({
  job,
  onUnsave,
  isRemoving,
}: {
  job: IJob;
  onUnsave: (id: string) => void;
  isRemoving: boolean;
}) {
  const locale = useLocale();
  const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
  const displayCompanyName = locale === "bn" ? (job.companyNameBn || job.companyName) : job.companyName;
  const initial = displayTitle?.charAt(0)?.toUpperCase() ?? "J";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <Link href={`/jobs/${job.slug}`}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 transition-colors truncate">
                {displayTitle}
              </h3>
            </Link>
            {displayCompanyName && (
              <p className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {displayCompanyName}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <Building2 size={11} /> {job.category}
            </p>
          </div>
        </div>

        {/* Unsave button */}
        <button
          onClick={() => onUnsave(job._id)}
          disabled={isRemoving}
          className="p-2 rounded-xl text-blue-700 dark:text-blue-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50"
          title="Remove from saved"
        >
          {isRemoving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Bookmark size={17} fill="currentColor" />
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={11} /> {job.location}
          </span>
        )}
        {job.salary && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              {job.salary}
            </span>
          </>
        )}
        {job.deadline && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1 text-xs text-orange-500">
              <Clock size={11} /> Deadline: {job.deadline}
            </span>
          </>
        )}
      </div>

      {/* About */}
      {job.about && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {job.about}
        </p>
      )}

      {/* Tags + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap">
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
            {job.type}
          </span>
          {job.experience && (
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-full font-medium">
              {job.experience}
            </span>
          )}
        </div>
        <Link href={`/jobs/${job.slug}/apply`}>
          <button className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap">
            Apply Now
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function SavedJobsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategory] = useState("All");
  const [typeFilter, setType] = useState<
    "All" | "Full time" | "Part time" | "Internship"
  >("All");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const {
    data: savedJobs = [],
    isLoading: jobsLoading,
    refetch,
  } = useGetSavedJobsQuery(undefined, { skip: !user });

  const [toggleSave] = useToggleSaveJobMutation();

  const handleUnsave = async (jobId: string) => {
    setRemovingId(jobId);
    try {
      await toggleSave(jobId).unwrap();
      toast.success("Job removed from saved");
      refetch();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = savedJobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.category ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (job.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "All" || job.category === categoryFilter;
    const matchType = typeFilter === "All" || job.type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  if (userLoading || jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2
          size={28}
          className="animate-spin text-blue-700 dark:text-blue-400"
        />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Bookmark
            size={40}
            className="text-gray-300 dark:text-gray-700 mx-auto mb-3"
          />
          <p className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Login required
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Login করলে saved jobs দেখতে পাবেন
          </p>
          <Link href="/login">
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Saved Jobs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Link href="/jobs">
            <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <Search size={15} /> Find More Jobs
            </button>
          </Link>
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search saved jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Category */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === c
                      ? "bg-blue-700 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            {/* Type */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    typeFilter === t
                      ? "bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Job Cards ── */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-16 text-center shadow-sm">
            <Bookmark
              size={40}
              className="text-gray-200 dark:text-gray-700 mx-auto mb-3"
            />
            <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">
              {savedJobs.length === 0
                ? "No saved jobs yet"
                : "No jobs match your filters"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 mb-5">
              {savedJobs.length === 0
                ? "Browse jobs and click the bookmark icon to save them here"
                : "Try adjusting your search or filters"}
            </p>
            <Link href="/jobs">
              <button className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Browse Jobs
              </button>
            </Link>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filtered.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onUnsave={handleUnsave}
                    isRemoving={removingId === job._id}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-5 text-center">
              Showing{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {savedJobs.length}
              </span>{" "}
              saved jobs
            </p>
          </>
        )}
      </div>
    </div>
  );
}
