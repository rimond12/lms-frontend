"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Link as LinkIcon,
  Upload,
  GripVertical,
  BookOpen,
  Clock,
  Eye,
  FolderOpen,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import ModuleQuizEditor, {
  ModuleQuiz,
} from "@/components/admin/shared/module-editors/ModuleQuizEditor";
import ModuleAssignmentEditor, {
  ModuleAssignment,
} from "@/components/admin/shared/module-editors/ModuleAssignmentEditor";

// ==================== TYPES ====================
interface Lesson {
  _id?: string;
  title: string;
  description?: string;
  type: "video" | "pdf" | "doc" | "link";
  // Video provider type (youtube, vdocipher, or direct file)
  videoProvider?: "youtube" | "vdocipher" | "direct";
  // VdoCipher Video ID (only used when videoProvider is 'vdocipher')
  vdocipherVideoId?: string;
  contentUrl: string;
  duration?: number;
  order?: number;
  isFree?: boolean;
}

interface ModuleResource {
  _id?: string;
  title: string;
  fileUrl: string;
  type?: "pdf" | "doc" | "zip" | "link" | "other";
}

export interface Module {
  _id?: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  resources?: ModuleResource[];
  quiz?: ModuleQuiz | null; // Embedded quiz instead of quizId
  assignment?: ModuleAssignment | null; // Embedded assignment
  order?: number;
  isLocked?: boolean;
}

interface ModulesStepProps {
  data: Module[];
  onUpdate: (data: Module[]) => void;
}

const LESSON_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "doc", label: "Document", icon: FileText },
  { value: "link", label: "External Link", icon: LinkIcon },
];

// ==================== LESSON CARD ====================
const LessonCard: React.FC<{
  lesson: Lesson;
  lessonIndex: number;
  moduleIndex: number;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}> = ({
  lesson,
  lessonIndex,
  moduleIndex,
  onUpdate,
  onRemove,
  onUpload,
  isUploading,
}) => {
  const LessonIcon =
    LESSON_TYPES.find((t) => t.value === lesson.type)?.icon || Video;

  // Lesson number in X.Y format
  const lessonNumber = `${moduleIndex + 1}.${lessonIndex + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border-l-4 border-l-blue-500 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Lesson Number Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm">
            {lessonNumber}
          </span>
          <GripVertical size={14} className="text-gray-300 cursor-grab" />
        </div>

        <div className="flex-1 space-y-3">
          {/* Lesson Type & Title Row */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3">
              <select
                value={lesson.type}
                onChange={(e) => onUpdate("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LESSON_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-9">
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => onUpdate("title", e.target.value)}
                placeholder="Lesson title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content URL / File Upload */}
          <div className="flex flex-col gap-2">
            {lesson.type === "video" ? (
              <>
                {/* Video Provider Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={lesson.videoProvider || "youtube"}
                    onChange={(e) => onUpdate("videoProvider", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="youtube">📺 YouTube</option>
                    <option value="vdocipher">🔒 VdoCipher (Secure)</option>
                    <option value="direct">🎬 Direct URL</option>
                  </select>
                  {lesson.videoProvider === "vdocipher" && (
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded font-medium">
                      DRM Protected
                    </span>
                  )}
                </div>

                {/* VdoCipher Video ID or Regular URL */}
                {lesson.videoProvider === "vdocipher" ? (
                  <input
                    type="text"
                    value={lesson.vdocipherVideoId || ""}
                    onChange={(e) => {
                      onUpdate("vdocipherVideoId", e.target.value);
                      onUpdate("contentUrl", e.target.value);
                    }}
                    placeholder="VdoCipher Video ID (32 characters)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    value={lesson.contentUrl}
                    onChange={(e) => onUpdate("contentUrl", e.target.value)}
                    placeholder={
                      lesson.videoProvider === "youtube"
                        ? "YouTube URL"
                        : "Video URL (direct link)"
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </>
            ) : lesson.type === "link" ? (
              <input
                type="text"
                value={lesson.contentUrl}
                onChange={(e) => onUpdate("contentUrl", e.target.value)}
                placeholder="External URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex-1">
                {lesson.contentUrl ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <FileText size={16} className="text-green-600" />
                    <span className="text-sm text-green-700 truncate flex-1">
                      {lesson.contentUrl.split("/").pop()}
                    </span>
                    <button
                      onClick={() => onUpdate("contentUrl", "")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpload(file);
                      }}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <span className="text-sm text-blue-600">
                        Uploading...
                      </span>
                    ) : (
                      <>
                        <Upload size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Upload {lesson.type.toUpperCase()}
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            )}

            {/* Duration (for videos) */}
            {lesson.type === "video" && (
              <div className="w-24">
                <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg">
                  <Clock size={14} className="text-gray-400" />
                  <input
                    type="number"
                    value={lesson.duration || ""}
                    onChange={(e) =>
                      onUpdate("duration", parseInt(e.target.value) || 0)
                    }
                    placeholder="mins"
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Free Preview Toggle */}
            <button
              onClick={() => onUpdate("isFree", !lesson.isFree)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                lesson.isFree
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              }`}
              title="Free Preview"
            >
              <Eye size={14} />
            </button>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MODULE CARD ====================
const ModuleCard: React.FC<{
  module: Module;
  moduleIndex: number;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onUpdateLesson: (lessonIdx: number, field: string, value: any) => void;
  onRemoveLesson: (lessonIdx: number) => void;
  onUploadFile: (lessonIdx: number, file: File) => Promise<void>;
  uploadingLessonIndex: number | null;
  onUpdateQuiz: (quiz: ModuleQuiz | null) => void;
  onUpdateAssignment: (assignment: ModuleAssignment | null) => void;
}> = ({
  module,
  moduleIndex,
  onUpdate,
  onRemove,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
  onUploadFile,
  uploadingLessonIndex,
  onUpdateQuiz,
  onUpdateAssignment,
}) => {
  const params = useParams();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showQuizEditor, setShowQuizEditor] = useState(!!module.quiz);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(
    !!module.assignment,
  );

  const totalDuration = module.lessons.reduce(
    (sum, l) => sum + (l.duration || 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Module Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-slate-50 to-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical size={18} className="text-gray-400 cursor-grab" />

        <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
          {moduleIndex + 1}
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={module.title}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate("title", e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Module title (e.g., Introduction to React)"
            className="w-full text-lg font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen size={14} />
            {module.lessons.length} lessons
          </span>
          {totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {totalDuration} min
            </span>
          )}
          {module.quiz && (
            <span className="flex items-center gap-1 text-indigo-600">
              <HelpCircle size={14} />
              Quiz
            </span>
          )}
          {module.assignment && (
            <span className="flex items-center gap-1 text-orange-600">
              <ClipboardList size={14} />
              Assignment
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>

        <div className="p-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Module Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            {/* Module Description */}
            <div className="mb-4">
              <textarea
                value={module.description || ""}
                onChange={(e) => onUpdate("description", e.target.value)}
                placeholder="Module description (optional)"
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Lessons List */}
            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {module.lessons.map((lesson, lessonIdx) => (
                  <LessonCard
                    key={lesson._id || lessonIdx}
                    lesson={lesson}
                    lessonIndex={lessonIdx}
                    moduleIndex={moduleIndex}
                    onUpdate={(field, value) =>
                      onUpdateLesson(lessonIdx, field, value)
                    }
                    onRemove={() => onRemoveLesson(lessonIdx)}
                    onUpload={(file) => onUploadFile(lessonIdx, file)}
                    isUploading={uploadingLessonIndex === lessonIdx}
                  />
                ))}
              </AnimatePresence>

              {module.lessons.length === 0 && (
                <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg">
                  <FolderOpen size={28} className="mx-auto mb-1 opacity-50" />
                  <p className="text-sm">No lessons yet</p>
                </div>
              )}
            </div>

            {/* Add Lesson Button */}
            <button
              onClick={onAddLesson}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors flex items-center justify-center gap-2 mb-4 text-sm"
            >
              <Plus size={16} />
              Add Lesson
            </button>

            {/* Optional Content: Quiz & Assignment */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {/* Section Header with Status */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Optional Content
                </h4>
                <div className="flex items-center gap-2">
                  {module.quiz && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                      <HelpCircle size={10} />
                      Quiz ✓
                    </span>
                  )}
                  {module.assignment && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                      <ClipboardList size={10} />
                      Assignment ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Add Buttons - Show when neither quiz nor assignment is added or being edited */}
              {!showQuizEditor &&
                !module.quiz &&
                !showAssignmentEditor &&
                !module.assignment && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQuizEditor(true)}
                      className="flex-1 py-2.5 px-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                    >
                      <HelpCircle size={15} />
                      Add Quiz
                    </button>
                    <button
                      onClick={() => setShowAssignmentEditor(true)}
                      className="flex-1 py-2.5 px-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                    >
                      <ClipboardList size={15} />
                      Add Assignment
                    </button>
                  </div>
                )}

              {/* Quiz Section */}
              {(showQuizEditor || module.quiz) && (
                <div className="mb-4 bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded">
                        <HelpCircle size={14} className="text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        Module Quiz
                      </span>
                      {module.quiz && (
                        <span className="text-xs text-indigo-600 bg-white px-2 py-0.5 rounded">
                          {module.quiz.questions?.length || 0} questions
                        </span>
                      )}
                    </div>
                  </div>
                  <ModuleQuizEditor
                    quiz={module.quiz || null}
                    moduleTitle={module.title}
                    onSave={(quiz) => onUpdateQuiz(quiz)}
                    onRemove={() => {
                      onUpdateQuiz(null);
                      setShowQuizEditor(false);
                    }}
                    isExpanded={!module.quiz}
                  />
                </div>
              )}

              {/* Assignment Section */}
              {(showAssignmentEditor || module.assignment) && (
                <div className="mb-4 bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded">
                        <ClipboardList size={14} className="text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        Module Assignment
                      </span>
                      {module.assignment && (
                        <span className="text-xs text-orange-600 bg-white px-2 py-0.5 rounded">
                          {module.assignment.totalPoints || 0} points
                        </span>
                      )}
                    </div>
                    {module.assignment?._id && (
                      <Link
                        href={`/dashboard/manage-courses/${params.id}/assignments/${module.assignment._id}/submissions`}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-100"
                      >
                        <Eye size={12} />
                        View Submissions
                      </Link>
                    )}
                  </div>
                  <ModuleAssignmentEditor
                    assignment={module.assignment || null}
                    moduleTitle={module.title}
                    onSave={(assignment) => onUpdateAssignment(assignment)}
                    onRemove={() => {
                      onUpdateAssignment(null);
                      setShowAssignmentEditor(false);
                    }}
                    isExpanded={!module.assignment}
                  />
                </div>
              )}

              {/* Add other option link - shows when one is active */}
              {(showQuizEditor || module.quiz) &&
                !showAssignmentEditor &&
                !module.assignment && (
                  <button
                    onClick={() => setShowAssignmentEditor(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1.5 rounded transition-colors"
                  >
                    <ClipboardList size={12} />+ Add Assignment
                  </button>
                )}
              {(showAssignmentEditor || module.assignment) &&
                !showQuizEditor &&
                !module.quiz && (
                  <button
                    onClick={() => setShowQuizEditor(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1.5 rounded transition-colors"
                  >
                    <HelpCircle size={12} />+ Add Quiz
                  </button>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const ModulesStep: React.FC<ModulesStepProps> = ({ data, onUpdate }) => {
  const [uploadingState, setUploadingState] = useState<{
    moduleIdx: number;
    lessonIdx: number;
  } | null>(null);

  // Add new module
  const addModule = () => {
    onUpdate([
      ...data,
      {
        title: "",
        description: "",
        lessons: [],
        resources: [],
        quiz: null,
        order: data.length,
      },
    ]);
  };

  // Update module field
  const updateModule = (moduleIdx: number, field: string, value: any) => {
    const newData = [...data];
    newData[moduleIdx] = { ...newData[moduleIdx], [field]: value };
    onUpdate(newData);
  };

  // Remove module
  const removeModule = (moduleIdx: number) => {
    onUpdate(data.filter((_, i) => i !== moduleIdx));
  };

  // Add lesson to module
  const addLesson = (moduleIdx: number) => {
    const newData = data.map((module, idx) => {
      if (idx === moduleIdx) {
        return {
          ...module,
          lessons: [
            ...module.lessons,
            {
              title: "",
              type: "video" as const,
              contentUrl: "",
              duration: 0,
              order: module.lessons.length,
              isFree: false,
            },
          ],
        };
      }
      return module;
    });
    onUpdate(newData);
  };

  // Update lesson in module
  const updateLesson = (
    moduleIdx: number,
    lessonIdx: number,
    field: string,
    value: any,
  ) => {
    const newData = data.map((module, idx) => {
      if (idx === moduleIdx) {
        return {
          ...module,
          lessons: module.lessons.map((lesson, lIdx) => {
            if (lIdx === lessonIdx) {
              return { ...lesson, [field]: value };
            }
            return lesson;
          }),
        };
      }
      return module;
    });
    onUpdate(newData);
  };

  // Remove lesson from module
  const removeLesson = (moduleIdx: number, lessonIdx: number) => {
    const newData = data.map((module, idx) => {
      if (idx === moduleIdx) {
        return {
          ...module,
          lessons: module.lessons.filter((_, i) => i !== lessonIdx),
        };
      }
      return module;
    });
    onUpdate(newData);
  };

  // Update quiz in module
  const updateQuiz = (moduleIdx: number, quiz: ModuleQuiz | null) => {
    const newData = [...data];
    newData[moduleIdx] = { ...newData[moduleIdx], quiz };
    onUpdate(newData);
  };

  // Update assignment in module
  const updateAssignment = (
    moduleIdx: number,
    assignment: ModuleAssignment | null,
  ) => {
    const newData = [...data];
    newData[moduleIdx] = { ...newData[moduleIdx], assignment };
    onUpdate(newData);
  };

  // Handle file upload
  const handleFileUpload = async (
    moduleIdx: number,
    lessonIdx: number,
    file: File,
  ) => {
    setUploadingState({ moduleIdx, lessonIdx });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";

      const token =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("accessToken="))
              ?.split("=")[1]
          : undefined;

      const response = await fetch(`${baseUrl}/programs/upload-lesson-doc`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const fileUrl =
        result.data?.imageUrl ||
        result.data?.url ||
        result.url ||
        result.filePath;

      if (fileUrl) {
        updateLesson(moduleIdx, lessonIdx, "contentUrl", fileUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setUploadingState(null);
    }
  };

  // Calculate totals
  const totalModules = data.length;
  const totalLessons = data.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalQuizzes = data.filter((m) => m.quiz).length;
  const totalAssignments = data.filter((m) => m.assignment).length;
  const totalDuration = data.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.duration || 0), 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{totalModules}</p>
          <p className="text-sm text-gray-500">Modules</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <p className="text-2xl font-bold text-slate-800">{totalLessons}</p>
          <p className="text-sm text-gray-500">Lessons</p>
        </div>
        <div className="text-center border-r border-gray-200">
          <p className="text-2xl font-bold text-indigo-600">{totalQuizzes}</p>
          <p className="text-sm text-gray-500">Quizzes</p>
        </div>
        <div className="text-center border-r border-gray-200">
          <p className="text-2xl font-bold text-orange-600">
            {totalAssignments}
          </p>
          <p className="text-sm text-gray-500">Assignments</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">
            {totalDuration} min
          </p>
          <p className="text-sm text-gray-500">Total Duration</p>
        </div>
      </div>

      {/* Modules List */}
      <AnimatePresence>
        {data.map((module, moduleIdx) => (
          <ModuleCard
            key={module._id || moduleIdx}
            module={module}
            moduleIndex={moduleIdx}
            onUpdate={(field, value) => updateModule(moduleIdx, field, value)}
            onRemove={() => removeModule(moduleIdx)}
            onAddLesson={() => addLesson(moduleIdx)}
            onUpdateLesson={(lessonIdx, field, value) =>
              updateLesson(moduleIdx, lessonIdx, field, value)
            }
            onRemoveLesson={(lessonIdx) => removeLesson(moduleIdx, lessonIdx)}
            onUploadFile={(lessonIdx, file) =>
              handleFileUpload(moduleIdx, lessonIdx, file)
            }
            uploadingLessonIndex={
              uploadingState?.moduleIdx === moduleIdx
                ? uploadingState.lessonIdx
                : null
            }
            onUpdateQuiz={(quiz) => updateQuiz(moduleIdx, quiz)}
            onUpdateAssignment={(assignment) =>
              updateAssignment(moduleIdx, assignment)
            }
          />
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No modules yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start building your course by adding the first module
          </p>
          <button
            onClick={addModule}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
          >
            <Plus size={18} />
            Create First Module
          </button>
        </div>
      )}

      {/* Add Module Button */}
      {data.length > 0 && (
        <button
          onClick={addModule}
          className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-50 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add New Module
        </button>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Tips:</strong> Each module can have multiple lessons and an
          optional quiz. Quizzes are automatically linked to the course when
          saved. Students can access module quizzes after completing the
          lessons.
        </p>
      </div>
    </motion.div>
  );
};

export default ModulesStep;
