"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Bookmark,
  Bell,
  Eye,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useGetMyApplicationsQuery } from "@/app/redux/api/jobsApi/JobApplicationApi";
import { useGetSavedJobsQuery } from "@/app/redux/api/jobsApi/SavedJobsApi";
import type { IApplication } from "@/types/job";
import type { IJob } from "@/types/job";

// ─── Status config ─────────────────────────────────────────────────
type AppStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected";

const STATUS_MAP: Record<
  AppStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: {
    label: "Pending",
    icon: AlertCircle,
    className:
      "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  },
  reviewed: {
    label: "Reviewed",
    icon: Eye,
    className:
      "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  },
  shortlisted: {
    label: "Shortlisted",
    icon: CheckCircle,
    className:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  },
  interview: {
    label: "Interview",
    icon: Calendar,
    className:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    className:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  },
};

// ─── Chart data (static — activity হলে backend থেকে আনা যাবে) ──────
const CHART_DATA = [
  { month: "Jan", applications: 2, interviews: 0 },
  { month: "Feb", applications: 4, interviews: 1 },
  { month: "Mar", applications: 3, interviews: 1 },
  { month: "Apr", applications: 6, interviews: 2 },
  { month: "May", applications: 5, interviews: 2 },
  { month: "Jun", applications: 8, interviews: 3 },
  { month: "Jul", applications: 7, interviews: 3 },
  { month: "Aug", applications: 10, interviews: 4 },
  { month: "Sep", applications: 9, interviews: 5 },
  { month: "Oct", applications: 12, interviews: 5 },
  { month: "Nov", applications: 11, interviews: 6 },
  { month: "Dec", applications: 14, interviews: 7 },
];

// ─── Custom Tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-500 dark:text-gray-400 capitalize">
            {p.dataKey}:
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function JobSeekerDashboard() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [chartPeriod, setChartPeriod] = useState<"3m" | "6m" | "1y">("1y");

  // ✅ Real API — user এর নিজের applications
  const { data: applications = [], isLoading: appsLoading } =
    useGetMyApplicationsQuery(user?.email ?? "", {
      skip: !user?.email,
    });

  // ✅ Real API — user এর saved jobs
  const { data: savedJobs = [], isLoading: savedLoading } =
    useGetSavedJobsQuery(undefined, {
      skip: !user,
    });

  const chartFiltered = {
    "3m": CHART_DATA.slice(-3),
    "6m": CHART_DATA.slice(-6),
    "1y": CHART_DATA,
  }[chartPeriod];

  // ── Loading ──
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-blue-700 dark:text-blue-400"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    router.push("/login");
    return null;
  }

  // ── Stats — real counts ──
  const interviewCount = applications.filter(
    (a: IApplication) => a.status === "interview",
  ).length;

  const STATS = [
    {
      label: "Applied Jobs",
      value: appsLoading ? "—" : applications.length,
      icon: Briefcase,
      color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    },
    {
      label: "Saved Jobs",
      value: savedLoading ? "—" : savedJobs.length,
      icon: Bookmark,
      color:
        "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    },
    {
      label: "Interviews",
      value: appsLoading ? "—" : interviewCount,
      icon: Calendar,
      color:
        "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    },
    {
      label: "Profile Views",
      value: 89,
      icon: Eye,
      color:
        "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    },
  ];

  // ── Profile completion ──
  const profileChecks = [
    { label: "Basic Info", done: !!(user.name && user.email) },
    { label: "Upload CV", done: !!user.cvUrl },
    { label: "Work Experience", done: !!user.jobExperiences?.length },
    {
      label: "Academic Info",
      done: !!(user.degreeTitle || user.universityName),
    },
    { label: "Profile Photo", done: !!user.profilePhoto },
    { label: "Mobile Number", done: !!user.mobileNumber },
  ];
  const completionPct = Math.round(
    (profileChecks.filter((c) => c.done).length / profileChecks.length) * 100,
  );
  const completionDash = 2 * Math.PI * 50 * (completionPct / 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back,{" "}
              <span className="text-blue-700 dark:text-blue-400">
                {user.name?.split(" ")[0]}! 👋
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here's what's happening with your job search today.
            </p>
          </div>
          <Link href="/jobs">
            <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <Search size={16} />
              Find Jobs
            </button>
          </Link>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
                >
                  <Icon size={18} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Chart + Profile Completion ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Application Activity
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Applications vs Interviews over time
                </p>
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(["3m", "6m", "1y"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${chartPeriod === p
                      ? "bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-700 dark:bg-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Applications
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Interviews
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartFiltered}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorInterviews"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  className="dark:stroke-gray-800"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  fill="url(#colorApps)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="interviews"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#colorInterviews)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Profile Completion */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Profile Strength
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Complete your profile to get more visibility
            </p>

            {/* Circle Progress */}
            <div className="flex justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    className="dark:stroke-gray-800"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${completionDash} ${2 * Math.PI * 50}`}
                    className="dark:stroke-blue-500 transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completionPct}%
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            {profileChecks.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 mb-2.5"
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done
                    ? "bg-blue-700 dark:bg-blue-600"
                    : "border-2 border-gray-200 dark:border-gray-700"
                    }`}
                >
                  {item.done && (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-xs ${item.done ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {item.label}
                </span>
              </div>
            ))}

            <Link href="/dashboard/profile">
              <button className="w-full mt-4 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors">
                Complete Profile
              </button>
            </Link>
          </div>
        </div>

        {/* ── Recent Applications + Saved Jobs ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm transition-colors overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Recent Applications
              </h2>
              <Link href="/dashboard/my-applications">
                <button className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 hover:underline font-semibold">
                  View all <ChevronRight size={14} />
                </button>
              </Link>
            </div>

            {appsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2
                  size={24}
                  className="animate-spin text-blue-700 dark:text-blue-400"
                />
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Briefcase
                  size={36}
                  className="text-gray-200 dark:text-gray-700 mb-3"
                />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  No applications yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 mb-4">
                  Start applying to jobs to track them here
                </p>
                <Link href="/jobs">
                  <button className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors">
                    Find Jobs
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {applications.slice(0, 5).map((app: IApplication) => {
                  const s =
                    STATUS_MAP[app.status as AppStatus] ?? STATUS_MAP.pending;
                  const StatusIcon = s.icon;
                  // jobId populated থাকলে job details পাওয়া যাবে
                  const job = app.jobId as any;
                  return (
                    <div
                      key={app._id as string}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Logo */}
                      <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {(job?.title ?? app.name)?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {job?.title ?? "Job Application"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {job?.category && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {job.category}
                            </span>
                          )}
                          {job?.location && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">
                                ·
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                <MapPin size={11} /> {job.location}
                              </span>
                            </>
                          )}
                          <span className="text-gray-300 dark:text-gray-600">
                            ·
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                            <Clock size={11} />
                            {app.createdAt
                              ? new Date(
                                app.createdAt as string,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${s.className}`}
                      >
                        <StatusIcon size={12} />
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Jobs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm transition-colors overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Saved Jobs
              </h2>
              <Link href="/dashboard/saved-jobs">
                <button className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 hover:underline font-semibold">
                  View all <ChevronRight size={14} />
                </button>
              </Link>
            </div>

            {savedLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2
                  size={24}
                  className="animate-spin text-blue-700 dark:text-blue-400"
                />
              </div>
            ) : savedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Bookmark
                  size={36}
                  className="text-gray-200 dark:text-gray-700 mb-3"
                />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  No saved jobs
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  Bookmark jobs to save them here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {savedJobs.slice(0, 4).map((job: IJob) => (
                  <div
                    key={job._id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {job.title?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {job.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {job.category}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {job.location && (
                            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                              <MapPin size={10} /> {job.location}
                            </span>
                          )}
                          {job.salary && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">
                                ·
                              </span>
                              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                {job.salary}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Bookmark
                        size={15}
                        className="text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        {job.type}
                      </span>
                      <Link href={`/jobs/${job.slug}/apply`}>
                        <button className="text-xs text-blue-700 dark:text-blue-400 font-semibold hover:underline">
                          Apply Now →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-700 dark:bg-blue-600 rounded flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            {/* <div>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-none">
                Immigrant Jobs World
              </div>
              <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                powered by aeroselect
              </div>
            </div> */}
          </div>
          {/* <div className="flex gap-4">
            {["Imprint", "Privacy", "Explore AeroHire"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
}
