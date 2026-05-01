"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { VideoState, VideoControls, UseVideoPlayerReturn } from '@/types/video';

export function useVideoPlayer(): UseVideoPlayerReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<VideoState>({
    currentTime: 0,
    duration: 0,
    volume: 1,
    playing: false,
    loading: false,
    buffered: 0,
    fullscreen: false,
    muted: false,
  });

  const play = useCallback(() => {
    setState(prev => ({ ...prev, playing: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, playing: false }));
  }, []);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, playing: false, currentTime: 0 }));
  }, []);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, playing: !prev.playing }));
  }, []);

  const seek = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ 
      ...prev, 
      volume: clampedVolume,
      muted: clampedVolume === 0 
    }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  // Handle fullscreen changes from browser (e.g. ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, fullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Memoize controls to prevent infinite re-renders
  const controls: VideoControls = useMemo(() => ({
    play,
    pause,
    stop,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
  }), [play, pause, stop, togglePlay, seek, setVolume, toggleMute, toggleFullscreen]);

  return {
    state,
    controls,
    videoRef,
    containerRef,
  };
}
