/**
 * Video Player Type Definitions
 * Clean, type-safe interfaces for the video player system
 */

export type VideoType = 'youtube' | 'file' | 'vdocipher';

export interface VideoPlayerProps {
  videoType: VideoType;
  videoId?: string;
  videoUrl?: string;
  // VdoCipher Video ID for secure DRM-protected videos
  vdocipherVideoId?: string;
  thumbnail?: string;
  title?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  autoPlay?: boolean;
  onViewed?: () => void;
  // Navigation props for LMS-style player
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
  hasPreviousLesson?: boolean;
  hasNextLesson?: boolean;
  currentLessonIndex?: number;
  totalLessons?: number;
}

export interface VideoState {
  currentTime: number;
  duration: number;
  volume: number;
  playing: boolean;
  loading: boolean;
  buffered: number;
  fullscreen: boolean;
  muted: boolean;
}

export interface VideoControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

export interface UseVideoPlayerReturn {
  state: VideoState;
  controls: VideoControls;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface ControlButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

export interface TimelineProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

export interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export interface PlayPauseProps {
  playing: boolean;
  onToggle: () => void;
}

export interface FullscreenButtonProps {
  onToggle: () => void;
}
