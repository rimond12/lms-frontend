"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileUp,
  Link as LinkIcon,
  FileText,
  Settings,
  Target,
  RefreshCw,
  ClipboardList,
  X,
  Upload,
  File,
  Download,
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { toast } from "sonner";

// ==================== TYPES ====================
export interface ModuleAssignment {
  _id?: string;
  title: string;
  description: string;
  instructions: string;

  // Submission Settings
  submissionTypes: ("file-upload" | "url-submission" | "text-submission")[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFilesCount?: number;

  // Timing
  startDate?: string;
  dueDate: string;
  lateDueDate?: string;

  // Grading
  totalPoints: number;
  passingPoints: number;
  lateSubmissionPenalty?: number;
  allowResubmission: boolean;
  maxAttempts: number;

  // Rubric
  rubric?: {
    criteria: string;
    maxPoints: number;
    description: string;
  }[];

  // Reference Files (admin-uploaded materials for students)
  referenceFiles?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt?: string;
  }[];

  // Status
  isPublished: boolean;
}

interface ModuleAssignmentEditorProps {
  assignment: ModuleAssignment | null;
  moduleTitle: string;
  onSave: (assignment: ModuleAssignment) => void;
  onRemove: () => void;
  isExpanded?: boolean;
}

// ==================== DEFAULT ASSIGNMENT ====================
const createDefaultAssignment = (moduleTitle: string): ModuleAssignment => ({
  title: `${moduleTitle} - Assignment`,
  description: "",
  instructions: "Complete the assignment as per the requirements.",
  submissionTypes: ["file-upload"],
  allowedFileTypes: ["pdf", "doc", "docx", "zip"],
  maxFileSize: 20,
  maxFilesCount: 3,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // 7 days from now
  totalPoints: 100,
  passingPoints: 60,
  lateSubmissionPenalty: 10,
  allowResubmission: true,
  maxAttempts: 3,
  rubric: [],
  isPublished: false,
});

// ==================== SUBMISSION TYPE OPTIONS ====================
const SUBMISSION_TYPES = [
  { value: "file-upload", label: "File Upload", icon: FileUp },
  { value: "url-submission", label: "URL/Link", icon: LinkIcon },
  { value: "text-submission", label: "Text Entry", icon: FileText },
] as const;

const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Word (DOC)" },
  { value: "docx", label: "Word (DOCX)" },
  { value: "zip", label: "ZIP Archive" },
  { value: "rar", label: "RAR Archive" },
  { value: "dwg", label: "AutoCAD (DWG)" },
  { value: "dxf", label: "AutoCAD (DXF)" },
  { value: "jpg", label: "Image (JPG)" },
  { value: "png", label: "Image (PNG)" },
];

// ==================== RUBRIC ITEM COMPONENT ====================
const RubricItem: React.FC<{
  rubric: { criteria: string; maxPoints: number; description: string };
  index: number;
  onUpdate: (
    updates: Partial<{
      criteria: string;
      maxPoints: number;
      description: string;
    }>,
  ) => void;
  onRemove: () => void;
}> = ({ rubric, index, onUpdate, onRemove }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="flex-1 space-y-2">
        <div className="flex gap-3">
          <input
            type="text"
            value={rubric.criteria}
            onChange={(e) => onUpdate({ criteria: e.target.value })}
            placeholder={`Criteria ${index + 1} (e.g., Code Quality)`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="number"
            value={rubric.maxPoints}
            onChange={(e) =>
              onUpdate({ maxPoints: parseInt(e.target.value) || 0 })
            }
            placeholder="Points"
            min={0}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <input
          type="text"
          value={rubric.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
      </div>
      <button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ModuleAssignmentEditor({
  assignment,
  moduleTitle,
  onSave,
  onRemove,
  isExpanded: initialExpanded = false,
}: ModuleAssignmentEditorProps) {
  const [localAssignment, setLocalAssignment] = useState<ModuleAssignment>(
    () => {
      if (assignment) {
        return {
          ...createDefaultAssignment(moduleTitle),
          ...assignment,
          submissionTypes: assignment.submissionTypes || ["file-upload"],
          allowedFileTypes: assignment.allowedFileTypes || [
            "pdf",
            "doc",
            "docx",
            "zip",
          ],
          rubric: assignment.rubric || [],
        };
      }
      return createDefaultAssignment(moduleTitle);
    },
  );
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [showSettings, setShowSettings] = useState(false);
  const [showRubric, setShowRubric] = useState(false);

  // Sync state when assignment prop changes (e.g., getting an _id after initial save)
  useEffect(() => {
    if (assignment) {
      setLocalAssignment((prev) => ({
        ...prev,
        ...assignment,
        submissionTypes: assignment.submissionTypes ||
          prev.submissionTypes || ["file-upload"],
        allowedFileTypes: assignment.allowedFileTypes ||
          prev.allowedFileTypes || ["pdf", "doc", "docx", "zip"],
        rubric: assignment.rubric || prev.rubric || [],
      }));
    }
  }, [assignment]);

  // Update local assignment
  const updateAssignment = (updates: Partial<ModuleAssignment>) => {
    const updated = { ...localAssignment, ...updates };
    setLocalAssignment(updated);
    onSave(updated);
  };

  // Toggle submission type
  const toggleSubmissionType = (
    type: "file-upload" | "url-submission" | "text-submission",
  ) => {
    const current = localAssignment.submissionTypes;
    if (current.includes(type)) {
      if (current.length > 1) {
        updateAssignment({
          submissionTypes: current.filter((t) => t !== type),
        });
      }
    } else {
      updateAssignment({ submissionTypes: [...current, type] });
    }
  };

  // Toggle file type
  const toggleFileType = (type: string) => {
    const current = localAssignment.allowedFileTypes || [];
    if (current.includes(type)) {
      updateAssignment({ allowedFileTypes: current.filter((t) => t !== type) });
    } else {
      updateAssignment({ allowedFileTypes: [...current, type] });
    }
  };

  // Add rubric criteria
  const addRubricCriteria = () => {
    updateAssignment({
      rubric: [
        ...(localAssignment.rubric || []),
        { criteria: "", maxPoints: 10, description: "" },
      ],
    });
  };

  // Update rubric criteria
  const updateRubricCriteria = (
    index: number,
    updates: Partial<{
      criteria: string;
      maxPoints: number;
      description: string;
    }>,
  ) => {
    const newRubric = [...(localAssignment.rubric || [])];
    newRubric[index] = { ...newRubric[index], ...updates };
    updateAssignment({ rubric: newRubric });
  };

  // Remove rubric criteria
  const removeRubricCriteria = (index: number) => {
    updateAssignment({
      rubric: (localAssignment.rubric || []).filter((_, i) => i !== index),
    });
  };

  // Calculate total rubric points
  const totalRubricPoints = (localAssignment.rubric || []).reduce(
    (sum, r) => sum + r.maxPoints,
    0,
  );

  if (!assignment && !isExpanded) {
    // No assignment yet - show add button
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
      >
        <ClipboardList className="w-5 h-5" />
        Add Assignment to this Module
      </button>
    );
  }

  return (
    <div className="border border-orange-200 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-amber-600 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-white" />
          <div>
            <h4 className="font-semibold text-white">Module Assignment</h4>
            <p className="text-orange-200 text-sm">
              {localAssignment.totalPoints} points • Due:{" "}
              {localAssignment.dueDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {localAssignment.isPublished && (
            <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full">
              Published
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={localAssignment.title}
                    onChange={(e) =>
                      updateAssignment({ title: e.target.value })
                    }
                    placeholder="Assignment title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <RichTextEditor
                  value={localAssignment.description}
                  onChange={(value) => updateAssignment({ description: value })}
                  placeholder="Brief description of this assignment..."
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions *
                </label>
                <RichTextEditor
                  value={localAssignment.instructions}
                  onChange={(value) =>
                    updateAssignment({ instructions: value })
                  }
                  placeholder="Detailed instructions for students..."
                />
              </div>

              {/* Submission Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Submission Types *
                </label>
                <div className="flex flex-wrap gap-3">
                  {SUBMISSION_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => toggleSubmissionType(value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                        localAssignment.submissionTypes.includes(value)
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
                {/* Submission Type Description */}
                {localAssignment.submissionTypes.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                    {localAssignment.submissionTypes.map((type) => {
                      const details = {
                        "file-upload":
                          "Students can upload documents, images, ZIPs, or CAD files.",
                        "url-submission":
                          "Students submit a direct link (e.g. Google Drive, GitHub, Live Site).",
                        "text-submission":
                          "Students type their answer directly in a text editor.",
                      }[type];
                      const label = SUBMISSION_TYPES.find(
                        (t) => t.value === type,
                      )?.label;
                      return (
                        <div key={type} className="flex gap-1.5">
                          <span className="font-medium text-gray-700">
                            • {label}:
                          </span>
                          <span>{details}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* File Types (if file-upload selected) */}
              {localAssignment.submissionTypes.includes("file-upload") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Allowed File Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FILE_TYPES.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => toggleFileType(value)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          (localAssignment.allowedFileTypes || []).includes(
                            value,
                          )
                            ? "border-orange-500 bg-orange-100 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:border-orange-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Files Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-orange-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Reference Files (Optional)
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Upload reference materials for students (PDF, DOC, ZIP, DWG,
                  images). Max 200MB per file.
                </p>

                {/* Drag & Drop Zone */}
                <div
                  className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      "border-orange-500",
                      "bg-orange-50",
                    );
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove(
                      "border-orange-500",
                      "bg-orange-50",
                    );
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-orange-500",
                      "bg-orange-50",
                    );
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const existingFiles =
                        localAssignment.referenceFiles || [];
                      const newFiles = Array.from(files).map((file) => ({
                        fileName: file.name,
                        fileUrl: URL.createObjectURL(file),
                        fileSize: file.size,
                        mimeType: file.type,
                        uploadedAt: new Date().toISOString(),
                        _file: file, // Keep file for upload
                      }));
                      updateAssignment({
                        referenceFiles: [...existingFiles, ...newFiles] as any,
                      });
                      toast.success(`${files.length} file(s) added`);
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept =
                      ".pdf,.doc,.docx,.zip,.rar,.dwg,.dxf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx";
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files && target.files.length > 0) {
                        const existingFiles =
                          localAssignment.referenceFiles || [];
                        const newFiles = Array.from(target.files).map(
                          (file) => ({
                            fileName: file.name,
                            fileUrl: URL.createObjectURL(file),
                            fileSize: file.size,
                            mimeType: file.type,
                            uploadedAt: new Date().toISOString(),
                            _file: file,
                          }),
                        );
                        updateAssignment({
                          referenceFiles: [
                            ...existingFiles,
                            ...newFiles,
                          ] as any,
                        });
                        toast.success(`${target.files.length} file(s) added`);
                      }
                    };
                    input.click();
                  }}
                >
                  <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Drag & drop files here or{" "}
                    <span className="text-orange-600 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, DOCX, ZIP, DWG, DXF, Images (max 200MB)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {localAssignment.referenceFiles &&
                  localAssignment.referenceFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        {localAssignment.referenceFiles.length} file(s)
                        attached:
                      </p>
                      {localAssignment.referenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <File className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const files = [
                                ...(localAssignment.referenceFiles || []),
                              ];
                              files.splice(index, 1);
                              updateAssignment({ referenceFiles: files });
                              toast.success("File removed");
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Dates with Validation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={localAssignment.startDate || ""}
                    onChange={(e) =>
                      updateAssignment({ startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={localAssignment.dueDate}
                    onChange={(e) =>
                      updateAssignment({ dueDate: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      localAssignment.startDate &&
                      localAssignment.dueDate < localAssignment.startDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {localAssignment.startDate &&
                    localAssignment.dueDate < localAssignment.startDate && (
                      <p className="text-xs text-red-500 mt-1">
                        Due date cannot be before start date
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Late Due Date
                  </label>
                  <input
                    type="date"
                    value={localAssignment.lateDueDate || ""}
                    onChange={(e) =>
                      updateAssignment({ lateDueDate: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      localAssignment.lateDueDate &&
                      localAssignment.lateDueDate < localAssignment.dueDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {localAssignment.lateDueDate &&
                    localAssignment.lateDueDate < localAssignment.dueDate && (
                      <p className="text-xs text-red-500 mt-1">
                        Late due date cannot be before due date
                      </p>
                    )}
                </div>
              </div>

              {/* Grading */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Total Points *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={localAssignment.totalPoints}
                    onChange={(e) =>
                      updateAssignment({
                        totalPoints: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Points *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={localAssignment.totalPoints}
                    value={localAssignment.passingPoints}
                    onChange={(e) =>
                      updateAssignment({
                        passingPoints: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Penalty (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={localAssignment.lateSubmissionPenalty || 0}
                    onChange={(e) =>
                      updateAssignment({
                        lateSubmissionPenalty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
              >
                <Settings className="w-4 h-4" />
                {showSettings ? "Hide Settings" : "Advanced Settings"}
                {showSettings ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Advanced Settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <RefreshCw className="w-4 h-4" />
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={localAssignment.maxAttempts}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 1;
                          if (val > 10) val = 10;
                          if (val < 1) val = 1;
                          updateAssignment({
                            maxAttempts: val,
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={localAssignment.maxFileSize || 20}
                        onChange={(e) =>
                          updateAssignment({
                            maxFileSize: parseInt(e.target.value) || 20,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Files Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={localAssignment.maxFilesCount || 3}
                        onChange={(e) =>
                          updateAssignment({
                            maxFilesCount: parseInt(e.target.value) || 3,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-3 md:col-span-3">
                      <input
                        type="checkbox"
                        id="allowResubmission"
                        checked={localAssignment.allowResubmission}
                        onChange={(e) =>
                          updateAssignment({
                            allowResubmission: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor="allowResubmission"
                        className="text-sm text-gray-700"
                      >
                        Allow Resubmission (students can submit again after
                        feedback)
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rubric Section */}
              <div>
                <button
                  onClick={() => setShowRubric(!showRubric)}
                  className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 mb-3"
                >
                  <ClipboardList className="w-4 h-4" />
                  {showRubric ? "Hide Rubric" : "Add Grading Rubric"}(
                  {(localAssignment.rubric || []).length} criteria)
                  {showRubric ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence>
                  {showRubric && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {(localAssignment.rubric || []).length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                          <p className="text-gray-500 text-sm">
                            No rubric criteria yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(localAssignment.rubric || []).map(
                            (rubric, index) => (
                              <RubricItem
                                key={index}
                                rubric={rubric}
                                index={index}
                                onUpdate={(updates) =>
                                  updateRubricCriteria(index, updates)
                                }
                                onRemove={() => removeRubricCriteria(index)}
                              />
                            ),
                          )}
                          {totalRubricPoints !==
                            localAssignment.totalPoints && (
                            <p className="text-sm text-amber-600 flex items-center gap-1">
                              ⚠️ Rubric points ({totalRubricPoints}) don't match
                              total points ({localAssignment.totalPoints})
                            </p>
                          )}
                        </div>
                      )}
                      <button
                        onClick={addRubricCriteria}
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Criteria
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="font-medium text-gray-700">
                    Publish Assignment
                  </label>
                  <p className="text-sm text-gray-500">
                    Students can see and submit published assignments
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateAssignment({
                      isPublished: !localAssignment.isPublished,
                    })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    localAssignment.isPublished ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      localAssignment.isPublished
                        ? "translate-x-7"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
