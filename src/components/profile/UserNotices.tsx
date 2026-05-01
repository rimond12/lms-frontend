"use client";

import React, { useState } from "react";
import { useGetUserNoticesQuery, INotice } from "@/app/redux/api/noticeApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Clock,
  AlertCircle,
  Bell,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";
import Image from "next/image";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

interface UserNoticesProps {
  userId?: string;
  className?: string;
}

export default function UserNotices({
  userId,
  className = "",
}: UserNoticesProps) {
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const limit = 10;

  const {
    data: noticesData,
    isLoading,
    error,
  } = useGetUserNoticesQuery({
    page,
    limit,
  });

  const handleViewNotice = (notice: INotice) => {
    setSelectedNotice(notice);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <Card className={`bg-white border-0 shadow-sm ${className}`}>
        <CardContent className="p-12 text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500">Loading your notices...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white border-0 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center gap-3 text-red-600 justify-center">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Failed to load notices</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const notices = noticesData?.data.notices || [];
  const totalNotices = noticesData?.data.total || 0;

  return (
    <>
      <Card
        className={`bg-white border-0 shadow-sm overflow-hidden ${className}`}
      >
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">
                  My Notices
                </CardTitle>
                <p className="text-blue-100 text-sm mt-0.5">
                  Stay updated with announcements
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1 backdrop-blur-sm">
              {totalNotices} {totalNotices === 1 ? "Notice" : "Notices"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {notices.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No notices yet
              </h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                When you receive announcements, they'll appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notices.map((notice, index) => (
                <div
                  key={notice._id}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => handleViewNotice(notice)}
                >
                  <div className="flex gap-4">
                    {/* Image or Icon */}
                    <div className="shrink-0">
                      {notice.image ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 relative">
                          <Image
                            src={notice.image}
                            alt="Notice"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                          <Bell className="w-7 h-7 text-blue-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {notice.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {notice.description && (
                        <p className="text-slate-600 text-sm line-clamp-1 mt-0.5">
                          {notice.description}
                        </p>
                      )}

                      <div className="line-clamp-2 mt-1 overflow-hidden">
                        <RichTextRenderer
                          htmlString={notice.content}
                          className="text-slate-500 text-sm prose-p:m-0 prose-img:hidden"
                        />
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(notice.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                        {notice.image && (
                          <span className="text-slate-300">• 📷 Image</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalNotices > limit && (
            <div className="flex justify-center gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="border-slate-200"
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-slate-600 text-sm font-medium">
                Page {page} of {Math.ceil(totalNotices / limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(totalNotices / limit)}
                className="border-slate-200"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {/* Modal Header with Image */}
            {selectedNotice.image ? (
              <div className="relative h-48 bg-slate-100">
                <Image
                  src={selectedNotice.image}
                  alt="Notice"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedNotice.title}
                  </h2>
                  {selectedNotice.description && (
                    <p className="text-white/80 text-sm mt-1">
                      {selectedNotice.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <DialogHeader className="p-6 pb-4 border-b border-slate-100">
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {selectedNotice.title}
                </DialogTitle>
                {selectedNotice.description && (
                  <DialogDescription className="text-slate-600 mt-1">
                    {selectedNotice.description}
                  </DialogDescription>
                )}
              </DialogHeader>
            )}

            <div className="p-6 space-y-6">
              {/* Date Badge */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Published on{" "}
                  {new Date(selectedNotice.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>

              {/* Content */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 overflow-hidden">
                <RichTextRenderer
                  htmlString={selectedNotice.content}
                  className="text-slate-700 leading-relaxed text-base"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">
                      Notice Information
                    </p>
                    <p className="text-blue-700 text-sm mt-0.5">
                      This notice was sent to you based on your enrollment
                      status.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
