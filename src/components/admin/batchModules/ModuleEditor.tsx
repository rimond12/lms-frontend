/**
 * ModuleEditor Component
 * Form for creating/editing batch modules with lessons and resources
 */

"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  Link,
  Save,
  X,
  Loader2,
} from "lucide-react";
import {
  IBatchModule,
  ICreateBatchModuleRequest,
  IBatchLesson,
  IBatchResource,
} from "@/app/redux/api/batchModuleApi/batchModuleApi";

interface ModuleEditorProps {
  initialData?: IBatchModule;
  onSave: (data: ICreateBatchModuleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LESSON_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "doc", label: "Document", icon: FileText },
  { value: "link", label: "External Link", icon: Link },
];

export default function ModuleEditor({
  initialData,
  onSave,
  onCancel,
  isLoading,
}: ModuleEditorProps) {
  // Module state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // Lessons state
  const [lessons, setLessons] = useState<Omit<IBatchLesson, "_id">[]>(
    initialData?.lessons?.map((l) => ({
      title: l.title,
      description: l.description,
      type: l.type,
      contentUrl: l.contentUrl,
      duration: l.duration,
      order: l.order,
      isFree: l.isFree,
    })) || [],
  );

  // Resources state
  const [resources, setResources] = useState<Omit<IBatchResource, "_id">[]>(
    initialData?.resources?.map((r) => ({
      title: r.title,
      fileUrl: r.fileUrl,
      type: r.type,
    })) || [],
  );

  // Add lesson
  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: "",
        type: "video",
        contentUrl: "",
        duration: 0,
        order: lessons.length,
        isFree: false,
      },
    ]);
  };

  // Update lesson
  const updateLesson = (
    index: number,
    updates: Partial<Omit<IBatchLesson, "_id">>,
  ) => {
    const newLessons = [...lessons];
    newLessons[index] = { ...newLessons[index], ...updates };
    setLessons(newLessons);
  };

  // Remove lesson
  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  // Add resource
  const addResource = () => {
    setResources([
      ...resources,
      {
        title: "",
        fileUrl: "",
        type: "pdf",
      },
    ]);
  };

  // Update resource
  const updateResource = (
    index: number,
    updates: Partial<Omit<IBatchResource, "_id">>,
  ) => {
    const newResources = [...resources];
    newResources[index] = { ...newResources[index], ...updates };
    setResources(newResources);
  };

  // Remove resource
  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = () => {
    if (!title.trim()) {
      alert("Module title is required");
      return;
    }

    const data: ICreateBatchModuleRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      lessons: lessons.map((l, i) => ({ ...l, order: i })),
      resources,
    };

    onSave(data);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to AutoCAD"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this module..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Lessons Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Lessons</h4>
          <button
            onClick={addLesson}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No lessons yet</p>
            <button
              onClick={addLesson}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              Add your first lesson
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <button className="mt-2 text-gray-400 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          updateLesson(index, { title: e.target.value })
                        }
                        placeholder="Lesson title"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <select
                        value={lesson.type}
                        onChange={(e) =>
                          updateLesson(index, { type: e.target.value as any })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {LESSON_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={lesson.contentUrl || ""}
                        onChange={(e) =>
                          updateLesson(index, { contentUrl: e.target.value })
                        }
                        placeholder="Content URL"
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={lesson.duration || ""}
                        onChange={(e) =>
                          updateLesson(index, {
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Duration (min)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lesson.isFree || false}
                        onChange={(e) =>
                          updateLesson(index, { isFree: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">
                        Free preview
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={() => removeLesson(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resources Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Resources</h4>
          <button
            onClick={addResource}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">No resources attached</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <input
                  type="text"
                  value={resource.title}
                  onChange={(e) =>
                    updateResource(index, { title: e.target.value })
                  }
                  placeholder="Resource title"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={resource.fileUrl}
                  onChange={(e) =>
                    updateResource(index, { fileUrl: e.target.value })
                  }
                  placeholder="File URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={resource.type}
                  onChange={(e) =>
                    updateResource(index, { type: e.target.value as any })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Document</option>
                  <option value="zip">ZIP</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
                <button
                  onClick={() => removeResource(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || !title.trim()}
          className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? "Update Module" : "Create Module"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
