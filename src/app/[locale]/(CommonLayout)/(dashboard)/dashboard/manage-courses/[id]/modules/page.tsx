"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "@/app/redux/api/CourseApi/CourseApi";
import {
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useUploadReferenceFilesMutation,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";
import ModulesStep from "@/components/admin/ProgramWizard/ModulesStep";

// ==================== MAIN PAGE ====================
export default function ManageModulesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [modules, setModules] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch course data
  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useGetCourseByIdQuery(courseId);
  const [updateCourse, { isLoading: isSaving }] = useUpdateCourseMutation();
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [uploadReferenceFiles] = useUploadReferenceFilesMutation();

  // Initialize modules from course data
  useEffect(() => {
    if (course?.modules) {
      // Map populated backend data to frontend state format
      const mappedModules = course.modules.map((mod: any) => {
        // Handle populated assignmentId - extract full object for editing
        let assignment = null;
        let assignmentId = null;

        if (mod.assignmentId) {
          // assignmentId is populated as full object from backend
          if (typeof mod.assignmentId === "object" && mod.assignmentId._id) {
            assignment = { ...mod.assignmentId };
            assignmentId = mod.assignmentId._id;
          } else if (typeof mod.assignmentId === "string") {
            // Just an ID reference
            assignmentId = mod.assignmentId;
          }
        } else if (mod.assignment) {
          // Fallback if assignment is already in assignment field
          assignment = mod.assignment;
          assignmentId = mod.assignment._id || mod.assignment;
        }

        return {
          ...mod,
          quiz: mod.quizId || mod.quiz || null,
          assignment,
          assignmentId,
        };
      });
      setModules(mappedModules);
      setHasChanges(false);
    }
  }, [course]);

  // Handle modules update
  const handleModulesUpdate = (updatedModules: any[]) => {
    setModules(updatedModules);
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    try {
      const processedModules = [];

      // Process assignments first
      for (const module of modules) {
        let processedModule = { ...module };

        // Handle Assignment
        if (module.assignment && module.assignment.title) {
          try {
            const assignmentPayload = {
              courseId,
              title: module.assignment.title,
              description: module.assignment.description || "",
              instructions: module.assignment.instructions || "",
              submissionTypes: module.assignment.submissionTypes || [
                "file-upload",
              ],
              allowedFileTypes: module.assignment.allowedFileTypes || [],
              maxFileSize: module.assignment.maxFileSize || 5,
              maxFilesCount: module.assignment.maxFilesCount || 3,
              startDate: module.assignment.startDate || null,
              dueDate: module.assignment.dueDate || null,
              lateDueDate: module.assignment.lateDueDate || null,
              totalPoints: module.assignment.totalPoints || 100,
              passingPoints: module.assignment.passingPoints || 0,
              lateSubmissionPenalty:
                module.assignment.lateSubmissionPenalty || 0,
              isPublished: module.assignment.isPublished || false,
            };

            console.log(
              "Assignment Payload:",
              JSON.stringify(assignmentPayload, null, 2),
            );

            let assignmentId =
              processedModule.assignmentId || module.assignment._id;

            if (assignmentId) {
              // UPDATE existing assignment
              await updateAssignment({
                id: assignmentId,
                ...assignmentPayload,
              }).unwrap();
              processedModule.assignmentId = assignmentId;
            } else {
              // CREATE new assignment
              const response =
                await createAssignment(assignmentPayload).unwrap();
              const assignAny = response as any;
              const newId =
                assignAny?.assignment?._id ||
                assignAny?.data?._id ||
                assignAny?._id;

              if (newId) {
                processedModule.assignmentId = newId;
                assignmentId = newId;
              }
            }

            // Upload new reference files (files with blob URLs or _file property)
            const refFiles = module.assignment.referenceFiles || [];
            const newFiles = refFiles.filter(
              (f: any) =>
                f._file || (f.fileUrl && f.fileUrl.startsWith("blob:")),
            );

            if (newFiles.length > 0 && assignmentId) {
              try {
                const formData = new FormData();
                for (const file of newFiles) {
                  if (file._file) {
                    formData.append("files", file._file);
                  }
                }

                if (formData.has("files")) {
                  await uploadReferenceFiles({
                    assignmentId,
                    files: formData,
                  }).unwrap();
                  console.log(
                    `Uploaded ${newFiles.length} reference files for assignment ${assignmentId}`,
                  );
                }
              } catch (uploadError: any) {
                console.error("Error uploading reference files:", uploadError);
                toast.error("Failed to upload reference files");
              }
            }
          } catch (assignError: any) {
            console.error(
              `Error processing assignment for module ${module.title}:`,
              assignError,
            );
            if (assignError?.data) {
              console.error(
                "Error Data:",
                JSON.stringify(assignError.data, null, 2),
              );
            }
            const errorMessage =
              assignError?.data?.message ||
              assignError?.message ||
              JSON.stringify(assignError);
            toast.error(`Assignment failed: ${errorMessage}`);
          }
        }

        // Clean up payload (remove populated/embedded objects that shouldn't be sent to updateCourse)
        // Note: keeping quiz/assignment fields might be ignored by strict schema, but best to clean
        // module.assignment is the detailed object, we rely on assignmentId
        // delete processedModule.assignment;

        processedModules.push(processedModule);
      }

      await updateCourse({
        id: courseId,
        modules: processedModules,
      }).unwrap();
      toast.success("Modules saved successfully!");
      setHasChanges(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save modules");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500">Loading course modules...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-8 rounded-xl border border-red-200 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load course data. Please try again.
          </p>
          <Link
            href="/dashboard/manage-courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/manage-courses"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
            >
              <ArrowLeft size={16} />
              Back to Courses
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Layers className="text-blue-600" size={24} />
                  Manage Modules
                </h1>
                <p className="text-gray-500 mt-1">{course.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium">
                    Unsaved Changes
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </motion.button>
              </div>
            </div>
          </div>

          {/* Course Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Course Type</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {course.type || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Level</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {course.level || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Modules</p>
                <p className="text-sm font-medium text-gray-900">
                  {modules.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Lessons</p>
                <p className="text-sm font-medium text-gray-900">
                  {modules.reduce(
                    (sum, m) => sum + (m.lessons?.length || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Modules Editor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} />
                Course Modules
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add, edit, reorder modules, lessons, quizzes, and assignments
              </p>
            </div>
            <div className="p-5">
              <ModulesStep data={modules} onUpdate={handleModulesUpdate} />
            </div>
          </div>

          {/* Save Button (Bottom) */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Save Changes
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
