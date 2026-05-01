"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  AlertCircle,
  Loader,
  Clock,
  Award,
  CheckCircle,
  Check,
  X,
  Mail,
  Phone,
  Eye,
  DollarSign,
  Layers,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetBatchEnrollmentsQuery,
  useGetAllBatchEnrollmentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  IBatchEnrollment,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetAllBatchesQuery } from "@/app/redux/api/batchApi/batchApi";

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-300",
    },
    partial: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-300",
    },
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-300",
    },
    overdue: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-300",
    },
  };
  const { bg, text, border } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
    >
      <DollarSign size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Enrollment status badge
const EnrollmentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<
    string,
    { bg: string; text: string; border: string; icon: any }
  > = {
    pending_payment: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-300",
      icon: Clock,
    },
    payment_approved: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-300",
      icon: CheckCircle,
    },
    active: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-300",
      icon: CheckCircle,
    },
    completed: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-300",
      icon: Award,
    },
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-300",
      icon: X,
    },
    shifted: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-300",
      icon: AlertCircle,
    },
  };
  const {
    bg,
    text,
    border,
    icon: Icon,
  } = config[status] || config.pending_payment;
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
};

export default function EnrollmentManagePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] =
    useState<string>("all");
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null,
  );

  // Fetch all batches first
  const { data: batchesData, isLoading: batchesLoading } =
    useGetAllBatchesQuery({
      page: 1,
      limit: 100,
    });
  const batches = batchesData?.data || [];

  // Fetch enrollments (either filtered by batch or all)
  const queryFilters = {
    paymentStatus:
      paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
    enrollmentStatus:
      enrollmentStatusFilter !== "all" ? enrollmentStatusFilter : undefined,
    searchTerm: searchTerm || undefined,
    page: 1,
    limit: 100,
  };

  const {
    data: batchEnrollmentsData,
    isLoading: batchEnrollmentsLoading,
    refetch: refetchBatch,
  } = useGetBatchEnrollmentsQuery(
    {
      batchId: batchFilter,
      ...queryFilters,
    },
    { skip: !batchFilter },
  );

  const {
    data: allEnrollmentsData,
    isLoading: allEnrollmentsLoading,
    refetch: refetchAll,
  } = useGetAllBatchEnrollmentsQuery(queryFilters, { skip: !!batchFilter });

  const enrollmentsData = batchFilter
    ? batchEnrollmentsData
    : allEnrollmentsData;
  const enrollmentsLoading = batchFilter
    ? batchEnrollmentsLoading
    : allEnrollmentsLoading;

  const refetch = () => {
    if (batchFilter) refetchBatch();
    else refetchAll();
  };

  // Mutations
  const [approvePayment] = useApprovePaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();

  const enrollments: IBatchEnrollment[] = enrollmentsData?.data || [];

  // Filter enrollments by search term (client-side backup)
  const filteredEnrollments = useMemo(() => {
    if (!searchTerm) return enrollments;

    return enrollments.filter((enrollment) => {
      const studentName = enrollment.studentInfo?.name?.toLowerCase() || "";
      const studentEmail = enrollment.studentInfo?.email?.toLowerCase() || "";
      const studentPhone = enrollment.studentInfo?.phone || "";
      const search = searchTerm.toLowerCase();

      return (
        studentName.includes(search) ||
        studentEmail.includes(search) ||
        studentPhone.includes(search)
      );
    });
  }, [enrollments, searchTerm]);

  // Stats
  const stats = useMemo(
    () => ({
      total: filteredEnrollments.length,
      pendingPayment: filteredEnrollments.filter(
        (e) => e.paymentStatus === "pending",
      ).length,
      partial: filteredEnrollments.filter((e) => e.paymentStatus === "partial")
        .length,
      completed: filteredEnrollments.filter(
        (e) => e.paymentStatus === "completed",
      ).length,
      active: filteredEnrollments.filter((e) => e.hasAccess).length,
    }),
    [filteredEnrollments],
  );

  // Handle approve pending payment
  const handleApprovePayment = async (
    enrollmentId: string,
    paymentId: string,
  ) => {
    try {
      setProcessingPaymentId(paymentId);
      await approvePayment({ enrollmentId, paymentId }).unwrap();
      toast.success("Payment approved successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve payment");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Handle reject pending payment
  const handleRejectPayment = async (
    enrollmentId: string,
    paymentId: string,
  ) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return;

    try {
      setProcessingPaymentId(paymentId);
      await rejectPayment({
        enrollmentId,
        paymentId,
        rejectionReason: reason || "Rejected by admin",
      }).unwrap();
      toast.success("Payment rejected");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject payment");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const isLoading = batchesLoading || enrollmentsLoading;

  if (isLoading && batches.length === 0) {
    return (
      <div className="p-4 lg:p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-slate-700 mx-auto mb-4" />
              <p className="text-gray-600">Loading enrollments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Users className="text-slate-700" size={28} />
            All Enrollments
          </h1>
          <p className="text-gray-600">
            View and manage all batch enrollments with payment approvals
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            {
              label: "Total Students",
              value: stats.total,
              icon: Users,
              color: "text-slate-600",
              bg: "bg-slate-50",
            },
            {
              label: "Pending Payment",
              value: stats.pendingPayment,
              icon: Clock,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Partial Paid",
              value: stats.partial,
              icon: DollarSign,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Fully Paid",
              value: stats.completed,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Active Access",
              value: stats.active,
              icon: Award,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${stat.bg} rounded-lg border border-gray-200 p-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={stat.color} />
                  <p className="text-xs font-medium text-gray-600">
                    {stat.label}
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* Batch Filter */}
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-gray-500" />
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">All Batches</option>
                {batches.map((batch: any) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-500" />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Enrollment Status */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={enrollmentStatusFilter}
                onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Status</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="payment_approved">Payment Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Enrollments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
        >
          {batches.length === 0 ? (
            <div className="p-12 text-center">
              <Layers size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">No Batches Found</p>
              <p className="text-sm text-gray-500 mt-1">
                Create a batch first to see enrollments
              </p>
              <Link
                href="/dashboard/manage-batches/create"
                className="inline-block mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
              >
                Create Batch
              </Link>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">No enrollments found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ||
                paymentStatusFilter !== "all" ||
                enrollmentStatusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No students have enrolled in this batch yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Batch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Enrolled
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredEnrollments.map((enrollment, index) => {
                      const batch =
                        typeof enrollment.batchId === "object"
                          ? enrollment.batchId
                          : null;
                      const course =
                        typeof enrollment.courseId === "object"
                          ? enrollment.courseId
                          : null;
                      const hasPendingPayment = enrollment.payments?.some(
                        (p: any) => p.status === "pending",
                      );
                      const pendingPayment = enrollment.payments?.find(
                        (p: any) => p.status === "pending",
                      );

                      return (
                        <motion.tr
                          key={enrollment._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Student Name */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {enrollment.studentInfo?.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {enrollment.enrollmentNumber}
                              </p>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Mail size={11} />
                                {enrollment.studentInfo?.email || "N/A"}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Phone size={11} />
                                {enrollment.studentInfo?.phone || "N/A"}
                              </div>
                            </div>
                          </td>

                          {/* Batch */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {batch?.batchName || "N/A"}
                              </p>
                              {/* Course Name with improved styling */}
                              {course?.title ? (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                                    {course.title.substring(0, 20)}
                                    {course.title.length > 20 ? "..." : ""}
                                  </span>
                                </div>
                              ) : (
                                // Debug: If course is missing, show what we have (only in dev)
                                <div className="hidden">
                                  No Course Data ({typeof enrollment.courseId})
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <PaymentStatusBadge
                                status={enrollment.paymentStatus}
                              />
                              <p className="text-xs text-gray-600">
                                {formatCurrency(enrollment.totalPaid)} /{" "}
                                {formatCurrency(enrollment.totalDue)}
                              </p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <EnrollmentStatusBadge
                              status={enrollment.enrollmentStatus}
                            />
                          </td>

                          {/* Enrolled Date */}
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(enrollment.enrolledAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {/* View Details */}
                              <Link
                                href={`/dashboard/manage-batches/${batch?._id || ""}/students/${enrollment._id}`}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>

                              {/* Approve Payment (if pending) */}
                              {hasPendingPayment && pendingPayment && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApprovePayment(
                                        enrollment._id,
                                        pendingPayment._id,
                                      )
                                    }
                                    disabled={
                                      processingPaymentId === pendingPayment._id
                                    }
                                    className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                    title="Approve Payment"
                                  >
                                    {processingPaymentId ===
                                    pendingPayment._id ? (
                                      <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check size={16} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectPayment(
                                        enrollment._id,
                                        pendingPayment._id,
                                      )
                                    }
                                    disabled={
                                      processingPaymentId === pendingPayment._id
                                    }
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                    title="Reject Payment"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Results Summary */}
        {filteredEnrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-gray-600 text-center"
          >
            Showing {filteredEnrollments.length} enrollment
            {filteredEnrollments.length !== 1 ? "s" : ""}
          </motion.div>
        )}
      </div>
    </div>
  );
}
