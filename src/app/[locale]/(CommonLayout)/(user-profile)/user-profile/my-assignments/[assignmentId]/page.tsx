"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  CheckCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import {
  useGetAssignmentByIdQuery,
  useGetMyLatestSubmissionQuery,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";
import { getFullDocumentUrl } from "@/utils/imageUtils";

// ==================== SUBMISSION FILE VIEW ====================
const SubmittedFile: React.FC<{
  file: { fileName: string; fileUrl: string; mimeType: string };
}> = ({ file }) => {
  const { fileName, fileUrl, mimeType } = file;
  const fileExt = fileName.split(".").pop() || "";

  // Ensure full URL
  const fullUrl = getFullDocumentUrl(fileUrl);

  const getFileIcon = (type: string) => {
    if (["pdf"].includes(type)) return "📄";
    if (["doc", "docx"].includes(type)) return "📝";
    if (["zip", "rar"].includes(type)) return "📦";
    if (["jpg", "jpeg", "png", "gif"].includes(type)) return "🖼️";
    return "📎";
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group">
      <span className="text-2xl">{getFileIcon(fileExt)}</span>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-slate-800 truncate"
          title={fileName}
        >
          {fileName}
        </p>
        <p className="text-xs text-slate-500 uppercase">{fileExt}</p>
      </div>
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        title="Download"
      >
        <Download size={18} />
      </a>
    </div>
  );
};

// ==================== STATUS BADGE ====================
const StatusBadge = ({ status }: { status: string }) => {
  const styles =
    {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      submitted: "bg-blue-100 text-blue-800 border-blue-200",
      graded: "bg-green-100 text-green-800 border-green-200",
      returned: "bg-orange-100 text-orange-800 border-orange-200",
      "resubmit-required": "bg-orange-100 text-orange-800 border-orange-200",
    }[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${styles} capitalize`}
    >
      {status}
    </span>
  );
};

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { user } = useUser();

  const { data: assignment, isLoading: loadingAssignment } =
    useGetAssignmentByIdQuery(assignmentId);

  const { data: submission, isLoading: loadingSubmission } =
    useGetMyLatestSubmissionQuery({ assignmentId }, { skip: !assignmentId });

  if (loadingAssignment || loadingSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">
            Assignment Not Found
          </h2>
          <Link
            href="/user-profile/my-assignments"
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            Back to assignments
          </Link>
        </div>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/user-profile/my-assignments"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Assignments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Assignment Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden relative"
            >
              {/* Status Line */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                  <FileText size={12} />
                  Assignment
                </div>
                {submission && <StatusBadge status={submission.status} />}
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-4 leading-tight">
                {assignment.title}
              </h1>

              <div className="prose prose-slate max-w-none text-slate-600 mb-6 text-sm leading-relaxed">
                {assignment.description}
              </div>

              {/* Meta Data */}
              <div className="flex flex-wrap gap-4 text-sm border-t border-slate-50 pt-4">
                <div
                  className={`flex items-center gap-1.5 font-medium ${isOverdue ? "text-red-500" : "text-slate-500"}`}
                >
                  <Calendar size={16} />
                  <span>Due: {dueDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Award size={16} />
                  <span>{assignment.totalPoints} Points</span>
                </div>
                {assignment.lateSubmissionPenalty && (
                  <div className="flex items-center gap-1.5 font-medium text-orange-500">
                    <AlertCircle size={16} />
                    <span>Penalty: {assignment.lateSubmissionPenalty}%</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Instructions */}
            {assignment.instructions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  Instructions
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm whitespace-pre-wrap border border-slate-100">
                  {assignment.instructions}
                </div>
              </motion.div>
            )}

            {/* Feedback Section (If Graded/Returned) */}
            {submission &&
              (submission.feedback ||
                submission.pointsAwarded !== undefined) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-2xl shadow-sm border p-6 ${submission.status === "graded" ? "bg-emerald-50/50 border-emerald-100" : "bg-orange-50/50 border-orange-100"}`}
                >
                  <h3
                    className={`font-bold mb-3 flex items-center gap-2 ${submission.status === "graded" ? "text-emerald-800" : "text-orange-800"}`}
                  >
                    {submission.status === "graded" ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    Instructor Feedback
                  </h3>

                  {submission.pointsAwarded !== undefined && (
                    <div className="text-3xl font-black mb-3">
                      <span
                        className={
                          submission.status === "graded"
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }
                      >
                        {submission.pointsAwarded}
                      </span>
                      <span className="text-slate-400 text-lg">
                        /{assignment.totalPoints}
                      </span>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="bg-white/60 p-4 rounded-xl text-slate-700 text-sm italic border border-white/50">
                      "{submission.feedback}"
                    </div>
                  )}
                </motion.div>
              )}
          </div>

          {/* Sidebar: Submission Status */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit"
            >
              <h3 className="font-bold text-slate-800 mb-4">Your Work</h3>

              {!submission ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    No submission yet
                  </p>
                  <Link
                    href={`/user-profile/my-assignments/${assignmentId}/submit`}
                  >
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-indigo-500/20">
                      Submit Assignment
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Submission Date */}
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-2">
                    <Clock size={14} />
                    Submitted on{" "}
                    {new Date(
                      submission.submittedAt || "",
                    ).toLocaleDateString()}
                  </div>

                  {/* Attachments */}
                  {submission.files && submission.files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Attachments
                      </p>
                      {submission.files.map((file: any, i: number) => (
                        <SubmittedFile key={i} file={file} />
                      ))}
                    </div>
                  )}

                  {/* URL Submission */}
                  {submission.linkUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Link
                      </p>
                      <a
                        href={submission.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium break-all"
                      >
                        <LinkIcon size={16} className="shrink-0" />
                        {submission.linkUrl}
                      </a>
                    </div>
                  )}

                  {/* Text Submission */}
                  {submission.textContent && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Text Response
                      </p>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 max-h-40 overflow-y-auto border border-slate-100">
                        {submission.textContent}
                      </div>
                    </div>
                  )}

                  {/* Resubmit Button (if allowed) */}
                  {(submission.status === "resubmit-required" ||
                    submission.status === "returned") && (
                    <Link
                      href={`/user-profile/my-assignments/${assignmentId}/submit`}
                    >
                      <button className="w-full mt-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        {submission.status === "returned" ||
                        submission.status === "resubmit-required"
                          ? "Resubmit Assignment"
                          : "Edit Submission"}
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
