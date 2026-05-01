"use client";

import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { PlayPauseProps } from '@/types/video';

/**
 * Play/Pause/Stop Control Button
 * Displays play or pause icon based on current state
 */
export function PlayPause({ playing, onToggle }: PlayPauseProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onToggle}
        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white group"
        title={playing ? 'Pause' : 'Play'}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <Pause className="w-5 h-5 group-hover:scale-110 transition-transform" />
        ) : (
          <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
}
