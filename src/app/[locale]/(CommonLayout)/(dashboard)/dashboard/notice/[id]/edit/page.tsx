"use client";

import React, { useState, useEffect } from "react";
import {
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useGetRecipientsPreviewMutation,
} from "@/app/redux/api/noticeApi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Upload, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import RichTextEditor from "@/components/shared/RichTextEditor";

const RECIPIENT_TYPES = [
  {
    value: "ALL_USERS",
    label: "👥 All Users",
    description: "Send to all registered users",
  },
  {
    value: "APPROVED_MEMBERS",
    label: "✓ Approved Members",
    description: "Send only to approved members",
  },
  {
    value: "AM_BASE",
    label: "🎖️ AM-BASE",
    description: "Send to AM-BASE members",
  },
  {
    value: "F_BASE",
    label: "👑 F-BASE",
    description: "Send to F-BASE members",
  },
  {
    value: "M_BASE",
    label: "🏆 M-BASE",
    description: "Send to M-BASE members",
  },
  {
    value: "CUSTOM",
    label: "👤 Custom",
    description: "Select specific recipients",
  },
];

export default function EditNoticePage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;

  const { data: noticeResponse, isLoading: isLoadingNotice } =
    useGetNoticeByIdQuery(noticeId);
  const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();
  const [getRecipientsPreview, { isLoading: isLoadingPreview }] =
    useGetRecipientsPreviewMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    recipientType: "ALL_USERS",
    sendEmail: false,
    image: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipientsPreview, setRecipientsPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form with notice data
  useEffect(() => {
    if (noticeResponse?.data) {
      const notice = noticeResponse.data;
      console.log("✏️ [EditNotice] Initialized form with:", notice.title);
      setFormData({
        title: notice.title,
        description: notice.description || "",
        content: notice.content,
        recipientType: notice.recipientType,
        sendEmail: notice.sendEmail,
        image: notice.image || "",
      });
      setImagePreview(notice.image || null);
    }
  }, [noticeResponse]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    console.log(`📝 [Form] Field changed - ${name}:`, value.substring(0, 50));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecipientTypeChange = (value: string) => {
    console.log("👥 [Form] Recipient type changed:", value);
    setFormData((prev) => ({
      ...prev,
      recipientType: value,
    }));
    setShowPreview(false);
  };

  const handleCheckboxChange = (checked: boolean) => {
    console.log("📧 [Form] Email toggle:", checked);
    setFormData((prev) => ({
      ...prev,
      sendEmail: checked,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(
      "🖼️ [Form] Image selected:",
      file.name,
      `(${(file.size / 1024).toFixed(1)}KB)`,
    );

    if (!file.type.startsWith("image/")) {
      console.error("❌ [Form] Invalid file type:", file.type);
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ [Form] File too large:", file.size);
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      console.log("✅ [Form] Image converted to base64");
      setImagePreview(base64String);
      setFormData((prev) => ({
        ...prev,
        image: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    console.log("🗑️ [Form] Image removed");
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handlePreviewRecipients = async () => {
    console.log(
      "🔍 [Form] Fetching recipients preview for:",
      formData.recipientType,
    );
    try {
      const result = (await getRecipientsPreview({
        recipientType: formData.recipientType,
      }).unwrap()) as any;

      const recipients = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];
      console.log("✅ [Form] Recipients preview fetched:", recipients.length);
      setRecipientsPreview(recipients);
      setShowPreview(true);
    } catch (error: any) {
      console.error("❌ [Form] Preview error:", error);
      toast.error("Failed to fetch recipients preview");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📤 [Form] Submitting notice update:", {
      noticeId,
      title: formData.title,
      contentLength: formData.content.length,
      hasImage: !!formData.image,
      recipientType: formData.recipientType,
    });

    if (!formData.title.trim()) {
      console.log("⚠️ [Form] Validation failed: Missing title");
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      console.log("⚠️ [Form] Validation failed: Missing content");
      toast.error("Content is required");
      return;
    }

    try {
      console.log("✏️ [Form] Updating notice...");
      await updateNotice({
        noticeId,
        payload: {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          recipientType: formData.recipientType,
          sendEmail: formData.sendEmail,
          image: formData.image || undefined,
        },
      }).unwrap();

      console.log("✅ [Form] Notice updated successfully");
      toast.success("Notice updated successfully!");
      router.push("/dashboard/notice");
    } catch (error: any) {
      console.error("❌ [Form] Submission error:", error);
      toast.error(error?.message || "Failed to update notice");
    }
  };

  if (isLoadingNotice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (!noticeResponse?.data) {
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

  const notice = noticeResponse.data;

  if (notice.status !== "DRAFT") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Card className="bg-white border-amber-200 shadow-lg max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-amber-600 font-semibold mb-4">
              Only draft notices can be edited
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
          <div>
            <h1 className="text-4xl font-bold text-gray-900">✏️ Edit Notice</h1>
            <p className="text-gray-600 mt-1">Update notice details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Description */}
          <Card className="bg-white border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">📌 Notice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="title"
                  className="text-base font-semibold mb-2 block"
                >
                  Notice Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notice title"
                  className="h-11"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-base font-semibold mb-2 block"
                >
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the notice"
                  className="h-11"
                />
              </div>

              <div>
                <Label
                  htmlFor="content"
                  className="text-base font-semibold mb-2 block"
                >
                  Content
                </Label>
                <div className="min-h-[300px]">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, content: value }))
                    }
                    placeholder="Enter the full notice content"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300">
            <CardHeader>
              <CardTitle className="text-lg">🖼️ Notice Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Recipient Configuration */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">
                👥 Recipient Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="recipientType"
                  className="text-base font-semibold mb-2 block"
                >
                  Who should receive this notice?
                </Label>
                <select
                  id="recipientType"
                  value={formData.recipientType}
                  onChange={(e) => handleRecipientTypeChange(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select recipient type...</option>
                  {RECIPIENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  {
                    RECIPIENT_TYPES.find(
                      (t) => t.value === formData.recipientType,
                    )?.description
                  }
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewRecipients}
                disabled={isLoadingPreview}
                className="w-full gap-2"
              >
                {isLoadingPreview && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                👁️ Preview Recipients
              </Button>

              {showPreview && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold mb-3 text-gray-900">
                    Total Recipients:{" "}
                    <span className="text-blue-600">
                      {recipientsPreview.length}
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {recipientsPreview.slice(0, 10).map((recipient) => (
                      <div
                        key={recipient.userId || recipient._id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {recipient.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {recipient.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recipientsPreview.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2">
                      ...and {recipientsPreview.length - 10} more recipients
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">📧 Email Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <Checkbox
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onCheckedChange={handleCheckboxChange}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="sendEmail"
                    className="text-base font-semibold cursor-pointer mb-0"
                  >
                    Send Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Recipients will receive this notice via email when published
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/notice" className="flex-1">
              <Button variant="outline" className="w-full h-11">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11"
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUpdating ? "Updating..." : "✏️ Update Notice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
