"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, ToggleRight, Calendar, Zap } from "lucide-react";

interface CertificateRuleData {
  minPercentage: number;
  issueAutomatically?: boolean;
  validityDays?: number;
  certificateTitle?: string;
  templateUrl?: string;
}

interface CertificateRulesStepProps {
  data: CertificateRuleData;
  onUpdate: (data: CertificateRuleData) => void;
}

export const CertificateRulesStep: React.FC<CertificateRulesStepProps> = ({
  data,
  onUpdate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Certificate Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up automatic certificate issuance rules for program completion
        </p>
      </div>

      {/* Minimum Passing Percentage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        <label className="block">
          <span className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            <Award className="w-5 h-5 text-amber-500" />
            Minimum Passing Percentage
          </span>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={data.minPercentage}
              onChange={(e) =>
                onUpdate({
                  ...data,
                  minPercentage: parseInt(e.target.value),
                })
              }
              className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="w-20">
              <div className="bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded px-3 py-2 text-center font-semibold text-amber-900 dark:text-amber-200">
                {data.minPercentage}%
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Users must achieve this percentage to receive a certificate
          </p>
        </label>
      </motion.div>

      {/* Automatic Issue Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="flex items-center gap-2">
            <ToggleRight className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Auto-Issue Certificates
            </span>
          </div>
          <input
            type="checkbox"
            checked={data.issueAutomatically ?? true}
            onChange={(e) =>
              onUpdate({
                ...data,
                issueAutomatically: e.target.checked,
              })
            }
            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
          />
        </label>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-200">
          <Zap className="w-4 h-4 inline mr-2" />
          {data.issueAutomatically
            ? "Certificates will be issued automatically when users reach the passing percentage"
            : "Certificates will require manual admin approval"}
        </div>
      </motion.div>

      {/* Certificate Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        <label className="block">
          <span className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Certificate Title
          </span>
          <input
            type="text"
            placeholder="e.g., Certificate of Completion, Professional Certification"
            value={data.certificateTitle || ""}
            onChange={(e) =>
              onUpdate({
                ...data,
                certificateTitle: e.target.value || undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            The title that will appear on issued certificates (optional)
          </p>
        </label>
      </motion.div>

      {/* Validity Period */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="space-y-3"
      >
        <label className="block">
          <span className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Certificate Validity Period (days)
          </span>
          <input
            type="number"
            placeholder="Leave empty for permanent validity"
            value={data.validityDays || ""}
            onChange={(e) =>
              onUpdate({
                ...data,
                validityDays: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            How many days until certificates expire (leave empty for permanent)
          </p>
        </label>
      </motion.div>

      {/* Template URL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="space-y-3"
      >
        <label className="block">
          <span className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Certificate Template URL
          </span>
          <input
            type="url"
            placeholder="https://example.com/certificate-template.pdf"
            value={data.templateUrl || ""}
            onChange={(e) =>
              onUpdate({
                ...data,
                templateUrl: e.target.value || undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Custom certificate template URL (optional)
          </p>
        </label>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950 dark:to-purple-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          📜 Certificate Rules Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Passing Score:
            </span>
            <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold">
              {data.minPercentage}%
            </span>
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Auto-Issue:
            </span>
            <span className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
              {data.issueAutomatically ? "Yes" : "Manual Review"}
            </span>
          </div>
          {data.certificateTitle && (
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Title:
              </span>
              <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                {data.certificateTitle}
              </span>
            </div>
          )}
          {data.validityDays && (
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Validity:
              </span>
              <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                {data.validityDays} days from issue
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>📋 How Certificates Work:</strong> When a user completes their quiz and
          achieves the minimum passing percentage, a certificate is automatically generated
          with unique verification code and certificate number.
        </p>
      </div>
    </motion.div>
  );
};
