"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Upload, Monitor } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";

interface LearningSoftware {
  _id?: string;
  title: string;
  photoUrl: string;
}

interface LearningSoftwareStepProps {
  data: LearningSoftware[];
  onUpdate: (data: LearningSoftware[]) => void;
}

/**
 * Step for Learning Software Management
 * Manages learning software items with title and photo upload
 */
export const LearningSoftwareStep: React.FC<LearningSoftwareStepProps> = ({
  data,
  onUpdate,
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addSoftware = () => {
    onUpdate([
      ...data,
      {
        title: "",
        photoUrl: "",
      },
    ]);
  };

  const updateSoftware = (
    idx: number,
    field: keyof LearningSoftware,
    value: string,
  ) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onUpdate(newData);
  };

  const removeSoftware = (idx: number) => {
    onUpdate(data.filter((_, i) => i !== idx));
  };

  // Validate software has all required fields
  const isSoftwareValid = (software: LearningSoftware): boolean => {
    return software.title.trim().length > 0;
  };

  const handleFileUpload = async (idx: number, file: File) => {
    if (!file) return;

    setUploadingIndex(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use correct backend URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";

      const token =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("accessToken="))
              ?.split("=")[1]
          : undefined;

      const response = await fetch(
        `${baseUrl}/programs/upload-learning-software-image`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      const imageUrl =
        result.data?.url ||
        result.data?.imageUrl ||
        result.url ||
        result.imageUrl;
      if (imageUrl) {
        updateSoftware(idx, "photoUrl", imageUrl);
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      alert("Image upload failed. Please try again.");
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Monitor className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Learning Software</h3>
          <p className="text-sm text-gray-500">
            Add software tools used in this program
          </p>
        </div>
      </div>

      {/* Software List */}
      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No learning software added yet</p>
          <button
            onClick={addSoftware}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={18} />
            Add First Software
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((software, idx) => (
            <motion.div
              key={idx}
              className={`border-2 rounded-xl p-4 transition-all ${
                isSoftwareValid(software)
                  ? "border-purple-200 hover:border-purple-400 hover:shadow-md bg-white"
                  : "border-amber-300 bg-amber-50"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Software Header */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  Software {idx + 1}
                </span>
                <button
                  onClick={() => removeSoftware(idx)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove software"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Photo Upload */}
              <div className="mb-3">
                {software.photoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={getImageUrl(software.photoUrl)}
                      alt={software.title || "Software"}
                      className="w-full h-24 object-contain bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => updateSoftware(idx, "photoUrl", "")}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1 px-3 py-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all">
                    {uploadingIndex === idx ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">
                          <Upload size={18} className="text-purple-600" />
                        </div>
                        <span className="text-sm text-purple-600">
                          Uploading...
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload size={18} className="text-purple-500" />
                        <span className="text-xs text-purple-600 font-medium">
                          Upload Logo/Icon
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(idx, file);
                      }}
                      disabled={uploadingIndex === idx}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title Input */}
              <div>
                <input
                  type="text"
                  value={software.title}
                  onChange={(e) => updateSoftware(idx, "title", e.target.value)}
                  placeholder="e.g., AutoCAD, Revit, ETABS"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {!software.title.trim() && (
                  <p className="text-xs text-amber-600 mt-1">
                    Title is required
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {data.length > 0 && (
        <button
          onClick={addSoftware}
          className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Another Software
        </button>
      )}
    </motion.div>
  );
};

export default LearningSoftwareStep;
