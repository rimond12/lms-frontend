"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  AlertCircle,
  X,
  CreditCard,
  DollarSign,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetBatchByIdQuery } from "@/app/redux/api/batchApi/batchApi";
import {
  useGetPendingPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  IPendingPayment,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import AppImage from "@/components/ui/AppImage";

export default function BatchPaymentsPage() {
  const params = useParams();
  const batchId = params.id as string;

  const [selectedPayment, setSelectedPayment] = useState<IPendingPayment | null>(
    null
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: batchData, isLoading: isLoadingBatch } =
    useGetBatchByIdQuery(batchId);
  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    refetch,
  } = useGetPendingPaymentsQuery(batchId);

  const [approvePayment, { isLoading: isApproving }] =
    useApprovePaymentMutation();
  const [rejectPayment, { isLoading: isRejecting }] =
    useRejectPaymentMutation();

  const batch = batchData?.data;
  const payments = paymentsData?.data || [];

  const handleApprove = async (payment: IPendingPayment) => {
    if (
      !window.confirm(
        `Approve payment of BDT ${payment.amount.toLocaleString()} from ${
          payment.student.name
        }?`
      )
    ) {
      return;
    }

    try {
      await approvePayment({
        enrollmentId: payment.enrollmentId,
        paymentId: payment.paymentId,
        adminNotes: adminNotes || undefined,
      }).unwrap();

      toast.success("Payment approved successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve payment");
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectPayment({
        enrollmentId: selectedPayment.enrollmentId,
        paymentId: selectedPayment.paymentId,
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes || undefined,
      }).unwrap();

      toast.success("Payment rejected");
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectionReason("");
      setAdminNotes("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject payment");
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingBatch) {
    return (
      <div className="p-2 lg:p-4 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-2 lg:p-4 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-2" size={40} />
            <p className="text-red-700 font-medium">Batch not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-4 bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/manage-batches"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-black">
              {batch.batchName} - Pending Payments
            </h1>
            <p className="text-sm text-gray-600">
              {batch.batchNumber} | Review and approve payment proofs
            </p>
          </div>
          <Link
            href={`/dashboard/manage-batches/${batchId}/students`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <User size={16} />
            View All Students
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-center gap-3">
          <Clock className="text-yellow-600" size={20} />
          <p className="font-medium text-yellow-800 text-sm">
            {payments.length} Pending Payment{payments.length !== 1 ? "s" : ""}{" "}
            Awaiting Review
          </p>
        </div>

        {/* Payments Table */}
        {isLoadingPayments ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-black p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600 text-sm">
              No pending payments to review for this batch
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-black overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Trans. ID</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-center">Proof</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment: IPendingPayment) => (
                    <tr
                      key={`${payment.enrollmentId}-${payment.paymentId}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-black">
                          {payment.student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.student.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {payment.enrollmentNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        BDT {payment.amount.toLocaleString()}
                        <div className="text-xs text-gray-500 font-normal">
                          Inst. #{payment.installmentNumber}
                        </div>
                        {payment.dueDate && (
                          <div className="text-xs text-gray-400">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {payment.isOverdue && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-0.5">
                            <AlertCircle size={10} /> OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize">
                          {payment.paymentMethod || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {payment.bankTransactionId}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(payment.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {payment.proofImageUrl ? (
                          <button
                            onClick={() =>
                              setViewProofUrl(payment.proofImageUrl)
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors text-xs"
                          >
                            <Eye size={14} /> View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(payment)}
                            disabled={isApproving}
                            title="Approve"
                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRejectModal(true);
                            }}
                            disabled={isRejecting}
                            title="Reject"
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        <AnimatePresence>
          {viewProofUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
              onClick={() => setViewProofUrl(null)}
            >
              <div
                className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewProofUrl(null)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                  {/* Using standard img tag for full customization in modal or custom Image component */}
                  <AppImage
                    photoUrl={viewProofUrl}
                    alt="Payment Proof"
                    width={1200}
                    height={800}
                    className="w-full h-full object-contain max-h-[85vh]"
                  />
                  <a
                    href={viewProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors text-sm backdrop-blur-sm"
                  >
                    <ExternalLink size={16} /> Open Original
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        {showRejectModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-black mb-4">
                Reject Payment
              </h3>

              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm">
                  <strong>Student:</strong> {selectedPayment.student.name}
                </p>
                <p className="text-sm">
                  <strong>Amount:</strong> BDT{" "}
                  {selectedPayment.amount.toLocaleString()}
                </p>
                <p className="text-sm">
                  <strong>Transaction ID:</strong>{" "}
                  {selectedPayment.bankTransactionId}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Invalid transaction ID, Amount mismatch..."
                  rows={3}
                  className="w-full px-3 py-2 border border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-1">
                  Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="w-full px-3 py-2 border border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                    setRejectionReason("");
                    setAdminNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isRejecting ? "Rejecting..." : "Reject Payment"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
