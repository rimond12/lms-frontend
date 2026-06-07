"use client";

import React from "react";

interface RichTextRendererProps {
  htmlString: string | null;
  className?: string;
}

/**
 * RichTextRenderer Component
 * Safely renders HTML content with proper image handling
 * Converts relative image paths to full URLs
 */
export default function RichTextRenderer({
  htmlString,
  className = "",
}: RichTextRendererProps) {
  if (!htmlString) {
    return <p className="text-gray-500 italic">No content available.</p>;
  }

  // Clean up broken image tags and fix relative paths
  const processHtml = (html: string): string => {
    // Remove img tags with src="undefined" or empty src
    let cleanHtml = html.replace(
      /<img[^>]+src=["'](undefined|["'])[^>]*>/gi,
      "",
    );

    // Fix relative image paths to absolute URLs
    cleanHtml = cleanHtml.replace(
      /<img([^>]+)src=["'](?!https?:\/\/)([^"']+)["']/gi,
      (match, attributes, src) => {
        // If the src doesn't start with http/https, prepend the backend URL
        const baseUrl =
          process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com";
        const fullUrl = src.startsWith("/")
          ? `${baseUrl}${src}`
          : `${baseUrl}/${src}`;
        return `<img${attributes}src="${fullUrl}"`;
      },
    );

    // Ensure images have proper styling
    cleanHtml = cleanHtml.replace(/<img([^>]*)>/gi, (match, attributes) => {
      // Check if style attribute already exists
      if (attributes.includes("style=")) {
        // Add to existing style
        return match.replace(
          /style=["']([^"']*)["']/i,
          'style="$1; max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;"',
        );
      } else {
        // Add new style attribute
        return `<img${attributes} style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">`;
      }
    });

    return cleanHtml;
  };

  const processedHtml = processHtml(htmlString);

  return (
    <div
      className={`prose prose-sm max-w-none text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

// Export as named export as well for flexibility
export { RichTextRenderer };
