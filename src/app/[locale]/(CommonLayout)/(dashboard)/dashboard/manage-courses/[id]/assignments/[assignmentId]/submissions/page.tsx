"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Download,
  Eye,
  Send,
  Loader2,
  AlertCircle,
  X,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  useGetAssignmentByIdQuery,
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
  useReturnForResubmissionMutation,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";

// ==================== STATUS BADGE ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    graded: "bg-green-100 text-green-800",
    returned: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

// ==================== GRADING MODAL ====================
interface GradingModalProps {
  submission: any;
  assignment: any;
  onClose: () => void;
  onGrade: (grade: number, feedback: string) => Promise<void>;
  onReturn: (feedback: string) => Promise<void>;
}

const GradingModal: React.FC<GradingModalProps> = ({
  submission,
  assignment,
  onClose,
  onGrade,
  onReturn,
}) => {
  const [grade, setGrade] = useState(submission.grade || 0);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<"grade" | "return" | null>(null);

  const handleGrade = async () => {
    if (grade < 0 || grade > assignment.totalPoints) {
      toast.error(`Grade must be between 0 and ${assignment.totalPoints}`);
      return;
    }
    setIsSubmitting(true);
    setAction("grade");
    try {
      await onGrade(grade, feedback);
      onClose();
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
      await onReturn(feedback);
      onClose();
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
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Grade Submission
            </h2>
            <p className="text-sm text-gray-500">
              {submission.studentId?.name || "Student"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Submitted Files */}
          {submission.files && submission.files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Submitted Files
              </h3>
              <div className="space-y-2">
                {submission.files.map((file: any, idx: number) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText size={18} className="text-gray-500" />
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {file.filename}
                    </span>
                    <Download size={16} className="text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* URL Submission */}
          {submission.urlSubmission && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                URL Submission
              </h3>
              <a
                href={submission.urlSubmission}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {submission.urlSubmission}
              </a>
            </div>
          )}

          {/* Text Submission */}
          {submission.textSubmission && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Text Submission
              </h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">
                {submission.textSubmission}
              </p>
            </div>
          )}

          {/* Grade Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade (out of {assignment.totalPoints})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={assignment.totalPoints}
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
                className="w-32 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-gray-500">/ {assignment.totalPoints}</span>
              <span
                className={`text-sm font-medium ${
                  grade >= assignment.passingPoints
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {grade >= assignment.passingPoints ? "Passing" : "Failing"}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the student..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReturn}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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

// ==================== MAIN COMPONENT ====================
export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const courseId = params.id as string;

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // API hooks
  const { data: assignmentData, isLoading: loadingAssignment } =
    useGetAssignmentByIdQuery(assignmentId);

  const {
    data: response,
    isLoading: loadingSubmissions,
    error,
    refetch,
  } = useGetSubmissionsQuery({ assignmentId });

  const submissions = response?.data || [];
  const assignment: any = assignmentData || {};

  const isLoading = loadingAssignment || loadingSubmissions;
  const [gradeSubmission] = useGradeSubmissionMutation();
  const [returnForResubmission] = useReturnForResubmissionMutation();

  const handleGrade = async (grade: number, feedback: string) => {
    await gradeSubmission({
      submissionId: selectedSubmission._id,
      pointsAwarded: grade,
      feedback,
    }).unwrap();
    toast.success("Submission graded successfully");
    refetch();
  };

  const handleReturn = async (feedback: string) => {
    await returnForResubmission({
      submissionId: selectedSubmission._id,
      feedback,
    }).unwrap();
    toast.success("Returned for resubmission");
    refetch();
  };

  // Calculate stats
  const stats = {
    total: submissions?.length || 0,
    pending:
      submissions?.filter((s: any) => s.status === "pending").length || 0,
    submitted:
      submissions?.filter((s: any) => s.status === "submitted").length || 0,
    graded: submissions?.filter((s: any) => s.status === "graded").length || 0,
    averageGrade:
      submissions
        ?.filter((s: any) => s.grade !== undefined)
        .reduce(
          (sum: number, s: any, _, arr: any[]) => sum + s.grade / arr.length,
          0,
        ) || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load submissions</p>
        </div>
      </div>
    );
  }

  // assignment already defined separately

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/dashboard/manage-courses/${courseId}/assignments`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Assignments
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {assignment.title || "Assignment"} - Submissions
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
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
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
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
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
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
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.averageGrade.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Avg Grade</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions?.map((submission: any) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-medium text-sm">
                            {submission.studentId?.name?.[0] || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {submission.studentId?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.studentId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.grade !== undefined ? (
                        <span className="font-medium text-gray-800">
                          {submission.grade}/{assignment.totalPoints}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        {submission.status === "submitted" ? "Grade" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {submissions?.length === 0 && (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
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
            assignment={assignment}
            onClose={() => setSelectedSubmission(null)}
            onGrade={handleGrade}
            onReturn={handleReturn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
