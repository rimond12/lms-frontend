"use client";

import React, { useRef, useState } from 'react';
import { TimelineProps } from '@/types/video';
import { formatTime } from '../utils/formatTime';

/**
 * Timeline Control Component
 * Seek bar with buffered progress indicator and time display
 */
export function Timeline({ 
  currentTime, 
  duration, 
  buffered, 
  onSeek 
}: TimelineProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, percent * duration));
    setHoverTime(time);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, percent * duration));
    onSeek(time);
  };

  return (
    <div className="space-y-2 flex-1">
      {/* Timeline Container */}
      <div 
        ref={timelineRef}
        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleTimelineClick}
      >
        {/* Buffered Progress */}
        <div 
          className="absolute h-full bg-white/30 rounded-full transition-all"
          style={{ width: `${buffered}%` }}
        />

        {/* Current Progress */}
        <div 
          className="absolute h-full bg-white rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />

        {/* Progress Handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded pointer-events-none whitespace-nowrap"
            style={{ 
              left: `${(hoverTime / duration) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Hidden range input for accessibility */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={() => setIsSeeking(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Video timeline"
        />
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between text-xs text-white/90 px-1">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
