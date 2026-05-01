"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle } from "lucide-react";
import AppImage from "@/components/ui/AppImage";

interface CertificatePreview {
  title?: string;
  description?: string;
  photoUrl?: string;
}

interface CertificatePreviewSectionProps {
  certificatePreview: CertificatePreview;
}

const CertificatePreviewSection: React.FC<CertificatePreviewSectionProps> = ({
  certificatePreview,
}) => {
  // Don't render if no certificate data
  if (!certificatePreview || (!certificatePreview.title && !certificatePreview.photoUrl)) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-700 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 rounded-xl">
          <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Certificate of Completion
        </h2>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Certificate Image */}
        {certificatePreview.photoUrl && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-xl blur-xl"></div>
            <AppImage
              photoUrl={certificatePreview.photoUrl}
              alt="Certificate Preview"
              width={500}
              height={350}
              className="relative w-full rounded-xl shadow-lg border border-yellow-200 dark:border-yellow-700"
            />
          </div>
        )}

        {/* Certificate Info */}
        <div className={certificatePreview.photoUrl ? "" : "col-span-2"}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-8 h-8 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {certificatePreview.title || "Certificate of Completion"}
            </h3>
          </div>

          {certificatePreview.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {certificatePreview.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>Awarded upon successful course completion</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CertificatePreviewSection;
