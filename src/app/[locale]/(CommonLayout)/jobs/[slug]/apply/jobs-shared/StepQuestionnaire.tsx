"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { FormData } from "./types";
import { QUESTIONS } from "./constants";
import { useTranslations } from "next-intl";

// ─── Tag Input ──────────────────────────────────────────────────
function TagInput({
  label,
  tags,
  color,
  placeholder,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  color: string;
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => {
            if (input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }}
          className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 ${color} text-xs px-3 py-1 rounded-full font-medium`}
          >
            {tag}
            <button type="button" onClick={() => onRemove(i)}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export function StepQuestionnaire({
  data,
  setData,
}: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const t = useTranslations("jobsPage");

  const addTag = (
    field: "hardSkills" | "softSkills" | "certifications",
    value: string,
  ) => setData((p) => ({ ...p, [field]: [...p[field], value] }));

  const removeTag = (
    field: "hardSkills" | "softSkills" | "certifications",
    idx: number,
  ) =>
    setData((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

  const getQuestionText = (index: number, defaultText: string) => {
    if (index === 0) return t.has("apply.questions.fixedTerm") ? t("apply.questions.fixedTerm") : defaultText;
    if (index === 1) return t.has("apply.questions.relocate") ? t("apply.questions.relocate") : defaultText;
    if (index === 2) return t.has("apply.questions.start30") ? t("apply.questions.start30") : defaultText;
    return defaultText;
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center">
        {t("apply.questionnaire")}
      </h2>

      {/* ── Yes/No Questions (existing) ── */}
      <div className="flex flex-col gap-3">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4"
          >
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {getQuestionText(i, q)}
            </p>
            <div className="flex gap-4">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={opt}
                    checked={data.answers[`q${i}`] === opt}
                    onChange={() =>
                      setData((p) => ({
                        ...p,
                        answers: { ...p.answers, [`q${i}`]: opt },
                      }))
                    }
                    className="accent-blue-700 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Experience ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {t("apply.experience")}
        </label>
        <input
          value={data.exprience}
          onChange={(e) =>
            setData((p) => ({ ...p, exprience: e.target.value }))
          }
          placeholder={t("apply.experiencePlaceholder")}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
        />
      </div>

      {/* ── Academic Qualification ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {t("apply.academic")}
        </label>
        <input
          value={data.academicQualifications}
          onChange={(e) =>
            setData((p) => ({
              ...p,
              academicQualifications: e.target.value,
            }))
          }
          placeholder={t("apply.academicPlaceholder")}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
        />
      </div>

      {/* ── Why Hire You ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {t("apply.whyHire")}
        </label>
        <textarea
          value={data.whyHireYou}
          onChange={(e) =>
            setData((p) => ({ ...p, whyHireYou: e.target.value }))
          }
          rows={4}
          placeholder={t("apply.whyHirePlaceholder")}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 dark:focus:border-blue-500 resize-none transition-colors"
        />
      </div>

      {/* ── Hard Skills ── */}
      <TagInput
        label={t("apply.hardSkills")}
        tags={data.hardSkills}
        color="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        placeholder={t("apply.tagPlaceholder")}
        onAdd={(v) => addTag("hardSkills", v)}
        onRemove={(i) => removeTag("hardSkills", i)}
      />

      {/* ── Soft Skills ── */}
      <TagInput
        label={t("apply.softSkills")}
        tags={data.softSkills}
        color="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        placeholder={t("apply.tagPlaceholderSoft")}
        onAdd={(v) => addTag("softSkills", v)}
        onRemove={(i) => removeTag("softSkills", i)}
      />

      {/* ── Certifications ── */}
      <TagInput
        label={t("apply.certifications")}
        tags={data.certifications}
        color="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        placeholder={t("apply.tagPlaceholderCert")}
        onAdd={(v) => addTag("certifications", v)}
        onRemove={(i) => removeTag("certifications", i)}
      />
    </div>
  );
}
