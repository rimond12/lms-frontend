"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Users,
  CreditCard,
  Upload,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Wallet,
  FileText,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useGetCourseBySlugQuery } from "@/app/redux/api/CourseApi/CourseApi";
import {
  useGetEnrollableBatchesQuery,
  IBatch,
  IInstallmentPlan,
} from "@/app/redux/api/batchApi/batchApi";
import {
  useEnrollInBatchMutation,
  useSubmitPaymentMutation,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetMeQuery } from "@/app/redux/api/users/userApi";
import { useGetPaymentSettingQuery } from "@/app/redux/api/paymentSettingApi/paymentSettingApi";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { isAuthenticated } from "@/utils/auth";
import Link from "next/link";

type Step = "info" | "payment" | "success";

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { user, isLoading: isUserLoading } = useUser();

  // State
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [selectedPlan, setSelectedPlan] = useState<IInstallmentPlan | null>(
    null,
  );
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
  const { data: courseData, isLoading: isLoadingCourse } =
    useGetCourseBySlugQuery(slug);
  const course = courseData;

  const { data: batchesData, isLoading: isLoadingBatches } =
    useGetEnrollableBatchesQuery(course?._id || "", { skip: !course?._id });

  const [enrollInBatch, { isLoading: isEnrolling }] =
    useEnrollInBatchMutation();
  const [submitPayment, { isLoading: isSubmittingPayment }] =
    useSubmitPaymentMutation();

  // Fetch current user profile & payment settings
  const { data: userData } = useGetMeQuery(undefined);
  const currentUser = userData?.data;
  const { data: paymentSettingData } = useGetPaymentSettingQuery();
  const paymentSetting = paymentSettingData?.data;

  // Filter batches with open enrollment and get the latest one
  // Filter batches with open enrollment
  const now = new Date();
  const validBatches = (batchesData?.data || [])
    .filter((batch: IBatch) => {
      if (batch.enrollmentDeadline) {
        return new Date(batch.enrollmentDeadline) > now;
      }
      return batch.status === "upcoming" || batch.status === "running";
    })
    .sort(
      (a: IBatch, b: IBatch) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    ); // Default descending (Newest first)

  // Prioritize Upcoming (Soonest) > Running (Newest)
  const upcomingBatches = validBatches
    .filter((b: IBatch) => b.status === "upcoming")
    .sort(
      (a: IBatch, b: IBatch) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    ); // Asc (Soonest first)

  const runningBatches = validBatches.filter(
    (b: IBatch) => b.status === "running",
  ); // Already desc (Newest first)

  // Auto-select the priority batch
  const selectedBatch =
    upcomingBatches[0] || runningBatches[0] || validBatches[0] || null;

  // Check authentication on mount
  useEffect(() => {
    if (!isUserLoading && !isLoadingCourse && !isAuthenticated(user)) {
      toast.error("Please login to enroll in this course");
      router.push(
        `/login?redirect=${encodeURIComponent(`/all-courses/${slug}/enroll`)}`,
      );
    }
  }, [user, isUserLoading, isLoadingCourse, router, slug]);

  // Auto-fill student info from user profile
  useEffect(() => {
    if (currentUser) {
      setStudentInfo({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        educationalInfo:
          currentUser.educationalInfo || currentUser.education || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  // Redirect if no batches available
  useEffect(() => {
    if (!isLoadingBatches && !selectedBatch && course) {
      toast.error("No batches available for enrollment");
      router.push(`/all-courses/${slug}`);
    }
  }, [isLoadingBatches, selectedBatch, course, router, slug]);

  // Auto-select plan if only one option
  useEffect(() => {
    if (selectedBatch?.installmentOptions?.length === 1 && !selectedPlan) {
      setSelectedPlan(selectedBatch.installmentOptions[0]);
    }
  }, [selectedBatch, selectedPlan]);

  const handleContinueToPayment = () => {
    // Validate student info
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
    setCurrentStep("payment");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const handleSubmit = async () => {
    // Validate payment plan
    if (!selectedPlan) {
      toast.error("Please select a payment plan");
      return;
    }

    // Validate payment info
    if (!paymentInfo.bankTransactionId.trim()) {
      toast.error("Please enter your transaction ID");
      return;
    }
    if (!paymentProofFile) {
      toast.error("Please upload your payment proof screenshot");
      return;
    }

    if (!selectedBatch) return;

    setIsUploading(true);

    try {
      // Step 1: Enroll in batch
      const enrollResult = await enrollInBatch({
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

      if (!enrollResult.success || !enrollResult.data._id) {
        throw new Error("Enrollment failed");
      }

      const newEnrollmentId = enrollResult.data._id;
      setEnrollmentId(newEnrollmentId);

      // Step 2: Upload payment proof
      const formData = new FormData();
      formData.append("file", paymentProofFile);

      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/batch-enrollments/upload-proof`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${
              document.cookie.split("accessToken=")[1]?.split(";")[0]
            }`,
          },
        },
      );

      let proofImageUrl = "/uploads/payment-proofs/temp.png";
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        proofImageUrl = uploadData.data?.url || proofImageUrl;
      }

      // Step 3: Submit payment
      await submitPayment({
        enrollmentId: newEnrollmentId,
        data: {
          installmentNumber: 1,
          amount: selectedPlan.installments[0].amount,
          bankTransactionId: paymentInfo.bankTransactionId.trim(),
          proofImageUrl,
          paymentMethod: paymentInfo.paymentMethod,
          notes: paymentInfo.notes.trim() || undefined,
        },
      }).unwrap();

      toast.success("Enrollment completed successfully!");
      setCurrentStep("success");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to complete enrollment. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  // Loading state
  if (isLoadingCourse || isLoadingBatches || isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Course or batch not found
  if (!course || !selectedBatch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Not Available
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            This course is not available for enrollment right now.
          </p>
          <Link
            href="/all-courses"
            className="inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button & Progress Steps */}
      {currentStep !== "success" && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Link
                href={currentStep === "payment" ? "#" : `/all-courses/${slug}`}
                onClick={(e) => {
                  if (currentStep === "payment") {
                    e.preventDefault();
                    setCurrentStep("info");
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>

              {/* Progress Steps */}
              <div className="flex items-center gap-3 flex-1 justify-center">
                <button
                  onClick={() =>
                    currentStep === "payment" && setCurrentStep("info")
                  }
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep === "payment"
                        ? "bg-green-500 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {currentStep === "payment" ? <Check size={12} /> : "1"}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      currentStep === "info" ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    Information
                  </span>
                </button>

                <div
                  className={`w-8 h-0.5 ${
                    currentStep === "payment" ? "bg-green-500" : "bg-gray-200"
                  }`}
                />

                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep === "payment"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      currentStep === "payment"
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    Payment
                  </span>
                </div>
              </div>

              {/* Spacer for alignment */}
              <div className="w-9 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Information */}
          {currentStep === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Batch Info - Disabled/Read-only */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Batch Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Batch Name
                    </label>
                    <input
                      type="text"
                      value={selectedBatch.batchName}
                      disabled
                      className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={formatDate(selectedBatch.startDate)}
                        disabled
                        className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Course Fee
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(selectedBatch.totalPrice)}
                        disabled
                        className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Your Information
                </h2>
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentInfo.name}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={studentInfo.phone}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={studentInfo.email}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Education
                      </label>
                      <input
                        type="text"
                        value={studentInfo.educationalInfo}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            educationalInfo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                        placeholder="e.g., BSc Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Address
                      </label>
                      <input
                        type="text"
                        value={studentInfo.address}
                        onChange={(e) =>
                          setStudentInfo({
                            ...studentInfo,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                        placeholder="Your address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinueToPayment}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === "payment" && selectedBatch && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Choose Payment Plan */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  Choose Payment Plan
                </h2>
                <div className="grid gap-3">
                  {selectedBatch.installmentOptions?.map(
                    (plan: IInstallmentPlan) => (
                      <button
                        key={plan.planType}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedPlan?.planType === plan.planType
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {plan.label}
                              </span>
                              {selectedPlan?.planType === plan.planType && (
                                <CheckCircle className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {plan.numberOfPayments} payment
                              {plan.numberOfPayments > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(plan.amountPerInstallment)}
                            </div>
                            {plan.numberOfPayments > 1 && (
                              <p className="text-xs text-gray-500">
                                per installment
                              </p>
                            )}
                          </div>
                        </div>
                        {plan.numberOfPayments > 1 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {plan.installments.map((inst, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                              >
                                {inst.label}: {formatCurrency(inst.amount)}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Payment Details
                </h2>

                {/* Amount to Pay */}
                {selectedPlan && (
                  <div className="bg-gradient-to-r from-purple-50 to-red-50 rounded-lg p-4 mb-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Amount to Pay Now
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedPlan.installments[0].amount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Instructions - Enhanced */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        পেমেন্ট পাঠান / Payment Instructions
                      </p>
                      {paymentSetting?.paymentInstructions && (
                        <p className="text-xs text-gray-600 mb-3">
                          {paymentSetting.paymentInstructions}
                        </p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                b
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">
                              bKash
                            </span>
                          </div>
                          <p className="text-base font-bold text-gray-900">
                            {paymentSetting?.bkashNumber || "01712-345678"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {paymentSetting?.bkashType || "Personal"}
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                N
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">
                              Nagad
                            </span>
                          </div>
                          <p className="text-base font-bold text-gray-900">
                            {paymentSetting?.nagadNumber || "01712-345678"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {paymentSetting?.nagadType || "Personal"}
                          </p>
                        </div>
                        {paymentSetting?.rocketNumber && (
                          <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  R
                                </span>
                              </div>
                              <span className="font-medium text-gray-700">
                                Rocket
                              </span>
                            </div>
                            <p className="text-base font-bold text-gray-900">
                              {paymentSetting.rocketNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {paymentSetting.rocketType || "Personal"}
                            </p>
                          </div>
                        )}
                        {paymentSetting?.bankAccountNumber && (
                          <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-700">
                                🏦 {paymentSetting.bankName || "Bank"}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                              A/C: {paymentSetting.bankAccountNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {paymentSetting.bankAccountName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentInfo.paymentMethod}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            paymentMethod: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 bg-white"
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Transaction ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.bankTransactionId}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            bankTransactionId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                        placeholder="TXN12345678"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
                      {paymentProofFile ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={URL.createObjectURL(paymentProofFile)}
                            alt="Payment proof"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 text-left">
                            <p className="text-sm text-gray-900 truncate">
                              {paymentProofFile.name}
                            </p>
                            <button
                              onClick={() => setPaymentProofFile(null)}
                              className="text-red-600 text-xs hover:underline mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                          <p className="text-sm text-gray-600">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            PNG, JPG up to 5MB
                          </p>
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

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={paymentInfo.notes}
                      onChange={(e) =>
                        setPaymentInfo({
                          ...paymentInfo,
                          notes: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 resize-none"
                      placeholder="Any additional info..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  isEnrolling ||
                  isSubmittingPayment ||
                  isUploading ||
                  !selectedPlan
                }
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isEnrolling || isSubmittingPayment || isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Submit Enrollment
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Success */}
          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Enrollment Submitted!
              </h2>
              <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
                Your payment is being reviewed. You&apos;ll get access once
                approved and the batch starts.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-sm mx-auto mb-6">
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">What&apos;s next?</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Payment review (within 24 hours)</li>
                      <li>Email notification on approval</li>
                      <li>Access when batch starts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/all-courses/${slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Back to Course
                </Link>
                <Link
                  href="/user-profile/my-courses-and-programs"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View My Courses
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
