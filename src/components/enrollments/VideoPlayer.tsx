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
  Loader,
  Eye,
  Settings,
  Share2,
  BookmarkPlus,
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  description?: string;
  onViewed: () => void;
  materialId: string;
  hasViewed: boolean;
}

// Helper function to detect video platform and extract ID
const getVideoEmbedUrl = (url: string): { embedUrl: string; platform: string } | null => {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?controls=1&modestbranding=1&rel=0`,
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

export default function VideoPlayer({
  url,
  title,
  description,
  onViewed,
  materialId,
  hasViewed,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isViewed, setIsViewed] = useState(hasViewed);
  const [videoInfo, setVideoInfo] = useState<{ embedUrl: string; platform: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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

  // Mark as viewed
  const markAsViewed = () => {
    if (!isViewed) {
      setIsViewed(true);
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
      if (!isViewed && videoRef.current.currentTime >= 5) {
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
    setShowSettings(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (videoRef.current && videoRef.current.contains(document.activeElement as Node)) {
        switch (e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
          case 'm':
            toggleMute();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isMuted]);

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-800 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Video</h3>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
          <p className="text-white text-sm">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
      ref={containerRef}
    >
      {/* Video Container */}
      <div
        className="relative w-full aspect-video bg-black rounded-t-lg overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
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
              className="w-full h-full object-cover"
              controlsList="nodownload"
            >
              <source src={videoInfo.embedUrl} type="video/mp4" />
              <p className="text-white text-center p-4">
                Your browser does not support HTML5 video.
              </p>
            </video>

            {/* Play Button Overlay */}
            {!isPlaying && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center group cursor-pointer"
              >
                <div className="bg-red-800/80 hover:bg-red-800 rounded-full p-5 transition-colors ">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </motion.button>
            )}

            {/* Custom Controls Bar - Only show on hover or playing */}
            {(isHovering || isPlaying) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 space-y-3"
              >
                {/* Progress Bar */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-700/50 rounded-full cursor-pointer accent-red-800 hover:h-1.5 transition-all"
                  />
                  <div className="flex justify-between text-xs text-gray-300">
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
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                      title="Play/Pause"
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
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                      title="Mute"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>

                    {/* Settings Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>

                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute bottom-full mb-2 left-0 bg-gray-900/95 border border-gray-700 rounded-lg  overflow-hidden z-20"
                        >
                          <div className="p-2 space-y-1 min-w-max">
                            <p className="text-xs font-semibold text-gray-300 px-3 py-2">
                              Playback Speed
                            </p>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handlePlaybackRateChange(rate)}
                                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                                  playbackRate === rate
                                    ? 'bg-red-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Fullscreen */}
                    <button
                      onClick={() => {
                        if (videoRef.current?.requestFullscreen) {
                          videoRef.current.requestFullscreen();
                        }
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                      title="Fullscreen"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Embedded Video Player (YouTube, Vimeo, etc.) */}
        {videoInfo?.platform !== 'Direct Video' && videoInfo?.embedUrl && (
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

        {/* Platform Badge */}
        {videoInfo?.platform && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            {videoInfo.platform}
          </div>
        )}

        {/* View Status Badge */}
        {isViewed && (
          <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Viewed
          </div>
        )}
      </div>

      {/* Video Information Section */}
      <div className="p-6 bg-white space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {videoInfo?.platform && (
            <p className="text-xs text-gray-500 mt-1">
              Video hosted on {videoInfo.platform}
            </p>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        )}

       
      </div>

      {/* Keyboard Shortcuts Info */}
      {videoInfo?.platform === 'Direct Video' && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <p className="font-medium text-gray-700 mb-1">💡 Tip:</p>
          <p>Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 text-gray-900 font-mono text-xs">Space</kbd> to play/pause or <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 text-gray-900 font-mono text-xs">M</kbd> to mute</p>
        </div>
      )}
    </motion.div>
  );
}
