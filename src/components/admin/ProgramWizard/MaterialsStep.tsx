"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, AlertCircle, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks";

interface Material {
  _id?: string;
  title: string;
  description: string;
  fileUrl: string;
  type: "lecture" | "file" | "url";
  subType?: "pdf" | "video" | "doc" | "image" | "link" | "external-link"; // For backward compatibility
  duration?: number;
}

interface MaterialsStepProps {
  data: Material[];
  onUpdate: (data: Material[]) => void;
}

const MATERIAL_TYPES = [
  { value: "lecture", label: "Lecture" },
  { value: "file", label: "Material (File)" },
  { value: "url", label: "Material (URL)" },
];

/**
 * Step 4: Learning Materials Management
 * Organizes materials with conditional fields based on type
 * Lecture: Title, Description, URL, Duration
 * File: Title, Description, File Upload
 * URL: Title, Description, URL
 */
export const MaterialsStep: React.FC<MaterialsStepProps> = ({
  data,
  onUpdate,
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addMaterial = () => {
    onUpdate([
      ...data,
      {
        title: "",
        description: "",
        fileUrl: "",
        type: "lecture",
        duration: 0,
      },
    ]);
  };

  const updateMaterial = (idx: number, field: string, value: any) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onUpdate(newData);
  };

  const removeMaterial = (idx: number) => {
    onUpdate(data.filter((_, i) => i !== idx));
  };

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith("/");
    }
  };

  // Validate material has all required fields based on type
  const isMaterialValid = (material: Material): boolean => {
    const hasTitle = material.title.trim().length > 0;
    const hasDescription = material.description.trim().length > 0;

    switch (material.type) {
      case "lecture":
        return (
          hasTitle &&
          hasDescription &&
          material.fileUrl.trim().length > 0 &&
          isValidUrl(material.fileUrl)
        );
      case "file":
        return hasTitle && hasDescription && material.fileUrl.trim().length > 0;
      case "url":
        return (
          hasTitle &&
          hasDescription &&
          material.fileUrl.trim().length > 0 &&
          isValidUrl(material.fileUrl)
        );
      default:
        return false;
    }
  };

  const handleFileUpload = async (idx: number, file: File) => {
    if (!file) return;

    setUploadingIndex(idx);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Use correct backend URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
      const response = await fetch(`${baseUrl}/programs/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      const fileUrl =
        result.data?.imageUrl ||
        result.data?.url ||
        result.url ||
        result.filePath;
      if (fileUrl) {
        updateMaterial(idx, "fileUrl", fileUrl);
      } else {
        throw new Error("No file URL in response");
      }
    } catch (error) {
      alert("File upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Materials List */}
      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No materials added yet</p>
          <button
            onClick={addMaterial}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <Plus size={18} />
            Add First Material
          </button>
        </div>
      ) : (
        data.map((material, idx) => (
          <motion.div
            key={idx}
            className={`border-2 rounded-lg p-5 transition-all ${
              isMaterialValid(material)
                ? "border-orange-300 hover:border-orange-400 hover:shadow-md"
                : "border-red-300 hover:border-red-400 bg-red-50"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Material Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Material {idx + 1}
                </h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded capitalize">
                    {material.type}
                  </span>
                  {material.type === "lecture" &&
                    material.duration &&
                    material.duration > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {material.duration} min
                      </span>
                    )}
                  {!isMaterialValid(material) && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                      <AlertCircle size={12} /> Incomplete
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeMaterial(idx)}
                className="flex items-center gap-1 text-red-800 hover:text-red-700 font-medium text-sm transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>

            {/* Material Type Selection - Always First */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Material Type <span className="text-red-600">*</span>
              </label>
              <select
                value={material.type}
                onChange={(e) => updateMaterial(idx, "type", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                {MATERIAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Fields Based on Type */}
            <div className="space-y-3">
              {/* Title - Always Shown */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={material.title}
                  onChange={(e) => updateMaterial(idx, "title", e.target.value)}
                  placeholder="e.g., Introduction to TypeScript"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {material.title.length}/100 characters
                </p>
              </div>

              {/* Description - Always Shown */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={material.description}
                  onChange={(e) =>
                    updateMaterial(idx, "description", e.target.value)
                  }
                  placeholder="Describe what this material covers..."
                  rows={2}
                  maxLength={300}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {material.description.length}/300 characters
                </p>
              </div>

              {/* LECTURE Fields */}
              {material.type === "lecture" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Video/Lecture URL <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={material.fileUrl}
                      onChange={(e) =>
                        updateMaterial(idx, "fileUrl", e.target.value)
                      }
                      placeholder="https://example.com/lecture.mp4 or /uploads/lecture.mp4"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        !isValidUrl(material.fileUrl) && material.fileUrl
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {!isValidUrl(material.fileUrl) && material.fileUrl && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠ Invalid URL format. Use https://... or /path/to/file
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Must be a valid absolute or relative URL
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Duration (minutes) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={material.duration || 0}
                      onChange={(e) =>
                        updateMaterial(
                          idx,
                          "duration",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="45"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Length of the lecture in minutes
                    </p>
                  </div>
                </>
              )}

              {/* FILE Upload Fields */}
              {material.type === "file" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Upload File <span className="text-red-600">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:bg-orange-50 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(idx, file);
                        }
                      }}
                      disabled={uploadingIndex === idx}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingIndex === idx ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin">
                          <Upload size={24} className="text-orange-600" />
                        </div>
                        <p className="text-sm font-medium text-orange-600">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, XLS, ZIP, etc.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {material.fileUrl && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-300 rounded-lg">
                      <p className="text-xs text-green-700">
                        ✓ File uploaded: {material.fileUrl.split("/").pop()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* URL Fields */}
              {material.type === "url" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    External URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={material.fileUrl}
                    onChange={(e) =>
                      updateMaterial(idx, "fileUrl", e.target.value)
                    }
                    placeholder="https://example.com/resource or /uploads/document.pdf"
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      !isValidUrl(material.fileUrl) && material.fileUrl
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {!isValidUrl(material.fileUrl) && material.fileUrl && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠ Invalid URL format. Use https://... or /path/to/file
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Must be a valid absolute or relative URL
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-4">
                <p className="text-xs text-blue-900">
                  <span className="font-medium">✓ Tip:</span> Select material
                  type first to see relevant input fields. Each material
                  requires a title and description.
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* Add Material Button */}
      <button
        onClick={addMaterial}
        className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 font-medium transition-colors"
      >
        + Add Material
      </button>
    </motion.div>
  );
};

export default MaterialsStep;
