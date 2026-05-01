"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Briefcase,
  CheckCircle,
  Calendar,
  AlertCircle,
  Star,
  Clock,
  X,
  Eye,
  ChevronRight,
  Loader2,
  BookOpen,
  Megaphone,
} from "lucide-react";
import Image from "next/image";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useGetUserNoticesQuery, INotice } from "@/app/redux/api/noticeApi";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

// ─── Types ────────────────────────────────────────────────────────
type JobNotifType =
  | "shortlisted"
  | "interview"
  | "rejected"
  | "new_job"
  | "reminder";

interface JobNotification {
  _id: string;
  type: JobNotifType;
  title: string;
  message: string;
  company?: string;
  jobTitle?: string;
  logo?: string;
  logoColor?: string;
  time: string;
  read: boolean;
}

// ─── Dummy Job Notifications ──────────────────────────────────────
const DUMMY_JOB_NOTIFS: JobNotification[] = [
  {
    _id: "1",
    type: "shortlisted",
    title: "You've been shortlisted!",
    message:
      "Creative Studio has shortlisted your application for UX/UI Designer.",
    company: "Creative Studio",
    jobTitle: "UX/UI Designer",
    logo: "CS",
    logoColor: "bg-purple-600",
    time: "2 hours ago",
    read: false,
  },
  {
    _id: "2",
    type: "interview",
    title: "Interview Scheduled",
    message:
      "Startup Hub has scheduled an interview for Product Manager on March 15, 2026.",
    company: "Startup Hub",
    jobTitle: "Product Manager",
    logo: "SH",
    logoColor: "bg-green-600",
    time: "5 hours ago",
    read: false,
  },
  {
    _id: "3",
    type: "new_job",
    title: "New job matching your profile",
    message:
      "A new Full Stack Developer position at Innovate GmbH matches your skills.",
    company: "Innovate GmbH",
    jobTitle: "Full Stack Developer",
    logo: "IG",
    logoColor: "bg-blue-700",
    time: "1 day ago",
    read: false,
  },
  {
    _id: "4",
    type: "reminder",
    title: "Application deadline tomorrow",
    message:
      "Your saved job Cloud Architect at SkyTech AG closes tomorrow. Apply now!",
    company: "SkyTech AG",
    jobTitle: "Cloud Architect",
    logo: "ST",
    logoColor: "bg-sky-600",
    time: "1 day ago",
    read: true,
  },
  {
    _id: "5",
    type: "rejected",
    title: "Application Update",
    message: "DataFlow AG has reviewed your application for Backend Engineer.",
    company: "DataFlow AG",
    jobTitle: "Backend Engineer",
    logo: "DF",
    logoColor: "bg-orange-500",
    time: "3 days ago",
    read: true,
  },
  {
    _id: "6",
    type: "new_job",
    title: "New jobs in Engineering",
    message:
      "5 new Engineering jobs were posted in Berlin matching your preferences.",
    company: undefined,
    jobTitle: undefined,
    logo: undefined,
    logoColor: undefined,
    time: "4 days ago",
    read: true,
  },
  {
    _id: "7",
    type: "shortlisted",
    title: "Profile viewed by employer",
    message:
      "Analytics Pro viewed your profile for the Data Scientist position.",
    company: "Analytics Pro",
    jobTitle: "Data Scientist",
    logo: "AP",
    logoColor: "bg-violet-600",
    time: "1 week ago",
    read: true,
  },
];

// ─── Notif type config ────────────────────────────────────────────
const NOTIF_CONFIG: Record<
  JobNotifType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  shortlisted: {
    icon: Star,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/30",
  },
  interview: {
    icon: Calendar,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  rejected: {
    icon: AlertCircle,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
  },
  new_job: {
    icon: Briefcase,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/30",
  },
  reminder: {
    icon: Clock,
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/30",
  },
};

// ─── Notice Detail Modal ──────────────────────────────────────────
function NoticeModal({
  notice,
  onClose,
}: {
  notice: INotice;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image header or plain header */}
          {notice.image ? (
            <div className="relative h-40 bg-gray-100 flex-shrink-0">
              <Image
                src={notice.image}
                alt="Notice"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-5 right-12">
                <h2 className="text-lg font-bold text-white">{notice.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Bell
                    size={18}
                    className="text-blue-700 dark:text-blue-400"
                  />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white text-base">
                  {notice.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {notice.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {notice.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
              <Clock size={12} />
              {new Date(notice.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <RichTextRenderer
                htmlString={notice.content}
                className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Job Notifications Tab ────────────────────────────────────────
function JobNotificationsTab() {
  const [notifs, setNotifs] = useState<JobNotification[]>(DUMMY_JOB_NOTIFS);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotifs((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  const deleteNotif = (id: string) =>
    setNotifs((prev) => prev.filter((n) => n._id !== id));

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {notifs.length} notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-blue-700 dark:bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-blue-700 dark:text-blue-400 font-semibold hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-16 text-center">
          <Bell
            size={40}
            className="text-gray-200 dark:text-gray-700 mx-auto mb-3"
          />
          <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">
            No notifications yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
            Job updates will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <AnimatePresence>
            {notifs.map((notif, idx) => {
              const cfg = NOTIF_CONFIG[notif.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-start gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group ${!notif.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                  onClick={() => markRead(notif._id)}
                >
                  {/* Icon or logo */}
                  {notif.logo ? (
                    <div
                      className={`w-10 h-10 rounded-xl ${notif.logoColor} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                    >
                      {notif.logo}
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={18} className={cfg.color} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${!notif.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-700 dark:bg-blue-400 flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotif(notif._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                          <X size={13} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        {notif.type === "new_job"
                          ? "New Job"
                          : notif.type === "shortlisted"
                            ? "Shortlisted"
                            : notif.type === "interview"
                              ? "Interview"
                              : notif.type === "rejected"
                                ? "Update"
                                : "Reminder"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Clock size={10} />
                        {notif.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── LMS Notices Tab ──────────────────────────────────────────────
function LMSNoticesTab() {
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);
  const limit = 10;

  const {
    data: noticesData,
    isLoading,
    error,
  } = useGetUserNoticesQuery({ page, limit });

  const notices = noticesData?.data.notices ?? [];
  const total = noticesData?.data.total ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={28}
          className="animate-spin text-blue-700 dark:text-blue-400"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Failed to load notices
        </p>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-16 text-center">
        <Megaphone
          size={40}
          className="text-gray-200 dark:text-gray-700 mx-auto mb-3"
        />
        <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">
          No notices yet
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          Announcements will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {notices.map((notice, idx) => (
            <motion.div
              key={notice._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              onClick={() => setSelectedNotice(notice)}
            >
              {/* Icon or image */}
              {notice.image ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 relative flex-shrink-0">
                  <Image
                    src={notice.image}
                    alt="Notice"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Bell
                    size={22}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {notice.title}
                  </p>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                {notice.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {notice.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Clock size={10} />
                  {new Date(notice.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      notice.recipientType === "ALL_USERS"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {notice.recipientType === "ALL_USERS"
                      ? "General"
                      : "Personal"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedNotice && (
        <NoticeModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function NotificationsPage() {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<"jobs" | "notices">("jobs");

  const jobUnread = DUMMY_JOB_NOTIFS.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2
          size={28}
          className="animate-spin text-blue-700 dark:text-blue-400"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with your job activity and announcements
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 mb-6 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "jobs"
                ? "bg-blue-700 dark:bg-blue-600 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <Briefcase size={15} />
            Job Alerts
            {jobUnread > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === "jobs"
                    ? "bg-white/20 text-white"
                    : "bg-blue-700 dark:bg-blue-600 text-white"
                }`}
              >
                {jobUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "notices"
                ? "bg-blue-700 dark:bg-blue-600 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <Bell size={15} />
            LMS Notices
          </button>
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "jobs" ? <JobNotificationsTab /> : <LMSNoticesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
