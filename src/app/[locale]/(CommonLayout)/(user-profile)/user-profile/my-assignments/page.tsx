"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileUp,
  Eye,
  ChevronRight,
  Award,
  Loader2,
  FileText,
} from "lucide-react";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useGetMySubmissionsQuery } from "@/app/redux/api/AssignmentApi/AssignmentApi";
import Link from "next/link";

// ==================== TYPES ====================
interface Assignment {
  _id: string;
  title: string;
  description: string;
  courseId: {
    _id: string;
    title: string;
  };
  batchId?: {
    _id: string;
    name: string;
  };
  dueDate: string;
  totalPoints: number;
  status: string;
}

interface Submission {
  _id: string;
  assignmentId: Assignment;
  status: "pending" | "submitted" | "graded" | "returned";
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

// ==================== STATUS BADGE ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    graded: "bg-green-100 text-green-800",
    returned: "bg-orange-100 text-orange-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    submitted: "Submitted",
    graded: "Graded",
    returned: "Returned for Revision",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

// ==================== ASSIGNMENT CARD ====================
const AssignmentCard: React.FC<{ submission: Submission }> = ({
  submission,
}) => {
  const assignment = submission.assignmentId;
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date() && submission.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border-2 ${
        isOverdue ? "border-red-200" : "border-gray-100"
      } p-5 hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-500">{assignment.courseId?.title}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {assignment.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span
            className={`flex items-center gap-1 ${
              isOverdue ? "text-red-600" : "text-gray-500"
            }`}
          >
            <Calendar size={14} />
            Due: {dueDate.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Award size={14} />
            {assignment.totalPoints} points
          </span>
        </div>

        {submission.status === "graded" && submission.grade !== undefined && (
          <span className="font-bold text-green-600">
            {submission.grade}/{assignment.totalPoints}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        {submission.status === "pending" || submission.status === "returned" ? (
          <Link
            href={`/user-profile/my-assignments/${assignment._id}/submit`}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FileUp size={16} />
            {submission.status === "returned" ? "Resubmit" : "Submit"}
          </Link>
        ) : (
          <Link
            href={`/user-profile/my-assignments/${assignment._id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye size={16} />
            View Details
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function MyAssignmentsPage() {
  const { user } = useUser();
  const [filter, setFilter] = useState<string>("all");

  const {
    data: response,
    isLoading,
    error,
  } = useGetMySubmissionsQuery(undefined, {
    skip: !user,
  });

  // Extract submissions array from response
  const submissions = response?.data || [];

  // Calculate stats
  const stats = {
    total: submissions.length || 0,
    pending: submissions.filter((s: any) => s.status === "pending").length || 0,
    submitted:
      submissions.filter((s: any) => s.status === "submitted").length || 0,
    graded: submissions.filter((s: any) => s.status === "graded").length || 0,
  };

  // Filter submissions
  const filteredSubmissions =
    filter === "all"
      ? submissions
      : submissions.filter((s: any) => s.status === filter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load assignments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-orange-600" />
              My Assignments
            </h1>
            <p className="text-gray-600 mt-2">
              Track and submit your course assignments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.submitted}
                  </p>
                  <p className="text-xs text-gray-500">Submitted</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
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
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["all", "pending", "submitted", "graded", "returned"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === status
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Assignments List */}
          {filteredSubmissions && filteredSubmissions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {filteredSubmissions.map((submission: any) => (
                  <AssignmentCard
                    key={submission._id}
                    submission={submission}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No assignments found
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "You don't have any assignments yet."
                  : `No ${filter} assignments.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
