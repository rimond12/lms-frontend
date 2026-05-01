/**
 * CopyModulesModal Component
 * Modal for copying modules from another batch
 */

"use client";

import React, { useState } from "react";
import {
  Copy,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
} from "lucide-react";
import { useGetAllBatchesQuery } from "@/app/redux/api/batchApi/batchApi";
import {
  useCopyModulesFromBatchMutation,
  useCopyModulesFromCourseMutation,
  useGetBatchModulesQuery,
} from "@/app/redux/api/batchModuleApi/batchModuleApi";

interface CopyModulesModalProps {
  targetBatchId: string;
  courseId: string;
  onClose: () => void;
}

export default function CopyModulesModal({
  targetBatchId,
  courseId,
  onClose,
}: CopyModulesModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeAssignments, setIncludeAssignments] = useState(true);
  const [adjustSchedule, setAdjustSchedule] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch batches for the same course
  const { data: batchesData, isLoading: isLoadingBatches } =
    useGetAllBatchesQuery({
      courseId,
      limit: 50,
    });

  // Fetch modules for selected batch
  const { data: modulesData, isLoading: isLoadingModules } =
    useGetBatchModulesQuery(
      { batchId: selectedBatchId || "", includeInactive: false },
      { skip: !selectedBatchId },
    );

  const [copyFromBatch, { isLoading: isCopying }] =
    useCopyModulesFromBatchMutation();
  const [copyFromCourse, { isLoading: isCopyingFromCourse }] =
    useCopyModulesFromCourseMutation();

  // Filter out current batch and apply search
  const availableBatches =
    batchesData?.data?.filter((batch) => {
      if (batch._id === targetBatchId) return false;
      if (searchTerm) {
        return (
          batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    }) || [];

  const selectedBatch = availableBatches.find((b) => b._id === selectedBatchId);
  const modules = modulesData?.data || [];

  const handleCopy = async () => {
    if (!selectedBatchId) return;

    try {
      await copyFromBatch({
        targetBatchId,
        data: {
          sourceBatchId: selectedBatchId,
          includeQuizzes,
          includeAssignments,
          adjustScheduleToNewBatch: adjustSchedule,
        },
      }).unwrap();

      setCopySuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to copy modules:", error);
    }
  };

  const handleCopyFromCourse = async () => {
    try {
      await copyFromCourse({
        batchId: targetBatchId,
        courseId,
      }).unwrap();

      setCopySuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to copy modules from course:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Copy className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Copy Modules
              </h2>
              <p className="text-sm text-gray-500">
                Import modules from another batch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {copySuccess ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Modules Copied Successfully!
              </h3>
              <p className="text-gray-500">
                All selected modules have been copied to this batch.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Copy from Course Option */}
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Copy from Course Template
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Import all modules from the course's default module
                      structure
                    </p>
                    <button
                      onClick={handleCopyFromCourse}
                      disabled={isCopyingFromCourse}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isCopyingFromCourse ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy from Course
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink px-4 text-sm text-gray-400">
                  or
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Search Batches */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Batch to Copy From
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search batches..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Batch List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {isLoadingBatches ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading batches...
                    </p>
                  </div>
                ) : availableBatches.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No other batches found
                    </p>
                  </div>
                ) : (
                  availableBatches.map((batch) => (
                    <button
                      key={batch._id}
                      onClick={() => setSelectedBatchId(batch._id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                        ${
                          selectedBatchId === batch._id
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div
                        className={`
                        w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold
                        ${
                          selectedBatchId === batch._id
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }
                      `}
                      >
                        {batch.batchNumber.split("-").pop()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {batch.batchName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(batch.startDate).toLocaleDateString()}
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              batch.status === "running"
                                ? "bg-green-100 text-green-700"
                                : batch.status === "upcoming"
                                  ? "bg-blue-100 text-blue-700"
                                  : batch.status === "completed"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {batch.status}
                          </span>
                        </p>
                      </div>
                      {selectedBatchId === batch._id && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Selected Batch Preview */}
              {selectedBatchId && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      Modules to Copy ({modules.length})
                    </h4>
                  </div>

                  {isLoadingModules ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    </div>
                  ) : modules.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No modules found in selected batch
                    </p>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {modules.slice(0, 5).map((module, index) => (
                        <div
                          key={module._id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{module.title}</span>
                          <span className="text-gray-400 text-xs">
                            ({module.lessons?.length || 0} lessons)
                          </span>
                        </div>
                      ))}
                      {modules.length > 5 && (
                        <p className="text-xs text-gray-500 pl-7">
                          + {modules.length - 5} more modules
                        </p>
                      )}
                    </div>
                  )}

                  {/* Copy Options */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeQuizzes}
                        onChange={(e) => setIncludeQuizzes(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Include linked quizzes
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAssignments}
                        onChange={(e) =>
                          setIncludeAssignments(e.target.checked)
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Include linked assignments
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adjustSchedule}
                        onChange={(e) => setAdjustSchedule(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Adjust schedule dates relative to new batch start
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!copySuccess && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              disabled={!selectedBatchId || isCopying || modules.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy {modules.length} Module{modules.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
