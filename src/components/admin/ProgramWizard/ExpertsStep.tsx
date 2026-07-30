"use client";

import { getImageUrl } from "@/utils/imageUtils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, AlertCircle, Upload } from "lucide-react";

interface Expert {
  name: string;
  designation: string; // MUST match backend schema: designation (not expertise)
  bio: string;
  profileImage?: string; // profile photo URL
}

interface ExpertsStepProps {
  data: Expert[];
  onUpdate: (data: Expert[]) => void;
}

/**
 * Step 3: Expert Assignment
 * Manages program experts/instructors with profile image uploads
 * Uses reusable useImageUpload hook for each expert
 */
export const ExpertsStep: React.FC<ExpertsStepProps> = ({ data, onUpdate }) => {
  // Store upload states for each expert indexed by their index
  const [expertUploadStates, setExpertUploadStates] = useState<{
    [key: number]: {
      isUploading: boolean;
      error: string | null;
      preview: string | null;
      fileName: string | null;
      fileSize: string | null;
    };
  }>({});

  const addExpert = () => {
    onUpdate([
      ...data,
      {
        name: "",
        designation: "",
        bio: "",
        profileImage: "",
      },
    ]);
  };

  const updateExpert = (idx: number, field: string, value: any) => {
    const newData = [...data];
    (newData[idx] as any)[field] = value;
    onUpdate(newData);
  };

  const removeExpert = (idx: number) => {
    onUpdate(data.filter((_, i) => i !== idx));
    // Clean up upload state for this expert
    const newStates = { ...expertUploadStates };
    delete newStates[idx];
    setExpertUploadStates(newStates);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Handle expert profile image upload - same pattern as inline fetch but cleaner
  const handleExpertImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    expertIdx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Clear previous error
      setExpertUploadStates((prev) => ({
        ...prev,
        [expertIdx]: {
          ...prev[expertIdx],
          error: null,
        },
      }));

      // Validate file type
      if (!file.type.startsWith("image/")) {
        const error = "Invalid file type. Use JPG, PNG, GIF, or WebP";
        setExpertUploadStates((prev) => ({
          ...prev,
          [expertIdx]: {
            isUploading: false,
            error,
            preview: null,
            fileName: null,
            fileSize: null,
          },
        }));
        return;
      }

      // Validate file size (max 2MB for profile photos)
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        const maxMB = Math.round(MAX_SIZE / (1024 * 1024));
        const actualMB = Math.round(file.size / (1024 * 1024));
        const error = `Profile photo must be less than ${maxMB}MB (current: ${actualMB}MB)`;
        setExpertUploadStates((prev) => ({
          ...prev,
          [expertIdx]: {
            isUploading: false,
            error,
            preview: null,
            fileName: null,
            fileSize: null,
          },
        }));
        return;
      }

      setExpertUploadStates((prev) => ({
        ...prev,
        [expertIdx]: {
          isUploading: true,
          error: null,
          preview: null,
          fileName: null,
          fileSize: null,
        },
      }));

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      console.log(
        `📤 Uploading profile photo for Expert ${expertIdx + 1}: ${file.name} (${formatFileSize(file.size)})`,
      );

      // Get API URL from environment variable
      const apiUrl =
        process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com";

      const token =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("accessToken="))
              ?.split("=")[1]
          : undefined;

      // Upload to backend (note: /api prefix required for all API routes)
      const response = await fetch(`${apiUrl}/api/programs/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const responseData = await response.json();
      const imageUrl = responseData?.data?.imageUrl || responseData?.imageUrl;

      if (imageUrl) {
        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setExpertUploadStates((prev) => ({
            ...prev,
            [expertIdx]: {
              isUploading: false,
              error: null,
              preview: reader.result as string,
              fileName: file.name,
              fileSize: formatFileSize(file.size),
            },
          }));
        };
        reader.readAsDataURL(file);

        // Save URL to expert data
        updateExpert(expertIdx, "profileImage", imageUrl);
        console.log(
          `✅ Profile photo uploaded for expert ${expertIdx + 1}:`,
          imageUrl,
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      console.error(
        `❌ Error uploading profile photo for Expert ${expertIdx + 1}:`,
        errorMsg,
      );
      setExpertUploadStates((prev) => ({
        ...prev,
        [expertIdx]: {
          isUploading: false,
          error: errorMsg,
          preview: null,
          fileName: null,
          fileSize: null,
        },
      }));
    }
  };

  // Validate expert has all required fields
  const isExpertValid = (expert: Expert): boolean => {
    return (
      expert.name.trim().length > 0 &&
      expert.designation.trim().length > 0 &&
      expert.bio.trim().length > 0
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Experts List */}
      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No Instructor added yet</p>
          <button
            onClick={addExpert}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <Plus size={18} />
            Add First Instructor
          </button>
        </div>
      ) : (
        data.map((expert, idx) => (
          <motion.div
            key={idx}
            className={`border-2 rounded-lg p-5 transition-all ${
              isExpertValid(expert)
                ? "border-green-300 hover:border-green-400 hover:shadow-md"
                : "border-orange-300 hover:border-orange-400 bg-orange-50"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Expert Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Instructor {idx + 1}
                </h3>
                {!isExpertValid(expert) && (
                  <div className="flex items-center gap-1 text-xs text-orange-700 mt-1">
                    <AlertCircle size={14} /> Incomplete - fill all fields
                  </div>
                )}
              </div>
              <button
                onClick={() => removeExpert(idx)}
                className="flex items-center gap-1 text-red-800 hover:text-red-800 font-medium text-sm transition-colors"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>

            {/* Expert Details */}
            <div className="space-y-3">
              {/* Profile Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Profile Photo{" "}
                  <span className="text-gray-500">(optional)</span>
                </label>

                {/* Error Message */}
                {expertUploadStates[idx]?.error && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-xs text-red-800">
                      <span className="font-medium">⚠️</span>{" "}
                      {expertUploadStates[idx].error}
                    </p>
                  </div>
                )}

                {/* Image Preview with metadata */}
                {(expertUploadStates[idx]?.preview ||
                  data[idx].profileImage) && (
                  <div className="mb-3 relative rounded-lg overflow-hidden border-2 border-green-300 bg-green-50 max-w-xs">
                    <img
                      src={
                        expertUploadStates[idx]?.preview ||
                        getImageUrl(data[idx].profileImage)
                      }
                      alt="Profile preview"
                      className="w-full h-32 object-cover"
                    />
                    {expertUploadStates[idx]?.fileName && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
                        <p className="truncate">
                          {expertUploadStates[idx].fileName}
                        </p>
                        <p>{expertUploadStates[idx].fileSize}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newStates = { ...expertUploadStates };
                        delete newStates[idx];
                        setExpertUploadStates(newStates);
                        updateExpert(idx, "profileImage", "");
                      }}
                      className="absolute top-2 right-2 bg-red-800 text-white p-1 rounded hover:bg-red-800 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all bg-green-50">
                  <Upload size={16} className="text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {expertUploadStates[idx]?.isUploading
                      ? "⏳ Uploading..."
                      : "Upload photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleExpertImageChange(e, idx)}
                    disabled={expertUploadStates[idx]?.isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP (max 2MB)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Full Name <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={expert.name}
                  onChange={(e) => updateExpert(idx, "name", e.target.value)}
                  placeholder="e.g., Dr. John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {expert.name.length}/100 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Designation <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={expert.designation}
                  onChange={(e) =>
                    updateExpert(idx, "designation", e.target.value)
                  }
                  placeholder="e.g., Senior Developer, Professor, Lead Instructor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Job title or designation (required by backend)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Biography <span className="text-red-800">*</span>
                </label>
                <textarea
                  value={expert.bio}
                  onChange={(e) => updateExpert(idx, "bio", e.target.value)}
                  placeholder="Professional background, experience, achievements, and credentials..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {expert.bio.length}/500 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <span className="font-medium">✓ Backend Compliant:</span>{" "}
                  Expert will be added via{" "}
                  <code className="text-blue-700">
                    POST /api/programs/:id/experts
                  </code>{" "}
                  endpoint with name, designation, and bio.
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* Add Expert Button */}
      <button
        onClick={addExpert}
        className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
      >
        + Add Instructor
      </button>
    </motion.div>
  );
};

export default ExpertsStep;
