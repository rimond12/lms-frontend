"use client";

import { useState } from "react";
import {
  useGetNoticeByIdQuery,
  usePublishNoticeMutation,
  useDeleteNoticeMutation,
  useUpdateNoticeMutation,
  INotice,
} from "@/app/redux/api/noticeApi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send, ArrowLeft, Edit2, Trash2, Archive } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;

  const [sendEmail, setSendEmail] = useState(false);
  const {
    data: noticeResponse,
    isLoading,
    error,
  } = useGetNoticeByIdQuery(noticeId);
  const [publishNotice, { isLoading: isPublishing }] =
    usePublishNoticeMutation();

  console.log("👁️ [NoticeDetail] Page loaded for notice:", noticeId);

  const notice = noticeResponse?.data;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "PUBLISHED":
        return "bg-green-100 text-green-800 border-green-300";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      ALL_USERS: "👥 All Users",
      BATCH: "📚 Specific Batches",
      INDIVIDUAL: "� Specific Individuals",
    };
    return labels[type] || type;
  };

  const [deleteNotice, { isLoading: isDeleting }] = useDeleteNoticeMutation();
  const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();

  const handlePublish = async () => {
    console.log("📤 [NoticeDetail] Publishing notice:", noticeId);

    if (!confirm("Are you sure you want to publish this notice?")) {
      console.log("❌ [NoticeDetail] Publish cancelled by user");
      return;
    }

    try {
      console.log("🔄 [NoticeDetail] Sending publish request:", {
        noticeId,
        sendEmail,
      });

      await publishNotice({
        noticeId,
        sendEmail,
      }).unwrap();

      console.log("✅ [NoticeDetail] Notice published successfully");
      toast.success(
        sendEmail
          ? "Notice published and emails queued for sending!"
          : "Notice published successfully",
      );
      setTimeout(() => router.push("/dashboard/notice"), 1500);
    } catch (error: any) {
      console.error("❌ [NoticeDetail] Publish error:", error);
      toast.error(error?.message || "Failed to publish notice");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      await deleteNotice(noticeId).unwrap();
      toast.success("Notice deleted successfully");
      router.push("/dashboard/notice");
    } catch (error: any) {
      toast.error("Failed to delete notice");
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this notice?")) {
      return;
    }

    try {
      await updateNotice({
        noticeId: noticeId,
        payload: { status: "ARCHIVED" } as any,
      }).unwrap();
      toast.success("Notice archived successfully");
      // Optional: Refresh or redirect
    } catch (error: any) {
      toast.error("Failed to archive notice");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notice details...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Card className="bg-white border-red-200 shadow-lg max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-semibold mb-4">
              Failed to load notice
            </p>
            <Link href="/dashboard/notice">
              <Button variant="outline">Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/notice">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-4xl font-bold text-gray-900">
                {notice.title}
              </h1>
              <Badge className={`${getStatusBadgeColor(notice.status)} border`}>
                {notice.status}
              </Badge>
              {notice.status === "DRAFT" && (
                <Link href={`/dashboard/notice/${noticeId}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>
              )}
              {notice.status === "PUBLISHED" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50"
                  onClick={handleArchive}
                  disabled={isUpdating}
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="ml-2 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
            {notice.description && (
              <p className="text-gray-600">{notice.description}</p>
            )}
          </div>
        </div>

        {/* Image */}
        {notice.image && (
          <Card className="mb-6 bg-white border-0 shadow-md overflow-hidden">
            <div className="relative w-full h-80 bg-gray-200">
              <Image
                src={notice.image}
                alt="Notice"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </Card>
        )}

        {/* Content */}
        <Card className="mb-6 bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">📄 Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-gray-700 leading-relaxed text-base prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </CardContent>
        </Card>

        {/* Recipient Information */}
        <Card className="mb-6 bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">👥 Recipient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Total Recipients</p>
                <p className="text-3xl font-bold text-blue-600">
                  {notice.totalRecipients}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">Recipient Type</p>
                <p className="text-lg font-semibold text-purple-700">
                  {getRecipientTypeLabel(notice.recipientType)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Email Status</p>
                <p className="text-lg font-semibold text-green-700">
                  {notice.sendEmail ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>
            </div>

            {/* Email Delivery Stats */}
            {notice.status === "PUBLISHED" && notice.sendEmail && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  📧 Email Delivery
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-green-600">
                      {notice.emailSentCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {notice.emailFailedCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {(notice.totalRecipients || 0) -
                        (notice.emailSentCount || 0) -
                        (notice.emailFailedCount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="mb-6 bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">ℹ️ Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Created</p>
                <p className="font-semibold text-gray-900">
                  {new Date(notice.createdAt).toLocaleString()}
                </p>
              </div>
              {notice.updatedAt && (
                <div>
                  <p className="text-gray-600 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(notice.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {notice.publishedAt && (
                <div>
                  <p className="text-gray-600 mb-1">Published</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(notice.publishedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Publish Section - Only for DRAFT */}
        {notice.status === "DRAFT" && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">🚀 Publish Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <Checkbox
                  id="sendEmailOnPublish"
                  checked={sendEmail}
                  onCheckedChange={(checked) => {
                    console.log("📧 [NoticeDetail] Email toggle:", checked);
                    setSendEmail(checked as boolean);
                  }}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="sendEmailOnPublish"
                    className="text-base font-semibold cursor-pointer mb-0"
                  >
                    Send Email to Recipients
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Emails will be sent to all {notice.totalRecipients}{" "}
                    recipients upon publishing
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11 text-base gap-2"
              >
                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPublishing ? "Publishing..." : "🚀 Publish Notice"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Messages */}
        {notice.status === "PUBLISHED" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ This notice has been published and is visible to recipients
            </p>
          </div>
        )}

        {notice.status === "ARCHIVED" && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-800">
              📦 This notice has been archived and is no longer active
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
