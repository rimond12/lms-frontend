/**
 * BatchModuleManagerV2OLD - Full Page Professional Module Manager
 * Features: Drag & Drop, Inline Editing, Quiz/Assignment Support, Copy Modules
 * Design: Compact, Numbered Steps (2.1, 2.2), Clean UI
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Save,
  Trash2,
  GripVertical,
  BookOpen,
  FileText,
  Video,
  Link2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  AlertCircle,
  Loader2,
  CheckCircle,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import VdoCipherPreview from "@/components/video/VdoCipherPreview";
import {
  useGetBatchModulesQuery,
  useCreateBatchModuleMutation,
  useUpdateBatchModuleMutation,
  useDeleteBatchModuleMutation,
  useReorderBatchModulesMutation,
  IBatchModule,
  UnlockType,
} from "@/app/redux/api/batchModuleApi/batchModuleApi";
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
} from "@/app/redux/api/QuizApi/quizApi";
import {
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useUploadReferenceFilesMutation,
} from "@/app/redux/api/AssignmentApi/AssignmentApi";
import CopyModulesModal from "./CopyModulesModal";
import ModuleQuizEditor, {
  ModuleQuiz,
} from "@/components/admin/shared/module-editors/ModuleQuizEditor";
import ModuleAssignmentEditor, {
  ModuleAssignment,
} from "@/components/admin/shared/module-editors/ModuleAssignmentEditor";

// ==================== TYPES ====================

interface ModuleFormData {
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

interface LessonFormData {
  _id?: string;
  tempId: string;
  title: string;
  description: string;
  type: "video" | "pdf" | "doc" | "link" | "file";
  // Video provider type (youtube, vdocipher, or direct file)
  videoProvider?: "youtube" | "vdocipher" | "direct";
  // VdoCipher Video ID (only used when videoProvider is 'vdocipher')
  vdocipherVideoId?: string;
  contentUrl: string;
  videoId?: string;
  duration: number;
  order: number;
  isFree: boolean;
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

const createEmptyLesson = (order: number): LessonFormData => ({
  tempId: generateTempId(),
  title: "",
  description: "",
  type: "video",
  contentUrl: "",
  duration: 0,
  order,
  isFree: false,
});

// ==================== SORTABLE LESSON ITEM ====================

interface SortableLessonItemProps {
  lesson: LessonFormData;
  moduleNumber: number;
  lessonNumber: number;
  onUpdate: (lesson: LessonFormData) => void;
  onDelete: () => void;
}

const SortableLessonItem = ({
  lesson,
  moduleNumber,
  lessonNumber,
  onUpdate,
  onDelete,
}: SortableLessonItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.tempId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeIcons = {
    video: Video,
    pdf: FileText,
    doc: FileText,
    link: Link2,
    file: FileText,
  };
  const Icon = typeIcons[lesson.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors ${
        isDragging ? "ring-2 ring-indigo-500 shadow-lg z-10" : ""
      }`}
    >
      <div className="flex items-center gap-2 p-2">
        {/* Drag Handle & Number */}
        <div className="flex items-center gap-2 text-gray-400">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-50 rounded"
          >
            <GripVertical size={14} />
          </button>
          <span className="text-xs font-mono font-medium text-gray-500 w-8">
            {moduleNumber}.{lessonNumber}
          </span>
        </div>

        {/* Type Icon */}
        <div className="p-1.5 bg-gray-50 rounded text-gray-500">
          <Icon size={14} />
        </div>

        {/* Title & Type Select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="relative group">
            <select
              value={lesson.type}
              onChange={(e) =>
                onUpdate({ ...lesson, type: e.target.value as any })
              }
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="doc">Doc</option>
              <option value="link">Link</option>
            </select>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 group-hover:border-indigo-200 transition-colors">
              {lesson.type.toUpperCase()}
            </span>
          </div>

          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdate({ ...lesson, title: e.target.value })}
            placeholder="Lesson title..."
            className="flex-1 bg-transparent border-0 p-0 text-sm font-medium focus:ring-0 placeholder:text-gray-300"
          />
        </div>

        {/* Meta Controls (Duration, URL, Free) */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1 text-gray-400"
            title="Duration (mins)"
          >
            <Clock size={12} />
            <input
              type="number"
              value={lesson.duration || ""}
              onChange={(e) =>
                onUpdate({ ...lesson, duration: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              className="w-8 bg-transparent border-0 p-0 text-xs text-center focus:ring-0 text-gray-600"
            />
            <span className="text-[10px]">m</span>
          </div>

          <label
            className="flex items-center gap-1.5 cursor-pointer"
            title="Free Preview"
          >
            <input
              type="checkbox"
              checked={lesson.isFree}
              onChange={(e) =>
                onUpdate({ ...lesson, isFree: e.target.checked })
              }
              className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ring-offset-0"
            />
            <span className="text-xs text-gray-500">Free</span>
          </label>

          <div className="h-4 w-px bg-gray-200" />

          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content URL & Video Provider */}
      <div className="px-9 pb-2 space-y-2">
        {/* Video Provider Selector (only for video type) */}
        {lesson.type === "video" && (
          <div className="flex items-center gap-2">
            <select
              value={lesson.videoProvider || "youtube"}
              onChange={(e) =>
                onUpdate({
                  ...lesson,
                  videoProvider: e.target.value as
                    | "youtube"
                    | "vdocipher"
                    | "direct",
                  // Clear VdoCipher ID if switching away
                  vdocipherVideoId:
                    e.target.value === "vdocipher"
                      ? lesson.vdocipherVideoId
                      : undefined,
                })
              }
              className="bg-gray-50 border-0 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="youtube">📺 YouTube</option>
              <option value="vdocipher">🔒 VdoCipher (Secure)</option>
              <option value="direct">🎬 Direct URL</option>
            </select>
            {lesson.videoProvider === "vdocipher" && (
              <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-medium">
                DRM Protected
              </span>
            )}
          </div>
        )}

        {/* VdoCipher Video ID Input */}
        {lesson.type === "video" && lesson.videoProvider === "vdocipher" ? (
          <>
            <input
              type="text"
              value={lesson.vdocipherVideoId || ""}
              onChange={(e) =>
                onUpdate({
                  ...lesson,
                  vdocipherVideoId: e.target.value,
                  contentUrl: e.target.value, // Also set contentUrl for compatibility
                })
              }
              placeholder="VdoCipher Video ID (32 characters)..."
              className="flex-1 w-full bg-gray-50 border-0 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-300 font-mono"
            />
            {/* Video Preview */}
            {lesson.vdocipherVideoId &&
              lesson.vdocipherVideoId.length >= 10 && (
                <VdoCipherPreview videoId={lesson.vdocipherVideoId} />
              )}
          </>
        ) : (
          /* Regular URL Input */
          <input
            type="text"
            value={lesson.contentUrl}
            onChange={(e) =>
              onUpdate({ ...lesson, contentUrl: e.target.value })
            }
            placeholder={
              lesson.type === "video"
                ? lesson.videoProvider === "youtube"
                  ? "YouTube URL..."
                  : "Video URL..."
                : "Resource URL..."
            }
            className="flex-1 w-full bg-gray-50 border-0 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-300"
          />
        )}
      </div>
    </div>
  );
};

// ==================== ASSESSMENT ITEM (Quiz/Assignment) ====================

const AssessmentItem = ({
  type,
  id,
  moduleNumber,
  itemNumber,
  onUpdateId,
  onDelete,
}: {
  type: "quiz" | "assignment";
  id: string;
  moduleNumber: number;
  itemNumber: number;
  onUpdateId: (id: string) => void;
  onDelete: () => void;
}) => {
  const Icon = type === "quiz" ? GraduationCap : ClipboardList;
  const colorClass = type === "quiz" ? "purple" : "amber";
  const label = type === "quiz" ? "Quiz" : "Assignment";
  const createLink =
    type === "quiz"
      ? "/dashboard/quizes/create-quize"
      : "/dashboard/assignments/create";

  return (
    <div
      className={`bg-white rounded-lg border border-l-4 border-l-${colorClass}-500 border-gray-100 p-2 pl-3 hover:border-gray-300 transition-colors`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-medium text-gray-500 w-8">
          {moduleNumber}.{itemNumber}
        </span>

        <div
          className={`p-1 bg-${colorClass}-50 rounded text-${colorClass}-600`}
        >
          <Icon size={14} />
        </div>

        <div className="flex-1 flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider text-${colorClass}-700`}
          >
            {label}
          </span>
          <input
            type="text"
            value={id}
            onChange={(e) => onUpdateId(e.target.value)}
            placeholder={`Paste ${label} ID here...`}
            className="flex-1 bg-transparent border-0 p-0 text-sm focus:ring-0 placeholder:text-gray-300"
          />
          <Link
            href={createLink}
            target="_blank"
            className={`px-2 py-0.5 bg-${colorClass}-50 text-${colorClass}-700 text-[10px] uppercase font-bold rounded hover:bg-${colorClass}-100 transition-colors whitespace-nowrap tracking-wide`}
          >
            + New
          </Link>
        </div>

        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title={`Remove ${label}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ==================== MODULE CARD ====================

interface ModuleCardProps {
  module: ModuleFormData;
  index: number;
  onUpdate: (module: ModuleFormData) => void;
  onDelete: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const ModuleCard = ({
  module,
  index,
  onUpdate,
  onDelete,
  onSave,
  isSaving,
}: ModuleCardProps) => {
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module._id || `new_${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = module.lessons.findIndex((l) => l.tempId === active.id);
    const newIndex = module.lessons.findIndex((l) => l.tempId === over.id);

    const newLessons = arrayMove(module.lessons, oldIndex, newIndex).map(
      (l, idx) => ({
        ...l,
        order: idx,
      }),
    );

    onUpdate({ ...module, lessons: newLessons, isDirty: true });
  };

  const addLesson = () => {
    onUpdate({
      ...module,
      lessons: [...module.lessons, createEmptyLesson(module.lessons.length)],
      isDirty: true,
      // Auto expand if adding lesson
      isExpanded: true,
    });
  };

  const updateLesson = (idx: number, lesson: LessonFormData) => {
    const newLessons = [...module.lessons];
    newLessons[idx] = lesson;
    onUpdate({ ...module, lessons: newLessons, isDirty: true });
  };

  const deleteLesson = (idx: number) => {
    onUpdate({
      ...module,
      lessons: module.lessons
        .filter((_, i) => i !== idx)
        .map((l, i) => ({ ...l, order: i })),
      isDirty: true,
    });
  };

  // Calculate item numbering
  const moduleNum = index + 1;
  let itemCounter = 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border transition-all ${
        isDragging
          ? "border-indigo-500 shadow-xl scale-[1.01]"
          : module.isDirty
            ? "border-amber-400 ring-1 ring-amber-400"
            : "border-gray-200 shadow-sm"
      }`}
    >
      {/* Module Header - Compact */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg select-none"
        onClick={() => onUpdate({ ...module, isExpanded: !module.isExpanded })}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing hover:bg-gray-200/50 rounded"
        >
          <GripVertical size={18} />
        </button>

        {/* Module Number */}
        <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 flex items-center justify-center font-bold text-sm">
          {moduleNum}
        </div>

        {/* Title Input - Click propagation stopped so we can edit without collapsing */}
        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={module.title}
            onChange={(e) =>
              onUpdate({ ...module, title: e.target.value, isDirty: true })
            }
            placeholder="Module Title..."
            className="w-full text-base font-semibold bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-400"
          />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">
              {module.lessons.length} steps
            </span>
            {!module.isPublished && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                DRAFT
              </span>
            )}
            {module.isDirty && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">
                UNSAVED
              </span>
            )}
          </div>
        </div>

        {/* Actions - Stop propagation for buttons */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onSave}
            disabled={isSaving || !module.isDirty}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${module.isDirty ? "text-green-600 hover:bg-green-50" : "text-gray-300"}`}
            title="Save Module"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
          </button>

          <div className="h-6 w-px bg-gray-100 mx-1" />

          <button
            onClick={() =>
              onUpdate({ ...module, isExpanded: !module.isExpanded })
            }
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {module.isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>

          {/* Delete hidden in expanded usually, but here kept for access or moved to dropdown if needed. Kept simple for now. */}
          <button
            onClick={onDelete}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Module"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {module.isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          {/* Top Configuration Grid - Compact */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <textarea
                value={module.description}
                onChange={(e) =>
                  onUpdate({
                    ...module,
                    description: e.target.value,
                    isDirty: true,
                  })
                }
                placeholder="Module description (what students will learn)..."
                rows={2}
                className="w-full bg-white px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder:text-gray-300"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <select
                  value={module.unlockType}
                  onChange={(e) =>
                    onUpdate({
                      ...module,
                      unlockType: e.target.value as UnlockType,
                      isDirty: true,
                    })
                  }
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="immediate">Scan Unlock: Immediately</option>
                  <option value="fixed-date">Scan Unlock: Specific Date</option>
                  <option value="days-after-enrollment">
                    Scan Unlock: Days after Enrollment
                  </option>
                  <option value="days-after-batch-start">
                    Scan Unlock: Days after Start
                  </option>
                </select>

                {module.unlockType !== "immediate" && (
                  <div className="w-1/3">
                    {module.unlockType === "fixed-date" ? (
                      <input
                        type="datetime-local"
                        value={module.unlockDate?.slice(0, 16) || ""}
                        onChange={(e) =>
                          onUpdate({
                            ...module,
                            unlockDate: e.target.value,
                            isDirty: true,
                          })
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={
                            module.unlockType === "days-after-enrollment"
                              ? module.unlockDaysAfterEnrollment
                              : module.unlockDaysAfterBatchStart
                          }
                          onChange={(e) =>
                            onUpdate({
                              ...module,
                              [module.unlockType === "days-after-enrollment"
                                ? "unlockDaysAfterEnrollment"
                                : "unlockDaysAfterBatchStart"]:
                                parseInt(e.target.value) || 0,
                              isDirty: true,
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                          placeholder="0"
                        />
                        <span className="absolute right-8 top-2 text-xs text-gray-400">
                          days
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={module.isPublished}
                    onChange={(e) =>
                      onUpdate({
                        ...module,
                        isPublished: e.target.checked,
                        isDirty: true,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Is Published?
                </label>
              </div>
            </div>
          </div>

          {/* Module Content List */}
          <div className="space-y-4">
            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={module.lessons.map((l) => l.tempId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {module.lessons.map((lesson, idx) => {
                      itemCounter++; // Increment for each lesson
                      return (
                        <SortableLessonItem
                          key={lesson.tempId}
                          lesson={lesson}
                          moduleNumber={moduleNum}
                          lessonNumber={idx + 1}
                          onUpdate={(l) => updateLesson(idx, l)}
                          onDelete={() => deleteLesson(idx)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            {/* Quiz Section - Inline Editor */}
            <div className="mt-4">
              {showQuizEditor || module.quiz ? (
                <div className="mb-4">
                  <ModuleQuizEditor
                    quiz={module.quiz || null}
                    moduleTitle={module.title}
                    onSave={(updatedQuiz) => {
                      onUpdate({ ...module, quiz: updatedQuiz, isDirty: true });
                    }}
                    onRemove={() => {
                      onUpdate({
                        ...module,
                        quiz: null,
                        quizId: undefined,
                        isDirty: true,
                      });
                      setShowQuizEditor(false);
                    }}
                    isExpanded={showQuizEditor || !!module.quiz}
                  />
                </div>
              ) : module.quizId ? (
                // Fallback for existing ID-only quizzes
                <AssessmentItem
                  type="quiz"
                  id={module.quizId}
                  moduleNumber={moduleNum}
                  itemNumber={module.lessons.length + 1}
                  onUpdateId={(id) =>
                    onUpdate({ ...module, quizId: id, isDirty: true })
                  }
                  onDelete={() =>
                    onUpdate({ ...module, quizId: undefined, isDirty: true })
                  }
                />
              ) : null}

              {/* Assignment Section - Inline Editor */}
              {showAssignmentEditor || module.assignment ? (
                <div className="mb-4">
                  <ModuleAssignmentEditor
                    assignment={module.assignment || null}
                    moduleTitle={module.title}
                    onSave={(updatedAssignment) => {
                      onUpdate({
                        ...module,
                        assignment: updatedAssignment,
                        isDirty: true,
                      });
                    }}
                    onRemove={() => {
                      onUpdate({
                        ...module,
                        assignment: null,
                        assignmentId: undefined,
                        isDirty: true,
                      });
                      setShowAssignmentEditor(false);
                    }}
                    isExpanded={showAssignmentEditor || !!module.assignment}
                  />
                </div>
              ) : module.assignmentId ? (
                <AssessmentItem
                  type="assignment"
                  id={module.assignmentId}
                  moduleNumber={moduleNum}
                  itemNumber={module.lessons.length + (module.quizId ? 2 : 1)}
                  onUpdateId={(id) =>
                    onUpdate({ ...module, assignmentId: id, isDirty: true })
                  }
                  onDelete={() =>
                    onUpdate({
                      ...module,
                      assignmentId: undefined,
                      isDirty: true,
                    })
                  }
                />
              ) : null}
            </div>

            {/* Footer Add Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 border-dashed">
              <button
                onClick={addLesson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
              >
                <Plus size={14} /> Add Lesson
              </button>

              {!module.quizId && !module.quiz && !showQuizEditor && (
                <button
                  onClick={() => setShowQuizEditor(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <GraduationCap size={14} /> Add Quiz
                </button>
              )}

              {!module.assignmentId &&
                !module.assignment &&
                !showAssignmentEditor && (
                  <button
                    onClick={() => setShowAssignmentEditor(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                  >
                    <ClipboardList size={14} /> Add Assignment
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export function BatchModuleManagerV2OLD({
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
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [uploadReferenceFiles] = useUploadReferenceFilesMutation();

  // Initialize modules from API
  useEffect(() => {
    if (modulesData?.data) {
      const sorted = [...modulesData.data].sort((a, b) => a.order - b.order);
      setModules(sorted.map(convertModuleToForm));
    }
  }, [modulesData]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      // Prepare localized updates to state so we don't lose them
      let updatedModuleState = { ...module };
      let moduleId = module._id;

      // STEP 1: Ensure Module Exists (Break Circular Dependency)
      // If module is new, we MUST create it first to get an ID for the Quiz/Assignment
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
          // Don't send quizId/assignmentId yet as they might not exist
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

        // Update the main state immediately so if we fail later, we at least have the module created
        const newModules = [...modules];
        newModules[index] = { ...module, _id: moduleId };
        setModules(newModules);
      }

      // STEP 2: Handle Quiz Persistence
      let finalQuizId = module.quizId;
      if (module.quiz) {
        // Prepare quiz data
        const quizPayload = {
          ...module.quiz,
          courseId,
          moduleId: moduleId, // Pass the confirmed Module ID
          quizType: "module", // Explicitly set type to ensure backend validation passes
        };

        if (module.quiz._id) {
          // Update existing quiz
          await updateQuiz({
            id: module.quiz._id,
            ...quizPayload,
          } as any).unwrap();
          finalQuizId = module.quiz._id;
        } else {
          // Create new quiz
          const result = await createQuiz(quizPayload as any).unwrap();
          // Fix: Extract ID correctly from response structure
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
        // Filter out blob URLs - only keep already uploaded files
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
          moduleId: moduleId, // Link assignment to module
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
      // We always define the payload fully to ensure everything is synced
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

      // Since we ensured moduleId exists in Step 1, this is effectively an update
      if (moduleId) {
        await updateModule({
          batchId,
          moduleId: moduleId,
          data: finalPayload,
        }).unwrap();
        toast.success("Module saved successfully");
      }

      // Final local state update
      handleUpdateModule(index, { ...updatedModuleState, isDirty: false });
      refetch();
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error?.data?.message || "Failed to save module");
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
  const stats = useMemo(() => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats & Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4  z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Modules</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {stats.totalLessons}
              </p>
              <p className="text-xs text-gray-500">Lessons</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.publishedModules}
              </p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
            {stats.unsavedModules > 0 && (
              <>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.unsavedModules}
                  </p>
                  <p className="text-xs text-gray-500">Unsaved</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCopyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              <Copy size={18} />
              Copy Modules
            </button>
            {stats.unsavedModules > 0 && (
              <button
                onClick={saveAllModules}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <Save size={18} />
                Save All
              </button>
            )}
            <button
              onClick={addModule}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Plus size={18} />
              Add Module
            </button>
          </div>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Modules Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start building your course content by adding modules. Each module
            can contain multiple lessons, quiz, and assignment.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowCopyModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              <Copy size={18} />
              Copy From Other Batch
            </button>
            <button
              onClick={addModule}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Plus size={18} />
              Create First Module
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext
            items={modules.map((m, idx) => m._id || `new_${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {modules.map((module, idx) => (
                <ModuleCard
                  key={module._id || `new_${idx}`}
                  module={module}
                  index={idx}
                  onUpdate={(m) => handleUpdateModule(idx, m)}
                  onDelete={() => handleDeleteModule(idx)}
                  onSave={() => handleSaveModule(idx)}
                  isSaving={savingModuleId === (module._id || `new_${idx}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Module Button at Bottom */}
      {modules.length > 0 && (
        <div className="text-center py-6">
          <button
            onClick={addModule}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
          >
            <Plus size={18} />
            Add Another Module
          </button>
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <CopyModulesModal
          targetBatchId={batchId}
          courseId={courseId}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  );
}

export default BatchModuleManagerV2OLD;
