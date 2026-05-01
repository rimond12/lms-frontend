"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
  X,
  Loader,
  Eye,
} from 'lucide-react';

interface SecureVideoPlayerProps {
  url: string;
  title: string;
  description?: string;
  onClose: () => void;
  onViewed: () => void;
  materialId: string;
}

// Helper function to detect video platform and extract ID
const getVideoEmbedUrl = (url: string): { embedUrl: string; platform: string } | null => {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?controls=1&modestbranding=1`,
      platform: 'YouTube',
    };
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'Vimeo',
    };
  }

  // Dailymotion
  const dailymotionRegex = /dailymotion\.com\/video\/([a-zA-Z0-9_-]+)/;
  const dailymotionMatch = url.match(dailymotionRegex);
  if (dailymotionMatch) {
    return {
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`,
      platform: 'Dailymotion',
    };
  }

  // Wistia
  const wistiaRegex = /wistia\.com\/medias\/([a-zA-Z0-9]+)/;
  const wistiaMatch = url.match(wistiaRegex);
  if (wistiaMatch) {
    return {
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`,
      platform: 'Wistia',
    };
  }

  // Bunny CDN
  if (url.includes('bunnycdn.com') || url.includes('b-cdn.net')) {
    return {
      embedUrl: url,
      platform: 'Bunny CDN',
    };
  }

  // Direct MP4/WebM/OGG
  if (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg') ||
    url.includes('mp4') ||
    url.includes('video')
  ) {
    return {
      embedUrl: url,
      platform: 'Direct Video',
    };
  }

  return null;
};

export default function SecureVideoPlayer({
  url,
  title,
  description,
  onClose,
  onViewed,
  materialId,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasViewed, setHasViewed] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{ embedUrl: string; platform: string } | null>(null);

  // Detect video platform on mount
  useEffect(() => {
    const info = getVideoEmbedUrl(url);
    if (info) {
      setVideoInfo(info);
      setIsLoading(false);
    } else {
      setError('Unsupported video format. Please use YouTube, Vimeo, or direct video link.');
      setIsLoading(false);
    }
  }, [url]);

  // Handle fullscreen
  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Mark as viewed - for embedded videos, mark immediately
  const markAsViewed = () => {
    if (!hasViewed) {
      setHasViewed(true);
      onViewed();
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle time update for direct videos
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Mark as viewed after 5 seconds of watching
      if (!hasViewed && videoRef.current.currentTime >= 5) {
        markAsViewed();
      }
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error('Play error:', err);
        });
      }
      setIsPlaying(!isPlaying);
      // Mark as viewed when user starts playing
      markAsViewed();
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement as Node)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          handleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isMuted]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        className={`bg-black rounded-lg overflow-hidden shadow-2xl ${
          isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full max-w-4xl'
        }`}
      >
        {/* Video Container */}
        <div className="relative bg-black aspect-video w-full">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-800 mx-auto mb-2" />
                <p className="text-white text-sm max-w-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Direct Video Player */}
          {videoInfo?.platform === 'Direct Video' && videoInfo.embedUrl && (
            <>
              <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error('Video error:', e);
                  setError('Failed to load video. Please check the URL.');
                }}
                className="w-full h-full object-cover select-none"
                controlsList="nodownload"
              >
                <source src={videoInfo.embedUrl} type="video/mp4" />
                <p className="text-white text-center p-4">
                  Your browser does not support HTML5 video.
                </p>
              </video>

              {/* Play Button Overlay */}
              {!isPlaying && !error && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                >
                  <div className="bg-red-800 hover:bg-red-700 rounded-full p-4 transition-colors shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </motion.button>
              )}
            </>
          )}

          {/* Embedded Video Player (YouTube, Vimeo, etc.) */}
          {videoInfo?.platform !== 'Direct Video' && videoInfo?.embedUrl && !error && (
            <iframe
              src={videoInfo.embedUrl}
              title={title}
              className="w-full h-full border-none"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={() => {
                markAsViewed();
              }}
            />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 p-2 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4">
            <div className="flex items-center gap-2">
              {videoInfo?.platform && (
                <span className="px-2 py-1 bg-red-800 text-white text-xs font-bold rounded">
                  {videoInfo.platform}
                </span>
              )}
              <h3 className="text-white font-bold text-sm line-clamp-2 flex-1">{title}</h3>
            </div>
          </div>

          {/* Viewed Indicator */}
          {hasViewed && (
            <div className="absolute top-16 right-4 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5" />
              Viewed
            </div>
          )}
        </div>

        {/* Controls Bar - Only for Direct Videos */}
        {videoInfo?.platform === 'Direct Video' && (
          <div className="bg-gray-900 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-700 rounded-full cursor-pointer accent-red-800 hover:h-2 transition-all"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
                  title="Play/Pause (Space)"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
                  title="Mute (M)"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                {/* Playback Rate */}
                <div className="flex items-center">
                  <select
                    value={playbackRate}
                    onChange={(e) =>
                      handlePlaybackRateChange(parseFloat(e.target.value))
                    }
                    className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Fullscreen */}
                <button
                  onClick={handleFullscreen}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
                  title="Fullscreen (F)"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700 space-y-1">
              <p className="font-semibold text-gray-400">Keyboard: Space (Play) | M (Mute) | F (Fullscreen)</p>
            </div>
          </div>
        )}

        {/* Video Info Footer */}
        {!isFullscreen && (
          <div className="bg-gray-50 p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900">{title}</h2>
              {videoInfo?.platform && (
                <p className="text-xs text-gray-600 font-medium">
                  Platform: <span className="font-semibold">{videoInfo.platform}</span>
                </p>
              )}
              {description && (
                <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
              )}
              {hasViewed && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded">
                  <Eye className="w-4 h-4" />
                  Material marked as viewed
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
