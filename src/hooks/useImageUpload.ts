import { useState, useCallback, useMemo } from "react";

/**
 * Preset configurations for different use cases
 */
export const IMAGE_UPLOAD_PRESETS = {
  BANNER: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    label: "Banner Image",
  },
  PROFILE: {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    label: "Profile Photo",
  },
  THUMBNAIL: {
    maxSize: 1 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    label: "Thumbnail",
  },
  AVATAR: {
    maxSize: 1.5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    label: "Avatar",
  },
  SPONSOR: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    label: "Sponsor Photo",
  },
} as const;

export type ImageUploadPresetKey = keyof typeof IMAGE_UPLOAD_PRESETS;

interface UseImageUploadOptions {
  preset?: ImageUploadPresetKey; // Use preset configurations
  maxSize?: number; // Override preset max size (in bytes)
  allowedTypes?: string[]; // Override preset allowed types
  label?: string; // Display label
  endpoint?: string; // Custom upload endpoint
  onSuccess?: (imageUrl: string, file: File) => void;
  onError?: (error: Error) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  error: string | null;
  preview: string | null;
  fileName: string | null;
  fileSize: string | null;
  uploadImage: (file: File) => Promise<string | null>;
  clearPreview: () => void;
  clearError: () => void;
  reset: () => void;
  isValidFile: (file: File) => { valid: boolean; error?: string };
}

/**
 * Enhanced reusable hook for image uploads with presets
 *
 * Features:
 * - Preset configurations for common use cases (banner, profile, thumbnail, avatar)
 * - File validation (type, size)
 * - Preview generation with metadata
 * - Error handling with detailed messages
 * - Customizable callbacks (onSuccess, onError, onUploadStart, onUploadEnd)
 * - Full state management
 *
 * Usage Examples:
 *
 * 1. Using presets (Recommended):
 * ```tsx
 * const { isUploading, preview, uploadImage, error } = useImageUpload({
 *   preset: 'BANNER',
 *   onSuccess: (url) => setImageUrl(url)
 * });
 * ```
 *
 * 2. Custom configuration:
 * ```tsx
 * const { isUploading, preview, uploadImage } = useImageUpload({
 *   maxSize: 3 * 1024 * 1024,
 *   onSuccess: (url) => handleImageUpload(url)
 * });
 * ```
 *
 * 3. With all callbacks:
 * ```tsx
 * const upload = useImageUpload({
 *   preset: 'PROFILE',
 *   onSuccess: (url) => console.log('Success:', url),
 *   onError: (err) => console.error('Error:', err),
 *   onUploadStart: () => setLoading(true),
 *   onUploadEnd: () => setLoading(false)
 * });
 *
 * // In file input handler
 * const handleFileChange = async (e) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     const url = await upload.uploadImage(file);
 *   }
 * };
 * ```
 */
export const useImageUpload = (
  options: UseImageUploadOptions = {},
): UseImageUploadReturn => {
  const {
    preset = "BANNER",
    maxSize: customMaxSize,
    allowedTypes: customAllowedTypes,
    label,
    endpoint = "/api/programs/upload-image",
    onSuccess,
    onError,
    onUploadStart,
    onUploadEnd,
  } = options;

  // Merge preset with custom options
  const presetConfig = IMAGE_UPLOAD_PRESETS[preset];
  const maxSize = customMaxSize || presetConfig.maxSize;
  const allowedTypes = customAllowedTypes || presetConfig.allowedTypes;
  const displayLabel = label || presetConfig.label;

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  /**
   * Format bytes to readable size
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }, []);

  /**
   * Validate file before upload
   */
  const isValidFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (!file) {
        return { valid: false, error: "No file selected" };
      }

      // Validate file type
      if (!allowedTypes.includes(file.type as any)) {
        const types = allowedTypes.map((t) => t.split("/")[1]).join(", ");
        return {
          valid: false,
          error: `Invalid file type. Allowed: ${types}`,
        };
      }

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        const actualSizeMB = Math.round(file.size / (1024 * 1024));
        return {
          valid: false,
          error: `${displayLabel} must be less than ${maxSizeMB}MB (current: ${actualSizeMB}MB)`,
        };
      }

      return { valid: true };
    },
    [allowedTypes, maxSize, displayLabel],
  );

  /**
   * Generate preview from file
   */
  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Upload image to backend
   */
  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        // Clear previous errors
        setError(null);

        // Validate file
        const validation = isValidFile(file);
        if (!validation.valid) {
          const errorMsg = validation.error || "File validation failed";
          setError(errorMsg);
          setPreview(null);
          onError?.(new Error(errorMsg));
          console.error(`❌ ${displayLabel} validation failed:`, errorMsg);
          return null;
        }

        // Call upload start callback
        onUploadStart?.();
        setIsUploading(true);

        // Generate preview
        const previewUrl = await generatePreview(file);
        setPreview(previewUrl);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));

        // Create FormData
        const formData = new FormData();
        formData.append("file", file);

        console.log(
          `📤 Uploading ${displayLabel}: ${file.name} (${formatFileSize(file.size)})`,
        );

        // Get API URL from environment variable
        // Use NEXT_PUBLIC_API_URL for API calls (includes /api prefix)
        const apiBaseUrl =
          typeof window !== "undefined"
            ? process.env.NEXT_PUBLIC_API_URL ||
              "https://api.caddcore.cloud/api"
            : "https://api.caddcore.cloud/api";

        // Construct full URL - remove /api prefix from endpoint if it exists since apiBaseUrl already includes it
        const cleanEndpoint = endpoint.startsWith("/api")
          ? endpoint.substring(4)
          : endpoint;
        const uploadUrl = `${apiBaseUrl}${cleanEndpoint}`;

        console.log(`🔗 Upload URL: ${uploadUrl}`);

        // Upload to backend
        // const response = await fetch(uploadUrl, {
        //   method: "POST",
        //   body: formData,
        // });
        // Upload to backend
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Upload failed with status ${response.status}`,
          );
        }

        const responseData = await response.json();
        const imageUrl = responseData?.data?.imageUrl || responseData?.imageUrl;

        if (!imageUrl) {
          throw new Error("No image URL returned from server");
        }

        console.log(`✅ ${displayLabel} uploaded successfully:`, imageUrl);
        onSuccess?.(imageUrl, file);

        return imageUrl;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        setPreview(null);
        setFileName(null);
        setFileSize(null);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        console.error(`❌ ${displayLabel} upload error:`, errorMessage);
        return null;
      } finally {
        setIsUploading(false);
        onUploadEnd?.();
      }
    },
    [
      isValidFile,
      generatePreview,
      onSuccess,
      onError,
      onUploadStart,
      onUploadEnd,
      displayLabel,
      formatFileSize,
      endpoint,
    ],
  );

  /**
   * Clear preview
   */
  const clearPreview = useCallback(() => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setError(null);
    setPreview(null);
    setFileName(null);
    setFileSize(null);
  }, []);

  return {
    isUploading,
    error,
    preview,
    fileName,
    fileSize,
    uploadImage,
    clearPreview,
    clearError,
    reset,
    isValidFile,
  };
};

export default useImageUpload;
