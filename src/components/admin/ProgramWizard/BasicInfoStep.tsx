"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Clock,
  Video,
  Award,
  Briefcase,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { useImageUpload } from "@/hooks";
import { generateSlug } from "@/utils/slug";
import CategorySelector from "@/components/shared/CategorySelector";

interface IHighlight {
  icon: string;
  label: string;
  order?: number;
}

interface ProgramData {
  title: string;
  slug: string;
  type: "training" | "seminar" | "webinar" | "workshop" | "course";
  description: string;
  shortDescription: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  duration: string;
  currency?: string;
  capacity?: number;
  tags: string[];
  bannerImage?: string;
  overviewVideoUrl?: string;
  highlights?: IHighlight[];
  isProtected?: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  // Category fields
  categories?: string[];
  primaryCategory?: string;
}

interface BasicInfoStepProps {
  data: ProgramData;
  onUpdate: (data: ProgramData) => void;
}

/**
 * Step 1: Basic More Information
 * Collects essential program details with banner image upload using preset
 */
export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
}) => {
  const handleChange = (
    field: keyof ProgramData,
    value: string | number | boolean | string[] | IHighlight[],
  ) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  // Use reusable image upload hook with BANNER preset
  const banner = useImageUpload({
    preset: "BANNER",
    onSuccess: (imageUrl) => {
      handleChange("bannerImage", imageUrl);
    },
    onError: (err) => {
      alert(`Upload failed: ${err.message}`);
    },
  });

  const handleBannerImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) await banner.uploadImage(file);
  };

  const handleDeleteBanner = () => {
    banner.reset();
    handleChange("bannerImage", "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-800">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => {
            const newTitle = e.target.value;
            // Update both title and slug simultaneously to avoid state race conditions
            onUpdate({
              ...data,
              title: newTitle,
              slug: generateSlug(newTitle),
            });
          }}
          placeholder="Enter  title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          {data.title.length}/100 characters
        </p>
      </div>

      {/* Slug Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug <span className="text-red-800">*</span>{" "}
          <span className="text-gray-500 text-xs">
            (Auto-generated, editable)
          </span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm bg-gray-50 px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg">
            /courses/
          </span>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder="course-url-slug"
            className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the course URL
        </p>
      </div>

      {/* Banner Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image <span className="text-gray-500">(optional)</span>
        </label>

        {/* Error Message */}
        {banner.error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800">
              <span className="font-medium">⚠️ Error:</span> {banner.error}
            </p>
          </div>
        )}

        {/* Image Preview with metadata */}
        {(banner.preview || data.bannerImage) && (
          <div className="mb-3 relative rounded-lg overflow-hidden border-2 border-blue-300 bg-blue-50 max-w-xs">
            <img
              src={banner.preview || getImageUrl(data.bannerImage)}
              alt="Banner preview"
              className="w-full h-40 object-cover"
            />
            {banner.fileName && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
                <p className="truncate">{banner.fileName}</p>
                {banner.fileSize && <p>{banner.fileSize}</p>}
              </div>
            )}
            <button
              type="button"
              onClick={handleDeleteBanner}
              className="absolute top-2 right-2 bg-red-800 text-white p-1 rounded hover:bg-red-800 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Button */}
        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all bg-blue-50">
          <Upload size={18} className="text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">
            {banner.isUploading
              ? "⏳ Uploading..."
              : "📁 Click to upload banner"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerImageChange}
            disabled={banner.isUploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG, GIF, WebP (max 5MB) | Recommended: 1200x400px
        </p>
      </div>

      {/* Course Overview Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Overview Video URL{" "}
          <span className="text-gray-500">(YouTube link)</span>
        </label>
        <input
          type="url"
          value={data.overviewVideoUrl || ""}
          onChange={(e) => handleChange("overviewVideoUrl", e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          If provided, this video will be shown in the hero section instead of
          the banner image
        </p>
      </div>

      {/* Course Highlights */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Highlights
          <span className="text-gray-500 ml-1">
            (e.g., "৩ মাস", "৩০ টা লাইভ সেশন")
          </span>
        </label>
        <div className="space-y-2">
          {(data.highlights || []).map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={highlight.icon}
                onChange={(e) => {
                  const newHighlights = [...(data.highlights || [])];
                  newHighlights[idx] = {
                    ...newHighlights[idx],
                    icon: e.target.value,
                  };
                  handleChange("highlights", newHighlights);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="check">✓ Check</option>
                <option value="clock">⏱ Clock</option>
                <option value="video">🎥 Video</option>
                <option value="award">🏆 Award</option>
                <option value="briefcase">💼 Work</option>
                <option value="book">📚 Book</option>
              </select>
              <input
                type="text"
                value={highlight.label}
                onChange={(e) => {
                  const newHighlights = [...(data.highlights || [])];
                  newHighlights[idx] = {
                    ...newHighlights[idx],
                    label: e.target.value,
                  };
                  handleChange("highlights", newHighlights);
                }}
                placeholder="e.g., ৩ মাস"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  const newHighlights = (data.highlights || []).filter(
                    (_, i) => i !== idx,
                  );
                  handleChange("highlights", newHighlights);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newHighlights = [
                ...(data.highlights || []),
                {
                  icon: "check",
                  label: "",
                  order: data.highlights?.length || 0,
                },
              ];
              handleChange("highlights", newHighlights);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 border border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors w-full justify-center"
          >
            <Plus size={16} />
            Add Highlight
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description <span className="text-red-800">*</span>
          </label>
          <textarea
            value={data.shortDescription}
            onChange={(e) => handleChange("shortDescription", e.target.value)}
            placeholder="Brief description (1-2 sentences)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.shortDescription.length}/200 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description <span className="text-red-800">*</span>
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Detailed program description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.description.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Type and Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Type <span className="text-red-800">*</span>
          </label>
          <select
            value={data.type}
            onChange={(e) =>
              handleChange("type", e.target.value as ProgramData["type"])
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="training">Training</option>
            <option value="seminar">Seminar</option>
            <option value="webinar">Webinar</option>
            <option value="workshop">Workshop</option>
            <option value="course">Course</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level <span className="text-red-800">*</span>
          </label>
          <select
            value={data.level}
            onChange={(e) =>
              handleChange("level", e.target.value as ProgramData["level"])
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all-levels">All Levels</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <CategorySelector
        selectedCategories={data.categories || []}
        primaryCategory={data.primaryCategory}
        onCategoriesChange={(categories) =>
          handleChange("categories", categories)
        }
        onPrimaryCategoryChange={(categoryId) =>
          handleChange("primaryCategory", categoryId || "")
        }
        maxSelections={5}
        showPrimarySelector={true}
        useAdminAPI={true}
        label="Categories"
        placeholder="Select categories for this program..."
      />

      {/* Duration and Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration <span className="text-gray-500">(e.g., "2 weeks")</span>
          </label>
          <input
            type="text"
            value={data.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            placeholder="2 weeks"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity <span className="text-gray-500">(max participants)</span>
          </label>
          <input
            type="number"
            value={data.capacity || ""}
            onChange={(e) =>
              handleChange("capacity", parseInt(e.target.value) || 0)
            }
            placeholder="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Note: Price and Date fields removed - now managed per Batch */}

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description <span className="text-gray-500">(for SEO)</span>
        </label>
        <textarea
          value={data.metaDescription || ""}
          onChange={(e) => handleChange("metaDescription", e.target.value)}
          placeholder="Brief SEO description (55-160 characters)"
          rows={2}
          maxLength={160}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          {(data.metaDescription || "").length}/160 characters
        </p>
      </div>

      {/* Meta Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Keywords <span className="text-gray-500">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={data.metaKeywords?.join(", ") || ""}
          onChange={(e) =>
            handleChange(
              "metaKeywords",
              e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter((k) => k),
            )
          }
          placeholder="typescript, programming, course, online"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          Keywords for search engine optimization
        </p>
      </div>
    </motion.div>
  );
};

export default BasicInfoStep;
