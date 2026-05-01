"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  Phone,
  Mail,
  XCircle,
  PlayCircle,
  PauseCircle,
  ClipboardList,
} from "lucide-react";
import { useGetCourseByIdQuery } from "@/app/redux/api/CourseApi/CourseApi";
import {
  useGetBatchesByCourseQuery,
  IBatch,
} from "@/app/redux/api/batchApi/batchApi";
import {
  useGetBatchEnrollmentsQuery,
  IBatchEnrollment,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    upcoming: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: <Clock size={14} />,
    },
    running: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <PlayCircle size={14} />,
    },
    completed: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: <CheckCircle size={14} />,
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <XCircle size={14} />,
    },
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: <Clock size={14} />,
    },
    partial: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      icon: <AlertCircle size={14} />,
    },
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle size={14} />,
    },
    pending_payment: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: <Clock size={14} />,
    },
    payment_approved: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: <CheckCircle size={14} />,
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      {status.replace(/_/g, " ")}
    </span>
  );
};

// Batch Card with expandable students
const BatchCard = ({
  batch,
  courseId,
}: {
  batch: IBatch;
  courseId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: enrollmentsData, isLoading: loadingEnrollments } =
    useGetBatchEnrollmentsQuery(
      { batchId: batch._id, limit: 100 },
      { skip: !isExpanded }
    );

  const enrollments = enrollmentsData?.data || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: batch.currency || "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Batch Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {batch.batchName}
            </h3>
            <p className="text-sm text-gray-500">Batch #{batch.batchNumber}</p>
          </div>
          <StatusBadge status={batch.status} />
        </div>

        {/* Batch Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Calendar size={14} />
              Start Date
            </div>
            <p className="font-semibold text-gray-900">
              {formatDate(batch.startDate)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Users size={14} />
              Students
            </div>
            <p className="font-semibold text-gray-900">
              {batch.currentStudentCount} / {batch.maxStudents || "∞"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <DollarSign size={14} />
              Price
            </div>
            <p className="font-semibold text-gray-900">
              {formatCurrency(batch.totalPrice)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Clock size={14} />
              Deadline
            </div>
            <p className="font-semibold text-gray-900">
              {batch.enrollmentDeadline
                ? formatDate(batch.enrollmentDeadline)
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye size={16} />
          {isExpanded
            ? "Hide Students"
            : `View Students (${batch.currentStudentCount})`}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Students List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : enrollments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No students enrolled yet
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  Enrolled Students
                </h4>
                <span className="text-sm text-gray-500">
                  {enrollments.length} students
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-700">
                        Student
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700">
                        Contact
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700">
                        Plan
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700">
                        Payment
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700">
                        Enrolled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {enrollments.map((enrollment: IBatchEnrollment) => (
                      <tr
                        key={enrollment._id}
                        className="bg-white hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <div className="font-medium text-gray-900">
                            {enrollment.studentInfo?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            #
                            {enrollment.enrollmentNumber ||
                              enrollment._id.slice(-6)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail size={12} />
                            <span className="text-xs">
                              {enrollment.studentInfo?.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <Phone size={12} />
                            <span className="text-xs">
                              {enrollment.studentInfo?.phone || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {enrollment.selectedPlan}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-xs">
                            <span className="text-green-600 font-medium">
                              {formatCurrency(enrollment.totalPaid || 0)}
                            </span>
                            <span className="text-gray-400"> / </span>
                            <span className="text-gray-600">
                              {formatCurrency(
                                (enrollment.totalPaid || 0) +
                                  (enrollment.totalDue || 0)
                              )}
                            </span>
                          </div>
                          <StatusBadge status={enrollment.paymentStatus} />
                        </td>
                        <td className="p-3">
                          <StatusBadge status={enrollment.enrollmentStatus} />
                        </td>
                        <td className="p-3 text-xs text-gray-500">
                          {formatDate(
                            enrollment.enrolledAt || enrollment.createdAt
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default function ProgramDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;

  // Fetch course data
  const {
    data: courseData,
    isLoading: loadingCourse,
    error: courseError,
  } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  // Fetch batches for this course
  const { data: batchesData, isLoading: loadingBatches } =
    useGetBatchesByCourseQuery(
      { courseId, includeInactive: true },
      { skip: !courseId }
    );

  const course = courseData as any;
  const batches = batchesData?.data || [];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!batches.length)
      return {
        totalBatches: 0,
        activeBatches: 0,
        completedBatches: 0,
        totalStudents: 0,
        totalRevenuePotential: 0,
      };

    return {
      totalBatches: batches.length,
      activeBatches: batches.filter((b: IBatch) => b.status === "running")
        .length,
      upcomingBatches: batches.filter((b: IBatch) => b.status === "upcoming")
        .length,
      completedBatches: batches.filter((b: IBatch) => b.status === "completed")
        .length,
      totalStudents: batches.reduce(
        (sum: number, b: IBatch) => sum + (b.currentStudentCount || 0),
        0
      ),
      totalRevenuePotential: batches.reduce(
        (sum: number, b: IBatch) =>
          sum + (b.currentStudentCount || 0) * (b.totalPrice || 0),
        0
      ),
    };
  }, [batches]);

  const isLoading = loadingCourse || loadingBatches;

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading course statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm">
                  Failed to load course details. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Back Button */}
        <Link
          href="/dashboard/manage-courses"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </Link>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GraduationCap size={24} />
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {course.type}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.isActive
                      ? "bg-green-500/30 text-green-100"
                      : "bg-gray-500/30 text-gray-100"
                  }`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              <p className="text-white/80 text-sm line-clamp-2">
                {course.description}
              </p>
            </div>
            <Link
              href={`/dashboard/manage-courses/${courseId}/assignments`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium shadow-sm"
            >
              <ClipboardList size={20} />
              View Assignments
            </Link>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalBatches}
            </p>
            <p className="text-sm text-gray-500">Total Batches</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayCircle size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeBatches}
            </p>
            <p className="text-sm text-gray-500">Running Batches</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalStudents}
            </p>
            <p className="text-sm text-gray-500">Total Students</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CheckCircle size={20} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completedBatches}
            </p>
            <p className="text-sm text-gray-500">Completed Batches</p>
          </motion.div>
        </div>

        {/* Batches Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-700" />
              All Batches & Students
            </h2>
            <Link
              href={`/dashboard/manage-courses/${courseId}/batches`}
              className="text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline"
            >
              Manage Batches →
            </Link>
          </div>

          {batches.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Batches Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first batch to start enrolling students
              </p>
              <Link
                href={`/dashboard/manage-courses/${courseId}/batches/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Create First Batch
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch: IBatch, index: number) => (
                <motion.div
                  key={batch._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BatchCard batch={batch} courseId={courseId} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Summary */}
        {batches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Course Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 text-sm">Total Batches</p>
                <p className="text-2xl font-bold">{stats.totalBatches}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Active Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Upcoming</p>
                <p className="text-2xl font-bold">
                  {stats.upcomingBatches || 0}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats.completedBatches}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
