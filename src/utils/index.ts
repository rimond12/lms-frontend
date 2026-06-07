/**
 * Utility function to construct full image URLs from relative paths
 */
export const getImageUrl = (imagePath?: string): string | undefined => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith("http")) return imagePath;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com";
  const cleanBaseUrl = baseUrl.replace("/api", "");

  // Ensure imagePath starts with / for proper URL construction
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return `${cleanBaseUrl}${normalizedPath}`;
};

/**
 * Utility function specifically for profile photos
 */
export const getProfilePhotoUrl = (photoPath?: string): string | undefined => {
  return getImageUrl(photoPath);
};

/**
 * Utility function specifically for blog/event/news images
 */
export const getBlogEventNewsImageUrl = (
  photoPath?: string,
): string | undefined => {
  return getImageUrl(photoPath);
};
