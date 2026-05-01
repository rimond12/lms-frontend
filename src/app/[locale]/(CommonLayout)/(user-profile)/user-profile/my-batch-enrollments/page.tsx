"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Upload,
  ChevronRight,
  CreditCard,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetMyBatchEnrollmentsQuery,
  useSubmitPaymentMutation,
  IBatchEnrollment,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { IBatch } from "@/app/redux/api/batchApi/batchApi";
import InstallmentPaymentForm from "@/components/enrollments/InstallmentPaymentForm";

// Status badge components
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Payment Pending",
    },
    partial: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Partially Paid",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Fully Paid",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Payment Rejected",
    },
  };

  const { bg, text, label } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
};

const AccessBadge = ({
  hasAccess,
  batch,
  paymentStatus,
  enrollmentStatus,
}: {
  hasAccess: boolean;
  batch: IBatch | null;
  paymentStatus: string;
  enrollmentStatus: string;
}) => {
  if (hasAccess) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        <CheckCircle size={14} />
        Access Granted
      </span>
    );
  }

  // Check if payment is pending review
  const hasPendingPayments = paymentStatus === "pending";

  // Check if payment is completed but waiting for batch to start
  const paymentCompleted = paymentStatus === "completed";
  const batchStarted = batch && new Date(batch.startDate) <= new Date();

  if (hasPendingPayments) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
        <Clock size={14} />
        Awaiting Payment Approval
      </span>
    );
  }

  if (paymentCompleted && !batchStarted) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        <Calendar size={14} />
        Access on{" "}
        {batch ? new Date(batch.startDate).toLocaleDateString() : "Batch Start"}
      </span>
    );
  }

  if (enrollmentStatus === "payment_approved") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        <CheckCircle size={14} />
        Payment Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
      <AlertCircle size={14} />
      {enrollmentStatus
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
};

export default function MyBatchEnrollmentsPage() {
  const { data, isLoading, error, refetch } = useGetMyBatchEnrollmentsQuery();
  const [submitPayment, { isLoading: isSubmitting }] =
    useSubmitPaymentMutation();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<IBatchEnrollment | null>(null);
  const [paymentData, setPaymentData] = useState({
    installmentNumber: 2,
    bankTransactionId: "",
    paymentMethod: "bKash",
    notes: "",
  });
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const enrollments = data?.data || [];

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getNextInstallment = (enrollment: IBatchEnrollment) => {
    const paidInstallments = enrollment.payments
      .filter((p) => p.status === "approved")
      .map((p) => p.installmentNumber);

    const planNumber = parseInt(enrollment.selectedPlan.replace("-plan", ""));

    for (let i = 1; i <= planNumber; i++) {
      if (!paidInstallments.includes(i)) {
        return i;
      }
    }
    return null;
  };

  const hasPendingPayment = (enrollment: IBatchEnrollment) => {
    return enrollment.payments.some((p) => p.status === "pending");
  };

  const handlePaymentSubmit = async () => {
    if (!selectedEnrollment) return;

    if (!paymentData.bankTransactionId.trim()) {
      toast.error("Please enter your transaction ID");
      return;
    }
    if (!paymentProofFile) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    const batch =
      typeof selectedEnrollment.batchId === "object"
        ? selectedEnrollment.batchId
        : null;
    const planNumber = parseInt(
      selectedEnrollment.selectedPlan.replace("-plan", ""),
    );
    const totalPrice = batch?.totalPrice || selectedEnrollment.totalDue;
    const installmentAmount = Math.ceil(totalPrice / planNumber);

    try {
      // For now, use a placeholder URL - in production, upload the file first
      const proofImageUrl = "/uploads/payment-proofs/temp.png";

      await submitPayment({
        enrollmentId: selectedEnrollment._id,
        data: {
          installmentNumber: paymentData.installmentNumber,
          amount: installmentAmount,
          bankTransactionId: paymentData.bankTransactionId.trim(),
          proofImageUrl,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes.trim() || undefined,
        },
      }).unwrap();

      toast.success("Payment submitted! Awaiting approval.");
      setShowPaymentModal(false);
      setSelectedEnrollment(null);
      setPaymentData({
        installmentNumber: 2,
        bankTransactionId: "",
        paymentMethod: "bKash",
        notes: "",
      });
      setPaymentProofFile(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit payment");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-2" size={40} />
            <p className="text-red-700">
              Error loading enrollments. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">
            My Batch Enrollments
          </h1>
          <p className="text-gray-600">
            View your enrolled batches and payment status
          </p>
        </div>

        {/* Enrollments */}
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">
              No Enrollments Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any batches yet. Browse our courses and
              enroll today!
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 bg-slate-800 text-white font-medium px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Browse Courses
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment: IBatchEnrollment) => {
              const batch =
                typeof enrollment.batchId === "object"
                  ? (enrollment.batchId as IBatch)
                  : null;
              const course =
                typeof enrollment.courseId === "object"
                  ? enrollment.courseId
                  : null;
              const nextInstallment = getNextInstallment(enrollment);
              const hasPending = hasPendingPayment(enrollment);

              return (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
                >
                  {/* Course Info Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {course?.title || "Course"}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {batch?.batchName || "Batch"}
                        </p>
                      </div>
                      <AccessBadge
                        hasAccess={enrollment.hasAccess}
                        batch={batch}
                        paymentStatus={enrollment.paymentStatus}
                        enrollmentStatus={enrollment.enrollmentStatus}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Access revocation alert */}
                    {(enrollment as any).accessRevokedDueToOverdue && (
                      <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle
                          size={16}
                          className="text-red-600 shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Course access has been suspended due to an overdue
                            installment.
                          </p>
                          <p className="text-xs text-red-600 mt-0.5">
                            Please submit your overdue payment to restore
                            access.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── Pricing Breakdown ── */}
                    <div className="mb-5 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <DollarSign size={12} /> Pricing Breakdown
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase">
                            Original
                          </p>
                          <p className="text-sm font-bold text-gray-800">
                            ৳{" "}
                            {(
                              (enrollment as any).originalPrice ||
                              batch?.totalPrice ||
                              0
                            )?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                          <p className="text-[10px] text-green-500 uppercase">
                            Discount
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {(enrollment as any).discountAmount > 0
                              ? `- ৳ ${(enrollment as any).discountAmount?.toLocaleString()}`
                              : "—"}
                          </p>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-[10px] text-blue-500 uppercase">
                            Your Price
                          </p>
                          <p className="text-sm font-bold text-blue-700">
                            ৳{" "}
                            {(
                              (enrollment as any).effectivePrice ||
                              batch?.totalPrice ||
                              0
                            )?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-[10px] text-green-500 uppercase">
                            Paid
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            ৳ {enrollment.totalPaid?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="p-2.5 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-[10px] text-red-500 uppercase">
                            Due
                          </p>
                          <p className="text-sm font-bold text-red-600">
                            ৳ {enrollment.totalDue?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      {(enrollment as any).discountReason && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-green-600">
                          <Tag size={10} />
                          <span>
                            Discount: {(enrollment as any).discountReason}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Quick Info Row ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Batch Start</p>
                          <p className="font-medium text-black">
                            {batch ? formatDate(batch.startDate) : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CreditCard className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Plan</p>
                          <p className="font-medium text-black">
                            {enrollment.selectedPlan === "1-plan"
                              ? "Full Payment"
                              : enrollment.selectedPlan === "2-plan"
                                ? "2 Installments"
                                : "3 Installments"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Clock className="text-amber-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Enrolled On</p>
                          <p className="font-medium text-black">
                            {formatDate((enrollment as any).createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Payment Status & Actions ── */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <PaymentStatusBadge status={enrollment.paymentStatus} />

                        <div className="flex items-center gap-2">
                          {enrollment.hasAccess && (
                            <Link
                              href={`/user-profile/my-courses-and-programs`}
                              className="flex items-center gap-2 bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <PlayCircle size={16} />
                              Access Course
                            </Link>
                          )}

                          {!hasPending &&
                            nextInstallment &&
                            enrollment.paymentStatus !== "completed" && (
                              <button
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setPaymentData({
                                    ...paymentData,
                                    installmentNumber: nextInstallment,
                                  });
                                  setShowPaymentModal(true);
                                }}
                                className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <Upload size={16} />
                                Pay Installment {nextInstallment}
                              </button>
                            )}
                        </div>
                      </div>

                      {hasPending && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                          <Clock className="text-yellow-600" size={18} />
                          <span className="text-sm text-yellow-700">
                            Your payment is being reviewed. You&apos;ll be
                            notified once approved.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Installment Schedule ── */}
                    {(() => {
                      const planNumber = parseInt(
                        enrollment.selectedPlan.replace("-plan", ""),
                      );
                      const effectivePrice =
                        (enrollment as any).effectivePrice ||
                        batch?.totalPrice ||
                        enrollment.totalDue ||
                        0;
                      const perInstallment = Math.ceil(
                        effectivePrice / planNumber,
                      );

                      return planNumber > 1 ? (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-1.5">
                            <CreditCard size={14} className="text-purple-500" />
                            Installment Schedule
                          </h4>
                          <div className="space-y-2">
                            {Array.from({ length: planNumber }, (_, idx) => {
                              const num = idx + 1;
                              const existingPayment = enrollment.payments.find(
                                (p) => p.installmentNumber === num,
                              );
                              const p = existingPayment as any;
                              const isPaid = p?.status === "approved";
                              const isPending = p?.status === "pending";
                              const isRejected = p?.status === "rejected";
                              const isOverdue = p?.isOverdue;

                              return (
                                <div
                                  key={num}
                                  className={`flex items-center justify-between rounded-lg px-4 py-3 border ${
                                    isPaid
                                      ? "bg-green-50 border-green-200"
                                      : isOverdue
                                        ? "bg-red-50 border-red-200"
                                        : isPending
                                          ? "bg-yellow-50 border-yellow-200"
                                          : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isPaid
                                          ? "bg-green-600 text-white"
                                          : isPending
                                            ? "bg-yellow-500 text-white"
                                            : isOverdue
                                              ? "bg-red-500 text-white"
                                              : "bg-gray-300 text-gray-600"
                                      }`}
                                    >
                                      {isPaid ? "✓" : num}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">
                                        Installment #{num}
                                        <span className="text-gray-500 font-normal ml-1.5">
                                          — ৳{" "}
                                          {(
                                            existingPayment?.amount ||
                                            perInstallment
                                          )?.toLocaleString()}
                                        </span>
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        {p?.dueDate && (
                                          <span className="text-xs text-gray-400">
                                            Due:{" "}
                                            {new Date(
                                              p.dueDate,
                                            ).toLocaleDateString()}
                                          </span>
                                        )}
                                        {p?.paymentMethod && (
                                          <span className="text-xs text-gray-400">
                                            • Via {p.paymentMethod}
                                          </span>
                                        )}
                                        {p?.bankTransactionId && (
                                          <span className="text-xs text-gray-400">
                                            • Trx: {p.bankTransactionId}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {isPaid && (
                                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                        Paid
                                      </span>
                                    )}
                                    {isPending && (
                                      <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                        Pending
                                      </span>
                                    )}
                                    {isRejected && (
                                      <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                        Rejected
                                      </span>
                                    )}
                                    {!existingPayment && (
                                      <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                        Unpaid
                                      </span>
                                    )}
                                    {isOverdue && (
                                      <span className="flex items-center gap-0.5 text-xs font-bold text-red-600">
                                        <AlertTriangle size={10} /> Overdue
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* ── Payment History ── */}
                    {enrollment.payments.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-500" />
                          Payment Records
                        </h4>
                        <div className="space-y-2">
                          {enrollment.payments.map((payment, idx) => {
                            const p = payment as any;
                            const isOverdue = p.isOverdue;
                            return (
                              <div
                                key={idx}
                                className={`rounded-lg px-4 py-3 ${
                                  isOverdue
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-gray-50 border border-gray-100"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-800">
                                      ৳ {payment.amount?.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Installment #{payment.installmentNumber}
                                    </span>
                                    {isOverdue && (
                                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                        <AlertTriangle size={10} /> OVERDUE
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        payment.status === "approved"
                                          ? "bg-green-100 text-green-700"
                                          : payment.status === "rejected"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {payment.status === "approved"
                                        ? "✓ Approved"
                                        : payment.status === "rejected"
                                          ? "✗ Rejected"
                                          : "⏳ Pending"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                                  {p.paymentMethod && (
                                    <span>
                                      Via:{" "}
                                      <strong className="text-gray-500">
                                        {p.paymentMethod}
                                      </strong>
                                    </span>
                                  )}
                                  {p.bankTransactionId && (
                                    <span>
                                      Trx:{" "}
                                      <strong className="text-gray-500">
                                        {p.bankTransactionId}
                                      </strong>
                                    </span>
                                  )}
                                  {p.dueDate && (
                                    <span>
                                      Due:{" "}
                                      {new Date(p.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span>
                                    Submitted:{" "}
                                    {new Date(
                                      payment.submittedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  {p.paymentDate && (
                                    <span>
                                      Paid:{" "}
                                      {new Date(
                                        p.paymentDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                {p.rejectionReason && (
                                  <p className="text-xs text-red-500 mt-1 italic">
                                    Rejection reason: {p.rejectionReason}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Installment Payment Modal — uses InstallmentPaymentForm */}
        {showPaymentModal &&
          selectedEnrollment &&
          (() => {
            const batch =
              typeof selectedEnrollment.batchId === "object"
                ? (selectedEnrollment.batchId as IBatch)
                : null;
            const planNumber = parseInt(
              selectedEnrollment.selectedPlan.replace("-plan", ""),
            );
            const effectivePrice =
              (selectedEnrollment as any).effectivePrice ||
              batch?.totalPrice ||
              selectedEnrollment.totalDue;
            const installmentAmount = Math.ceil(effectivePrice / planNumber);
            // Find the due date for the target installment
            const targetPayment = selectedEnrollment.payments.find(
              (p) => p.installmentNumber === paymentData.installmentNumber,
            );
            const dueDate = (targetPayment as any)?.dueDate;

            return (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">
                      Installment #{paymentData.installmentNumber} Payment
                    </h3>
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedEnrollment(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                  <InstallmentPaymentForm
                    enrollmentId={selectedEnrollment._id}
                    installmentNumber={paymentData.installmentNumber}
                    installmentAmount={installmentAmount}
                    dueDate={dueDate}
                    inline
                    onSuccess={() => {
                      setShowPaymentModal(false);
                      setSelectedEnrollment(null);
                      refetch();
                    }}
                  />
                </motion.div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
