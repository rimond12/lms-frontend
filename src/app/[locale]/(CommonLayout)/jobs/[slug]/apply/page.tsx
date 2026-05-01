"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react";

import { Step, FormData, INITIAL_FORM_DATA } from "./jobs-shared/types";
import { STEPS, JOB } from "./jobs-shared/constants";
import { StepQuestionnaire } from "./jobs-shared/StepQuestionnaire";
import { StepReviewSubmit } from "./jobs-shared/StepReviewSubmit";
import { CancelModal } from "./jobs-shared/CancelModal";

import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useGetJobBySlugQuery } from "@/app/redux/api/jobsApi/jobsApi";
import { useApplyToJobMutation } from "@/app/redux/api/jobsApi/JobApplicationApi";
import { toast } from "react-hot-toast";

// ─── Submit Result Modal ──────────────────────────────────────────
function SubmitResultModal({
  type, missingFields, onClose, onEdit,
}: {
  type: "success" | "missing";
  missingFields?: string[];
  onClose: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        {type === "success" ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={36} className="text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              Application Submitted!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              আপনার application সফলভাবে জমা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
            </p>
            <div className="flex gap-3">
              <Link href="/jobs" className="flex-1">
                <button onClick={onClose}
                  className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Jobs দেখুন
                </button>
              </Link>
              <Link href="/dashboard/my-applications" className="flex-1">
                <button onClick={onClose}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
                  My Applications
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle size={36} className="text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              কিছু তথ্য missing!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              নিচের তথ্যগুলো পূরণ করুন:
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-5 text-left">
              {missingFields?.map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <X size={12} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">{f}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                বন্ধ করুন
              </button>
              <button onClick={onEdit}
                className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Edit করুন
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useUser();

  const { data: job, isLoading: jobLoading } = useGetJobBySlugQuery(slug, { skip: !slug });
  const [applyToJob, { isLoading: isSubmitting }] = useApplyToJobMutation();

  const [step, setStep] = useState<Step>(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModal, setShowModal] = useState<"success" | "missing" | null>(null);
  const [appId] = useState(() => Math.random().toString(36).substring(2, 7).toUpperCase());
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // ── Auto-fill from profile ──
  useEffect(() => {
    if (user) {
      setFormData((p) => ({
        ...p,
        name: user.name || p.name,
        email: user.email || p.email,
        phone: user.mobileNumber || p.phone,
        address: user.address || p.address,
        cvUrl: user.cvUrl || p.cvUrl,
        academicQualifications: user.degreeTitle
          ? `${user.degreeTitle}${user.universityName ? `, ${user.universityName}` : ""}`
          : p.academicQualifications,
        // ✅ hardSkills, softSkills, certifications — হারাবে না
      }));
    }
  }, [user?._id]); // ✅ fix: শুধু একবার run হবে

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!formData.name) missing.push("নাম");
    if (!formData.email) missing.push("Email");
    if (!formData.phone) missing.push("Phone");
    if (!formData.address) missing.push("Address");
    if (!formData.cvUrl) missing.push("CV / Resume");
    if (!formData.academicQualifications) missing.push("Academic Qualification");
    return missing;
  };

  const handleContinue = () => { if (step < 2) setStep((s) => (s + 1) as Step); };
  const handleBack = () => { if (step > 1) setStep((s) => (s - 1) as Step); };

  const handleSubmit = async () => {
    const missing = getMissingFields();

    // ✅ Missing থাকলে modal দেখাও
    if (missing.length > 0) {
      setShowModal("missing");
      return;
    }

    if (!job) return;
    try {
      const vacancy = Object.entries(formData.answers)
        .map(([k, v]) => `${k}:${v}`)
        .join("|");

      await applyToJob({
        jobId: job._id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        presentAddress: formData.address,
        resumeLink: formData.cvUrl,
        academicQualifications: formData.academicQualifications,
        exprience: formData.exprience,
        whyHireYou: formData.whyHireYou,
        hardSkills: formData.hardSkills,
        softSkills: formData.softSkills,
        certifications: formData.certifications,
        vacancy,
      }).unwrap();

      // ✅ Success modal দেখাও
      setShowModal("success");
    } catch (err: any) {
      if (err?.data?.message?.includes("already")) {
        toast.error("আপনি এই job এ আগেই apply করেছেন!");
      } else {
        toast.error("Apply করতে সমস্যা হয়েছে, আবার চেষ্টা করুন");
      }
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={36} className="animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors">
      {/* HERO */}
      <div className="relative max-w-7xl mx-auto rounded-2xl w-full h-48 sm:h-64 mt-5 overflow-hidden">
        <Image src="/images/details-banner.png" alt="Banner" fill className="object-cover object-center" />
      </div>

      {/* COMPANY INFO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center -mt-10 mb-4">
          <div className="w-20 h-20 rounded-full bg-blue-700 dark:bg-blue-600 border-4 border-white dark:border-gray-950 shadow-lg flex items-center justify-center text-white font-black text-base relative z-10 mb-3">
            {JOB.logo}
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white text-center">
            {job?.title || JOB.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{JOB.company}</p>
        </div>

        {/* Profile notice */}
        {user && (
          <div className="max-w-5xl mx-auto mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                আপনার profile থেকে তথ্য auto-fill হয়েছে।
                {getMissingFields().length > 0 && (
                  <> কিছু তথ্য missing —{" "}
                    <Link href="/profile" className="underline font-bold">Profile update করুন</Link>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all
                  ${step > s.id ? "bg-blue-700 dark:bg-blue-600"
                    : step === s.id ? "bg-blue-700 dark:bg-blue-600 ring-4 ring-blue-200 dark:ring-blue-900"
                    : "bg-gray-200 dark:bg-gray-700"}`}>
                  {step > s.id ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${step === s.id ? "bg-white" : "bg-gray-400 dark:bg-gray-500"}`} />
                  )}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap ${step >= s.id ? "text-blue-700 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-14 mb-4 mx-1 transition-colors ${step > s.id ? "bg-blue-700 dark:bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-sm mb-5 transition-colors">
            {step === 1 && <StepQuestionnaire data={formData} setData={setFormData} />}
            {step === 2 && <StepReviewSubmit data={formData} setData={setFormData} />}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-10">
            <button onClick={() => setShowCancelModal(true)}
              className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleBack} disabled={step === 1}
              className="flex-1 border border-blue-700 dark:border-blue-500 text-blue-700 dark:text-blue-400 rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {step > 1 ? "Previous" : "Back"}
            </button>
            {step < 2 ? (
              <button onClick={handleContinue}
                className="flex-1 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-bold transition-colors">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelModal onCancel={() => setShowCancelModal(false)} onConfirm={() => window.history.back()} />
      )}

      {/* ✅ Missing fields modal */}
      {showModal === "missing" && (
        <SubmitResultModal
          type="missing"
          missingFields={getMissingFields()}
          onClose={() => setShowModal(null)}
          onEdit={() => { setShowModal(null); setStep(2); }}
        />
      )}

      {/* ✅ Success modal */}
      {showModal === "success" && (
        <SubmitResultModal
          type="success"
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
}