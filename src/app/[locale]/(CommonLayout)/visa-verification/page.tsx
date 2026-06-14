"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import {
  PhoneCall,
  FileText,
  UploadCloud,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useSubmitVisaVerificationMutation,
  useLazyCheckVisaStatusQuery,
} from "@/app/redux/api/visaVerificationApi/visaVerificationApi";

interface VisaFormData {
  mobileNumber: string;
  passportNumber: string;
}

// ─── Success Modal ────────────────────────────────────────────────
function SuccessModal({ onClose, locale }: { onClose: () => void; locale: string }) {
  const isBn = locale === "bn";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 sm:p-10 text-center animate-in zoom-in-95 duration-300 border border-blue-50">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5 sm:mb-6 ring-8 ring-green-50/50">
          <CheckCircle size={40} className="text-green-500 sm:w-12 sm:h-12" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-950 mb-3">
          {isBn ? "আবেদন জমা হয়েছে!" : "Application Submitted!"}
        </h2>
        <p className="text-slate-500 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
          {isBn
            ? "আপনার ভিসা যাচাইকরণের আবেদনটি সফলভাবে গৃহীত হয়েছে। আমাদের বিশেষজ্ঞ দল শীঘ্রই আপনার আবেদনটি যাচাই করবে।"
            : "Your visa verification request has been successfully submitted. Our team will verify your documents shortly."}
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            onClick={onClose}
            className="block w-full py-3.5 sm:py-4 bg-[#1a4da1] hover:bg-[#133a7a] text-white rounded-2xl font-bold text-center transition-all active:scale-[0.98] shadow-xl shadow-blue-900/20 text-sm sm:text-base"
          >
            {isBn ? "হোম পেজে যান" : "Go to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function VisaVerificationPage() {
  const locale = useLocale();
  const isBn = locale === "bn";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"submit" | "status">("submit");

  // Submit states
  const [form, setForm] = useState<VisaFormData>({
    mobileNumber: "",
    passportNumber: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Status check states
  const [statusForm, setStatusForm] = useState<VisaFormData>({
    mobileNumber: "",
    passportNumber: "",
  });
  const [statusResult, setStatusResult] = useState<any | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const [submitVisaVerification, { isLoading }] = useSubmitVisaVerificationMutation();
  const [checkVisaStatus, { isLoading: isChecking }] = useLazyCheckVisaStatusQuery();

  const handleTextChange = (key: keyof VisaFormData, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleStatusTextChange = (key: keyof VisaFormData, val: string) => {
    setStatusForm((p) => ({ ...p, [key]: val }));
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Type validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(isBn ? "শুধুমাত্র PDF, JPG এবং PNG ফাইল অনুমোদিত" : "Only PDF, JPG, and PNG files are allowed");
      return;
    }

    // Size validation (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error(isBn ? "ফাইলের আকার ৫ এমবি এর কম হতে হবে" : "File size must be under 5 MB");
      return;
    }

    setFiles((prev) => [...prev, selectedFile]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach((f) => handleFileChange(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.mobileNumber.trim()) {
      toast.error(isBn ? "মোবাইল নম্বর লিখুন" : "Mobile number is required");
      return;
    }
    if (!form.passportNumber.trim()) {
      toast.error(isBn ? "পাসপোর্ট নম্বর লিখুন" : "Passport number is required");
      return;
    }
    if (files.length === 0) {
      toast.error(isBn ? "ভিসা ডকুমেন্ট আপলোড করুন" : "Visa document file is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("mobileNumber", form.mobileNumber);
      formData.append("passportNumber", form.passportNumber);
      files.forEach((f) => {
        formData.append("visaDocument", f);
      });

      await submitVisaVerification(formData).unwrap();
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err?.data?.message || (isBn ? "আবেদন জমা দিতে সমস্যা হয়েছে" : "Submission failed"));
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusForm.mobileNumber.trim()) {
      toast.error(isBn ? "মোবাইল নম্বর লিখুন" : "Mobile number is required");
      return;
    }
    if (!statusForm.passportNumber.trim()) {
      toast.error(isBn ? "পাসপোর্ট নম্বর লিখুন" : "Passport number is required");
      return;
    }

    try {
      setHasChecked(true);
      const res = await checkVisaStatus({
        mobileNumber: statusForm.mobileNumber,
        passportNumber: statusForm.passportNumber,
      }).unwrap();
      setStatusResult(res);
    } catch (err: any) {
      setStatusResult(null);
      toast.error(err?.data?.message || (isBn ? "কোন আবেদন পাওয়া যায়নি" : "No visa record found"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Modal */}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} locale={locale} />}

      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1a4da1] transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={14} />
            {isBn ? "পেছনে যান" : "Back to Home"}
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-50 text-[#1a4da1] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              {isBn ? "ভিসা যাচাইকরণ" : "Visa Verification"}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              {isBn
                ? "নিরাপদে আপনার ভিসার তথ্য যাচাই করতে নিচের ফর্মটি ব্যবহার করুন"
                : "Submit details or check status to verify your visa safely"}
            </p>
          </div>

          {/* Tab headers */}
          <div className="flex border-b border-slate-100 mb-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab("submit");
                setStatusResult(null);
                setHasChecked(false);
              }}
              className={`flex-1 pb-4 text-center text-sm font-bold border-b-2 transition-all ${
                activeTab === "submit"
                  ? "border-[#1a4da1] text-[#1a4da1]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {isBn ? "আবেদন জমা দিন" : "Submit Verification"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`flex-1 pb-4 text-center text-sm font-bold border-b-2 transition-all ${
                activeTab === "status"
                  ? "border-[#1a4da1] text-[#1a4da1]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {isBn ? "অবস্থা যাচাই করুন" : "Check Status"}
            </button>
          </div>

          {activeTab === "submit" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 ml-1">
                  <PhoneCall size={14} className="text-[#1a4da1]" />
                  {isBn ? "মোবাইল নম্বর" : "Mobile Number"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.mobileNumber}
                  onChange={(e) => handleTextChange("mobileNumber", e.target.value)}
                  placeholder={isBn ? "মোবাইল নম্বর লিখুন" : "Enter mobile number"}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-[14px] text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4da1] transition-all duration-300 placeholder:text-slate-400"
                />
              </div>

              {/* Passport Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 ml-1">
                  <FileText size={14} className="text-[#1a4da1]" />
                  {isBn ? "পাসপোর্ট নম্বর" : "Passport Number"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => handleTextChange("passportNumber", e.target.value)}
                  placeholder={isBn ? "যেমন: A12345678" : "e.g., A12345678"}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-[14px] text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4da1] transition-all duration-300 placeholder:text-slate-400"
                />
              </div>

              {/* Visa Document Upload Area */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 ml-1">
                  <UploadCloud size={14} className="text-[#1a4da1]" />
                  {isBn ? "ভিসা নথি আপলোড করুন" : "Upload Visa Document"} <span className="text-red-500">*</span>
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
                    dragActive
                      ? "border-[#1a4da1] bg-blue-50/50"
                      : files.length > 0
                      ? "border-green-400 bg-green-50/10"
                      : "border-slate-200 hover:border-[#1a4da1] hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach((f) => handleFileChange(f));
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-[#1a4da1] rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-tight">
                        {isBn ? "ভিসা ডকুমেন্ট ড্র্যাগ ও ড্রপ করুন অথবা ক্লিক করুন" : "Drag & Drop or Click to Upload Visa Document"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        {isBn ? "PDF, JPG, PNG (সর্বোচ্চ ৫ এমবি)" : "PDF, JPG, PNG (Max 5 MB)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="space-y-2.5 mt-4">
                    <div className="text-xs font-bold text-slate-500 ml-1">
                      {isBn ? "নির্বাচিত ফাইলসমূহ:" : "Selected Files:"}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {files.map((f, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0 border border-green-100">
                              <CheckCircle size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate max-w-[180px] sm:max-w-[280px]">
                                {f.name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                                {(f.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Button to upload extra files */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="w-full py-2.5 border-2 border-dashed border-blue-200 hover:border-[#1a4da1] text-xs font-bold text-[#1a4da1] hover:bg-blue-55/40 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] mt-2 bg-white"
                    >
                      <UploadCloud size={14} />
                      {isBn ? "আরও ফাইল যোগ করুন" : "+ Add Extra File / Image"}
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#1a4da1] hover:bg-[#133a7a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-blue-900/10 text-sm sm:text-base mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {isBn ? "প্রক্রিয়াধীন..." : "Submitting..."}
                  </>
                ) : (
                  <>{isBn ? "সাবমিট করুন" : "Submit Request"}</>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStatusSubmit} className="space-y-6">
              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 ml-1">
                  <PhoneCall size={14} className="text-[#1a4da1]" />
                  {isBn ? "মোবাইল নম্বর" : "Mobile Number"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={statusForm.mobileNumber}
                  onChange={(e) => handleStatusTextChange("mobileNumber", e.target.value)}
                  placeholder={isBn ? "মোবাইল নম্বর লিখুন" : "Enter mobile number"}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-[14px] text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4da1] transition-all duration-300 placeholder:text-slate-400"
                />
              </div>

              {/* Passport Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 ml-1">
                  <FileText size={14} className="text-[#1a4da1]" />
                  {isBn ? "পাসপোর্ট নম্বর" : "Passport Number"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={statusForm.passportNumber}
                  onChange={(e) => handleStatusTextChange("passportNumber", e.target.value)}
                  placeholder={isBn ? "যেমন: A12345678" : "e.g., A12345678"}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-[14px] text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4da1] transition-all duration-300 placeholder:text-slate-400"
                />
              </div>

              {/* Check Button */}
              <button
                type="submit"
                disabled={isChecking}
                className="w-full py-4 bg-[#1a4da1] hover:bg-[#133a7a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-blue-900/10 text-sm sm:text-base mt-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {isBn ? "অনুসন্ধান করা হচ্ছে..." : "Searching..."}
                  </>
                ) : (
                  <>{isBn ? "অবস্থা পরীক্ষা করুন" : "Check Status"}</>
                )}
              </button>

              {/* Status Display Card */}
              {hasChecked && statusResult && (
                <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in duration-300">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 ml-1">
                    {isBn ? "যাচাইকরণ ফলাফল:" : "Verification Result:"}
                  </h3>

                  {statusResult.status === "Pending" && (
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 flex gap-4">
                      <div className="w-10 h-10 bg-amber-100/80 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-amber-800">
                          {isBn ? "আবেদন প্রক্রিয়াধীন (Pending)" : "Under Review (Pending)"}
                        </div>
                        <p className="text-xs text-amber-700/80 font-medium leading-relaxed mt-1">
                          {isBn
                            ? "আপনার ভিসা যাচাইকরণের আবেদনটি বর্তমানে পর্যালোচনাধীন রয়েছে। আমাদের বিশেষজ্ঞ দল শীঘ্রই এটি যাচাই সম্পন্ন করবে।"
                            : "Your request is currently under review. Our team will verify your documents shortly."}
                        </p>
                        {statusResult.adminFeedback && (
                          <div className="mt-3 pt-3 border-t border-amber-200/40 text-xs font-semibold text-amber-800/85">
                            {isBn ? "মন্তব্য: " : "Note: "}
                            <span className="font-medium">{statusResult.adminFeedback}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {statusResult.status === "Approved" && (
                    <div className="bg-green-50/60 border border-green-200/60 rounded-2xl p-5 flex gap-4">
                      <div className="w-10 h-10 bg-green-100/80 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-green-800">
                          {isBn ? "অনুমোদিত হয়েছে (Approved)" : "Approved"}
                        </div>
                        <p className="text-xs text-green-700/80 font-medium leading-relaxed mt-1">
                          {isBn
                            ? "অভিনন্দন! আপনার ভিসা নথিটি সফলভাবে যাচাই করা হয়েছে।"
                            : "Congratulations! Your visa verification request has been successfully approved."}
                        </p>
                        {statusResult.adminFeedback && (
                          <div className="mt-3 pt-3 border-t border-green-200/40 text-xs font-semibold text-green-800/85">
                            {isBn ? "মন্তব্য: " : "Feedback: "}
                            <span className="font-medium">{statusResult.adminFeedback}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {statusResult.status === "Rejected" && (
                    <div className="bg-red-50/60 border border-red-200/60 rounded-2xl p-5 flex gap-4">
                      <div className="w-10 h-10 bg-red-100/80 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <XCircle size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-red-800">
                          {isBn ? "প্রত্যাখ্যাত হয়েছে (Rejected)" : "Rejected"}
                        </div>
                        <p className="text-xs text-red-700/80 font-medium leading-relaxed mt-1">
                          {isBn
                            ? "দুঃখিত, আপনার ভিসা যাচাইকরণের আবেদনটি প্রত্যাখ্যান করা হয়েছে।"
                            : "Unfortunately, your visa verification request was rejected."}
                        </p>
                        {statusResult.adminFeedback && (
                          <div className="mt-3 pt-3 border-t border-red-200/40 text-xs font-semibold text-red-800/85">
                            {isBn ? "কারণ: " : "Reason: "}
                            <span className="font-medium text-red-700/90">{statusResult.adminFeedback}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
