"use client";

import React, { useState, useRef } from "react";
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  FileText,
  Upload,
  X,
  File,
  Loader2,
  Award,
  AlertTriangle,
  LinkIcon,
  ArrowLeft,
  Send,
  Clock,
  Target,
  BookOpen,
  ExternalLink,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import {
  useSubmitAssignmentMutation,
  useGetMyLatestSubmissionQuery,
  useGetAssignmentByIdQuery,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";
import { getFullDocumentUrl } from "@/utils/imageUtils";

interface AssignmentDetailViewProps {
  assignmentId: string;
  courseId: string;
  batchId?: string;
  onClose?: () => void;
}

export default function AssignmentDetailView({
  assignmentId,
  courseId,
  batchId,
  onClose,
}: AssignmentDetailViewProps) {
  // States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textSubmission, setTextSubmission] = useState("");
  const [urlSubmission, setUrlSubmission] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Hooks
  const { data: assignment, isLoading: loadingAssignment } =
    useGetAssignmentByIdQuery(assignmentId);
  const { data: existingSubmission, refetch: refetchSubmission } =
    useGetMyLatestSubmissionQuery({ assignmentId, batchId });
  const [submitAssignment, { isLoading: isSubmitting }] =
    useSubmitAssignmentMutation();

  // Computed values
  const isOverdue = assignment?.dueDate
    ? new Date(assignment.dueDate) < new Date()
    : false;
  const hasSubmitted = !!existingSubmission;
  const isGraded = existingSubmission?.status === "graded";
  const submissionTypes = assignment?.submissionTypes || ["file-upload"];
  const allowedFileTypes = assignment?.allowedFileTypes || [
    "pdf",
    "doc",
    "docx",
    "zip",
  ];
  const maxFileSize = assignment?.maxFileSize || 50;
  const maxFilesCount = assignment?.maxFilesCount || 3;

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!assignment?.dueDate) return null;
    const dueDate = new Date(assignment.dueDate);
    if (isOverdue) {
      return `Overdue by ${formatDistanceToNow(dueDate)}`;
    }
    return `${formatDistanceToNow(dueDate)} remaining`;
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedFileTypes.includes(ext)) {
        toast.error(`File type .${ext} is not allowed`);
        return false;
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds ${maxFileSize}MB limit`);
        return false;
      }
      return true;
    });

    if (selectedFiles.length + validFiles.length > maxFilesCount) {
      toast.error(`Maximum ${maxFilesCount} files allowed`);
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (
      selectedFiles.length === 0 &&
      !textSubmission.trim() &&
      !urlSubmission.trim()
    ) {
      toast.error("Please provide at least one submission");
      return;
    }

    if (!batchId) {
      toast.error(
        "Batch information is missing. This feature requires a batch enrollment.",
      );
      console.error("Assignment submission failed: No batchId available", {
        assignmentId,
        courseId,
        batchId,
      });
      return;
    }

    // Debug logging
    console.log("Submitting assignment:", {
      assignmentId,
      batchId,
      courseId,
      filesCount: selectedFiles.length,
      hasTextContent: !!textSubmission.trim(),
      hasLinkUrl: !!urlSubmission.trim(),
    });

    try {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("batchId", batchId);

      // Add files
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Add text submission
      if (textSubmission.trim()) {
        formData.append("textContent", textSubmission);
      }

      // Add URL submission
      if (urlSubmission.trim()) {
        formData.append("linkUrl", urlSubmission);
      }

      await submitAssignment(formData).unwrap();
      toast.success("🎉 Assignment submitted successfully!");
      refetchSubmission();
      setSelectedFiles([]);
      setTextSubmission("");
      setUrlSubmission("");
    } catch (error: any) {
      console.error("Submission error details:", {
        status: error?.status,
        message: error?.data?.message,
        error: error?.data?.errorMessages || error?.data,
      });
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Failed to submit assignment";
      toast.error(errorMessage);
    }
  };

  // Loading state
  if (loadingAssignment) {
    return (
      <div className="h-full bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-pulse"></div>
            <Loader2 className="w-8 h-8 text-red-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading assignment...</p>
        </div>
      </div>
    );
  }

  // No assignment found — auto-close and return to video
  // This handles orphaned/deleted assignment references gracefully
  if (!assignment) {
    if (onClose) {
      // Auto-navigate back so students don't see an error
      onClose();
      return null;
    }
    // Fallback: if no onClose handler, show a minimal message
    return (
      <div className="h-full bg-linear-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Assignment Not Available
          </h2>
          <p className="text-gray-500 mb-6">
            This assignment is no longer available. Please continue with the
            next lesson.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-indigo-50 overflow-y-auto">
      {/* Hero Header */}
      <div className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Back Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Course</span>
            </button>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <ClipboardList className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Assignment
                  </span>
                  {hasSubmitted && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isGraded
                          ? "bg-white text-black"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {isGraded ? "✓ Graded" : "✓ Submitted"}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  {assignment.title}
                </h1>
                <p className="text-white/80 text-sm">
                  Submit your work and showcase your skills
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[120px]">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>Total Points</span>
                </div>
                <p className="text-2xl font-bold">{assignment.totalPoints}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[120px]">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>To Pass</span>
                </div>
                <p className="text-2xl font-bold">{assignment.passingPoints}</p>
              </div>
              {assignment.dueDate && (
                <div
                  className={`backdrop-blur-sm rounded-xl px-4 py-3 min-w-[140px] ${
                    isOverdue ? "bg-red-500/30" : "bg-white/15"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due Date</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isOverdue ? "text-red-200" : "text-white/60"}`}
                  >
                    {getTimeRemaining()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Resubmit Alert */}
        {existingSubmission?.status === "resubmit-required" && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Resubmission Required
                </h3>
                <p className="text-gray-700 mb-3">
                  The instructor has requested changes to your assignment.
                  Please review the feedback below and submit again.
                </p>
                {existingSubmission.feedback && (
                  <div className="bg-white/80 rounded-lg p-4 border border-amber-200">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
                      Instructor Feedback
                    </p>
                    <p className="text-gray-800 italic">
                      "{existingSubmission.feedback}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            {assignment.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-red-600" />
                    Description
                  </h3>
                </div>
                <div className="p-6">
                  <RichTextRenderer
                    htmlString={assignment.description}
                    className="text-gray-700 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Instructions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Instructions
                </h3>
              </div>
              <div className="p-6">
                <RichTextRenderer
                  htmlString={
                    assignment.instructions || "No instructions provided."
                  }
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            </div>

            {/* Reference Materials Card */}
            {assignment.referenceFiles &&
              assignment.referenceFiles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-white px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Download className="w-5 h-5 text-red-600" />
                      Reference Materials
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                        {assignment.referenceFiles.length} file
                        {assignment.referenceFiles.length > 1 ? "s" : ""}
                      </span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                      Download the reference materials to complete this
                      assignment.
                    </p>
                    <div className="space-y-3">
                      {assignment.referenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-lg shadow-sm">
                              <File className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <a
                            href={getFullDocumentUrl(file.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={file.fileName}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Grade Display - If graded */}
            {isGraded && existingSubmission && (
              <div className="bg-black rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Your Grade</h3>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-5xl font-black">
                      {existingSubmission.pointsAwarded ?? 0}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      out of {assignment.totalPoints}
                    </p>
                  </div>
                  <div className="flex-1 pl-8 border-l border-white/20">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                        (existingSubmission.pointsAwarded ?? 0) >=
                        assignment.passingPoints
                          ? "bg-white/20"
                          : "bg-red-500/50"
                      }`}
                    >
                      {(existingSubmission.pointsAwarded ?? 0) >=
                      assignment.passingPoints
                        ? "🎉 Passed!"
                        : "❌ Did not pass"}
                    </div>
                    {existingSubmission.feedback && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          Instructor Feedback
                        </p>
                        <p className="text-sm text-white/90 bg-white/10 rounded-lg p-3">
                          {existingSubmission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submission Section */}
            {!isGraded && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-red-600" />
                    Submit Your Work
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose one or more submission methods below
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* File Upload */}
                  {submissionTypes.includes("file-upload") && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <File className="w-4 h-4 text-red-500" />
                        File Upload
                        <span className="text-xs text-gray-400 font-normal">
                          (Max {maxFilesCount} files, {maxFileSize}MB each)
                        </span>
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-red-500 bg-red-50 scale-[1.02]"
                            : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          accept={allowedFileTypes
                            .map((t) => `.${t}`)
                            .join(",")}
                          className="hidden"
                        />
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="font-semibold text-gray-700 mb-1">
                          {isDragging
                            ? "Drop files here!"
                            : "Drag & drop or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Accepts: {allowedFileTypes.join(", ").toUpperCase()}
                        </p>
                      </div>

                      {/* Selected Files */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"
                            >
                              <div className="p-2 bg-white rounded-lg border border-gray-200">
                                <File className="w-4 h-4 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Submission */}
                  {submissionTypes.includes("text-submission") && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <FileText className="w-4 h-4 text-red-500" />
                        Text Submission
                      </label>
                      <textarea
                        value={textSubmission}
                        onChange={(e) => setTextSubmission(e.target.value)}
                        placeholder="Write your answer or response here..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {/* URL Submission */}
                  {submissionTypes.includes("url-submission") && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <LinkIcon className="w-4 h-4 text-red-500" />
                        Link / URL Submission
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={urlSubmission}
                          onChange={(e) => setUrlSubmission(e.target.value)}
                          placeholder="https://drive.google.com/your-file"
                          className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 placeholder:text-gray-400"
                        />
                        <ExternalLink className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {hasSubmitted
                          ? "Resubmit Assignment"
                          : "Submit Assignment"}
                      </>
                    )}
                  </button>

                  {isOverdue && (
                    <div className="flex items-center gap-2 justify-center text-amber-600 bg-amber-50 rounded-xl p-3">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        This assignment is past due, but you can still submit.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous Submission */}
            {existingSubmission && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                    Your Previous Submission
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    Submitted on{" "}
                    {format(
                      new Date(existingSubmission.submittedAt),
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </div>
                  {existingSubmission.files &&
                    existingSubmission.files.length > 0 && (
                      <div className="space-y-2">
                        {existingSubmission.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <File className="w-4 h-4 text-gray-900" />
                            <a
                              href={getFullDocumentUrl(
                                // @ts-ignore
                                file.fileUrl || file.url || file.path,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-800 font-medium hover:underline truncate"
                            >
                              {file.fileName || "Download File"}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                Assignment Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Total Points
                  </span>
                  <span className="font-bold text-gray-900">
                    {assignment.totalPoints}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Passing Score
                  </span>
                  <span className="font-bold text-gray-900">
                    {assignment.passingPoints}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isGraded
                        ? "bg-black text-white"
                        : hasSubmitted
                          ? "bg-gray-100 text-gray-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isGraded
                      ? "Graded"
                      : hasSubmitted
                        ? "Submitted"
                        : "Not Submitted"}
                  </span>
                </div>

                {assignment.allowResubmission === true && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Resubmission</span>
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Allowed
                    </span>
                  </div>
                )}

                {assignment.maxAttempts && assignment.maxAttempts > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Max Attempts</span>
                    <span className="font-bold text-gray-900">
                      {assignment.maxAttempts}
                    </span>
                  </div>
                )}
              </div>

              {/* Accepted Submissions */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Accepted Submissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {submissionTypes.includes("file-upload") && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                      📁 File Upload
                    </span>
                  )}
                  {submissionTypes.includes("text-submission") && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                      📝 Text Entry
                    </span>
                  )}
                  {submissionTypes.includes("url-submission") && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                      🔗 URL/Link
                    </span>
                  )}
                </div>
              </div>

              {/* File Types */}
              {submissionTypes.includes("file-upload") && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Allowed File Types
                  </p>
                  <p className="text-sm text-gray-600">
                    {allowedFileTypes.map((t) => t.toUpperCase()).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
