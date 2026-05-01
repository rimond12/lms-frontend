"use client";

/**
 * InstallmentPaymentForm
 *
 * Reusable form component for students to submit payment proof
 * for a specific installment of their batch enrollment.
 *
 * Usage:
 *   <InstallmentPaymentForm
 *     enrollmentId={enrollment._id}
 *     installmentNumber={2}
 *     installmentAmount={5000}
 *     dueDate={payment.dueDate}
 *     onSuccess={() => refetch()}
 *   />
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Upload,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSubmitPaymentMutation } from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useImageUpload } from "@/hooks";

interface InstallmentPaymentFormProps {
  enrollmentId: string;
  installmentNumber: number;
  installmentAmount: number;
  /** ISO date string for when this installment is due */
  dueDate?: string;
  /** Called after successful payment submission */
  onSuccess?: () => void;
  /** If true, renders inline (no card wrapper); defaults to false */
  inline?: boolean;
}

export default function InstallmentPaymentForm({
  enrollmentId,
  installmentNumber,
  installmentAmount,
  dueDate,
  onSuccess,
  inline = false,
}: InstallmentPaymentFormProps) {
  const [bankTransactionId, setBankTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [submitPayment, { isLoading: isSubmitting }] =
    useSubmitPaymentMutation();
  const { uploadImage } = useImageUpload();

  const isOverdue = dueDate
    ? new Date(dueDate) < new Date()
    : false;

  const handleProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setProofImageUrl(url);
        toast.success("Proof uploaded!");
      } else {
        toast.error("Upload failed — no URL returned");
      }
    } catch {
      toast.error("Failed to upload proof");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankTransactionId.trim()) {
      toast.error("Transaction ID is required");
      return;
    }
    if (!proofImageUrl) {
      toast.error("Please upload a payment proof screenshot");
      return;
    }

    try {
      await submitPayment({
        enrollmentId,
        data: {
          installmentNumber,
          amount: installmentAmount,
          bankTransactionId: bankTransactionId.trim(),
          proofImageUrl,
          paymentMethod,
          paymentDate,
          notes: notes.trim() || undefined,
        },
      }).unwrap();

      setSubmitted(true);
      toast.success(
        `Installment #${installmentNumber} payment submitted! Awaiting approval.`
      );
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to submit payment"
      );
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle size={20} className="text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800 text-sm">
            Payment Submitted
          </p>
          <p className="text-xs text-green-600">
            Installment #{installmentNumber} is under review.
          </p>
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header info */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-gray-500" />
          <span className="font-semibold text-sm text-gray-800">
            Installment #{installmentNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-green-600" />
          <span className="font-bold text-green-700">
            ৳ {installmentAmount.toLocaleString()}
          </span>
          {dueDate && (
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isOverdue
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <Calendar size={10} />
              Due: {new Date(dueDate).toLocaleDateString()}
              {isOverdue && " — OVERDUE"}
            </span>
          )}
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p>
            This installment is overdue. Please submit payment immediately to
            avoid losing access.
          </p>
        </div>
      )}

      {/* Payment Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Payment Method *
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Bkash">Bkash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Payment Date *
          </label>
          <input
            type="date"
            value={paymentDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Transaction ID */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Transaction ID / Reference *
        </label>
        <input
          type="text"
          value={bankTransactionId}
          onChange={(e) => setBankTransactionId(e.target.value)}
          placeholder="e.g. 8D2K9F1A"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Proof Upload */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Payment Screenshot *
        </label>
        {proofImageUrl ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={14} className="text-green-600 shrink-0" />
            <span className="text-xs text-green-700 flex-1 truncate">
              {proofImageUrl.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => setProofImageUrl("")}
              className="p-1 hover:bg-green-100 rounded"
            >
              <X size={12} className="text-green-600" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500">
              {isUploading ? "Uploading..." : "Click to upload screenshot (JPG, PNG)"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProofUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any additional info..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader size={14} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CreditCard size={14} />
            Submit Payment Proof
          </>
        )}
      </button>
    </form>
  );

  if (inline) return formContent;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {formContent}
    </div>
  );
}
