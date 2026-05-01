/**
 * VdoCipherPlayer Component - Enhanced
 * Features:
 * - Secure DRM-protected video playback
 * - Auto OTP generation (students see nothing)
 * - Progress tracking with auto-save
 * - Resume from last position
 * - Retry on network failure
 * - Beautiful loading states
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  Lock,
  RefreshCw,
  CheckCircle,
  Play,
} from "lucide-react";

interface VdoCipherPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onViewed?: () => void;
  autoPlay?: boolean;
  // Progress tracking props
  batchId?: string;
  courseId?: string;
  lessonId?: string;
  moduleId?: string;
}

interface OTPResponse {
  success: boolean;
  data?: {
    otp: string;
    playbackInfo: string;
  };
  message?: string;
}

interface ResumeResponse {
  success: boolean;
  data?: {
    resumePosition: number;
  };
}

// Module-level cache to handle Strict Mode double-invocation and rapid remounts
const otpCache = new Map<
  string,
  { otp: string; playbackInfo: string; timestamp: number }
>();
const inFlightRequests = new Map<string, Promise<OTPResponse>>();

export function VdoCipherPlayer({
  videoId,
  title,
  className = "",
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onViewed,
  autoPlay = false,
  batchId,
  courseId,
  lessonId,
  moduleId,
}: VdoCipherPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = useState<string | null>(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const fetchingRef = useRef<string | null>(null); // Track which video ID is currently being fetched

  const MAX_RETRIES = 3;

  // Helper to get access token from cookies
  const getAccessToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
    return match ? match[2] : null;
  };

  // Fetch resume position from server
  const fetchResumePosition = useCallback(async () => {
    if (!videoId) return;

    try {
      const params = new URLSearchParams({ videoId });
      if (batchId) params.append("batchId", batchId);
      if (lessonId) params.append("lessonId", lessonId);

      const token = getAccessToken();
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/video-progress/resume?${params}`,
        {
          credentials: "include",
          headers,
        },
      );

      const data: ResumeResponse = await response.json();

      if (data.success && data.data && data.data.resumePosition > 10) {
        setResumePosition(data.data.resumePosition);
        setShowResumePrompt(true);
      }
    } catch (err) {
      // Silently fail - resume is optional
      console.log("Resume position not available");
    }
  }, [videoId, batchId, lessonId]);

  // Fetch OTP from backend
  const fetchOTP = useCallback(async () => {
    if (!videoId) {
      setError("No video ID provided");
      setLoading(false);
      return;
    }

    // Prevent duplicate fetch for same video
    if (fetchingRef.current === videoId) {
      return;
    }
    fetchingRef.current = videoId;

    // Check local cache first (valid for 5 seconds)
    const cached = otpCache.get(videoId);
    if (cached && Date.now() - cached.timestamp < 5000) {
      setOtp(cached.otp);
      setPlaybackInfo(cached.playbackInfo);
      setLoading(false);
      fetchResumePosition();
      return;
    }

    // Check if request is already in flight
    if (inFlightRequests.has(videoId)) {
      try {
        const data = await inFlightRequests.get(videoId)!;
        if (data.success && data.data) {
          setOtp(data.data.otp);
          setPlaybackInfo(data.data.playbackInfo);
          setLoading(false);
          fetchResumePosition();
        }
      } catch (e) {
        // Ignore
      }
      return;
    }

    setLoading(true);
    setError(null);

    const fetchPromise = (async () => {
      const token = getAccessToken();
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vdocipher/otp`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ videoId }),
          credentials: "include",
        },
      );
      return await response.json();
    })();

    inFlightRequests.set(videoId, fetchPromise);

    try {
      const data: OTPResponse = await fetchPromise;

      // Remove from inflight after completion
      inFlightRequests.delete(videoId);

      if (data.success && data.data) {
        setOtp(data.data.otp);
        setPlaybackInfo(data.data.playbackInfo);

        // Cache success
        otpCache.set(videoId, {
          otp: data.data.otp,
          playbackInfo: data.data.playbackInfo,
          timestamp: Date.now(),
        });

        setRetryCount(0);

        // Also fetch resume position
        fetchResumePosition();
      } else {
        // User-friendly error messages
        let errorMsg = data.message || "Failed to load video";
        if (errorMsg.includes("not configured")) {
          errorMsg = "Video service is not configured. Please contact support.";
        } else if (errorMsg.includes("not found")) {
          errorMsg = "This video is no longer available.";
        }

        setError(errorMsg);

        // Auto-retry on certain errors
        if (retryCount < MAX_RETRIES && !errorMsg.includes("not available")) {
          setRetryCount((prev) => prev + 1);
          fetchingRef.current = null; // Allow retry
          setTimeout(fetchOTP, 2000 * (retryCount + 1));
        }
      }
    } catch (err) {
      console.error("VdoCipher OTP fetch error:", err);

      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        fetchingRef.current = null; // Allow retry
        setError(
          `Connection failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`,
        );
        setTimeout(fetchOTP, 2000 * (retryCount + 1));
      } else {
        setError(
          "Unable to connect. Please check your internet connection and try again.",
        );
      }
    } finally {
      if (retryCount >= MAX_RETRIES) {
        fetchingRef.current = null; // Reset on final failure
      }
      setLoading(false);
    }
  }, [videoId, retryCount, fetchResumePosition]);

  useEffect(() => {
    // Reset fetching ref when videoId changes
    return () => {
      fetchingRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    fetchOTP();
  }, [videoId]); // Only re-fetch when videoId changes

  // Save progress to server
  const saveProgress = useCallback(
    async (watchedSeconds: number, totalDuration: number) => {
      if (!videoId || watchedSeconds < 5) return;

      // Avoid saving too frequently
      if (Math.abs(watchedSeconds - lastSavedTimeRef.current) < 10) return;
      lastSavedTimeRef.current = watchedSeconds;

      try {
        const token = getAccessToken();
        const headers: any = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/video-progress/save`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            videoId,
            videoProvider: "vdocipher",
            watchedSeconds,
            totalDuration,
            batchId,
            courseId,
            lessonId,
            moduleId,
          }),
          credentials: "include",
        });
      } catch (err) {
        console.log("Progress save failed silently");
      }
    },
    [videoId, batchId, courseId, lessonId, moduleId],
  );

  // Handle player events via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object") {
        const { event: eventType, data } = event.data;

        switch (eventType) {
          case "play":
            onPlay?.();
            setShowResumePrompt(false);
            break;

          case "pause":
            onPause?.();
            // Save progress on pause
            saveProgress(currentTimeRef.current, durationRef.current);
            break;

          case "ended":
            onEnded?.();
            saveProgress(durationRef.current, durationRef.current);
            break;

          case "timeupdate":
            if (data?.currentTime && data?.duration) {
              currentTimeRef.current = data.currentTime;
              durationRef.current = data.duration;
              onTimeUpdate?.(data.currentTime, data.duration);

              // Mark as viewed after 30% watched
              if (!hasViewed && data.currentTime / data.duration > 0.3) {
                setHasViewed(true);
                onViewed?.();
              }
            }
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onViewed,
    hasViewed,
    saveProgress,
  ]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (otp && playbackInfo) {
      progressSaveIntervalRef.current = setInterval(() => {
        if (currentTimeRef.current > 0) {
          saveProgress(currentTimeRef.current, durationRef.current);
        }
      }, 30000);
    }

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
      // Final save on unmount
      if (currentTimeRef.current > 0) {
        saveProgress(currentTimeRef.current, durationRef.current);
      }
    };
  }, [otp, playbackInfo, saveProgress]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`relative w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden flex items-center justify-center ${className}`}
        style={{ aspectRatio: "16/9" }}
      >
        <div className="text-center text-white">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-indigo-400" />
            <Lock className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300" />
          </div>
          <p className="text-sm text-gray-300">Loading secure video...</p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Attempt {retryCount}/{MAX_RETRIES}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden flex items-center justify-center ${className}`}
        style={{ aspectRatio: "16/9" }}
      >
        <div className="text-center text-white p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => {
              setRetryCount(0);
              fetchOTP();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all transform hover:scale-105 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render VdoCipher iframe player
  if (otp && playbackInfo) {
    // Build embed URL with resume position if available and user accepts
    let embedUrl = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`;
    if (autoPlay) embedUrl += "&autoplay=true";

    return (
      <div
        ref={containerRef}
        className={`relative w-full bg-black rounded-xl overflow-hidden group ${className}`}
        style={{ aspectRatio: "16/9" }}
      >
        {/* Resume prompt */}
        {showResumePrompt && resumePosition > 0 && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Continue Watching?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Resume from {formatTime(resumePosition)}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowResumePrompt(false);
                    // Send seek command to iframe if possible
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.postMessage(
                        { event: "seek", time: resumePosition },
                        "*",
                      );
                    }
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all font-medium"
                >
                  Resume
                </button>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-medium"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Title overlay */}
        {title && (
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-medium truncate">
                {title}
              </span>
            </div>
          </div>
        )}

        {/* VdoCipher iframe */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
        />

        {/* Status badges */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex gap-2">
          {hasViewed && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 backdrop-blur-sm rounded text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>Viewed</span>
            </div>
          )}
          {/* <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-green-400">
            <Lock className="w-3 h-3" />
            <span>DRM Protected</span>
          </div> */}
        </div>
      </div>
    );
  }

  return null;
}

export default VdoCipherPlayer;
