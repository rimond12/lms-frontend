"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { VideoPlayerProps } from "@/types/video";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { PlayPause } from "./controls/PlayPause";
import { VolumeControl } from "./controls/VolumeControl";
import { Timeline } from "./controls/Timeline";
import { FullscreenButton } from "./controls/FullscreenButton";
import { Play, Loader2, SkipBack, SkipForward } from "lucide-react";
import VdoCipherPlayer from "./VdoCipherPlayer";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    youtubeAPIReady: boolean;
    youtubeAPICallbacks: (() => void)[];
  }
}

// Initialize global YouTube callback system
if (typeof window !== "undefined") {
  window.youtubeAPICallbacks = window.youtubeAPICallbacks || [];

  // Only set up the global callback once
  if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = () => {
      window.youtubeAPIReady = true;
      // Execute all registered callbacks
      window.youtubeAPICallbacks.forEach((cb) => cb());
      window.youtubeAPICallbacks = [];
    };
  }
}

function StandardVideoPlayer({
  videoType,
  videoId,
  videoUrl,
  vdocipherVideoId,
  thumbnail,
  title,
  className = "",
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  autoPlay = false,
  onViewed,
  onPreviousLesson,
  onNextLesson,
  hasPreviousLesson = false,
  hasNextLesson = false,
  currentLessonIndex = 0,
  totalLessons = 0,
}: VideoPlayerProps) {
  // Rest of the component for YouTube and file videos
  const { state, controls, videoRef, containerRef } = useVideoPlayer();
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false); // Track if YouTube player is truly ready
  const [showTopOverlay, setShowTopOverlay] = useState(false); // Show title overlay on top

  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(true); // Ref to track loading state for timeout
  const mountedRef = useRef(true); // Track if component is mounted
  const instanceIdRef = useRef(Date.now()); // Unique instance ID
  const pendingPlayRef = useRef(false); // Queue play command if clicked before ready
  const playerReadyRef = useRef(false); // Ref version of playerReady for callbacks
  const topOverlayTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timer for top overlay

  // Generate stable player ID based on instance
  const playerId = `yt-player-${instanceIdRef.current}`;

  // Sync loading ref with state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Reset states when video changes
  useEffect(() => {
    setHasStarted(false);
    setIsLoading(true);
    setDuration(0);
    setPlayerReady(false);
    setShowTopOverlay(false);
    isLoadingRef.current = true;
    playerReadyRef.current = false;
    pendingPlayRef.current = false;

    // Cleanup previous player
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      youtubePlayerRef.current = null;
    }

    // Clear previous interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Clear top overlay timer
    if (topOverlayTimeoutRef.current) {
      clearTimeout(topOverlayTimeoutRef.current);
      topOverlayTimeoutRef.current = null;
    }
  }, [videoType, videoId, videoUrl]);

  // Auto-hide controls after 2.5 seconds of inactivity
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    if (state.playing && hasStarted) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [state.playing, hasStarted]);

  const handleMouseMove = () => {
    resetHideControlsTimer();
  };

  // Show controls when paused
  useEffect(() => {
    if (!state.playing) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    } else {
      resetHideControlsTimer();
    }
  }, [state.playing, resetHideControlsTimer]);

  // YouTube Player Initialization
  useEffect(() => {
    if (videoType !== "youtube" || !videoId) {
      setIsLoading(false);
      isLoadingRef.current = false;
      return;
    }

    mountedRef.current = true;
    const currentInstanceId = instanceIdRef.current;

    const initPlayer = () => {
      // Check if component is still mounted and same instance
      if (!mountedRef.current || instanceIdRef.current !== currentInstanceId) {
        return;
      }

      // Wait for DOM element to be ready
      const attemptInit = (retries = 0) => {
        if (
          !mountedRef.current ||
          instanceIdRef.current !== currentInstanceId
        ) {
          return;
        }

        const playerElement = document.getElementById(playerId);

        if (!playerElement) {
          if (retries < 10) {
            setTimeout(() => attemptInit(retries + 1), 100);
          } else {
            setIsLoading(false);
            isLoadingRef.current = false;
          }
          return;
        }

        if (window.YT && window.YT.Player) {
          try {
            youtubePlayerRef.current = new window.YT.Player(playerId, {
              videoId: videoId,
              playerVars: {
                autoplay: autoPlay ? 1 : 0,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 1,
                enablejsapi: 1,
                playsinline: 1,
              },
              events: {
                onReady: (event: any) => {
                  if (
                    !mountedRef.current ||
                    instanceIdRef.current !== currentInstanceId
                  ) {
                    return;
                  }

                  event.target.setVolume(state.volume * 100);
                  const videoDuration = event.target.getDuration();
                  if (videoDuration) {
                    setDuration(videoDuration);
                  }

                  setIsLoading(false);
                  isLoadingRef.current = false;
                  setPlayerReady(true);
                  playerReadyRef.current = true;

                  controls.seek(0);
                  controls.setVolume(state.volume);

                  // Execute pending play if user clicked before player was ready
                  if (pendingPlayRef.current) {
                    pendingPlayRef.current = false;
                    event.target.playVideo();
                  }

                  // Auto-play on page load if autoPlay is true
                  if (autoPlay) {
                    setHasStarted(true);
                    event.target.playVideo();
                  }
                },
                onStateChange: (event: any) => {
                  if (
                    !mountedRef.current ||
                    instanceIdRef.current !== currentInstanceId
                  ) {
                    return;
                  }

                  // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
                  if (event.data === 1) {
                    // Playing
                    controls.play();
                    setHasStarted(true);
                    onPlay?.();

                    // Show top overlay with title for 4 seconds
                    setShowTopOverlay(true);
                    if (topOverlayTimeoutRef.current) {
                      clearTimeout(topOverlayTimeoutRef.current);
                    }
                    topOverlayTimeoutRef.current = setTimeout(() => {
                      if (mountedRef.current) {
                        setShowTopOverlay(false);
                      }
                    }, 4000);

                    // Update duration if not set
                    if (!duration && youtubePlayerRef.current?.getDuration) {
                      const d = youtubePlayerRef.current.getDuration();
                      if (d) setDuration(d);
                    }

                    // Start progress tracking
                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                    }
                    progressIntervalRef.current = setInterval(() => {
                      if (youtubePlayerRef.current?.getCurrentTime) {
                        const currentTime =
                          youtubePlayerRef.current.getCurrentTime();
                        controls.seek(currentTime);
                        onTimeUpdate?.(currentTime);
                      }
                    }, 100);
                  } else if (event.data === 2) {
                    // Paused
                    controls.pause();
                    onPause?.();

                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                      progressIntervalRef.current = null;
                    }
                  } else if (event.data === 0) {
                    // Ended
                    controls.stop();
                    setHasStarted(false);
                    onEnded?.();

                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                      progressIntervalRef.current = null;
                    }
                  } else if (event.data === 3) {
                    // Buffering
                    // Keep playing state during buffering
                  }
                },
                onError: (event: any) => {
                  console.error("YouTube player error:", event.data);
                  setIsLoading(false);
                  isLoadingRef.current = false;
                },
              },
            });
          } catch (error) {
            console.error("Failed to create YouTube player:", error);
            setIsLoading(false);
            isLoadingRef.current = false;
          }
        }
      };

      attemptInit();
    };

    // Load YouTube iframe API if needed
    if (!window.YT || !window.YT.Player) {
      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src*="youtube.com/iframe_api"]',
      );

      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Register callback
      if (window.youtubeAPIReady) {
        initPlayer();
      } else {
        window.youtubeAPICallbacks.push(initPlayer);
      }
    } else {
      initPlayer();
    }

    // Fallback timeout using ref
    const fallbackTimeout = setTimeout(() => {
      if (
        isLoadingRef.current &&
        mountedRef.current &&
        instanceIdRef.current === currentInstanceId
      ) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }, 8000);

    return () => {
      mountedRef.current = false;

      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        youtubePlayerRef.current = null;
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      clearTimeout(fallbackTimeout);
    };
  }, [videoType, videoId]);

  // Direct Video File Handlers
  useEffect(() => {
    if (videoType !== "file" || !videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedMetadata = () => {
      controls.seek(0);
      setDuration(video.duration || 0);
      setIsLoading(false);
      isLoadingRef.current = false;
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      isLoadingRef.current = false;
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      isLoadingRef.current = true;
    };

    const handlePlay = () => {
      controls.play();
      setHasStarted(true);
      onPlay?.();
    };

    const handlePause = () => {
      controls.pause();
      onPause?.();
    };

    const handleEnded = () => {
      controls.stop();
      setHasStarted(false);
      onEnded?.();
    };

    const handleTimeUpdate = () => {
      controls.seek(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleVolumeChange = () => {
      controls.setVolume(video.volume);
      if (video.muted !== state.muted) {
        controls.toggleMute();
      }
    };

    const handleDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      isLoadingRef.current = false;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("error", handleError);
    };
  }, [videoType, videoUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (topOverlayTimeoutRef.current) {
        clearTimeout(topOverlayTimeoutRef.current);
      }
    };
  }, []);

  // Control Handlers
  const handlePlay = () => {
    setHasStarted(true);
    setShowControls(true);

    if (videoType === "youtube") {
      // Check if player is ready
      if (playerReadyRef.current && youtubePlayerRef.current) {
        if (typeof youtubePlayerRef.current.playVideo === "function") {
          youtubePlayerRef.current.playVideo();
        }
      } else {
        // Player not ready yet, queue the play command
        pendingPlayRef.current = true;
        console.log("YouTube player not ready, queuing play command");
      }
    } else if (videoType === "file" && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Play error:", err);
      });
    }
  };

  const handlePause = () => {
    if (videoType === "youtube" && youtubePlayerRef.current) {
      if (typeof youtubePlayerRef.current.pauseVideo === "function") {
        youtubePlayerRef.current.pauseVideo();
      }
    } else if (videoType === "file" && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleTogglePlay = () => {
    if (state.playing) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleSeek = (time: number) => {
    if (videoType === "youtube" && youtubePlayerRef.current) {
      if (typeof youtubePlayerRef.current.seekTo === "function") {
        youtubePlayerRef.current.seekTo(time, true);
      }
    } else if (videoType === "file" && videoRef.current) {
      videoRef.current.currentTime = time;
    }

    controls.seek(time);
  };

  const handleVolumeChange = (volume: number) => {
    if (videoType === "youtube" && youtubePlayerRef.current) {
      if (typeof youtubePlayerRef.current.setVolume === "function") {
        youtubePlayerRef.current.setVolume(volume * 100);
      }
    } else if (videoType === "file" && videoRef.current) {
      videoRef.current.volume = volume;
    }

    controls.setVolume(volume);
  };

  const handleToggleMute = () => {
    if (videoType === "youtube" && youtubePlayerRef.current) {
      if (state.muted) {
        if (typeof youtubePlayerRef.current.unMute === "function") {
          youtubePlayerRef.current.unMute();
        }
      } else {
        if (typeof youtubePlayerRef.current.mute === "function") {
          youtubePlayerRef.current.mute();
        }
      }
    } else if (videoType === "file" && videoRef.current) {
      videoRef.current.muted = !state.muted;
    }

    controls.toggleMute();
  };

  const handleFullscreen = async () => {
    await controls.toggleFullscreen();
  };

  // Get current duration (from state or try to get from player)
  const getCurrentDuration = useCallback(() => {
    if (duration > 0) return duration;

    if (videoType === "youtube" && youtubePlayerRef.current?.getDuration) {
      const d = youtubePlayerRef.current.getDuration();
      if (d && d > 0) {
        setDuration(d);
        return d;
      }
    }

    if (videoType === "file" && videoRef.current?.duration) {
      const d = videoRef.current.duration;
      if (d && isFinite(d)) {
        setDuration(d);
        return d;
      }
    }

    return 0;
  }, [duration, videoType]);

  // Validate props
  if (videoType === "youtube" && !videoId) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-white text-sm">
          Error: YouTube video ID is required
        </p>
      </div>
    );
  }

  if (videoType === "file" && !videoUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-white text-sm">Error: Video URL is required</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-white rounded-lg overflow-hidden shadow-2xl ${className}`}
      style={{ aspectRatio: "16/9" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => state.playing && setShowControls(false)}
    >
      {/* Video Element for Direct Files */}
      {videoType === "file" && videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnail}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ objectFit: "contain" }}
          preload="metadata"
          playsInline
        />
      )}

      {/* YouTube Iframe Container */}
      {videoType === "youtube" && videoId && (
        <div
          id={playerId}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: hasStarted ? "none" : "auto" }}
        />
      )}

      {/* Top Overlay - Covers YouTube Share button and shows title */}
      {hasStarted && (showTopOverlay || !state.playing) && title && (
        <div
          className="absolute top-0 left-0 right-0 z-40 transition-opacity duration-300"
          style={{
            pointerEvents: "none",
          }}
        >
          {/* Gradient overlay - covers YouTube's UI - DARKER version */}
          <div className="bg-gradient-to-b from-black via-black/85 to-transparent pt-4 pb-20 px-5">
            <div className="flex items-center gap-3">
              {/* Play/Pause indicator icon */}
              <div
                className={`shrink-0 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center ${
                  state.playing ? "bg-emerald-500/20" : "bg-amber-500/20"
                }`}
              >
                <Play
                  className={`w-5 h-5 ${
                    state.playing
                      ? "text-emerald-400 fill-emerald-400"
                      : "text-amber-400 fill-amber-400"
                  }`}
                />
              </div>

              {/* Title and status */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium tracking-wide uppercase mb-0.5 ${
                    state.playing ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {state.playing ? "Now Playing" : "Paused"}
                </p>
                <h3 className="text-white text-base font-semibold truncate drop-shadow-lg">
                  {title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black z-10">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-white text-base font-semibold">
              Loading video...
            </p>
            <p className="text-gray-400 text-sm mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay (before video starts) */}
      {!hasStarted && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-20">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title || "Video thumbnail"}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              style={{ zIndex: -1 }}
            />
          )}

          {/* Video Title */}
          {title && (
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
              <h3 className="text-white text-xl font-bold drop-shadow-lg">
                {title}
              </h3>
            </div>
          )}

          {/* Custom Play Button */}
          <button
            onClick={handlePlay}
            className="group relative z-30 focus:outline-none focus:ring-4 focus:ring-white/50 rounded-full"
            aria-label="Play video"
          >
            <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-300 animate-pulse" />
            <div className="relative bg-red-600 hover:bg-red-700 rounded-full p-8 transition-all duration-300 transform group-hover:scale-110 shadow-2xl">
              <Play className="w-16 h-16 text-white fill-white" />
            </div>
          </button>

          {/* Duration Badge */}
          {videoType === "youtube" && (
            <div className="absolute bottom-24 bg-black/80 px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-medium">Click to play</p>
            </div>
          )}
        </div>
      )}

      {/* Custom Controls Bar - Auto-hide with smooth transition */}
      {hasStarted && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-30 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          style={{ pointerEvents: showControls ? "auto" : "none" }}
        >
          <div className="p-4 space-y-3">
            {/* Timeline */}
            <Timeline
              currentTime={state.currentTime}
              duration={getCurrentDuration()}
              buffered={state.buffered}
              onSeek={handleSeek}
            />

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-2">
              {/* Left Controls - Play/Pause + Navigation */}
              <div className="flex items-center gap-1">
                {/* Previous Lesson Button */}
                {(hasPreviousLesson || hasNextLesson) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviousLesson?.();
                    }}
                    disabled={!hasPreviousLesson}
                    className={`p-2 rounded-lg transition-all ${
                      hasPreviousLesson
                        ? "text-white hover:bg-white/20"
                        : "text-white/30 cursor-not-allowed"
                    }`}
                    title="Previous Lesson"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                )}

                <PlayPause
                  playing={state.playing}
                  onToggle={handleTogglePlay}
                />

                {/* Next Lesson Button */}
                {(hasPreviousLesson || hasNextLesson) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNextLesson?.();
                    }}
                    disabled={!hasNextLesson}
                    className={`p-2 rounded-lg transition-all ${
                      hasNextLesson
                        ? "text-white hover:bg-white/20"
                        : "text-white/30 cursor-not-allowed"
                    }`}
                    title="Next Lesson"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                )}

                <VolumeControl
                  volume={state.volume}
                  muted={state.muted}
                  onToggleMute={handleToggleMute}
                  onVolumeChange={handleVolumeChange}
                />
              </div>

              {/* Center - Lesson Counter */}
              {totalLessons > 0 && (
                <div className="text-white text-xs font-medium">
                  {currentLessonIndex + 1} / {totalLessons}
                </div>
              )}

              {/* Right Controls */}
              <div className="flex items-center gap-1">
                <FullscreenButton onToggle={handleFullscreen} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click to Toggle Play/Pause - Only active when controls are visible */}
      {hasStarted && !isLoading && (
        <div
          onClick={handleTogglePlay}
          className="absolute inset-0 cursor-pointer"
          style={{ zIndex: 5 }}
        />
      )}
    </div>
  );
}

export function VideoPlayer(props: VideoPlayerProps) {
  // If VdoCipher video, use the dedicated player
  if (props.videoType === "vdocipher" && props.vdocipherVideoId) {
    return (
      <VdoCipherPlayer
        videoId={props.vdocipherVideoId}
        title={props.title}
        className={props.className}
        onPlay={props.onPlay}
        onPause={props.onPause}
        onEnded={props.onEnded}
        onTimeUpdate={
          props.onTimeUpdate
            ? (current, duration) => props.onTimeUpdate!(current)
            : undefined
        }
        onViewed={props.onViewed}
        autoPlay={props.autoPlay}
      />
    );
  }

  // Otherwise use the standard player (YouTube/File)
  return <StandardVideoPlayer {...props} />;
}
