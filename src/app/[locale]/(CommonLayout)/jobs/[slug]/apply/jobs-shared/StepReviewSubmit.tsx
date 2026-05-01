"use client";

import React, { useState } from "react";
import { AlertCircle, User, FileText, ExternalLink } from "lucide-react";
import { FormData } from "./types";
import { QUESTIONS } from "./constants";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import EditProfileForm from "@/components/forms/EditProfileForm";

function ReviewRow({ label, value }: { label: string; value: string }) {
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
        {value || "— Not filled"}
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

  // Missing required fields check
  const missingFields: string[] = [];
  if (!data.name) missingFields.push("Full Name");
  if (!data.email) missingFields.push("Email");
  if (!data.phone) missingFields.push("Phone number");
  if (!data.address) missingFields.push("Address");
  if (!data.cvUrl) missingFields.push("CV / Resume");
  if (!data.academicQualifications)
    missingFields.push("Academic Qualification");

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

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-2">
        Review and Submit
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
              Some information is missing!
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
            <User size={13} /> Update Profile
          </button>
        </div>
      )}

      {/* ── Profile Information ── */}
      <ReviewSection title="Profile Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <ReviewRow label="Full Name" value={data.name} />
          <ReviewRow label="Email" value={data.email} />
          <ReviewRow label="Phone" value={data.phone} />
          <ReviewRow label="Address" value={data.address} />
        </div>

        {data.cvUrl ? (
          <a
            href={data.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium mt-1"
          >
            <FileText size={13} /> View CV / Resume <ExternalLink size={11} />
          </a>
        ) : (
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              CV / Resume
            </span>
            <span className="text-xs font-medium text-red-400 italic">
              — Not filled
            </span>
          </div>
        )}

        {/* Edit button — সবসময় দেখাবে */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline mt-1 w-fit"
        >
          <User size={12} /> Edit Profile
        </button>
      </ReviewSection>

      {/* ── Qualification ── */}
      <ReviewSection title="Qualification">
        <ReviewRow
          label="Academic Qualification"
          value={data.academicQualifications}
        />
        <ReviewRow label="Experience" value={data.exprience} />
      </ReviewSection>

      {/* ── Why Hire ── */}
      {data.whyHireYou && (
        <ReviewSection title="Why Hire Me">
          <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
            {data.whyHireYou}
          </p>
        </ReviewSection>
      )}

      {/* ── Skills ── */}
      {(data.hardSkills.length > 0 || data.softSkills.length > 0) && (
        <ReviewSection title="Skills">
          {data.hardSkills.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                Hard Skills
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
                Soft Skills
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
        <ReviewSection title="Certifications">
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
      <ReviewSection title="Questionnaire">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {q}
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
