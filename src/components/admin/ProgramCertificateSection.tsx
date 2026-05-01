"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Edit2, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUpdateCertificateRulesMutation } from "@/app/redux/api/CourseApi/CourseApi";
import { ICertificateRule } from "@/types/course";

interface ProgramCertificateSectionProps {
  courseId: string;
  certificateRule?: ICertificateRule;
  onCertificateChange: (rule: ICertificateRule) => void;
}

export default function ProgramCertificateSection({
  courseId,
  certificateRule,
  onCertificateChange,
}: ProgramCertificateSectionProps) {
  const [updateCertificateRules] = useUpdateCertificateRulesMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    minPercentage: 60,
    templateUrl: "",
    issueAutomatically: true,
    validityDays: undefined as number | undefined,
    certificateTitle: "Certificate of Completion",
  });

  // Initialize form with existing data
  useEffect(() => {
    if (certificateRule) {
      setForm({
        minPercentage: certificateRule.minPercentage || 60,
        templateUrl: certificateRule.templateUrl || "",
        issueAutomatically: certificateRule.issueAutomatically !== false,
        validityDays: certificateRule.validityDays,
        certificateTitle: certificateRule.certificateTitle || "Certificate of Completion",
      });
    }
  }, [certificateRule]);

  const handleSubmit = async () => {
    if (form.minPercentage < 0 || form.minPercentage > 100) {
      toast.error("Minimum percentage must be between 0 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCertificateRules({
        courseId,
        certificateRule: form,
      }).unwrap();
      toast.success("Certificate rules updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update certificate rules");
      console.error("Certificate update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (certificateRule) {
      setForm({
        minPercentage: certificateRule.minPercentage || 60,
        templateUrl: certificateRule.templateUrl || "",
        issueAutomatically: certificateRule.issueAutomatically !== false,
        validityDays: certificateRule.validityDays,
        certificateTitle: certificateRule.certificateTitle || "Certificate of Completion",
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Certificate Settings</h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition text-sm font-medium"
          >
            <Edit2 size={16} />
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        // View Mode
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Certificate Title</p>
              <p className="font-semibold text-gray-900">{form.certificateTitle}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Minimum Passing Score</p>
              <p className="font-semibold text-gray-900">{form.minPercentage}%</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Issue Automatically</p>
              <p className="font-semibold text-gray-900">
                {form.issueAutomatically ? "✓ Yes" : "✗ No"}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Validity</p>
              <p className="font-semibold text-gray-900">
                {form.validityDays ? `${form.validityDays} days` : "Lifetime"}
              </p>
            </div>
          </div>

          {form.templateUrl && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Certificate Template</p>
              <a
                href={form.templateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium text-sm"
              >
                View Template →
              </a>
            </div>
          )}
        </div>
      ) : (
        // Edit Mode
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Certificate Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Certificate Title <span className="text-red-800">*</span>
            </label>
            <input
              type="text"
              value={form.certificateTitle}
              onChange={(e) => setForm({ ...form, certificateTitle: e.target.value })}
              placeholder="e.g., Certificate of Completion"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Minimum Percentage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Passing Score (%) <span className="text-red-800">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={form.minPercentage}
                onChange={(e) => setForm({ ...form, minPercentage: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-right min-w-[3rem]">
                <span className="text-2xl font-bold text-blue-600">{form.minPercentage}</span>
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Certificate Template URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Certificate Template URL
            </label>
            <input
              type="url"
              value={form.templateUrl}
              onChange={(e) => setForm({ ...form, templateUrl: e.target.value })}
              placeholder="https://example.com/certificate-template.pdf"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Upload URL to your certificate template
            </p>
          </div>

          {/* Certificate Validity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Certificate Validity (days)
            </label>
            <input
              type="number"
              value={form.validityDays || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  validityDays: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Leave empty for lifetime validity"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for certificates that don't expire
            </p>
          </div>

          {/* Automatic Issue */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.issueAutomatically}
                onChange={(e) => setForm({ ...form, issueAutomatically: e.target.checked })}
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Issue certificate automatically when criteria is met
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
            >
              <Save size={14} />
              {isSubmitting ? "Saving..." : "Save Settings"}
            </motion.button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
