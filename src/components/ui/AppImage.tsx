"use client";

import Image, { ImageProps } from "next/image";
import { getImageUrl } from "@/utils/imageUtils";

/**
 * Reusable AppImage component that handles all image types:
 * - Server uploaded images (uploads/images/...)
 * - External URLs (Cloudinary, etc.)
 * - Default fallback images
 * - Built on Next.js Image component for optimization
 */
interface AppImageProps extends Omit<ImageProps, "src" | "alt"> {
  /** The image path/URL from your database */
  photoUrl?: string;
  /** Optional custom default image path */
  defaultImage?: string;
  /** Alt text for accessibility */
  alt?: string;
}

export default function AppImage({ 
  photoUrl, 
  defaultImage,
  alt = "Image", 
  ...props 
}: AppImageProps) {
  const imageSrc = getImageUrl(photoUrl, defaultImage);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      {...props}
    />
  );
}

/**
 * Usage Examples:
 * 
 * // Server uploaded image
 * <AppImage
 *   photoUrl="uploads/images/1724693142511-profile.png"
 *   alt="User profile"
 *   width={200}
 *   height={200}
 *   className="rounded-xl"
 * />
 * 
 * // External image (Cloudinary)
 * <AppImage
 *   photoUrl="https://res.cloudinary.com/dalpf8iip/image/upload/v1755148618/image.jpg"
 *   alt="External image"
 *   width={300}
 *   height={200}
 * />
 * 
 * // With custom default
 * <AppImage
 *   photoUrl={user.profilePhoto}
 *   defaultImage="/images/default-avatar.png"
 *   alt="User avatar"
 *   width={50}
 *   height={50}
 *   className="rounded-full"
 * />
 * 
 * // Fallback to default when no photoUrl
 * <AppImage
 *   alt="Course thumbnail"
 *   width={400}
 *   height={250}
 *   className="object-cover"
 * />
 */
