/**
 * BatchModuleManagerV2View - Presentational Component
 * Contains all UI rendering: ModuleCard, SortableLessonItem, AssessmentItem
 * No API calls or business logic here - all passed as props from Container
 */

"use client";

import React, { useState } from "react";
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
  Loader2,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import VdoCipherPreview from "@/components/video/VdoCipherPreview";
import { UnlockType } from "@/app/redux/api/batchModuleApi/batchModuleApi";
import ModuleQuizEditor from "@/components/admin/shared/module-editors/ModuleQuizEditor";
import ModuleAssignmentEditor from "@/components/admin/shared/module-editors/ModuleAssignmentEditor";
import CopyModulesModal from "./CopyModulesModal";
import { getFullDocumentUrl } from "@/utils/imageUtils";

// ==================== TYPES (shared with Container) ====================

import type {
  ModuleFormData,
  LessonFormData,
  ModuleStats,
} from "./BatchModuleManagerV2";

// ==================== VIEW PROPS ====================

export interface BatchModuleManagerV2ViewProps {
  // Data
  modules: ModuleFormData[];
  stats: ModuleStats;
  isLoading: boolean;
  savingModuleId: string | null;
  batchId: string;
  courseId: string;

  // Actions
  onAddModule: () => void;
  onUpdateModule: (index: number, module: ModuleFormData) => void;
  onDeleteModule: (index: number) => void;
  onRemoveAssignment: (moduleIndex: number) => void;
  onSaveModule: (index: number) => void;
  onSaveAll: () => void;
  onModuleDragEnd: (event: DragEndEvent) => void;
  onShowCopyModal: () => void;
  onCloseCopyModal: () => void;
  showCopyModal: boolean;
  onUploadLessonFile: (file: File) => Promise<string>;
  onRemoveQuiz: (moduleIndex: number) => void;
}

// ==================== HELPER ====================

const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const createEmptyLesson = (order: number): LessonFormData => ({
  tempId: generateTempId(),
  title: "",
  description: "",
  type: "video",
  contentUrl: "",
  duration: 0,
  order,
  isFree: false,
  videoProvider: "vdocipher", // Default to VdoCipher
});

// ==================== SORTABLE LESSON ITEM ====================

interface SortableLessonItemProps {
  lesson: LessonFormData;
  moduleNumber: number;
  lessonNumber: number;
  onUpdate: (lesson: LessonFormData) => void;
  onDelete: () => void;
  onUploadFile: (file: File) => Promise<string>;
}

const SortableLessonItem = ({
  lesson,
  moduleNumber,
  lessonNumber,
  onUpdate,
  onDelete,
  onUploadFile,
}: SortableLessonItemProps) => {
  const [isUploading, setIsUploading] = useState(false);
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
    file: ClipboardList, // Using generic file icon
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
              <option value="video">🎥 Video Lesson</option>
              {/* <option value="pdf">PDF</option>
              <option value="doc">Doc</option> */}
              <option value="link">🔗 External Link</option>
              <option value="file">📁 File/Image </option>
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
                  vdocipherVideoId:
                    e.target.value === "vdocipher"
                      ? lesson.vdocipherVideoId
                      : undefined,
                })
              }
              className="bg-gray-50 border-0 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="vdocipher">🔒 VdoCipher (Secure / Paid)</option>

              <option value="youtube">📺 YouTube (Free / Public)</option>
              <option value="direct">🎬 Video Link (MP4 / Server)</option>
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
                  contentUrl: e.target.value,
                })
              }
              placeholder="VdoCipher Video ID (32 characters)..."
              className="flex-1 w-full bg-gray-50 border-0 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-300 font-mono"
            />
            {lesson.vdocipherVideoId &&
              lesson.vdocipherVideoId.length >= 10 && (
                <VdoCipherPreview videoId={lesson.vdocipherVideoId} />
              )}
          </>
        ) : lesson.type === "file" ? (
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    try {
                      const url = await onUploadFile(file);
                      onUpdate({
                        ...lesson,
                        contentUrl: url,
                        // Optionally update title if empty
                        title: lesson.title || file.name,
                      });
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-500 w-full">
                {isUploading ? (
                  <>
                    <Loader2
                      size={12}
                      className="animate-spin text-indigo-500"
                    />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <ClipboardList size={14} className="text-gray-400" />
                    <span className="truncate flex-1">
                      {lesson.contentUrl
                        ? lesson.contentUrl.split("/").pop()
                        : "Click to upload file"}
                    </span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-medium border border-indigo-100 uppercase">
                      Upload
                    </span>
                  </>
                )}
              </div>
            </div>
            {lesson.contentUrl && (
              <a
                href={getFullDocumentUrl(lesson.contentUrl)}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded border border-transparent hover:border-indigo-100 transition-colors"
                title="View/Download File"
              >
                <Link2 size={14} />
              </a>
            )}
          </div>
        ) : (
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
  onUploadLessonFile: (file: File) => Promise<string>;
  onRemoveAssignment: () => void;
  onRemoveQuiz: () => void;
}

const ModuleCard = ({
  module,
  index,
  onUpdate,
  onDelete,
  onSave,
  isSaving,
  onUploadLessonFile,
  onRemoveAssignment,
  onRemoveQuiz,
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

        {/* Title Input */}
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

        {/* Actions */}
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
                      itemCounter++;
                      return (
                        <SortableLessonItem
                          key={lesson.tempId}
                          lesson={lesson}
                          moduleNumber={moduleNum}
                          lessonNumber={idx + 1}
                          onUpdate={(l) => updateLesson(idx, l)}
                          onDelete={() => deleteLesson(idx)}
                          onUploadFile={onUploadLessonFile}
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
                    onRemove={onRemoveQuiz}
                    isExpanded={showQuizEditor || !!module.quiz}
                  />
                </div>
              ) : module.quizId ? (
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
                    onRemove={onRemoveAssignment}
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

// ==================== MAIN VIEW COMPONENT ====================

export default function BatchModuleManagerV2View({
  modules,
  stats,
  isLoading,
  savingModuleId,
  batchId,
  courseId,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onRemoveAssignment,
  onSaveModule,
  onSaveAll,
  onModuleDragEnd,
  onShowCopyModal,
  onCloseCopyModal,
  showCopyModal,
  onRemoveQuiz,
  onUploadLessonFile,
}: BatchModuleManagerV2ViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
              onClick={onShowCopyModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              <Copy size={18} />
              Copy Modules
            </button>
            {stats.unsavedModules > 0 && (
              <button
                onClick={onSaveAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <Save size={18} />
                Save All
              </button>
            )}
            <button
              onClick={onAddModule}
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
              onClick={onShowCopyModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              <Copy size={18} />
              Copy From Other Batch
            </button>
            <button
              onClick={onAddModule}
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
          onDragEnd={onModuleDragEnd}
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
                  onUpdate={(m) => onUpdateModule(idx, m)}
                  onDelete={() => onDeleteModule(idx)}
                  onSave={() => onSaveModule(idx)}
                  isSaving={savingModuleId === (module._id || `new_${idx}`)}
                  onUploadLessonFile={onUploadLessonFile}
                  onRemoveAssignment={() => onRemoveAssignment(idx)}
                  onRemoveQuiz={() => onRemoveQuiz(idx)}
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
            onClick={onAddModule}
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
          onClose={onCloseCopyModal}
        />
      )}
    </div>
  );
}
