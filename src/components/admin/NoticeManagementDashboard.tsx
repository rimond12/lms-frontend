"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useGetAllNoticesQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useUploadNoticeAttachmentMutation,
  INotice,
} from "@/app/redux/api/noticeApi";
import { getImageUrl } from "@/utils/imageUtils";
import {
  Plus,
  Edit2,
  Trash2,
  Bell,
  Calendar,
  Link as LinkIcon,
  Check,
  X,
  Loader2,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function NoticeManagementDashboard() {
  // Queries & Mutations
  const { data: noticesData, isLoading, isError, refetch } = useGetAllNoticesQuery();
  const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
  const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();
  const [uploadNoticeAttachment, { isLoading: isUploadingFile }] = useUploadNoticeAttachmentMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync edit data into form
  const handleEditClick = (notice: INotice) => {
    setEditingId(notice._id);
    setTitle(notice.title);
    setContent(notice.content);
    
    // Sync attachments list, falling back to legacy single attachment if necessary
    let initialAttachments: string[] = [];
    if (notice.attachments && notice.attachments.length > 0) {
      initialAttachments = [...notice.attachments];
    } else if (notice.attachment) {
      initialAttachments = [notice.attachment];
    }
    setAttachments(initialAttachments);
    setIsActive(notice.isActive);
    
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setAttachments([]);
    setIsActive(true);
  };

  // Submit Handler (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required");
      return;
    }

    try {
      if (editingId) {
        // Edit mode
        await updateNotice({
          noticeId: editingId,
          payload: {
            title,
            content,
            attachment: attachments[0] || undefined, // single string fallback
            attachments,
            isActive,
          },
        }).unwrap();
        toast.success("Notice updated successfully");
      } else {
        // Create mode
        await createNotice({
          title,
          content,
          attachment: attachments[0] || undefined, // single string fallback
          attachments,
          isActive,
        }).unwrap();
        toast.success("Notice created successfully");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong. Please try again.");
    }
  };

  // Delete Handler
  const handleDeleteClick = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice permanently?")) {
      return;
    }
    try {
      await deleteNotice(noticeId).unwrap();
      toast.success("Notice deleted permanently");
      if (editingId === noticeId) {
        resetForm();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete notice");
    }
  };

  // Toggle Visibility Handler
  const handleToggleActive = async (notice: INotice) => {
    try {
      await updateNotice({
        noticeId: notice._id,
        payload: { isActive: !notice.isActive },
      }).unwrap();
      toast.success(`Notice is now ${!notice.isActive ? "Active" : "Inactive"}`);
      if (editingId === notice._id) {
        setIsActive(!notice.isActive);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle status");
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("attachment", file);

    try {
      const response = await uploadNoticeAttachment(formData).unwrap();
      if (response.success && response.data?.attachmentPath) {
        setAttachments((prev) => [...prev, response.data.attachmentPath]);
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Error uploading file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const notices = noticesData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 dark:text-gray-400 font-medium">Loading notice board data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-950/30 shadow-xl rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-2">Failed to load notices</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
            An error occurred while fetching the notices list. Please refresh the page or try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-gray-50 tracking-tight">
            Notice Board Management
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">
            Publish, edit, delete, and control public visibility of announcements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* notice editor form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              {editingId ? "Edit Notice Details" : "Publish New Notice"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Notice Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder-slate-400 text-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Notice Content *
                </label>
                <textarea
                  placeholder="Write the full notice description or details here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder-slate-400 text-sm transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Attachments (Optional)
                </label>
                
                {/* File list */}
                {attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {attachments.map((item, idx) => {
                      const cleanName = item.split("/").pop() || item;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-gray-800/40 rounded-xl border border-slate-100 dark:border-gray-800/60 gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-700 dark:text-gray-300 truncate font-medium" title={item}>
                              {cleanName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-slate-100 dark:hover:bg-gray-850 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  {/* Manual URL field */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Paste custom link (e.g. https://example.com/file.pdf)"
                        id="custom-url-input"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              setAttachments(prev => [...prev, input.value.trim()]);
                              input.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("custom-url-input") as HTMLInputElement;
                        if (input && input.value.trim()) {
                          setAttachments(prev => [...prev, input.value.trim()]);
                          input.value = "";
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Add Link
                    </button>
                  </div>

                  {/* File Upload Selector */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-4 border border-dashed border-slate-300 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-xl transition-all text-xs font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingFile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading File...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-slate-450" />
                          <span>Upload Image or File</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Visibility Checkbox */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 dark:border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-slate-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  Make this notice active immediately (Public viewable)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/15 disabled:opacity-50 transition-all text-sm cursor-pointer"
                >
                  {(isCreating || isUpdating) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{editingId ? "Save Changes" : "Publish Notice"}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-slate-600 dark:text-gray-300 font-semibold rounded-xl transition-all text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* notices actions table list */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
                Notice List
                <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 rounded-full font-semibold">
                  {notices.length} Total
                </span>
              </h2>
            </div>

            {notices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200 dark:border-gray-700">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-gray-200 mb-1">No notices published yet</h3>
                <p className="text-slate-500 dark:text-gray-400 text-xs max-w-xs mx-auto">
                  Announcements you create will appear in this table. Use the form on the left to add one.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-gray-850 border-b border-slate-100 dark:border-gray-800">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Notice</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Visibility Status</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-800/80">
                    {notices.map((notice) => (
                      <tr key={notice._id} className="hover:bg-slate-50/30 dark:hover:bg-gray-800/20 transition-all">
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <p className="font-semibold text-slate-800 dark:text-gray-200 text-sm leading-snug truncate">
                              {notice.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {notice.content}
                            </p>
                            {((notice.attachments && notice.attachments.length > 0) ? notice.attachments : (notice.attachment ? [notice.attachment] : [])).map((item, idx) => {
                              const cleanFileName = item.split("/").pop() || item;
                              return (
                                <a
                                  key={idx}
                                  href={getImageUrl(item)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1.5 mr-2.5"
                                  title={cleanFileName}
                                >
                                  <LinkIcon className="w-2.5 h-2.5" />
                                  <span>File {idx + 1}</span>
                                </a>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(notice)}
                            title="Click to toggle visibility status"
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-all border cursor-pointer hover:scale-105 ${
                              notice.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }`}
                          >
                            {notice.isActive ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(notice)}
                              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Edit notice"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(notice._id)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete notice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
