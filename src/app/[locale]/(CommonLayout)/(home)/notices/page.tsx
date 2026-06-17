"use client";

import React, { useState, useMemo } from "react";
import { useGetActiveNoticesQuery, INotice } from "@/app/redux/api/noticeApi";
import {
  Bell,
  Calendar,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/utils/imageUtils";

export default function NoticesPage() {
  const { data: noticesData, isLoading, isError, refetch } = useGetActiveNoticesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const notices = noticesData?.data || [];

  // Filter notices based on search query
  const filteredNotices = useMemo(() => {
    return notices.filter(
      (notice) =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notices, searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-gray-400 font-medium">Loading notice board...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-xl rounded-3xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-2">Notice Board Unavailable</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
            We are having trouble loading the notice board right now. Please reload the page.
          </p>
          <button
            onClick={() => refetch()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/25 transition-all text-sm cursor-pointer"
          >
            Reload Notices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-slate-900 dark:text-gray-100 font-sans pb-24">
      {/* Premium Hero Header Section */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-gray-900/40 border-b border-slate-100 dark:border-gray-800/80 py-16 sm:py-20 mb-12">
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-blue-400 dark:bg-blue-600 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[50%] rounded-full bg-indigo-400 dark:bg-indigo-600 blur-[100px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            <Bell className="w-3.5 h-3.5" />
            Official Notice Board
          </span>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-tight mb-4">
            Notice Board & Announcements
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Stay updated with the latest news, notices, deadlines, and official announcements.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 shadow-sm transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Notices List Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredNotices.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-gray-900/20 border border-dashed border-slate-200 dark:border-gray-800 rounded-3xl p-8">
            <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-gray-800">
              <Bell className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-2">No announcements found</h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
              There are no notices published matching your search criteria.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => {
              const isExpanded = expandedId === notice._id;
              const noticeAttachments = (notice.attachments && notice.attachments.length > 0)
                ? notice.attachments
                : (notice.attachment ? [notice.attachment] : []);
              const hasAttachments = noticeAttachments.length > 0;

              return (
                <div
                  key={notice._id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "border-blue-500/50 dark:border-blue-500/40 shadow-xl shadow-blue-500/5"
                      : "border-slate-100 dark:border-gray-800/80 hover:border-slate-200 dark:hover:border-gray-700/60 shadow-sm"
                  }`}
                >
                  {/* Card Header (Clickable for expansion) */}
                  <button
                    onClick={() => toggleExpand(notice._id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 select-none cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-gray-500 mb-2.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(notice.createdAt), "MMMM dd, yyyy")}</span>
                      </div>
                      <h2
                        className={`text-lg font-bold tracking-tight transition-colors duration-200 line-clamp-2 pr-4 ${
                          isExpanded
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-900 dark:text-gray-50 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                      >
                        {notice.title}
                      </h2>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                        isExpanded
                          ? "bg-blue-50 border-blue-200/50 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400 rotate-180"
                          : "bg-slate-50 border-slate-100 text-slate-400 dark:bg-gray-800/50 dark:border-gray-700/50 dark:text-gray-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expandable Content Area using Framer Motion */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 border-t border-slate-50 dark:border-gray-800/60 pt-5">
                          <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            {notice.content}
                          </p>

                           {/* Attachments Box */}
                           {hasAttachments && (
                             <div className="mt-6 space-y-3">
                               <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                 Attachments ({noticeAttachments.length})
                               </p>
                               <div className="grid gap-3">
                                 {noticeAttachments.map((item, idx) => {
                                   if (!item) return null;
                                   const cleanFileName = item.split("/").pop() || item;
                                   return (
                                     <div key={idx} className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                       <div className="flex items-center gap-3 min-w-0">
                                         <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/30">
                                           <FileText className="w-5 h-5" />
                                         </div>
                                         <div className="min-w-0">
                                           <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                             Attachment Available
                                           </p>
                                           <p className="text-xs text-slate-650 dark:text-gray-300 font-medium truncate max-w-[200px] sm:max-w-[320px]" title={item}>
                                             {cleanFileName}
                                           </p>
                                         </div>
                                       </div>

                                       <a
                                         href={getImageUrl(item)}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                       >
                                         <ExternalLink className="w-3.5 h-3.5" />
                                         <span>View Attachment</span>
                                       </a>
                                     </div>
                                   );
                                 })}
                               </div>
                             </div>
                           )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
