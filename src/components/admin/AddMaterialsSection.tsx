"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import { IMaterial } from "@/types/course";

interface AddMaterialsSectionProps {
  courseId: string;
  materials?: IMaterial[];
  onMaterialsChange?: (materials: IMaterial[]) => void;
  readOnly?: boolean;
}

export default function AddMaterialsSection({
  courseId,
  materials = [],
  onMaterialsChange,
  readOnly = false,
}: AddMaterialsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 0,
    url: "",
    type: "video",
    order: materials.length + 1,
  });

  const handleAddMaterial = () => {
    console.log("➕ handleAddMaterial called");
    console.log("📝 Form data:", formData);

    if (!formData.title || !formData.url) {
      console.warn("⚠️ Validation failed: missing title or URL");
      toast.error("Title and URL are required");
      return;
    }

    const newMaterial: IMaterial = {
      _id: editingId || `temp-${Date.now()}`,
      ...formData,
      type: formData.type as IMaterial["type"],
    };

    console.log("🆕 New material object:", newMaterial);

    let updatedMaterials: IMaterial[];
    if (editingId) {
      console.log("✏️ Updating existing material with ID:", editingId);
      updatedMaterials = materials.map((m) =>
        m._id === editingId ? newMaterial : m
      );
      toast.success("Material updated");
    } else {
      console.log("➕ Adding new material");
      updatedMaterials = [...materials, newMaterial];
      toast.success("Material added");
    }

    console.log("📋 Updated materials array:", updatedMaterials);
    onMaterialsChange?.(updatedMaterials);
    resetForm();
  };

  const handleDeleteMaterial = (id: string) => {
    console.log("🗑️ handleDeleteMaterial called with ID:", id);
    if (window.confirm("Are you sure you want to delete this material?")) {
      console.log("✅ Delete confirmed, filtering materials...");
      const updatedMaterials = materials.filter((m) => m._id !== id);
      console.log("📋 Materials after deletion:", updatedMaterials);
      onMaterialsChange?.(updatedMaterials);
      toast.success("Material deleted");
    } else {
      console.log("❌ Delete cancelled by user");
    }
  };

  const handleEditMaterial = (material: IMaterial) => {
    setFormData({
      title: material.title,
      description: material.description || "",
      duration: material.duration || 0,
      url: material.url || "",
      type: material.type || "video",
      order: material.order || 1,
    });
    setEditingId(material._id || null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 0,
      url: "",
      type: "video",
      order: materials.length + 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Program Materials</h2>
        {!readOnly && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Material
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && !readOnly && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-800">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Material title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="link">Link</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-800">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com/material"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Material description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddMaterial}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              {editingId ? "Update Material" : "Add Material"}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No materials added yet</p>
          {!readOnly && (
            <p className="text-xs mt-2">Click "Add Material" to get started</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {[...materials]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((material) => (
              <div
                key={material._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {!readOnly && (
                  <GripVertical size={16} className="text-gray-400 cursor-grab" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                      {material.order}.
                    </span>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {material.title}
                    </h4>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {material.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    {material.description}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>⏱ {material.duration} min</span>
                    <span className="text-blue-600 truncate">
                      {material.url}
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material._id || "")}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-800" />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {materials.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>Total materials: <strong>{materials.length}</strong></p>
          <p>Total duration: <strong>{materials.reduce((sum, m) => sum + (m.duration || 0), 0)} minutes</strong></p>
        </div>
      )}
    </div>
  );
}
