"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Upload, Image as ImageIcon, X, FileText } from "lucide-react";
import AppImage from "@/components/ui/AppImage";

interface CertificatePreview {
  title: string;
  description: string;
  photoUrl: string;
}

interface CertificateStepProps {
  data: CertificatePreview;
  onUpdate: (data: CertificatePreview) => void;
}

export const CertificateStep: React.FC<CertificateStepProps> = ({
  data,
  onUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: keyof CertificatePreview, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";

      const token =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("accessToken="))
              ?.split("=")[1]
          : undefined;

      console.log("📤 Uploading certificate image...");
      console.log("🔗 Upload URL:", `${baseUrl}/programs/upload-image`);

      const response = await fetch(`${baseUrl}/programs/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      console.log("📥 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("📥 Response data:", result);

        // Extract image URL from response - try multiple possible field names
        const imageUrl =
          result.data?.imageUrl ||
          result.data?.url ||
          result.imageUrl ||
          result.url;

        if (imageUrl) {
          console.log("✅ Image uploaded successfully:", imageUrl);
          handleChange("photoUrl", imageUrl);
        } else {
          console.error("❌ No image URL in response:", result);
          alert("Upload succeeded but no image URL returned");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Upload failed:", response.status, errorData);
        alert(`Upload failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    handleChange("photoUrl", "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
          <Award className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Certificate Preview
          </h2>
          <p className="text-sm text-gray-500">
            Configure how the certificate will appear on the course page
          </p>
        </div>
      </div>

      {/* Certificate Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form Fields */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Certificate Title
            </label>
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Certificate of Completion"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Description
            </label>
            <textarea
              value={data.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what this certificate represents..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="inline w-4 h-4 mr-1" />
              Certificate Image/Sample
            </label>
            <div className="relative">
              {data.photoUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <AppImage
                    photoUrl={data.photoUrl}
                    alt="Certificate Preview"
                    width={400}
                    height={192}
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600"></div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* URL Input (alternative) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or paste image URL
            </label>
            <input
              type="url"
              value={data.photoUrl || ""}
              onChange={(e) => handleChange("photoUrl", e.target.value)}
              placeholder="https://example.com/certificate-image.png"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Preview
            </h3>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {data.photoUrl ? (
                <AppImage
                  photoUrl={data.photoUrl}
                  alt="Certificate"
                  width={400}
                  height={160}
                  className="w-full h-40 object-contain bg-gray-50"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                  <Award className="w-16 h-16 text-yellow-400" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 text-center">
                  {data.title || "Certificate of Completion"}
                </h4>
                {data.description && (
                  <p className="text-sm text-gray-500 text-center mt-2 line-clamp-3">
                    {data.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> This is only for display purposes on the
              course page. The actual certificate generation is handled
              separately.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateStep;
