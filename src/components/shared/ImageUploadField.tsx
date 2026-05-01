"use client";

import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { getImageUrl } from "@/utils/imageUtils";

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (imagePath: string) => void;
  onUpload: (file: File) => Promise<string>;
  placeholder?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  onUpload,
  placeholder = "Click to upload an image",
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URL
  const getPreviewUrl = (imagePath: string) => {
    return getImageUrl(imagePath);
  };

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload file
      const imagePath = await onUpload(file);
      onChange(imagePath);

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    onChange("");
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get current display image
  const currentImage = preview || (value ? getPreviewUrl(value) : null);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-start gap-3">
        {/* Image Preview */}
        {currentImage && (
          <div className="relative">
            <img
              src={currentImage}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-800 text-white rounded-full p-1 hover:bg-red-800 transition-colors"
              title="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Upload Section */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon size={16} className="text-gray-600" />
                <span>{currentImage ? "Change Image" : placeholder}</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, WebP • Max {maxSize}MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
