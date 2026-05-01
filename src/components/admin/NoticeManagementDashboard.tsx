"use client";

import React, { useState } from "react";
import {
  useGetAllNoticesQuery,
  useDeleteNoticeMutation,
  useUpdateNoticeMutation,
  INotice,
} from "@/app/redux/api/noticeApi";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Trash2,
  Edit2,
  Eye,
  Plus,
  Filter,
  Bell,
  FileText,
  Send,
  Archive,
  Users,
  Mail,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function NoticeManagementDashboard() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  const {
    data: noticesData,
    isLoading,
    error,
  } = useGetAllNoticesQuery({
    page,
    limit,
    status: statusFilter,
  });

  const [deleteNotice] = useDeleteNoticeMutation();
  const [updateNotice] = useUpdateNoticeMutation();

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      await deleteNotice(noticeId).unwrap();
      toast.success("Notice deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete notice");
    }
  };

  const handleArchive = async (noticeId: string) => {
    if (!confirm("Are you sure you want to archive this notice?")) {
      return;
    }

    try {
      await updateNotice({
        noticeId: noticeId,
        payload: { status: "ARCHIVED" } as any,
      }).unwrap();
      toast.success("Notice archived successfully");
    } catch (error: any) {
      toast.error("Failed to archive notice");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "DRAFT":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          label: "Draft",
        };
      case "PUBLISHED":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Published",
        };
      case "ARCHIVED":
        return {
          color: "bg-slate-50 text-slate-600 border-slate-200",
          icon: Archive,
          label: "Archived",
        };
      default:
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: FileText,
          label: status,
        };
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    const labels: { [key: string]: { icon: string; label: string } } = {
      ALL_USERS: { icon: "👥", label: "All Users" },
      BATCH: { icon: "📚", label: "Batches" },
      INDIVIDUAL: { icon: "👤", label: "Individuals" },
    };
    return labels[type] || { icon: "📢", label: type };
  };

  // Calculate stats
  const totalNotices = noticesData?.data.total || 0;
  const draftCount =
    noticesData?.data.notices.filter((n) => n.status === "DRAFT").length || 0;
  const publishedCount =
    noticesData?.data.notices.filter((n) => n.status === "PUBLISHED").length ||
    0;
  const archivedCount =
    noticesData?.data.notices.filter((n) => n.status === "ARCHIVED").length ||
    0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading notices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Card className="bg-white border-red-100 shadow-lg max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Failed to load notices
            </h3>
            <p className="text-slate-600 text-sm">
              Please try refreshing the page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Notice Management
                </h1>
                <p className="text-slate-500 text-sm">
                  Create and manage announcements
                </p>
              </div>
            </div>
            <Link href="/dashboard/notice/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-11 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Notice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card
            className={`bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${!statusFilter ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => {
              setStatusFilter(undefined);
              setPage(1);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {totalNotices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === "DRAFT" ? "ring-2 ring-amber-500" : ""}`}
            onClick={() => {
              setStatusFilter(statusFilter === "DRAFT" ? undefined : "DRAFT");
              setPage(1);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Drafts</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">
                    {draftCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === "PUBLISHED" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => {
              setStatusFilter(
                statusFilter === "PUBLISHED" ? undefined : "PUBLISHED",
              );
              setPage(1);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Published
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    {publishedCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === "ARCHIVED" ? "ring-2 ring-slate-500" : ""}`}
            onClick={() => {
              setStatusFilter(
                statusFilter === "ARCHIVED" ? undefined : "ARCHIVED",
              );
              setPage(1);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Archived</p>
                  <p className="text-3xl font-bold text-slate-600 mt-1">
                    {archivedCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Archive className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Indicator */}
        {statusFilter && (
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
              <Filter className="w-3 h-3 mr-1.5" />
              Filtered by: {statusFilter}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter(undefined);
                setPage(1);
              }}
              className="text-slate-500 hover:text-slate-700 h-7 px-2"
            >
              Clear filter
            </Button>
          </div>
        )}

        {/* Notices List */}
        {noticesData?.data.notices && noticesData.data.notices.length > 0 ? (
          <div className="space-y-3">
            {noticesData.data.notices.map((notice) => {
              const statusConfig = getStatusConfig(notice.status);
              const StatusIcon = statusConfig.icon;
              const recipientInfo = getRecipientTypeLabel(notice.recipientType);

              return (
                <Card
                  key={notice._id}
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Image Section */}
                      {notice.image && (
                        <div className="lg:w-48 h-32 lg:h-auto relative bg-slate-100 shrink-0">
                          <Image
                            src={notice.image}
                            alt="Notice"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Title & Status */}
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                                {notice.title}
                              </h3>
                              <Badge
                                className={`${statusConfig.color} border flex items-center gap-1 px-2 py-0.5`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {/* Description */}
                            {notice.description && (
                              <p className="text-slate-600 text-sm line-clamp-1 mb-2">
                                {notice.description}
                              </p>
                            )}

                            {/* Content Preview */}
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                              {notice.content.replace(/<[^>]*>?/gm, "")}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{notice.totalRecipients} recipients</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>{recipientInfo.icon}</span>
                                <span>{recipientInfo.label}</span>
                              </div>
                              {notice.sendEmail && (
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{notice.emailSentCount} sent</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                  {new Date(
                                    notice.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/dashboard/notice/${notice._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {notice.status === "DRAFT" && (
                              <>
                                <Link
                                  href={`/dashboard/notice/${notice._id}/edit`}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/notice/${notice._id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-slate-500 hover:text-green-600 hover:bg-green-50"
                                    title="Publish"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(notice._id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {notice.status === "PUBLISHED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                                onClick={() => handleArchive(notice._id)}
                                title="Archive"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No notices found
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Get started by creating your first notice
              </p>
              <Link href="/dashboard/notice/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Notice
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {noticesData && noticesData.data.total > limit && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="border-slate-200"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                {
                  length: Math.min(
                    5,
                    Math.ceil(noticesData.data.total / limit),
                  ),
                },
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-slate-600"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                },
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(noticesData.data.total / limit)}
              className="border-slate-200"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
