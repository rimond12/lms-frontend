/**
 * Batch Modules Management Page
 * Admin page for managing modules of a specific batch
 */

"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useGetBatchByIdQuery } from "@/app/redux/api/batchApi/batchApi";
import { BatchModuleManager } from "@/components/admin/batchModules";
import BatchModuleManagerV2 from "@/components/admin/batchModules/BatchModuleManagerV2";

export default function BatchModulesPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params?.id as string;

  const {
    data: batchData,
    isLoading,
    error,
  } = useGetBatchByIdQuery(batchId, {
    skip: !batchId,
  });

  const batch = batchData?.data;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading batch details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Batch Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The batch you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const courseId =
    typeof batch.courseId === "string"
      ? batch.courseId
      : batch.courseId?._id || "";

  const courseName =
    typeof batch.courseId === "object" ? batch.courseId?.title : "Course";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200  z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {batch.batchName} - Modules
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {courseName} • {batch.batchNumber}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  batch.status === "running"
                    ? "bg-green-100 text-green-700"
                    : batch.status === "upcoming"
                      ? "bg-blue-100 text-blue-700"
                      : batch.status === "completed"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-700"
                }`}
              >
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BatchModuleManagerV2
          batchId={batchId}
          courseId={courseId}
          batchStartDate={batch.startDate}
        />
      </div>
    </div>
  );
}
