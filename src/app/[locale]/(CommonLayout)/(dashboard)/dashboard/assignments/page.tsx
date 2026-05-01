"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Users,
  Search,
  Filter,
  X,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Loader2,
  Calendar,
  Star,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
  useReturnForResubmissionMutation,
  useGetAssignmentByIdQuery,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";
import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import { useGetAllBatchesQuery } from "@/app/redux/api/batchApi/batchApi";
import { getFullDocumentUrl } from "@/utils/imageUtils";

// ==================== STATUS BADGE ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    graded: "bg-green-100 text-green-800",
    returned: "bg-orange-100 text-orange-800",
    "resubmit-required": "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status?.replace("-", " ") || "Unknown"}
    </span>
  );
};

// ==================== GRADING MODAL ====================
interface GradingModalProps {
  submission: any;
  onClose: () => void;
  onSuccess: () => void;
}

const GradingModal: React.FC<GradingModalProps> = ({
  submission,
  onClose,
  onSuccess,
}) => {
  const { data: assignmentData } = useGetAssignmentByIdQuery(
    submission?.assignmentId?._id || submission?.assignmentId,
    { skip: !submission?.assignmentId },
  );
  const assignment: any = assignmentData || {};

  const [grade, setGrade] = useState(submission?.pointsAwarded || 0);
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<"grade" | "return" | null>(null);

  const [gradeSubmission] = useGradeSubmissionMutation();
  const [returnForResubmission] = useReturnForResubmissionMutation();

  const handleGrade = async () => {
    if (grade < 0 || grade > (assignment.totalPoints || 100)) {
      toast.error(
        `Grade must be between 0 and ${assignment.totalPoints || 100}`,
      );
      return;
    }
    setIsSubmitting(true);
    setAction("grade");
    try {
      await gradeSubmission({
        submissionId: submission._id,
        pointsAwarded: grade,
        feedback,
      }).unwrap();
      toast.success("Submission graded successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to grade submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback for resubmission");
      return;
    }
    setIsSubmitting(true);
    setAction("return");
    try {
      await returnForResubmission({
        submissionId: submission._id,
        feedback,
      }).unwrap();
      toast.success("Returned for resubmission");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to return submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Review Submission
            </h2>
            <p className="text-sm text-gray-500">
              {submission?.studentId?.name || "Student"} •{" "}
              {assignment?.title || "Assignment"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Student & Course Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Student</p>
              <p className="font-medium text-gray-900">
                {submission?.studentId?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {submission?.studentId?.email}
              </p>
              <p className="text-xs text-gray-500">
                {submission?.studentId?.phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Course & Batch</p>
              <p className="font-medium text-gray-900">
                {submission?.courseId?.title || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {submission?.batchId?.batchName || "N/A"}
              </p>
            </div>
          </div>

          {/* Submitted Files */}
          {submission?.files && submission.files.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Submitted Files
              </h3>
              <div className="space-y-2">
                {submission.files.map((file: any, idx: number) => (
                  <a
                    key={idx}
                    href={getFullDocumentUrl(file.fileUrl || file.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText size={18} className="text-gray-500" />
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {file.fileName ||
                        file.filename ||
                        file.originalName ||
                        "File"}
                    </span>
                    <Download size={16} className="text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* URL Submission */}
          {submission?.urlSubmission && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                URL Submission
              </h3>
              <a
                href={submission.urlSubmission}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all text-sm"
              >
                {submission.urlSubmission}
              </a>
            </div>
          )}

          {/* Text Submission */}
          {submission?.textSubmission && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Text Submission
              </h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border">
                {submission.textSubmission}
              </p>
            </div>
          )}

          {/* Grade Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Grade (out of {assignment?.totalPoints || 100})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={assignment?.totalPoints || 100}
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
                  className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">
                  / {assignment?.totalPoints || 100}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Current Status
              </p>
              <StatusBadge status={submission?.status} />
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Feedback / Comments
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the student..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleReturn}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 border border-orange-400 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 font-medium"
          >
            {isSubmitting && action === "return" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <AlertCircle size={16} />
            )}
            Return for Revision
          </button>
          <button
            onClick={handleGrade}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isSubmitting && action === "grade" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Save Grade
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==================== PAGE CONTENT WITH URL PARAMS ====================
function AssignmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL query params
  const courseFilter = searchParams.get("course") || "";
  const batchFilter = searchParams.get("batch") || "";
  const statusFilter = searchParams.get("status") || "";
  const searchTerm = searchParams.get("search") || "";

  // Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Update URL with new filter value
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace("/dashboard/assignments", { scroll: false });
  }, [router]);

  const hasActiveFilters =
    courseFilter || batchFilter || statusFilter || searchTerm;

  // Fetch courses and batches for filters
  const { data: coursesData } = useGetCoursesQuery({ limit: 100 });
  const { data: batchesData } = useGetAllBatchesQuery({ limit: 100 });

  const courses = coursesData?.data || [];
  const batches = batchesData?.data || [];

  // Fetch submissions with filters
  const {
    data: submissionsResponse,
    isLoading,
    error,
    refetch,
  } = useGetSubmissionsQuery({
    courseId: courseFilter || undefined,
    batchId: batchFilter || undefined,
    status: (statusFilter as any) || undefined,
    limit: 100,
  });

  const allSubmissions = submissionsResponse?.data || [];

  // Client-side search filter
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) return allSubmissions;
    const term = searchTerm.toLowerCase();
    return allSubmissions.filter((sub: any) => {
      const studentName = sub?.studentId?.name?.toLowerCase() || "";
      const studentEmail = sub?.studentId?.email?.toLowerCase() || "";
      const assignmentTitle = sub?.assignmentId?.title?.toLowerCase() || "";
      return (
        studentName.includes(term) ||
        studentEmail.includes(term) ||
        assignmentTitle.includes(term)
      );
    });
  }, [allSubmissions, searchTerm]);

  // Calculate stats
  const stats = useMemo(
    () => ({
      total: allSubmissions.length,
      pending: allSubmissions.filter((s: any) => s.status === "pending").length,
      submitted: allSubmissions.filter((s: any) => s.status === "submitted")
        .length,
      graded: allSubmissions.filter((s: any) => s.status === "graded").length,
    }),
    [allSubmissions],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardList className="text-blue-600" size={28} />
              Assignment Management
            </h1>
            <p className="text-gray-500 mt-1">
              View and grade all student submissions across courses and batches
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500">Total Submissions</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.submitted}
                  </p>
                  <p className="text-xs text-gray-500">To Grade</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.graded}
                  </p>
                  <p className="text-xs text-gray-500">Graded</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter size={18} />
                Filters
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <RotateCcw size={14} />
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by student name, email, or assignment..."
                  value={searchTerm}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Course Filter */}
              <div className="relative">
                <select
                  value={courseFilter}
                  onChange={(e) => updateFilter("course", e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All Courses</option>
                  {courses.map((course: any) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Batch Filter */}
              <div className="relative">
                <select
                  value={batchFilter}
                  onChange={(e) => updateFilter("batch", e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All Batches</option>
                  {batches.map((batch: any) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="returned">Returned</option>
                  <option value="resubmit-required">Resubmit Required</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load submissions</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Submissions Found
                </h3>
                <p className="text-gray-500">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "No student submissions yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Course / Batch
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSubmissions.map((submission: any) => (
                      <motion.tr
                        key={submission._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-sm">
                                {submission.studentId?.name?.[0]?.toUpperCase() ||
                                  "S"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {submission.studentId?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {submission.studentId?.email}
                              </p>
                              <p className="text-xs text-gray-400">
                                {submission.studentId?.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {submission.courseId?.title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.batchId?.batchName || "N/A"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-900">
                            {submission.assignmentId?.title || "N/A"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt,
                              ).toLocaleDateString("bn-BD", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={submission.status} />
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {submission.pointsAwarded !== undefined &&
                          submission.pointsAwarded !== null ? (
                            <span className="font-semibold text-gray-900">
                              {submission.pointsAwarded}/
                              {submission.assignmentId?.totalPoints || 100}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Eye size={15} />
                            {submission.status === "submitted"
                              ? "Grade"
                              : "View"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Results Summary */}
            {filteredSubmissions.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
                Showing {filteredSubmissions.length} of {allSubmissions.length}{" "}
                submissions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <GradingModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onSuccess={() => refetch()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== MAIN EXPORT WITH SUSPENSE ====================
export default function GlobalAssignmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      }
    >
      <AssignmentsPageContent />
    </Suspense>
  );
}
