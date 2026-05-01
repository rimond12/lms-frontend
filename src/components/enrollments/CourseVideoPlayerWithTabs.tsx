"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  FileText,
  Award,
  BookOpen,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/video";
import { extractYouTubeId, isYouTubeUrl } from "@/components/video/utils";
import { getFullDocumentUrl } from "@/utils/imageUtils";

interface Material {
  _id: string;
  title: string;
  description?: string;
  type:
    | "pdf"
    | "video"
    | "doc"
    | "image"
    | "link"
    | "external-link"
    | "audio"
    | "file";
  fileUrl: string;
  url?: string;
  duration?: string;
  videoProvider?: "youtube" | "vdocipher" | "direct";
  vdocipherVideoId?: string;
}

interface Program {
  bannerImage: string;
  title: string;
  type: string;
}

interface CourseVideoPlayerWithTabsProps {
  activeMaterial: Material | null;
  courseTitle: string;
  courseDescription?: string;
  materials: Material[];
  quizzes: any[];
  courseId: string;
  hasViewed: boolean;
  onViewed: () => void;
  onDownload?: (material: Material) => void;
  program: Program;
  materialsPercentage: number;
  quizzesPercentage: number;
  overallPercentage: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  router: { push: (path: string) => void };
  // Navigation props
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
  hasPreviousLesson?: boolean;
  hasNextLesson?: boolean;
  currentLessonIndex?: number;
  totalLessons?: number;
}

export default function CourseVideoPlayerWithTabs({
  activeMaterial,
  courseTitle,
  courseDescription,
  materials,
  quizzes,
  courseId,
  hasViewed,
  onViewed,
  onDownload,
  program,
  materialsPercentage,
  quizzesPercentage,
  overallPercentage,
  isSidebarOpen,
  setIsSidebarOpen,
  router,
  onPreviousLesson,
  onNextLesson,
  hasPreviousLesson = false,
  hasNextLesson = false,
  currentLessonIndex = 0,
  totalLessons = 0,
}: CourseVideoPlayerWithTabsProps) {
  const [isViewed, setIsViewed] = useState(hasViewed);
  const [showLinkCopy, setShowLinkCopy] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState(0); // Counter for forcing VideoPlayer re-mount
  const previousMaterialIdRef = React.useRef<string | null>(null);
  const hasCalledViewedRef = React.useRef(false); // Track if onViewed was already called

  // Force VideoPlayer re-mount when activeMaterial changes
  // Force VideoPlayer re-mount removed - causing multiple OTP calls
  // The VdoCipherPlayer handles videoId changes internally now
  /*
  useEffect(() => {
    if (
      activeMaterial?._id &&
      activeMaterial._id !== previousMaterialIdRef.current
    ) {
      previousMaterialIdRef.current = activeMaterial._id;
      setVideoKey((prev) => prev + 1); // Increment to force new key
      // Reset the viewed tracking for the new material
      hasCalledViewedRef.current = false;
    }
  }, [activeMaterial?._id]);
  */

  // Just reset the viewed ref when material changes
  useEffect(() => {
    if (activeMaterial?._id !== previousMaterialIdRef.current) {
      previousMaterialIdRef.current = activeMaterial?._id || null;
      hasCalledViewedRef.current = false;
    }
  }, [activeMaterial?._id]);

  // Update viewed status when hasViewed changes
  useEffect(() => {
    setIsViewed(hasViewed);
    // If already viewed from props, mark as called to prevent duplicate
    if (hasViewed) {
      hasCalledViewedRef.current = true;
    }
  }, [hasViewed]);

  // Auto-mark non-video content as viewed when displayed
  // Video lessons have play/time events that trigger onViewed(), but
  // link, pdf, doc, image, file, and audio types have no such event.
  // This ensures they are marked as viewed immediately upon display.
  useEffect(() => {
    if (
      activeMaterial &&
      activeMaterial.type !== "video" &&
      !hasCalledViewedRef.current &&
      !isViewed
    ) {
      // Small delay to prevent rapid re-fires during material switching
      const timer = setTimeout(() => {
        if (!hasCalledViewedRef.current && !isViewed) {
          hasCalledViewedRef.current = true;
          setIsViewed(true);
          onViewed();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeMaterial?._id, activeMaterial?.type, isViewed, onViewed]);

  const handleVideoPlay = () => {
    // Only call onViewed once per material
    if (!hasCalledViewedRef.current && !isViewed) {
      hasCalledViewedRef.current = true;
      setIsViewed(true);
      onViewed();
    }
  };

  const handleVideoTimeUpdate = (time: number) => {
    // Mark as viewed after 5 seconds, but only if not already called
    if (!hasCalledViewedRef.current && !isViewed && time >= 5) {
      hasCalledViewedRef.current = true;
      setIsViewed(true);
      onViewed();
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowLinkCopy(type);
      setTimeout(() => setShowLinkCopy(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Determine video type and props for VideoPlayer
  const getVideoPlayerProps = () => {
    if (!activeMaterial || activeMaterial.type !== "video") {
      return null;
    }

    // Check for VdoCipher first
    if (
      activeMaterial.videoProvider === "vdocipher" &&
      activeMaterial.vdocipherVideoId
    ) {
      return {
        videoType: "vdocipher" as const,
        vdocipherVideoId: activeMaterial.vdocipherVideoId,
        videoId: activeMaterial.vdocipherVideoId, // Pass as videoId too for consistency
      };
    }

    const videoUrl = getFullDocumentUrl(
      activeMaterial.fileUrl || activeMaterial.url || "",
    );

    if (isYouTubeUrl(videoUrl)) {
      const videoId = extractYouTubeId(videoUrl);
      if (videoId) {
        return {
          videoType: "youtube" as const,
          videoId,
        };
      }
    }

    // Direct video file
    return {
      videoType: "file" as const,
      videoUrl: getFullDocumentUrl(videoUrl),
    };
  };

  const videoPlayerProps = getVideoPlayerProps();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Video Player Section */}
      <div className="w-full">
        {activeMaterial &&
        activeMaterial.type === "video" &&
        videoPlayerProps ? (
          <VideoPlayer
            key={`video-${activeMaterial._id}`} // Stable key based on material ID only
            {...videoPlayerProps}
            title={activeMaterial.title}
            onPlay={handleVideoPlay}
            onTimeUpdate={handleVideoTimeUpdate}
            className="w-full"
            autoPlay={true}
            onPreviousLesson={onPreviousLesson}
            onNextLesson={onNextLesson}
            hasPreviousLesson={hasPreviousLesson}
            hasNextLesson={hasNextLesson}
            currentLessonIndex={currentLessonIndex}
            totalLessons={totalLessons}
          />
        ) : activeMaterial &&
          (activeMaterial.type === "link" ||
            activeMaterial.type === "external-link") ? (
          <div className="w-full aspect-video bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-gray-300">
            <div className="text-center max-w-2xl px-6">
              <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                <ExternalLink className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                External Resource Link
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {activeMaterial.title}
              </p>
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Click to copy link:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={getFullDocumentUrl(
                      activeMaterial.fileUrl || activeMaterial.url || "",
                    )}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 font-mono"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        getFullDocumentUrl(
                          activeMaterial.fileUrl || activeMaterial.url || "",
                        ),
                        "link",
                      )
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {showLinkCopy === "link" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() =>
                  window.open(
                    getFullDocumentUrl(
                      activeMaterial.fileUrl || activeMaterial.url || "",
                    ),
                    "_blank",
                  )
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <ExternalLink className="w-5 h-5" />
                Open in New Tab
              </button>
            </div>
          </div>
        ) : activeMaterial &&
          (activeMaterial.type === "file" ||
            activeMaterial.type === "doc" ||
            activeMaterial.type === "image" ||
            activeMaterial.type === "pdf") ? (
          <div className="w-full aspect-video bg-gray-100 flex flex-col relative group">
            {/* Inline Preview Logic */}
            {activeMaterial.type === "image" ||
            (activeMaterial.fileUrl &&
              activeMaterial.fileUrl.match(
                /\.(jpg|jpeg|png|webp|gif|svg)$/i,
              )) ? (
              <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/5">
                <img
                  src={getFullDocumentUrl(
                    activeMaterial.fileUrl || activeMaterial.url || "",
                  )}
                  alt={activeMaterial.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : activeMaterial.type === "pdf" ||
              (activeMaterial.fileUrl &&
                activeMaterial.fileUrl.match(/\.pdf$/i)) ? (
              <iframe
                src={getFullDocumentUrl(
                  activeMaterial.fileUrl || activeMaterial.url || "",
                )}
                className="w-full h-full"
                title={activeMaterial.title}
              />
            ) : (
              // Default Fallback for other files
              <div className="flex-1 flex items-center justify-center bg-linear-to-br from-gray-50 to-slate-50">
                <div className="text-center max-w-2xl px-6">
                  <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {activeMaterial.type === "doc"
                      ? "Document"
                      : "Lesson Resource"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto line-clamp-2">
                    {activeMaterial.title}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay Actions (Download) - Always available */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-lg backdrop-blur-sm">
              <a
                href={getFullDocumentUrl(
                  activeMaterial.fileUrl || activeMaterial.url || "#",
                )}
                download={activeMaterial.title || "download"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              {(activeMaterial.type === "image" ||
                activeMaterial.type === "pdf") && (
                <button
                  onClick={() =>
                    window.open(
                      getFullDocumentUrl(
                        activeMaterial.fileUrl || activeMaterial.url || "",
                      ),
                      "_blank",
                    )
                  }
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Non-previewable fallback actions (centered if no preview) */}
            {!(
              activeMaterial.type === "image" ||
              activeMaterial.type === "pdf" ||
              activeMaterial.fileUrl?.match(
                /\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i,
              )
            ) && (
              <div className="absolute inset-x-0 bottom-12 flex justify-center">
                <a
                  href={getFullDocumentUrl(
                    activeMaterial.fileUrl || activeMaterial.url || "#",
                  )}
                  download={activeMaterial.title || "download"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-video bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center border-b border-gray-300">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {activeMaterial
                  ? activeMaterial.title
                  : "Select a video to start learning"}
              </h3>
              <p className="text-sm text-gray-600">
                {activeMaterial
                  ? "This material is not a video. Use the tabs below for more information."
                  : "Choose from the course content on the right"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
