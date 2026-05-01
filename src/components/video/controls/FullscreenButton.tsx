"use client";

import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { FullscreenButtonProps } from '@/types/video';

/**
 * Fullscreen Toggle Button
 * Toggles fullscreen mode for the video player
 */
export function FullscreenButton({ onToggle }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <button
      onClick={onToggle}
      className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white group"
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
    >
      {isFullscreen ? (
        <Minimize className="w-5 h-5 group-hover:scale-110 transition-transform" />
      ) : (
        <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
