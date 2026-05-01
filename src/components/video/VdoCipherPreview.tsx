/**
 * VdoCipherPreview Component
 * Shows a preview of VdoCipher video in admin panel
 * Used when adding/editing lessons
 */

"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Eye, Play } from "lucide-react";

interface VdoCipherPreviewProps {
  videoId: string;
  onValidate?: (isValid: boolean, info?: VideoInfo) => void;
}

interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  status: string;
  poster?: string;
}

export function VdoCipherPreview({
  videoId,
  onValidate,
}: VdoCipherPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = useState<string | null>(null);

  // Debounced validation
  useEffect(() => {
    if (!videoId || videoId.length < 10) {
      setIsValid(null);
      setVideoInfo(null);
      return;
    }

    const timer = setTimeout(() => {
      validateVideo();
    }, 500);

    return () => clearTimeout(timer);
  }, [videoId]);

  const validateVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vdocipher/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
          credentials: "include",
        },
      );

      const data = await response.json();
      const valid = data.success && data.data?.isValid;

      setIsValid(valid);
      onValidate?.(valid);

      if (!valid) {
        setVideoInfo(null);
      }
    } catch {
      setIsValid(false);
      onValidate?.(false);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vdocipher/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data.success && data.data) {
        setOtp(data.data.otp);
        setPlaybackInfo(data.data.playbackInfo);
        setShowPlayer(true);
      }
    } catch (error) {
      console.error("Preview load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!videoId || videoId.length < 10) {
    return null;
  }

  // Show player preview
  if (showPlayer && otp && playbackInfo) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Video Preview
          </span>
          <button
            onClick={() => {
              setShowPlayer(false);
              setOtp(null);
              setPlaybackInfo(null);
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <div style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
            className="w-full h-full"
            frameBorder="0"
            allow="encrypted-media; autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Show validation status
  return (
    <div className="mt-2 flex items-center gap-2">
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-500">Validating...</span>
        </>
      ) : isValid === true ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">Valid Video ID</span>
          <button
            onClick={loadPreview}
            className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded transition-colors"
          >
            <Play className="w-3 h-3" />
            Preview
          </button>
        </>
      ) : isValid === false ? (
        <>
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">Invalid Video ID</span>
        </>
      ) : null}
    </div>
  );
}

export default VdoCipherPreview;
