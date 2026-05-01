"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  Link as LinkIcon,
  Trash2,
  Clock,
  Calendar,
  Award,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import {
  useGetAssignmentByIdQuery,
  useSubmitAssignmentMutation,
  useGetMyLatestSubmissionQuery,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";

// ==================== FILE PREVIEW ====================
const FilePreview: React.FC<{
  file: File;
  onRemove: () => void;
}> = ({ file, onRemove }) => {
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("doc")) return "📝";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{getFileIcon(file.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function SubmitAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const assignmentId = params.assignmentId as string;

  // State
  const [files, setFiles] = useState<File[]>([]);
  const [urlSubmission, setUrlSubmission] = useState("");
  const [textSubmission, setTextSubmission] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hooks
  const { data: assignment, isLoading: loadingAssignment } =
    useGetAssignmentByIdQuery(assignmentId);
  const { data: existingSubmission } = useGetMyLatestSubmissionQuery(
    { assignmentId },
    { skip: !assignmentId },
  );
  const [submitAssignment] = useSubmitAssignmentMutation();

  // File upload
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const maxFiles = assignment?.maxFilesCount || 5;
      const maxSize = (assignment?.maxFileSize || 50) * 1024 * 1024;

      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds the maximum file size`);
          return false;
        }
        return true;
      });

      if (files.length + validFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [assignment, files.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: assignment?.allowedFileTypes?.reduce(
      (acc: Record<string, string[]>, type: string) => {
        const mimeTypes: Record<string, string[]> = {
          pdf: ["application/pdf"],
          doc: ["application/msword"],
          docx: [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
          zip: ["application/zip"],
          rar: ["application/x-rar-compressed"],
          dwg: ["application/acad", "application/x-acad"],
          jpg: ["image/jpeg"],
          png: ["image/png"],
        };
        acc[type] = mimeTypes[type] || [];
        return acc;
      },
      {},
    ),
    maxFiles: assignment?.maxFilesCount || 5,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (files.length === 0 && !urlSubmission.trim() && !textSubmission.trim()) {
      toast.error("Please provide a submission");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      files.forEach((file) => formData.append("files", file));
      if (urlSubmission) formData.append("urlSubmission", urlSubmission);
      if (textSubmission) formData.append("textSubmission", textSubmission);

      await submitAssignment(formData).unwrap();

      toast.success("Assignment submitted successfully!");
      router.push("/my-assignments");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Assignment not found</p>
        </div>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();
  const submissionTypes = assignment.submissionTypes || ["file-upload"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link
            href="/my-assignments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Assignments
          </Link>

          {/* Assignment Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {assignment.title}
            </h1>
            <p className="text-gray-600 mb-4">{assignment.description}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-6">
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-red-600" : "text-gray-500"
                }`}
              >
                <Calendar size={16} />
                Due: {dueDate.toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Award size={16} />
                {assignment.totalPoints} points
              </span>
              {assignment.lateSubmissionPenalty && (
                <span className="flex items-center gap-1 text-orange-600">
                  <AlertCircle size={16} />
                  Late penalty: {assignment.lateSubmissionPenalty}%
                </span>
              )}
            </div>

            {/* Instructions */}
            {assignment.instructions && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Instructions
                </h3>
                <p className="text-blue-700 text-sm whitespace-pre-wrap">
                  {assignment.instructions}
                </p>
              </div>
            )}
          </motion.div>

          {/* Previous Submission Warning */}
          {existingSubmission && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Previous Submission Found
                  </h4>
                  <p className="text-sm text-yellow-700">
                    You already submitted this assignment. Submitting again will
                    replace your previous submission.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submission Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Submission
            </h2>

            {/* File Upload */}
            {submissionTypes.includes("file-upload") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-300 hover:border-orange-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">
                    {isDragActive
                      ? "Drop files here..."
                      : "Drag & drop files or click to browse"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Max {assignment.maxFilesCount || 5} files,{" "}
                    {assignment.maxFileSize || 50}MB each
                  </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <FilePreview
                        key={index}
                        file={file}
                        onRemove={() => removeFile(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* URL Submission */}
            {submissionTypes.includes("url-submission") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LinkIcon size={16} className="inline mr-1" />
                  URL Submission
                </label>
                <input
                  type="url"
                  value={urlSubmission}
                  onChange={(e) => setUrlSubmission(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Text Submission */}
            {submissionTypes.includes("text-submission") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Text Submission
                </label>
                <textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Enter your response..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Link
                href="/my-assignments"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
