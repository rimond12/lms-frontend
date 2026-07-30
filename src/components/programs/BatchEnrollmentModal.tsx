"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  AlertCircle,
  Loader,
  Calendar,
  Users,
  DollarSign,
  Upload,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useGetEnrollableBatchesQuery, IBatch, IInstallmentPlan } from "@/app/redux/api/batchApi/batchApi";
import { useEnrollInBatchMutation, useSubmitPaymentMutation } from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetMeQuery } from "@/app/redux/api/users/userApi";
import { useGetPaymentSettingQuery } from "@/app/redux/api/paymentSettingApi/paymentSettingApi";

interface BatchEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onEnrollSuccess?: () => void;
}

type Step = "select-batch" | "select-plan" | "student-info" | "payment" | "success";

const BatchEnrollmentModal: React.FC<BatchEnrollmentModalProps> = ({
  isOpen,
  onClose,
  course,
  onEnrollSuccess,
}) => {
  const [step, setStep] = useState<Step>("select-batch");
  const [selectedBatch, setSelectedBatch] = useState<IBatch | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<IInstallmentPlan | null>(null);
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    email: "",
    phone: "",
    educationalInfo: "",
    address: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    bankTransactionId: "",
    paymentMethod: "bKash",
    notes: "",
  });
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // API Hooks
  const { data: batchesData, isLoading: isLoadingBatches } = useGetEnrollableBatchesQuery(
    course?._id,
    { skip: !isOpen || !course?._id }
  );
  const [enrollInBatch, { isLoading: isEnrolling }] = useEnrollInBatchMutation();
  const [submitPayment, { isLoading: isSubmittingPayment }] = useSubmitPaymentMutation();
  
  // Fetch current user profile & payment settings to auto-fill form
  const { data: userData } = useGetMeQuery(undefined, { skip: !isOpen });
  const currentUser = userData?.data;
  const { data: paymentSettingData } = useGetPaymentSettingQuery(undefined, { skip: !isOpen });
  const paymentSetting = paymentSettingData?.data;

  const batches = batchesData?.data || [];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("select-batch");
      setSelectedBatch(null);
      setSelectedPlan(null);
      setPaymentInfo({ bankTransactionId: "", paymentMethod: "bKash", notes: "" });
      setPaymentProofFile(null);
      setEnrollmentId(null);
    }
  }, [isOpen]);

  // Auto-fill student info from user profile when available
  useEffect(() => {
    if (currentUser && isOpen) {
      setStudentInfo({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        educationalInfo: currentUser.educationalInfo || currentUser.education || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBatchSelect = (batch: IBatch) => {
    setSelectedBatch(batch);
    setStep("select-plan");
  };

  const handlePlanSelect = (plan: IInstallmentPlan) => {
    setSelectedPlan(plan);
    setStep("student-info");
  };

  const handleStudentInfoSubmit = () => {
    if (!studentInfo.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!studentInfo.email.trim() || !studentInfo.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!studentInfo.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Proceed to enrollment and payment
    handleEnroll();
  };

  const handleEnroll = async () => {
    if (!selectedBatch || !selectedPlan) return;

    try {
      const result = await enrollInBatch({
        batchId: selectedBatch._id,
        selectedPlan: selectedPlan.planType,
        studentInfo: {
          name: studentInfo.name.trim(),
          email: studentInfo.email.trim(),
          phone: studentInfo.phone.trim(),
          educationalInfo: studentInfo.educationalInfo.trim() || undefined,
          address: studentInfo.address.trim() || undefined,
        },
      }).unwrap();

      if (result.success && result.data._id) {
        setEnrollmentId(result.data._id);
        toast.success("Enrolled successfully! Now submit your payment.");
        setStep("payment");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Enrollment failed. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!enrollmentId || !selectedPlan) return;

    if (!paymentInfo.bankTransactionId.trim()) {
      toast.error("Please enter your bank transaction ID");
      return;
    }
    if (!paymentProofFile) {
      toast.error("Please upload your payment proof screenshot");
      return;
    }

    setIsUploading(true);

    try {
      // First, upload the image (you'll need to implement this based on your file upload logic)
      // For now, we'll assume the file is uploaded to a path
      const formData = new FormData();
      formData.append("file", paymentProofFile);

      // Upload file (using your existing upload endpoint)
      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/batch-enrollments/upload-proof`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${document.cookie.split("accessToken=")[1]?.split(";")[0]}`,
          },
        }
      );

      let proofImageUrl = "/uploads/payment-proofs/temp.png"; // Fallback if upload not implemented

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        proofImageUrl = uploadData.data?.url || proofImageUrl;
      }

      // Submit payment
      await submitPayment({
        enrollmentId,
        data: {
          installmentNumber: 1,
          amount: selectedPlan.installments[0].amount,
          bankTransactionId: paymentInfo.bankTransactionId.trim(),
          proofImageUrl,
          paymentMethod: paymentInfo.paymentMethod,
          notes: paymentInfo.notes.trim() || undefined,
        },
      }).unwrap();

      toast.success("Payment submitted! Awaiting admin approval.");
      setStep("success");

      setTimeout(() => {
        onEnrollSuccess?.();
      }, 3000);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit payment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-800 to-red-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {step === "success" ? "Enrollment Complete!" : `Enroll in ${course?.title || "Course"}`}
                </h2>
                <p className="text-white/80 text-sm">
                  {step === "select-batch" && "Select a batch to join"}
                  {step === "select-plan" && "Choose your payment plan"}
                  {step === "student-info" && "Enter your information"}
                  {step === "payment" && "Submit your payment"}
                  {step === "success" && "Your enrollment is being processed"}
                </p>
              </div>
              {step !== "success" && (
                <button onClick={handleClose} className="p-1 hover:bg-red-800 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            {/* Progress Steps */}
            {step !== "success" && (
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  {["select-batch", "select-plan", "student-info", "payment"].map((s, i) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          step === s
                            ? "bg-red-800 text-white"
                            : ["select-batch", "select-plan", "student-info", "payment"].indexOf(step) > i
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {["select-batch", "select-plan", "student-info", "payment"].indexOf(step) > i ? (
                          <Check size={16} />
                        ) : (
                          i + 1
                        )}
                      </div>
                      {i < 3 && <div className="w-12 sm:w-24 h-0.5 bg-gray-200 mx-2" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Select Batch */}
                {step === "select-batch" && (
                  <motion.div key="select-batch" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {isLoadingBatches ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-red-800" />
                      </div>
                    ) : batches.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No batches available for enrollment at the moment.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {batches.map((batch: IBatch) => (
                          <button
                            key={batch._id}
                            onClick={() => handleBatchSelect(batch)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-red-800 hover:bg-red-50 transition-all text-left group"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-black group-hover:text-red-800">
                                  {batch.batchName}
                                </h3>
                                <p className="text-sm text-gray-500">{batch.batchNumber}</p>
                              </div>
                              <ChevronRight className="text-gray-400 group-hover:text-red-800" />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Starts {formatDate(batch.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>
                                  {batch.currentStudentCount}
                                  {batch.maxStudents && `/${batch.maxStudents}`} students
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign size={14} />
                                <span>{formatCurrency(batch.totalPrice, batch.currency)}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Select Plan */}
                {step === "select-plan" && selectedBatch && (
                  <motion.div key="select-plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button
                      onClick={() => setStep("select-batch")}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-800 mb-4"
                    >
                      <ChevronLeft size={16} />
                      Back to batches
                    </button>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <h3 className="font-semibold text-black">{selectedBatch.batchName}</h3>
                      <p className="text-sm text-gray-600">
                        Starts on {formatDate(selectedBatch.startDate)} | Total: {formatCurrency(selectedBatch.totalPrice, selectedBatch.currency)}
                      </p>
                    </div>

                    <h4 className="font-semibold text-black mb-4">Choose Your Payment Plan</h4>

                    <div className="space-y-4">
                      {selectedBatch.installmentOptions?.map((plan: IInstallmentPlan) => (
                        <button
                          key={plan.planType}
                          onClick={() => handlePlanSelect(plan)}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-red-800 hover:bg-red-50 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-black group-hover:text-red-800">
                                {plan.label}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {plan.numberOfPayments} payment{plan.numberOfPayments > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(plan.amountPerInstallment, selectedBatch.currency)}
                              </p>
                              {plan.numberOfPayments > 1 && (
                                <p className="text-xs text-gray-500">per installment</p>
                              )}
                            </div>
                          </div>
                          {plan.numberOfPayments > 1 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {plan.installments.map((inst, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                                >
                                  {inst.label}: {formatCurrency(inst.amount, selectedBatch.currency)}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Student Info */}
                {step === "student-info" && selectedBatch && selectedPlan && (
                  <motion.div key="student-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button
                      onClick={() => setStep("select-plan")}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-800 mb-4"
                    >
                      <ChevronLeft size={16} />
                      Back to plans
                    </button>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold text-black">{selectedBatch.batchName}</h3>
                          <p className="text-sm text-gray-600">{selectedPlan.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(selectedPlan.installments[0].amount, selectedBatch.currency)}
                          </p>
                          <p className="text-xs text-gray-500">First payment</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-black mb-4">Your Information</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={studentInfo.name}
                          onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Email *</label>
                        <input
                          type="email"
                          value={studentInfo.email}
                          onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={studentInfo.phone}
                          onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Educational Background</label>
                        <input
                          type="text"
                          value={studentInfo.educationalInfo}
                          onChange={(e) => setStudentInfo({ ...studentInfo, educationalInfo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="e.g., BSc in Civil Engineering"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Address</label>
                        <textarea
                          value={studentInfo.address}
                          onChange={(e) => setStudentInfo({ ...studentInfo, address: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleStudentInfoSubmit}
                      disabled={isEnrolling}
                      className="w-full mt-6 bg-red-800 text-white font-semibold py-3 rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          Continue to Payment
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Step 4: Payment */}
                {step === "payment" && selectedBatch && selectedPlan && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                        <div>
                          <p className="font-medium text-yellow-800">Make Your Payment</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Transfer <strong>{formatCurrency(selectedPlan.installments[0].amount, selectedBatch.currency)}</strong> to our account using any of the following methods:
                          </p>
                          {paymentSetting?.paymentInstructions && (
                            <p className="text-xs text-yellow-800 mt-1 italic">
                              {paymentSetting.paymentInstructions}
                            </p>
                          )}
                          <div className="mt-2 text-sm text-yellow-700 space-y-1">
                            <p><strong>bKash ({paymentSetting?.bkashType || "Personal"}):</strong> {paymentSetting?.bkashNumber || "01712-345678"}</p>
                            <p><strong>Nagad ({paymentSetting?.nagadType || "Personal"}):</strong> {paymentSetting?.nagadNumber || "01712-345678"}</p>
                            {paymentSetting?.rocketNumber && (
                              <p><strong>Rocket ({paymentSetting?.rocketType || "Personal"}):</strong> {paymentSetting.rocketNumber}</p>
                            )}
                            {paymentSetting?.bankAccountNumber && (
                              <p><strong>Bank:</strong> {paymentSetting.bankName || "Bank"} (A/C: {paymentSetting.bankAccountNumber} - {paymentSetting.bankAccountName})</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Payment Method *
                        </label>
                        <select
                          value={paymentInfo.paymentMethod}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                          <option value="bKash">bKash</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Transaction ID / Reference *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.bankTransactionId}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, bankTransactionId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="e.g., TXN12345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Payment Screenshot *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-800 transition-colors">
                          {paymentProofFile ? (
                            <div className="space-y-2">
                              <img
                                src={URL.createObjectURL(paymentProofFile)}
                                alt="Payment proof"
                                className="max-h-40 mx-auto rounded-lg"
                              />
                              <p className="text-sm text-gray-600">{paymentProofFile.name}</p>
                              <button
                                onClick={() => setPaymentProofFile(null)}
                                className="text-red-600 text-sm hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Notes (Optional)</label>
                        <textarea
                          value={paymentInfo.notes}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, notes: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          placeholder="Any additional information..."
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePaymentSubmit}
                      disabled={isSubmittingPayment || isUploading}
                      className="w-full mt-6 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmittingPayment || isUploading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          Submit Payment
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Success */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">Payment Submitted!</h3>
                    <p className="text-gray-600 mb-6">
                      Your payment is being reviewed. You will get access once your payment is approved
                      and the batch starts.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                      <div className="flex items-start gap-3">
                        <Clock className="text-blue-600 mt-0.5" size={20} />
                        <div>
                          <p className="font-medium text-blue-800">What happens next?</p>
                          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                            <li>Admin will review your payment (usually within 24 hours)</li>
                            <li>Once approved, you&apos;ll be notified via email</li>
                            <li>Course access will be granted when the batch starts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="mt-6 px-6 py-2 bg-red-800 text-white font-medium rounded-lg hover:bg-red-900 transition-colors"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BatchEnrollmentModal;
