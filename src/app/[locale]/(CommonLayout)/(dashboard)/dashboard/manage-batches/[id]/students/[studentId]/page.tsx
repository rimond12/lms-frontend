"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader,
  DollarSign,
  FileText,
  Shield,
  Key,
  Copy,
  MessageCircle,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetBatchEnrollmentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetBatchByIdQuery } from "@/app/redux/api/batchApi/batchApi";
import AppImage from "@/components/ui/AppImage";
import EditStudentModal from "./EditStudentModal";

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    partial: { bg: "bg-blue-100", text: "text-blue-800", icon: DollarSign },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: CheckCircle,
    },
    overdue: { bg: "bg-red-100", text: "text-red-800", icon: AlertCircle },
  };
  const { bg, text, icon: Icon } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${bg} ${text}`}
    >
      <Icon size={14} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Access badge component
const AccessBadge = ({ hasAccess }: { hasAccess: boolean }) => {
  return hasAccess ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
      <Shield size={14} />
      Access Granted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
      <Shield size={14} />
      No Access
    </span>
  );
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const studentId = params.studentId as string;

  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch batch details
  const { data: batchData, isLoading: batchLoading } =
    useGetBatchByIdQuery(batchId);
  const batch = batchData?.data;

  // Fetch enrollments to find the specific student
  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    refetch,
  } = useGetBatchEnrollmentsQuery({ batchId });
  const enrollments = enrollmentsData?.data || [];

  // Find the specific enrollment (studentId is actually enrollmentId)
  const enrollment = enrollments.find((e: any) => e._id === studentId);

  // API mutations
  const [approvePayment, { isLoading: isApproving }] =
    useApprovePaymentMutation();
  const [rejectPayment, { isLoading: isRejecting }] =
    useRejectPaymentMutation();

  const handleApprovePayment = async (paymentId: string) => {
    try {
      setProcessingPaymentId(paymentId);
      await approvePayment({ enrollmentId: studentId, paymentId }).unwrap();
      toast.success("Payment approved successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve payment");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPaymentId) return;

    try {
      await rejectPayment({
        enrollmentId: studentId,
        paymentId: selectedPaymentId,
        rejectionReason: rejectionReason || "Payment rejected by admin",
      }).unwrap();
      toast.success("Payment rejected");
      setShowRejectModal(false);
      setSelectedPaymentId(null);
      setRejectionReason("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject payment");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Get user password from enrollment (safely)
  const getUserPassword = (): string => {
    if (
      typeof enrollment?.userId === "object" &&
      enrollment.userId?.plainPassword
    ) {
      return enrollment.userId.plainPassword;
    }
    // Fallback: use phone number as password (since that's how we generate it)
    return enrollment?.studentInfo?.phone || "-";
  };

  // Copy password to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Password copied!");
  };

  // Send info via WhatsApp
  const sendWhatsAppMessage = () => {
    if (!enrollment) return;

    const phone = enrollment.studentInfo?.phone?.replace(/\D/g, "");
    const courseName =
      typeof enrollment.courseId === "object"
        ? enrollment.courseId.title
        : "Course";
    const password = getUserPassword();

    const message = `🎓 *IMMIGRANT JOBS WORLD Learning Portal - Account Information*

━━━━━━━━━━━━━━━━━━━━━━

👤 *Student Name:* ${enrollment.studentInfo?.name}
📧 *Email:* ${enrollment.studentInfo?.email}
🔑 *Password:* ${password}

━━━━━━━━━━━━━━━━━━━━━━

📚 *Course:* ${courseName}
📋 *Batch:* ${batch?.batchName}
🔢 *Batch Number:* ${batch?.batchNumber}
🎫 *Enrollment ID:* ${enrollment.enrollmentNumber}

━━━━━━━━━━━━━━━━━━━━━━

💰 *Payment Status:* ${enrollment.paymentStatus?.toUpperCase()}
✅ *Paid:* BDT ${enrollment.totalPaid?.toLocaleString()}
⏳ *Due:* BDT ${enrollment.totalDue?.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━

🔗 *Login URL:* ${window.location.origin}/login

Thank you for enrolling with IMMIGRANT JOBS WORLD! 🚀`;

    // Format phone for WhatsApp (add 88 for Bangladesh if not present)
    let whatsappPhone = phone;
    if (phone && !phone.startsWith("88") && phone.length === 11) {
      whatsappPhone = "88" + phone;
    }

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (batchLoading || enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Student Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The enrollment record you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href={`/dashboard/manage-batches/${batchId}/students`}
          className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  const student = enrollment.studentInfo || {};
  const payments = enrollment.payments || [];
  const course =
    typeof enrollment.batchId === "object" &&
    enrollment.batchId?.courseId &&
    typeof enrollment.batchId.courseId === "object"
      ? enrollment.batchId.courseId
      : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link
          href={`/dashboard/manage-batches/${batchId}/students`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Students List
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.name || "Student"}
            </h1>
            <p className="text-gray-600 mt-1">
              {batch?.batchName} • {course?.title || "Course"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
            >
              <Pencil size={16} />
              Edit Student
            </button>
            <PaymentStatusBadge status={enrollment.paymentStatus} />
            <AccessBadge hasAccess={enrollment.hasAccess} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Student Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              Student Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {student.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {student.phone || "N/A"}
                  </p>
                </div>
              </div>

              {student.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {student.address}
                    </p>
                  </div>
                </div>
              )}

              {student.educationalInfo && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    <p className="font-medium text-gray-900">
                      {student.educationalInfo}
                    </p>
                  </div>
                </div>
              )}

              {/* Password Section */}
              <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                <Key className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Account Password</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-mono text-amber-800 min-w-[100px]">
                      {showPassword ? getUserPassword() : "••••••••"}
                    </code>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(getUserPassword())}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Copy Password"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={sendWhatsAppMessage}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                <MessageCircle size={18} />
                Send Info in WhatsApp
              </button>
            </div>
          </motion.div>

          {/* Enrollment Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-600" />
              Payment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Plan</span>
                <span className="font-semibold text-gray-900">
                  {enrollment.selectedPlan}
                </span>
              </div>

              {/* Discount Info */}
              {enrollment.discountType &&
                enrollment.discountType !== "none" &&
                enrollment.discountAmount &&
                enrollment.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price</span>
                      <span className="font-semibold text-gray-400 line-through">
                        {formatCurrency(
                          enrollment.originalPrice || 0,
                          batch?.currency,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">
                        {enrollment.discountType === "percentage"
                          ? `${enrollment.discountValue}% Off`
                          : `${formatCurrency(enrollment.discountValue || 0, batch?.currency)} Off`}{" "}
                        (-
                        {formatCurrency(
                          enrollment.discountAmount,
                          batch?.currency,
                        )}
                        )
                      </span>
                    </div>
                    {enrollment.discountReason && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason</span>
                        <span className="text-sm text-gray-500 italic">
                          {enrollment.discountReason}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Effective Price</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          enrollment.effectivePrice || 0,
                          batch?.currency,
                        )}
                      </span>
                    </div>
                  </>
                )}

              {/* Show total if no discount */}
              {(!enrollment.discountType ||
                enrollment.discountType === "none" ||
                !enrollment.discountAmount) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      enrollment.totalPaid + enrollment.totalDue,
                      batch?.currency,
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(enrollment.totalPaid || 0, batch?.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Remaining</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(enrollment.totalDue, batch?.currency)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                Enrolled on {formatDate(enrollment.createdAt)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Payment History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discount / Scholarship Info Card */}
          {enrollment.discountType &&
            enrollment.discountType !== "none" &&
            enrollment.discountAmount &&
            enrollment.discountAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-5"
              >
                <h3 className="text-md font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Discount / Scholarship Applied
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-green-600 text-xs font-medium">
                      Original Price
                    </p>
                    <p className="font-bold text-gray-800 line-through">
                      {formatCurrency(
                        enrollment.originalPrice || 0,
                        batch?.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600 text-xs font-medium">
                      Discount
                    </p>
                    <p className="font-bold text-green-700">
                      {enrollment.discountType === "percentage"
                        ? `${enrollment.discountValue}% Off`
                        : `${formatCurrency(enrollment.discountValue || 0, batch?.currency)} Off`}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600 text-xs font-medium">
                      Amount Saved
                    </p>
                    <p className="font-bold text-green-700">
                      -
                      {formatCurrency(
                        enrollment.discountAmount,
                        batch?.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600 text-xs font-medium">
                      Effective Price
                    </p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(
                        enrollment.effectivePrice || 0,
                        batch?.currency,
                      )}
                    </p>
                  </div>
                </div>
                {enrollment.discountReason && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-600 font-medium">Reason</p>
                    <p className="text-sm text-green-800 italic">
                      {enrollment.discountReason}
                    </p>
                  </div>
                )}
                {enrollment.discountScope && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Scope:{" "}
                      {enrollment.discountScope === "all"
                        ? "Applied to all installments"
                        : "First installment only"}
                    </span>
                    {enrollment.planDiscountApplied && (
                      <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Auto Plan Discount
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Payment History
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {enrollment.enrollmentNumber && (
                    <span className="px-2 py-1 bg-gray-100 rounded-lg font-mono text-xs">
                      #{enrollment.enrollmentNumber}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                    {enrollment.selectedPlan === "1-plan"
                      ? "Full Payment"
                      : enrollment.selectedPlan === "2-plan"
                        ? "2 Installments"
                        : "3 Installments"}
                  </span>
                </div>
              </div>
              {/* Payment overview bar */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600 font-medium">
                    Total Paid
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(enrollment.totalPaid || 0, batch?.currency)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-600 font-medium">
                    Remaining Due
                  </p>
                  <p className="text-lg font-bold text-red-700">
                    {formatCurrency(enrollment.totalDue || 0, batch?.currency)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium">
                    Total Payable
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(
                      enrollment.effectivePrice ||
                        enrollment.totalPaid + enrollment.totalDue ||
                        0,
                      batch?.currency,
                    )}
                  </p>
                </div>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No payments recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {payments.map((payment: any, index: number) => (
                  <div key={payment._id || index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Installment {payment.installmentNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.submittedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(payment.amount, batch?.currency)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            payment.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status === "approved" && (
                            <CheckCircle size={12} />
                          )}
                          {payment.status === "rejected" && (
                            <XCircle size={12} />
                          )}
                          {payment.status === "pending" && <Clock size={12} />}
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Transaction ID</p>
                        <p className="font-mono text-gray-900">
                          {payment.bankTransactionId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Method</p>
                        <p className="text-gray-900">
                          {payment.paymentMethod || "N/A"}
                        </p>
                      </div>
                      {payment.paymentDate && (
                        <div>
                          <p className="text-gray-500">Payment Date</p>
                          <p className="text-gray-900">
                            {formatDate(payment.paymentDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Due Date & Overdue */}
                    {payment.dueDate && (
                      <div className="mb-4 flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          Due: {formatDate(payment.dueDate)}
                        </span>
                        {payment.isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle size={10} />
                            Overdue
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reviewed Info */}
                    {payment.status !== "pending" && payment.reviewedAt && (
                      <div className="mb-4 text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle size={10} />
                        Reviewed on {formatDate(payment.reviewedAt)}
                      </div>
                    )}

                    {/* Admin Notes */}
                    {payment.adminNotes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">
                          Admin Notes
                        </p>
                        <p className="text-blue-800 text-sm">
                          {payment.adminNotes}
                        </p>
                      </div>
                    )}

                    {payment.proofImageUrl && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Payment Proof
                        </p>
                        <AppImage
                          photoUrl={payment.proofImageUrl}
                          width={600}
                          height={600}
                          alt="Payment proof"
                          className="max-h-80 w-96 rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                        />
                      </div>
                    )}

                    {payment.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{payment.notes}</p>
                      </div>
                    )}

                    {payment.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">
                          Rejection Reason
                        </p>
                        <p className="text-red-700">
                          {payment.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons for Pending Payments */}
                    {payment.status === "pending" && (
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <button
                          onClick={() => handleApprovePayment(payment._id)}
                          disabled={
                            processingPaymentId === payment._id || isApproving
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processingPaymentId === payment._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPaymentId(payment._id);
                            setShowRejectModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Payment
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this payment:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPaymentId(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPayment}
                disabled={isRejecting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRejecting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Reject Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        enrollment={enrollment}
        onSuccess={() => {
          refetch();
          setShowEditModal(false);
        }}
        batchPrice={batch?.totalPrice || 0}
        batch={batch || null}
      />
    </div>
  );
}
