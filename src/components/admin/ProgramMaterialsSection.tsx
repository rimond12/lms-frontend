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
  FileText,
  FileIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} from "@/app/redux/api/CourseApi/CourseApi";
import { IMaterial } from "@/types/course";

interface ProgramMaterialsSectionProps {
  courseId: string;
  materials: IMaterial[];
  onMaterialsChange: (materials: IMaterial[]) => void;
}

export default function ProgramMaterialsSection({
  courseId,
  materials,
  onMaterialsChange,
}: ProgramMaterialsSectionProps) {
  const [addMaterial] = useAddMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    type: "pdf" as 'pdf' | 'video' | 'doc' | 'image' | 'link' | 'external-link',
    duration: 0,
  });

  // Clear form
  const clearForm = () => {
    setForm({
      title: "",
      description: "",
      fileUrl: "",
      type: "pdf",
      duration: 0,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Material title is required");
      return;
    }
    if (!form.fileUrl.trim()) {
      toast.error("File URL is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const materialData = {
        title: form.title.trim(),
        description: form.description.trim(),
        fileUrl: form.fileUrl.trim(),
        type: form.type,
        duration: form.duration,
      };

      if (editingId) {
        await updateMaterial({
          courseId,
          materialId: editingId,
          material: materialData,
        }).unwrap();
        toast.success("Material updated successfully!");
      } else {
        await addMaterial({
          courseId,
          material: materialData,
        }).unwrap();
        toast.success("Material added successfully!");
      }

      clearForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save material");
      console.error("Material save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (materialId: string) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      await deleteMaterial({
        courseId,
        materialId,
      }).unwrap();
      toast.success("Material deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete material");
    }
  };

  // Handle edit
  const handleEdit = (material: IMaterial) => {
    setForm({
      title: material.title,
      description: material.description || "",
      fileUrl: material.fileUrl || material.url || "",
      type: (material.type || "pdf") as 'pdf' | 'video' | 'doc' | 'image' | 'link' | 'external-link',
      duration: material.duration || 0,
    });
    setEditingId(material._id || null);
    setIsAdding(true);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "video":
        return "🎥";
      case "doc":
        return "📝";
      case "image":
        return "🖼️";
      case "link":
      case "external-link":
        return "🔗";
      default:
        return "📋";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Materials</h2>
      </div>

      {/* Existing Materials */}
      {materials && materials.length > 0 && (
        <div className="mb-6 space-y-2">
          {materials.map((material) => (
            <div
              key={material._id}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getTypeIcon(material.type)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{material.title}</h3>
                  {material.description && (
                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                      {material.type || "file"}
                    </span>
                    {material.duration && (
                      <span className="text-xs text-gray-600">
                        Duration: {material.duration} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(material)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Edit material"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(material._id || "")}
                  className="p-2 text-red-800 hover:bg-red-50 rounded transition"
                  title="Delete material"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Material Title <span className="text-red-800">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Getting Started with React"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the material..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* File URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File URL <span className="text-red-800">*</span>
              </label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="https://example.com/material.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Type and Duration Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-800">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="doc">Document</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                  <option value="external-link">External Link</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                {isSubmitting ? "Saving..." : editingId ? "Update Material" : "Add Material"}
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
          Add Material
        </button>
      )}
    </div>
  );
}
