"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, AlertCircle, Loader } from "lucide-react";
import { useGetCourseByIdQuery } from "@/app/redux/api/CourseApi/CourseApi";
import ProgramExpertsSection from "@/components/admin/ProgramExpertsSection";

export default function ExpertsManagementPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data, isLoading, error } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const program = data as any;

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading experts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-800" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 text-sm">
                  Failed to load program. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/dashboard/manage-courses/${courseId}/details`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          Back to Details
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3">
            <Users size={24} className="text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Experts
              </h1>
              <p className="text-gray-600">{program.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Experts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProgramExpertsSection
            courseId={courseId}
            experts={program.experts || []}
            onExpertsChange={() => {}}
          />
        </motion.div>
      </div>
    </div>
  );
}
