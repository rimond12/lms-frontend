"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Edit2,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useAddCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
} from "@/app/redux/api/CourseApi/CourseApi";
import { ICurriculum, ITopic } from "@/types/course";

interface ProgramCurriculumSectionProps {
  courseId: string;
  curriculum: ICurriculum[];
  onCurriculumChange: (curriculum: ICurriculum[]) => void;
}

export default function ProgramCurriculumSection({
  courseId,
  curriculum,
  onCurriculumChange,
}: ProgramCurriculumSectionProps) {
  const [addCurriculum] = useAddCurriculumMutation();
  const [updateCurriculum] = useUpdateCurriculumMutation();
  const [deleteCurriculum] = useDeleteCurriculumMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new curriculum
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [topics, setTopics] = useState<ITopic[]>([]);
  const [topicInput, setTopicInput] = useState({ title: "", duration: 0, description: "" });

  // Clear form
  const clearForm = () => {
    setModuleTitle("");
    setModuleDescription("");
    setTopics([]);
    setTopicInput({ title: "", duration: 0, description: "" });
    setIsAdding(false);
    setEditingModule(null);
  };

  // Add topic to current module
  const addTopic = () => {
    if (!topicInput.title.trim()) {
      toast.error("Topic title is required");
      return;
    }
    if (!topicInput.duration || topicInput.duration <= 0) {
      toast.error("Topic duration must be greater than 0");
      return;
    }

    const newTopic: ITopic = {
      title: topicInput.title.trim(),
      description: topicInput.description.trim(),
      duration: topicInput.duration,
      order: topics.length,
    };

    setTopics([...topics, newTopic]);
    setTopicInput({ title: "", duration: 0, description: "" });
    toast.success("Topic added");
  };

  // Remove topic
  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  // Submit curriculum
  const handleSubmitCurriculum = async () => {
    if (!moduleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }
    if (topics.length === 0) {
      toast.error("Add at least one topic");
      return;
    }

    setIsSubmitting(true);
    try {
      const curriculumData = {
        moduleTitle: moduleTitle.trim(),
        description: moduleDescription.trim(),
        topics: topics.map((t, idx) => ({
          ...t,
          order: idx,
        })),
      };

      if (editingModule) {
        // Update existing curriculum
        await updateCurriculum({
          courseId,
          curriculumId: editingModule,
          curriculum: curriculumData,
        }).unwrap();
        toast.success("Curriculum module updated successfully!");
      } else {
        // Add new curriculum
        await addCurriculum({
          courseId,
          curriculum: curriculumData,
        }).unwrap();
        toast.success("Curriculum module added successfully!");
      }

      clearForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save curriculum");
      console.error("Curriculum save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete curriculum
  const handleDeleteCurriculum = async (curriculumId: string) => {
    if (!window.confirm("Are you sure you want to delete this curriculum module?")) {
      return;
    }

    try {
      await deleteCurriculum({
        courseId,
        curriculumId,
      }).unwrap();
      toast.success("Curriculum module deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete curriculum");
    }
  };

  // Edit curriculum
  const handleEditCurriculum = (curr: ICurriculum) => {
    setModuleTitle(curr.moduleTitle);
    setModuleDescription(curr.description || "");
    setTopics(curr.topics || []);
    setEditingModule(curr._id || null);
    setIsAdding(true);
  };

  // Toggle expand module
  const toggleExpand = (id: string | undefined) => {
    if (!id) return;
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Curriculum & Modules</h2>
      </div>

      {/* Existing Curriculum Modules */}
      {curriculum && curriculum.length > 0 && (
        <div className="mb-6 space-y-3">
          {curriculum.map((module) => (
            <div
              key={module._id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                onClick={() => toggleExpand(module._id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {expandedModules.includes(module._id || "") ? (
                    <ChevronUp size={18} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.moduleTitle}</h3>
                    <p className="text-sm text-gray-600">
                      {module.topics?.length || 0} topics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCurriculum(module);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCurriculum(module._id || "");
                    }}
                    className="p-2 text-red-800 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded Topics */}
              {expandedModules.includes(module._id || "") && (
                <div className="p-4 border-t border-gray-200 bg-white space-y-2">
                  {module.topics && module.topics.length > 0 ? (
                    module.topics.map((topic, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{topic.title}</p>
                            {topic.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {topic.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded">
                            {topic.duration} min
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No topics added</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      <motion.div
        initial={false}
        animate={{ height: isAdding ? "auto" : 0, opacity: isAdding ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden mb-4"
      >
        {isAdding && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
            {/* Module Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module Title <span className="text-red-800">*</span>
              </label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g., Introduction to React"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Module Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module Description
              </label>
              <textarea
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Brief overview of this module..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Topics Section */}
            <div className="border-t border-blue-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Topics</h4>

              {/* Add Topic Form */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={topicInput.title}
                  onChange={(e) => setTopicInput({ ...topicInput, title: e.target.value })}
                  placeholder="Topic title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <textarea
                  value={topicInput.description}
                  onChange={(e) =>
                    setTopicInput({ ...topicInput, description: e.target.value })
                  }
                  placeholder="Topic description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />

                <input
                  type="number"
                  value={topicInput.duration}
                  onChange={(e) =>
                    setTopicInput({
                      ...topicInput,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Duration (minutes)"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <button
                  type="button"
                  onClick={addTopic}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Plus size={14} />
                  Add Topic
                </button>
              </div>

              {/* Topics List */}
              {topics.length > 0 && (
                <div className="space-y-2">
                  {topics.map((topic, idx) => (
                    <div key={idx} className="flex items-start justify-between p-2 bg-white border border-gray-200 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{topic.title}</p>
                        {topic.description && (
                          <p className="text-xs text-gray-600">{topic.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{topic.duration} minutes</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTopic(idx)}
                        className="p-1 text-red-800 hover:bg-red-50 rounded transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitCurriculum}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                {isSubmitting
                  ? "Saving..."
                  : editingModule
                  ? "Update Module"
                  : "Add Module"}
              </motion.button>
              <button
                type="button"
                onClick={clearForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Button */}
      {!isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Curriculum Module
        </button>
      )}
    </div>
  );
}
