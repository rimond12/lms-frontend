"use client";

import React, { useState } from "react";
import { AlertCircle, User, FileText, ExternalLink } from "lucide-react";
import { FormData } from "./types";
import { QUESTIONS } from "./constants";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import EditProfileForm from "@/components/forms/EditProfileForm";
import { useTranslations } from "next-intl";

function ReviewRow({ label, value }: { label: string; value: string }) {
  const t = useTranslations("jobsPage");
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span
        className={`text-xs font-medium ${
          value ? "text-gray-700 dark:text-gray-200" : "text-red-400 italic"
        }`}
      >
        {value || `— ${t("apply.notFilled")}`}
      </span>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-36 shrink-0">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {title}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function StepReviewSubmit({
  data,
  setData,
}: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const { user, refetch } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const t = useTranslations("jobsPage");

  // Missing required fields check
  const missingFields: string[] = [];
  if (!data.name) missingFields.push(t("apply.fullName"));
  if (!data.email) missingFields.push(t("apply.email"));
  if (!data.phone) missingFields.push(t("apply.phone"));
  if (!data.address) missingFields.push(t("apply.address"));
  if (!data.cvUrl) missingFields.push(t("apply.viewCv"));
  if (!data.academicQualifications)
    missingFields.push(t("apply.academic"));

  // After profile update — re-fill form from updated user
  const handleEditSuccess = () => {
    refetch?.();
    if (user) {
      setData((p) => ({
        ...p,
        name: user.name || p.name,
        email: user.email || p.email,
        phone: user.mobileNumber || p.phone,
        address: user.address || p.address,
        cvUrl: user.cvUrl || p.cvUrl,
        academicQualifications: user.degreeTitle
          ? `${user.degreeTitle}${user.universityName ? `, ${user.universityName}` : ""}`
          : p.academicQualifications,
      }));
    }
    setIsEditModalOpen(false);
  };

  const getQuestionText = (index: number, defaultText: string) => {
    if (index === 0) return t.has("apply.questions.fixedTerm") ? t("apply.questions.fixedTerm") : defaultText;
    if (index === 1) return t.has("apply.questions.relocate") ? t("apply.questions.relocate") : defaultText;
    if (index === 2) return t.has("apply.questions.start30") ? t("apply.questions.start30") : defaultText;
    return defaultText;
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-2">
        {t("apply.reviewSubmit")}
      </h2>

      {/* ── Missing fields warning ── */}
      {missingFields.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-2">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle
              size={16}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              {t("apply.missingTitle")}
            </p>
          </div>
          <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 pl-5 mb-3">
            {missingFields.map((f, i) => (
              <li key={i} className="list-disc">
                {f} — not in your profile
              </li>
            ))}
          </ul>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            <User size={13} /> {t("apply.updateProfile")}
          </button>
        </div>
      )}

      {/* ── Profile Information ── */}
      <ReviewSection title={t("apply.profileInfo")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <ReviewRow label={t("apply.fullName")} value={data.name} />
          <ReviewRow label={t("apply.email")} value={data.email} />
          <ReviewRow label={t("apply.phone")} value={data.phone} />
          <ReviewRow label={t("apply.address")} value={data.address} />
        </div>

        {data.cvUrl ? (
          <a
            href={data.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium mt-1"
          >
            <FileText size={13} /> {t("apply.viewCv")} <ExternalLink size={11} />
          </a>
        ) : (
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              CV / Resume
            </span>
            <span className="text-xs font-medium text-red-400 italic">
              — {t("apply.notFilled")}
            </span>
          </div>
        )}

        {/* Edit button — সবসময় দেখাবে */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline mt-1 w-fit"
        >
          <User size={12} /> {t("apply.editProfile")}
        </button>
      </ReviewSection>

      {/* ── Qualification ── */}
      <ReviewSection title={t("apply.qualification")}>
        <ReviewRow
          label={t("apply.academic")}
          value={data.academicQualifications}
        />
        <ReviewRow label={t("apply.experience")} value={data.exprience} />
      </ReviewSection>

      {/* ── Why Hire ── */}
      {data.whyHireYou && (
        <ReviewSection title={t("apply.whyHireMe")}>
          <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
            {data.whyHireYou}
          </p>
        </ReviewSection>
      )}

      {/* ── Skills ── */}
      {(data.hardSkills.length > 0 || data.softSkills.length > 0) && (
        <ReviewSection title={t("apply.skills")}>
          {data.hardSkills.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                {t("apply.hardSkills")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.hardSkills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.softSkills.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                {t("apply.softSkills")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.softSkills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ReviewSection>
      )}

      {/* ── Certifications ── */}
      {data.certifications.length > 0 && (
        <ReviewSection title={t("apply.certifications")}>
          <div className="flex flex-wrap gap-1.5">
            {data.certifications.map((s, i) => (
              <span
                key={i}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* ── Questionnaire answers ── */}
      <ReviewSection title={t("apply.questionnaire")}>
        {QUESTIONS.map((q, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {getQuestionText(i, q)}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {data.answers[`q${i}`] || "—"}
            </span>
          </div>
        ))}
      </ReviewSection>

      {/* ── EditProfileForm Modal ── */}
      {user && (
        <EditProfileForm
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
