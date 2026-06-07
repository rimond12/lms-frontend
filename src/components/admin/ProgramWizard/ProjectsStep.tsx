"use client";

import { getImageUrl } from "@/utils/imageUtils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, AlertCircle, Upload } from "lucide-react";

interface Project {
  title?: string;
  description?: string;
  image?: string;
}

interface ProjectsStepProps {
  data: Project[];
  onUpdate: (data: Project[]) => void;
}

/**
 * Step 4: Project Assignment
 * Manages course projects with image uploads
 * Uses reusable useImageUpload hook for each project
 */
export const ProjectsStep: React.FC<ProjectsStepProps> = ({
  data,
  onUpdate,
}) => {
  // Store upload states for each project indexed by their index
  const [projectUploadStates, setProjectUploadStates] = useState<{
    [key: number]: {
      isUploading: boolean;
      error: string | null;
      preview: string | null;
      fileName: string | null;
      fileSize: string | null;
    };
  }>({});

  const addProject = () => {
    onUpdate([
      ...data,
      {
        title: "",
        description: "",
        image: "",
      },
    ]);
  };

  const updateProject = (idx: number, field: string, value: any) => {
    const newData = [...data];
    (newData[idx] as any)[field] = value;
    onUpdate(newData);
  };

  const removeProject = (idx: number) => {
    onUpdate(data.filter((_, i) => i !== idx));
    // Clean up upload state for this project
    const newStates = { ...projectUploadStates };
    delete newStates[idx];
    setProjectUploadStates(newStates);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Handle project image upload - same pattern as experts but for projects
  const handleProjectImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    projectIdx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Clear previous error
      setProjectUploadStates((prev) => ({
        ...prev,
        [projectIdx]: {
          ...prev[projectIdx],
          error: null,
        },
      }));

      // Validate file type
      if (!file.type.startsWith("image/")) {
        const error = "Invalid file type. Use JPG, PNG, GIF, or WebP";
        setProjectUploadStates((prev) => ({
          ...prev,
          [projectIdx]: {
            isUploading: false,
            error,
            preview: null,
            fileName: null,
            fileSize: null,
          },
        }));
        return;
      }

      // Validate file size (max 5MB for project images)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        const maxMB = Math.round(MAX_SIZE / (1024 * 1024));
        const actualMB = Math.round(file.size / (1024 * 1024));
        const error = `Project image must be less than ${maxMB}MB (current: ${actualMB}MB)`;
        setProjectUploadStates((prev) => ({
          ...prev,
          [projectIdx]: {
            isUploading: false,
            error,
            preview: null,
            fileName: null,
            fileSize: null,
          },
        }));
        return;
      }

      setProjectUploadStates((prev) => ({
        ...prev,
        [projectIdx]: {
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
        `📤 Uploading project image for Project ${projectIdx + 1}: ${file.name} (${formatFileSize(file.size)})`,
      );

      // Get API URL from environment variable
      const apiUrl =
        process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com";

      // Upload to backend (note: /api/programs/upload-image required for all API routes)
      const response = await fetch(`${apiUrl}/api/programs/upload-image`, {
        method: "POST",
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
          setProjectUploadStates((prev) => ({
            ...prev,
            [projectIdx]: {
              isUploading: false,
              error: null,
              preview: reader.result as string,
              fileName: file.name,
              fileSize: formatFileSize(file.size),
            },
          }));
        };
        reader.readAsDataURL(file);

        // Save URL to project data
        updateProject(projectIdx, "image", imageUrl);
        console.log(
          `✅ Project image uploaded for project ${projectIdx + 1}:`,
          imageUrl,
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      console.error(
        `❌ Error uploading project image for Project ${projectIdx + 1}:`,
        errorMsg,
      );
      setProjectUploadStates((prev) => ({
        ...prev,
        [projectIdx]: {
          isUploading: false,
          error: errorMsg,
          preview: null,
          fileName: null,
          fileSize: null,
        },
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Projects List */}
      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No projects added yet</p>
          <button
            onClick={addProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <Plus size={18} />
            Add First Project
          </button>
        </div>
      ) : (
        data.map((project, idx) => (
          <motion.div
            key={idx}
            className="border-2 rounded-lg p-5 transition-all border-green-300 hover:border-green-400 hover:shadow-md bg-green-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Project Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Project {idx + 1}
                </h3>
              </div>
              <button
                onClick={() => removeProject(idx)}
                className="flex items-center gap-1 text-red-800 hover:text-red-800 font-medium text-sm transition-colors"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>

            {/* Project Details */}
            <div className="space-y-3">
              {/* Project Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Project Image{" "}
                  <span className="text-gray-500">(optional)</span>
                </label>

                {/* Error Message */}
                {projectUploadStates[idx]?.error && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-xs text-red-800">
                      <span className="font-medium">⚠️</span>{" "}
                      {projectUploadStates[idx].error}
                    </p>
                  </div>
                )}

                {/* Image Preview with metadata */}
                {(projectUploadStates[idx]?.preview || data[idx].image) && (
                  <div className="mb-3 relative rounded-lg overflow-hidden border-2 border-green-300 bg-green-50 max-w-xs">
                    <img
                      src={
                        projectUploadStates[idx]?.preview ||
                        getImageUrl(data[idx].image)
                      }
                      alt="Project preview"
                      className="w-full h-32 object-cover"
                    />
                    {projectUploadStates[idx]?.fileName && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
                        <p className="truncate">
                          {projectUploadStates[idx].fileName}
                        </p>
                        <p>{projectUploadStates[idx].fileSize}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newStates = { ...projectUploadStates };
                        delete newStates[idx];
                        setProjectUploadStates(newStates);
                        updateProject(idx, "image", "");
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
                    {projectUploadStates[idx]?.isUploading
                      ? "⏳ Uploading..."
                      : "Upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProjectImageChange(e, idx)}
                    disabled={projectUploadStates[idx]?.isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Project Title{" "}
                  <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={project.title || ""}
                  onChange={(e) => updateProject(idx, "title", e.target.value)}
                  placeholder="e.g., E-commerce Website, Mobile App, Dashboard"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {project.title?.length || 0}/100 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Project Description{" "}
                  <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={project.description || ""}
                  onChange={(e) =>
                    updateProject(idx, "description", e.target.value)
                  }
                  placeholder="Describe the project requirements, technologies used, and learning outcomes..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {project.description?.length || 0}/300 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <span className="font-medium">✓ Backend Compliant:</span>{" "}
                  Project will be added via{" "}
                  <code className="text-blue-700">
                    POST /api/programs/:id/projects
                  </code>{" "}
                  endpoint with optional title, description, and image.
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* Add Project Button */}
      <button
        onClick={addProject}
        className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
      >
        + Add Project
      </button>
    </motion.div>
  );
};

export default ProjectsStep;
