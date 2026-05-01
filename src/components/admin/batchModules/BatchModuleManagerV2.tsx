/**
 * BatchModuleManagerV2 - Container Component (Logic Only)
 * All state management, API calls, and business logic live here.
 * UI rendering is delegated to BatchModuleManagerV2View.
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "react-hot-toast";
import {
  useGetBatchModulesQuery,
  useCreateBatchModuleMutation,
  useUpdateBatchModuleMutation,
  useDeleteBatchModuleMutation,
  useReorderBatchModulesMutation,
  useUploadLessonFileMutation,
  IBatchModule,
  UnlockType,
} from "@/app/redux/api/batchModuleApi/batchModuleApi";
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} from "@/app/redux/api/QuizApi/quizApi";
import {
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useUploadReferenceFilesMutation,
  useDeleteAssignmentMutation,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";
import { ModuleQuiz } from "@/components/admin/shared/module-editors/ModuleQuizEditor";
import { ModuleAssignment } from "@/components/admin/shared/module-editors/ModuleAssignmentEditor";
import BatchModuleManagerV2View from "./BatchModuleManagerV2View";

// ==================== EXPORTED TYPES ====================

export interface ModuleFormData {
  _id?: string;
  title: string;
  description: string;
  lessons: LessonFormData[];
  quizId?: string;
  assignmentId?: string;
  quiz?: ModuleQuiz | null;
  assignment?: ModuleAssignment | null;
  unlockType: UnlockType;
  unlockDate?: string;
  unlockDaysAfterEnrollment?: number;
  unlockDaysAfterBatchStart?: number;
  isPublished: boolean;
  isExpanded: boolean;
  isDirty: boolean;
}

export interface LessonFormData {
  _id?: string;
  tempId: string;
  title: string;
  description: string;
  type: "video" | "pdf" | "doc" | "link" | "file";
  videoProvider?: "youtube" | "vdocipher" | "direct";
  vdocipherVideoId?: string;
  contentUrl: string;
  videoId?: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export interface ModuleStats {
  total: number;
  totalLessons: number;
  publishedModules: number;
  unsavedModules: number;
}

interface Props {
  batchId: string;
  courseId: string;
  batchStartDate?: string;
}

// ==================== HELPER FUNCTIONS ====================

const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const convertModuleToForm = (module: IBatchModule): ModuleFormData => ({
  _id: module._id,
  title: module.title,
  description: module.description || "",
  lessons: module.lessons.map((l, idx) => ({
    _id: l._id,
    tempId: l._id || generateTempId(),
    title: l.title,
    description: l.description || "",
    type: l.type,
    videoProvider: l.videoProvider || "youtube",
    vdocipherVideoId: l.vdocipherVideoId,
    contentUrl: l.contentUrl || "",
    videoId: typeof l.videoId === "string" ? l.videoId : l.videoId?._id,
    duration: l.duration || 0,
    order: l.order ?? idx,
    isFree: l.isFree || false,
  })),
  quizId:
    typeof module.quizId === "string" ? module.quizId : module.quizId?._id,
  assignmentId:
    typeof module.assignmentId === "string"
      ? module.assignmentId
      : module.assignmentId?._id,
  quiz: typeof module.quizId === "object" ? (module.quizId as any) : null,
  assignment:
    typeof module.assignmentId === "object"
      ? (module.assignmentId as any)
      : null,
  unlockType: module.unlockType || "immediate",
  unlockDate: module.unlockDate,
  unlockDaysAfterEnrollment: module.unlockDaysAfterEnrollment,
  unlockDaysAfterBatchStart: module.unlockDaysAfterBatchStart,
  isPublished: module.isPublished,
  isExpanded: false,
  isDirty: false,
});

const createEmptyModule = (order: number): ModuleFormData => ({
  title: "",
  description: "",
  lessons: [],
  unlockType: "immediate",
  isPublished: false,
  isExpanded: true,
  isDirty: true,
});

// ==================== CONTAINER COMPONENT ====================

export function BatchModuleManagerV2({
  batchId,
  courseId,
  batchStartDate,
}: Props) {
  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [savingModuleId, setSavingModuleId] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // API Hooks
  const {
    data: modulesData,
    isLoading,
    refetch,
  } = useGetBatchModulesQuery({ batchId, includeInactive: true });
  const [createModule] = useCreateBatchModuleMutation();
  const [updateModule] = useUpdateBatchModuleMutation();
  const [deleteModule] = useDeleteBatchModuleMutation();
  const [reorderModules] = useReorderBatchModulesMutation();

  // Quiz & Assignment Mutations
  const [createQuiz] = useCreateQuizMutation();
  const [updateQuiz] = useUpdateQuizMutation();
  const [deleteQuizMutation] = useDeleteQuizMutation();
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [uploadReferenceFiles] = useUploadReferenceFilesMutation();

  // Initialize modules from API
  useEffect(() => {
    if (modulesData?.data) {
      const sorted = [...modulesData.data].sort((a, b) => a.order - b.order);
      setModules(sorted.map(convertModuleToForm));
    }
  }, [modulesData]);

  // Handle module reorder
  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex(
      (m) => (m._id || `new_${modules.indexOf(m)}`) === active.id,
    );
    const newIndex = modules.findIndex(
      (m) => (m._id || `new_${modules.indexOf(m)}`) === over.id,
    );

    const newModules = arrayMove(modules, oldIndex, newIndex);
    setModules(newModules);

    // Only reorder if all modules are saved
    const savedModuleIds = newModules.filter((m) => m._id).map((m) => m._id!);
    if (savedModuleIds.length === newModules.length) {
      try {
        await reorderModules({ batchId, moduleOrder: savedModuleIds }).unwrap();
        toast.success("Modules reordered successfully");
      } catch (error) {
        toast.error("Failed to reorder modules");
        refetch();
      }
    }
  };

  // Add new module
  const addModule = () => {
    const newModule = createEmptyModule(modules.length);
    setModules([...modules, newModule]);
  };

  // Update module
  const handleUpdateModule = (index: number, updatedModule: ModuleFormData) => {
    const newModules = [...modules];
    newModules[index] = updatedModule;
    setModules(newModules);
  };

  // Save module
  const handleSaveModule = async (index: number) => {
    const module = modules[index];
    if (!module.title.trim()) {
      toast.error("Module title is required");
      return;
    }

    setSavingModuleId(module._id || `new_${index}`);

    try {
      let updatedModuleState = { ...module };
      let moduleId = module._id;

      // STEP 1: Ensure Module Exists (Break Circular Dependency)
      if (!moduleId) {
        const initialPayload = {
          title: module.title,
          description: module.description || undefined,
          lessons: module.lessons.map((l, idx) => ({
            title: l.title,
            description: l.description || undefined,
            type: l.type,
            contentUrl: l.contentUrl || undefined,
            videoId: l.videoId || undefined,
            duration: l.duration || undefined,
            order: idx,
            isFree: l.isFree,
            videoProvider: l.videoProvider,
            vdocipherVideoId: l.vdocipherVideoId,
          })),
          unlockType: module.unlockType,
          unlockDate: module.unlockDate || undefined,
          unlockDaysAfterEnrollment:
            module.unlockDaysAfterEnrollment || undefined,
          unlockDaysAfterBatchStart:
            module.unlockDaysAfterBatchStart || undefined,
          isPublished: module.isPublished,
          order: index,
        };

        const result = await createModule({
          batchId,
          data: initialPayload,
        }).unwrap();
        moduleId = result.data._id;
        updatedModuleState = { ...updatedModuleState, _id: moduleId };

        const newModules = [...modules];
        newModules[index] = { ...module, _id: moduleId };
        setModules(newModules);
      }

      // STEP 2: Handle Quiz Persistence
      let finalQuizId = module.quizId;
      if (module.quiz) {
        const quizPayload = {
          ...module.quiz,
          courseId,
          moduleId: moduleId,
          quizType: "module",
        };

        if (module.quiz._id) {
          await updateQuiz({
            id: module.quiz._id,
            ...quizPayload,
          } as any).unwrap();
          finalQuizId = module.quiz._id;
        } else {
          const result = await createQuiz(quizPayload as any).unwrap();
          finalQuizId = result.quiz._id;

          updatedModuleState = {
            ...updatedModuleState,
            quiz: { ...module.quiz, _id: finalQuizId },
            quizId: finalQuizId,
          };
        }
      }

      // STEP 3: Handle Assignment Persistence
      let finalAssignmentId = module.assignmentId;
      if (module.assignment) {
        const existingServerFiles = (module.assignment.referenceFiles || [])
          .filter((f: any) => f.fileUrl && !f.fileUrl.startsWith("blob:"))
          .map((f: any) => ({
            fileName: f.fileName,
            fileUrl: f.fileUrl,
            fileSize: f.fileSize,
            mimeType: f.mimeType,
            uploadedAt: f.uploadedAt,
          }));

        const assignmentPayload = {
          ...module.assignment,
          referenceFiles: existingServerFiles,
          courseId,
          batchId,
          moduleId: moduleId,
        };

        if (module.assignment._id) {
          await updateAssignment({
            id: module.assignment._id,
            ...assignmentPayload,
          } as any).unwrap();
          finalAssignmentId = module.assignment._id;
        } else {
          const result = await createAssignment(
            assignmentPayload as any,
          ).unwrap();
          finalAssignmentId = result._id;

          updatedModuleState = {
            ...updatedModuleState,
            assignment: { ...module.assignment, _id: finalAssignmentId },
            assignmentId: finalAssignmentId,
          };
        }

        // Upload new files
        const refFiles = module.assignment.referenceFiles || [];
        const newFilesToUpload = refFiles.filter(
          (f: any) => f._file || (f.fileUrl && f.fileUrl.startsWith("blob:")),
        );

        if (newFilesToUpload.length > 0 && finalAssignmentId) {
          try {
            const formData = new FormData();
            for (const file of newFilesToUpload) {
              if ((file as any)._file) {
                formData.append("files", (file as any)._file);
              }
            }
            if (formData.has("files")) {
              await uploadReferenceFiles({
                assignmentId: finalAssignmentId,
                files: formData,
              }).unwrap();
            }
          } catch (uploadError) {
            console.error("Error uploading files:", uploadError);
            toast.error("Failed to upload reference files");
          }
        }
      }

      // STEP 4: Final Update of Module (Link Quiz/Assignment)
      const finalPayload = {
        title: updatedModuleState.title,
        description: updatedModuleState.description || undefined,
        lessons: updatedModuleState.lessons.map((l, idx) => ({
          title: l.title,
          description: l.description || undefined,
          type: l.type,
          contentUrl: l.contentUrl || undefined,
          videoId: l.videoId || undefined,
          duration: l.duration || undefined,
          order: idx,
          isFree: l.isFree,
          videoProvider: l.videoProvider,
          vdocipherVideoId: l.vdocipherVideoId,
        })),
        quizId: finalQuizId?.trim() || undefined,
        assignmentId: finalAssignmentId?.trim() || undefined,
        unlockType: updatedModuleState.unlockType,
        unlockDate: updatedModuleState.unlockDate || undefined,
        unlockDaysAfterEnrollment:
          updatedModuleState.unlockDaysAfterEnrollment || undefined,
        unlockDaysAfterBatchStart:
          updatedModuleState.unlockDaysAfterBatchStart || undefined,
        isPublished: updatedModuleState.isPublished,
        order: index,
      };

      if (moduleId) {
        await updateModule({
          batchId,
          moduleId: moduleId,
          data: finalPayload,
        }).unwrap();
        toast.success("Module saved successfully");
      }

      handleUpdateModule(index, { ...updatedModuleState, isDirty: false });
      refetch();
    } catch (error: any) {
      console.error("Save Error:", JSON.stringify(error, null, 2), error);

      // 1. Validation Errors (400 Bad Request from Zod/Backend)
      // 1. Validation Errors (400 Bad Request from Zod/Backend)
      const validationErrors = error?.data?.errorSources || error?.data?.errors;

      if (validationErrors && Array.isArray(validationErrors)) {
        const errorMessages = validationErrors
          .map((err: any) => {
            // Handle both 'path' (backend standard) and 'field' (legacy/screenshot)
            const rawField = err.path || err.field; // Don't default to "Field" yet
            let field = rawField ? String(rawField).replace("body.", "") : "";
            let locationPrefix = "";

            // Check if error is inside a lesson array (e.g., lessons[0].title or lessons.0.title)
            const lessonMatch = field.match(/^lessons[\[\.](\d+)[\]\.]?(.*)/);
            if (lessonMatch) {
              const lessonIndex = parseInt(lessonMatch[1]);
              const subField = lessonMatch[2].replace(/^\./, ""); // Remove leading dot if present

              // Only add Lesson prefix if specific lesson is identified
              locationPrefix = `Lesson ${lessonIndex + 1}`;
              field = subField; // Update field to be the relative field name
            }

            // Map technical field names to user-friendly labels
            const fieldMap: Record<string, string> = {
              title: "Module Title",
              description: "Description",
              lessons: "Lessons List",
              type: "Type",
              contentUrl: "Content/Video URL",
              duration: "Duration",
              // Assignment fields (inside module)
              "assignment.title": "Assignment Title",
              "assignment.description": "Assignment Description",
              "assignment.instructions": "Assignment Instructions",
              "assignment.dueDate": "Due Date",
              "assignment.totalPoints": "Total Points",
              "assignment.passingPoints": "Passing Points",
              "assignment.maxFileSize": "Max File Size",
              // Quiz fields (inside module)
              "quiz.title": "Quiz Title",
              "quiz.description": "Quiz Description",
              "quiz.passingPercentage": "Quiz Passing Percentage",
              "quiz.timeLimit": "Quiz Time Limit",
              moduleId: "Module ID",
            };

            const friendlyField = fieldMap[field] || field;

            // Remove "Field: " prefix if present in the message itself
            const message = err.message.replace(/^Field: /, "");

            // Construct final string: "Lesson 1 - Title: is required" or "Title: is required"
            // Grammar fix: "Title: is required" -> "Title is required"
            const trimmedMessage = message.trim();
            const separator = trimmedMessage.startsWith("is ") ? " " : ": ";

            if (!friendlyField) {
              return `• ${trimmedMessage}`;
            }

            return locationPrefix
              ? `• ${locationPrefix} - ${friendlyField}${separator}${trimmedMessage}`
              : `• ${friendlyField}${separator}${trimmedMessage}`;
          })
          .join("\n");

        toast.error(`Issues Found in Module ${index + 1}: \n${errorMessages}`, {
          duration: 6000,
          style: { minWidth: "350px", whiteSpace: "pre-line" },
        });
      }
      // 2. Standard Backend Error Message
      else if (error?.data?.message) {
        toast.error(`Error: ${error.data.message}`);
      }
      // 3. RTK Query / Network Errors
      else if (error?.error) {
        toast.error(`Network Error: ${error.error}`);
      }
      // 4. Standard JS Error
      else if (error?.message) {
        toast.error(`Unexpected Error: ${error.message}`);
      }
      // 5. Fallback
      else {
        toast.error("Failed to save module. Check console for details.");
      }
    } finally {
      setSavingModuleId(null);
    }
  };

  // Delete module
  const handleDeleteModule = async (index: number) => {
    const module = modules[index];
    if (
      !window.confirm(
        `Are you sure you want to delete "${module.title || "this module"}"?`,
      )
    ) {
      return;
    }

    if (module._id) {
      try {
        await deleteModule({ batchId, moduleId: module._id }).unwrap();
        toast.success("Module deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete module");
        return;
      }
    }
    setModules(modules.filter((_, i) => i !== index));
  };

  // Remove assignment from module (delete from DB + unlink from module)
  const handleRemoveAssignment = async (moduleIndex: number) => {
    const module = modules[moduleIndex];

    // Ask for confirmation first
    if (
      !window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone.",
      )
    ) {
      return;
    }

    const assignmentId = module.assignment?._id || module.assignmentId;

    // Optimistically clear from local state
    const updatedModule = {
      ...module,
      assignment: null,
      assignmentId: undefined,
      isDirty: false,
    };
    handleUpdateModule(moduleIndex, updatedModule);

    // Delete the assignment record from DB if it exists
    if (assignmentId) {
      try {
        await deleteAssignment(assignmentId).unwrap();
        toast.success("Assignment deleted");
      } catch (error) {
        toast.error("Failed to delete assignment");
      }
    }

    // Unlink assignment from the module in DB
    if (module._id) {
      try {
        await updateModule({
          batchId,
          moduleId: module._id,
          data: {
            title: module.title,
            description: module.description || undefined,
            lessons: module.lessons.map((l, idx) => ({
              title: l.title,
              description: l.description || undefined,
              type: l.type,
              contentUrl: l.contentUrl || undefined,
              videoId: l.videoId || undefined,
              duration: l.duration || undefined,
              order: idx,
              isFree: l.isFree,
              videoProvider: l.videoProvider,
              vdocipherVideoId: l.vdocipherVideoId,
            })),
            assignmentId: null as any,
            quizId: module.quizId?.trim() || undefined,
            unlockType: module.unlockType,
            unlockDate: module.unlockDate || undefined,
            unlockDaysAfterEnrollment:
              module.unlockDaysAfterEnrollment || undefined,
            unlockDaysAfterBatchStart:
              module.unlockDaysAfterBatchStart || undefined,
            isPublished: module.isPublished,
            order: moduleIndex,
          },
        }).unwrap();
      } catch (error) {
        toast.error("Failed to unlink assignment from module");
      }
    }
  };

  // Remove quiz from module (delete from DB + unlink from module)
  const handleRemoveQuiz = async (moduleIndex: number) => {
    const module = modules[moduleIndex];

    if (
      !window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone.",
      )
    ) {
      return;
    }

    const quizId = module.quiz?._id || module.quizId;

    // Optimistically clear from local state
    const updatedModule = {
      ...module,
      quiz: null,
      quizId: undefined,
      isDirty: false,
    };
    handleUpdateModule(moduleIndex, updatedModule);

    // Delete the quiz record from DB if it exists
    if (quizId) {
      try {
        await deleteQuizMutation(quizId).unwrap();
        toast.success("Quiz deleted");
      } catch (error) {
        toast.error("Failed to delete quiz");
      }
    }

    // Unlink quiz from the module in DB
    if (module._id) {
      try {
        await updateModule({
          batchId,
          moduleId: module._id,
          data: {
            title: module.title,
            description: module.description || undefined,
            lessons: module.lessons.map((l, idx) => ({
              title: l.title,
              description: l.description || undefined,
              type: l.type,
              contentUrl: l.contentUrl || undefined,
              videoId: l.videoId || undefined,
              duration: l.duration || undefined,
              order: idx,
              isFree: l.isFree,
              videoProvider: l.videoProvider,
              vdocipherVideoId: l.vdocipherVideoId,
            })),
            quizId: null as any,
            assignmentId: module.assignmentId?.trim() || undefined,
            unlockType: module.unlockType,
            unlockDate: module.unlockDate || undefined,
            unlockDaysAfterEnrollment:
              module.unlockDaysAfterEnrollment || undefined,
            unlockDaysAfterBatchStart:
              module.unlockDaysAfterBatchStart || undefined,
            isPublished: module.isPublished,
            order: moduleIndex,
          },
        }).unwrap();
      } catch (error) {
        toast.error("Failed to unlink quiz from module");
      }
    }
  };

  // Save all modules
  const saveAllModules = async () => {
    const unsavedModules = modules.filter((m) => m.isDirty);
    if (unsavedModules.length === 0) {
      toast("No unsaved changes");
      return;
    }
    for (let i = 0; i < modules.length; i++) {
      if (modules[i].isDirty) {
        await handleSaveModule(i);
      }
    }
  };

  // Stats
  const stats: ModuleStats = useMemo(() => {
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const publishedModules = modules.filter((m) => m.isPublished).length;
    const unsavedModules = modules.filter((m) => m.isDirty).length;
    return {
      total: modules.length,
      totalLessons,
      publishedModules,
      unsavedModules,
    };
  }, [modules]);

  // File Upload Handler
  const [uploadLessonFile] = useUploadLessonFileMutation();

  const handleUploadFile = async (file: File): Promise<string> => {
    try {
      const result = await uploadLessonFile({ batchId, file }).unwrap();
      return result.data.fileUrl;
    } catch (error) {
      console.error(
        "File upload failed:",
        JSON.stringify(error, null, 2),
        error,
      );
      toast.error("Failed to upload file");
      throw error;
    }
  };

  // ==================== RENDER: Delegate to View ====================
  return (
    <BatchModuleManagerV2View
      modules={modules}
      stats={stats}
      isLoading={isLoading}
      savingModuleId={savingModuleId}
      batchId={batchId}
      courseId={courseId}
      onAddModule={addModule}
      onUpdateModule={handleUpdateModule}
      onDeleteModule={handleDeleteModule}
      onRemoveAssignment={handleRemoveAssignment}
      onRemoveQuiz={handleRemoveQuiz}
      onSaveModule={handleSaveModule}
      onSaveAll={saveAllModules}
      onModuleDragEnd={handleModuleDragEnd}
      onShowCopyModal={() => setShowCopyModal(true)}
      onCloseCopyModal={() => setShowCopyModal(false)}
      showCopyModal={showCopyModal}
      onUploadLessonFile={handleUploadFile}
    />
  );
}

export default BatchModuleManagerV2;
