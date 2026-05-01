"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Award,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  PlayCircle,
  X,
  Clock,
  DollarSign,
  Layers,
  Calendar,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useGetMyBatchEnrollmentsQuery } from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { calculateCourseProgress } from "@/app/utils/calculateCourseProgress";
import AppImage from "@/components/ui/AppImage";

// Status badge colors for batch enrollments
const ENROLLMENT_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; icon: any }
> = {
  active: { bg: "bg-emerald-100", text: "text-emerald-700", icon: PlayCircle },
  payment_approved: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: CheckCircle,
  },
  pending_payment: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
  },
  completed: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: CheckCircle,
  },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
  shifted: { bg: "bg-gray-100", text: "text-gray-700", icon: AlertCircle },
};

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  partial: { bg: "bg-blue-100", text: "text-blue-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  overdue: { bg: "bg-red-100", text: "text-red-700" },
};

// Batch Enrollment Card Component
const BatchEnrollmentCard = ({ enrollment }: { enrollment: any }) => {
  const batch = enrollment.batchId;
  const isBatchExpired = batch?.status === "completed";

  // courseId is populated directly on enrollment, not inside batch
  const course =
    typeof enrollment.courseId === "object" ? enrollment.courseId : null;

  let statusConfig =
    ENROLLMENT_STATUS_COLORS[enrollment.enrollmentStatus] ||
    ENROLLMENT_STATUS_COLORS["pending_payment"];

  // Override status if batch is expired
  if (isBatchExpired) {
    statusConfig = {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: AlertCircle,
    };
  }

  const paymentConfig =
    PAYMENT_STATUS_COLORS[enrollment.paymentStatus] ||
    PAYMENT_STATUS_COLORS["pending"];
  const StatusIcon = statusConfig.icon;

  // Calculate progress using shared utility
  const cp = calculateCourseProgress(enrollment);
  const progressPercentage = cp.percentage;

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div className="h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-gray-300 overflow-hidden flex flex-col">
        {/* Image Section */}
        <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
          {course?.bannerImage ? (
            <AppImage
              photoUrl={course.bannerImage}
              alt={course.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${isBatchExpired ? "grayscale" : "group-hover:scale-105"}`}
              width={400}
              height={160}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Enrollment Status Badge */}
          <div
            className={`absolute top-3 right-3 ${statusConfig.bg} ${statusConfig.text} px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 border border-white/20`}
          >
            <StatusIcon className="w-3 h-3" />
            {isBatchExpired
              ? "Expired"
              : enrollment.enrollmentStatus
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </div>

          {/* Batch Badge */}
          <div className="absolute bottom-3 left-3 bg-white/95 text-gray-800 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 border border-gray-200">
            <Layers className="w-3 h-3" />
            {batch?.batchName || "Batch"}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {course?.title || "Course"}
          </h3>

          {/* Batch Start Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Starts: {batch?.startDate ? formatDate(batch.startDate) : "TBD"}
            </span>
          </div>

          {/* Access Status */}
          {enrollment.hasAccess ? (
            <>
              {/* Progress Bar - Only show if has access */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="text-gray-900 font-bold">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${isBatchExpired ? "bg-gray-400" : "bg-blue-600"}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div
                  className={`rounded-lg p-2 text-center border ${isBatchExpired ? "bg-gray-50 border-gray-100" : "bg-blue-50 border-blue-100"}`}
                >
                  <p className="text-gray-600 mb-0.5">Materials</p>
                  <p
                    className={`font-bold ${isBatchExpired ? "text-gray-500" : "text-blue-700"}`}
                  >
                    {cp.completedLessons}/{cp.totalLessons}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-2 text-center border ${isBatchExpired ? "bg-gray-50 border-gray-100" : "bg-green-50 border-green-100"}`}
                >
                  <p className="text-gray-600 mb-0.5">Quizzes</p>
                  <p
                    className={`font-bold ${isBatchExpired ? "text-gray-500" : "text-green-700"}`}
                  >
                    {cp.completedQuizzes}/{cp.totalQuizzes}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Payment Status - Show if no access yet */
            <div className="mb-3 space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  paymentConfig.bg
                } ${paymentConfig.text} border ${paymentConfig.text.replace(
                  "text-",
                  "border-",
                )}`}
              >
                <DollarSign className="w-3 h-3" />
                Payment:{" "}
                {enrollment.paymentStatus.charAt(0).toUpperCase() +
                  enrollment.paymentStatus.slice(1)}
              </div>
              <p className="text-xs text-gray-500">
                {enrollment.paymentStatus === "pending" &&
                  "Waiting for admin approval"}
                {enrollment.paymentStatus === "partial" &&
                  "Some installments pending"}
                {enrollment.paymentStatus === "completed" &&
                  "Access granted when batch starts"}
              </p>
            </div>
          )}

          {/* Certificate Status */}
          {enrollment.progress?.certificateIssued && (
            <div className="flex items-center gap-2 text-xs mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-medium">
                Certificate Issued
              </span>
            </div>
          )}

          {isBatchExpired && (
            <div className="mt-auto mb-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>Access expired. Contact support for extension.</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {enrollment.hasAccess && !isBatchExpired ? (
            <Link
              href={`/user-profile/my-courses-and-programs/${enrollment._id}`}
            >
              <button className="w-full bg-gray-900 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <PlayCircle className="w-4 h-4" />
                <span>Continue Learning</span>
              </button>
            </Link>
          ) : isBatchExpired ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 font-medium text-sm py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Access Expired</span>
            </button>
          ) : (
            <Link href="/my-batch-enrollments">
              <button className="w-full text-gray-700 border border-gray-300 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <span>View Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Loading Skeleton
const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="w-full h-36 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-1.5 bg-gray-200 rounded w-full" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  </div>
);

// Main Page Component
export default function MyEnrollmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch batch enrollments (NEW API)
  const {
    data: batchData,
    isLoading: batchLoading,
    error: batchError,
  } = useGetMyBatchEnrollmentsQuery({});

  const batchEnrollments = batchData?.data || [];

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    return batchEnrollments.filter((enrollment: any) => {
      const batch = enrollment.batchId;
      const course =
        typeof batch?.courseId === "object" ? batch.courseId : null;
      const courseTitle = course?.title || "";
      const batchName = batch?.batchName || "";

      const matchesSearch =
        courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batchName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter || enrollment.enrollmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [batchEnrollments, searchTerm, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const hasFilters = searchTerm || statusFilter;
  const isLoading = batchLoading;
  const hasError = batchError;

  // Calculate stats
  const stats = useMemo(() => {
    const active = batchEnrollments.filter(
      (e: any) => e.hasAccess && e.enrollmentStatus === "active",
    ).length;
    const completed = batchEnrollments.filter(
      (e: any) => e.enrollmentStatus === "completed",
    ).length;
    const pending = batchEnrollments.filter(
      (e: any) => e.enrollmentStatus === "pending_payment",
    ).length;
    const certificates = batchEnrollments.filter(
      (e: any) => e.progress?.certificateIssued,
    ).length;
    return { active, completed, pending, certificates };
  }, [batchEnrollments]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link
                href="/user-profile"
                className="hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">My Courses</span>
            </nav>

            {/* Title & Description */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  My Courses & Programs
                </h1>
                <p className="text-gray-600">
                  Manage and track all your enrolled courses
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.active}
                    </p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completed}
                    </p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pending}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.certificates}
                    </p>
                    <p className="text-xs text-gray-600">Certificates</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              />
            </div>

            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === ""
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({batchEnrollments.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setStatusFilter("pending_payment")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "pending_payment"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>
        </motion.div>

        {/* Enrollments Grid */}
        <div className="mb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : hasError ||
            !filteredEnrollments ||
            filteredEnrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 text-center py-16 px-4"
            >
              <div className="inline-block p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {hasError
                  ? "Something went wrong"
                  : searchTerm || statusFilter
                    ? "No courses found"
                    : "No enrollments yet"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {hasError
                  ? "We encountered an error. Please try again later."
                  : searchTerm || statusFilter
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Start your learning journey by enrolling in courses from our catalog."}
              </p>
              {!hasError && !searchTerm && !statusFilter && (
                <Link
                  href="/all-courses"
                  className="inline-block px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                >
                  Browse Courses
                </Link>
              )}
            </motion.div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredEnrollments.length}
                  </span>{" "}
                  {filteredEnrollments.length === 1 ? "course" : "courses"}
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.map((enrollment: any) => (
                  <BatchEnrollmentCard
                    key={enrollment._id}
                    enrollment={enrollment}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
