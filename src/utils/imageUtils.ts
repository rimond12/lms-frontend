// Get the server base URL from environment or use the same as baseApi
const getServerBaseUrl = (): string => {
  // Use environment variables for file URLs
  let url =
    process.env.NEXT_PUBLIC_FILE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.caddcore.cloud"
      : "https://api.caddcore.cloud");

  // Ensure protocol is present
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash if present
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  return url;
};

/**
 * Unified image URL utility function that handles:
 * - Server uploaded images (uploads/images/...)
 * - External URLs (Cloudinary, etc.)
 * - Default fallback images
 *
 * @param photoUrl - The image path/URL from your database
 * @param defaultImage - Optional custom default image path
 * @returns Complete image URL ready for use
 */
export function getImageUrl(photoUrl?: string, defaultImage?: string): string {
  // If no photoUrl provided, return default placeholder
  if (!photoUrl) {
    return defaultImage || "/images/course-thumbnail.jpg";
  }

  // If it's already a complete URL (starts with http/https), return as-is
  if (photoUrl.startsWith("http")) {
    return photoUrl;
  }

  // Handle server-uploaded images
  const serverBaseUrl = getServerBaseUrl();

  // Clean the base URL (remove /api if present)
  const cleanBaseUrl = serverBaseUrl.replace(/\/api$/, "");

  // Ensure the photo URL starts with a slash
  const cleanPhotoUrl = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;

  // Construct and return the full URL
  return `${cleanBaseUrl}${cleanPhotoUrl}`;
}

/**
 * Alternative function name for consistency with existing code
 * This provides the same functionality as getImageUrl
 */
export const getFullImageUrl = getImageUrl;

/**
 * Specific function for document URLs (keeping existing API compatibility)
 */
export function getFullDocumentUrl(relativePath: string): string {
  if (!relativePath) return "";

  // If URL already starts with http, return as is
  if (relativePath.startsWith("http")) return relativePath;

  const serverBaseUrl = getServerBaseUrl();

  // Ensure relative path starts with /
  const cleanRelativePath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;

  // Construct full URL
  return `${serverBaseUrl}${cleanRelativePath}`;
}
