"use client";

import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { VolumeControlProps } from '@/types/video';

/**
 * Volume Control Component
 * Slider for volume adjustment with mute toggle
 */
export function VolumeControl({ 
  volume, 
  muted, 
  onVolumeChange, 
  onToggleMute 
}: VolumeControlProps) {
  const [showSlider, setShowSlider] = useState(false);

  const getVolumeIcon = () => {
    if (muted || volume === 0) {
      return <VolumeX className="w-5 h-5" />;
    } else if (volume < 0.5) {
      return <Volume1 className="w-5 h-5" />;
    } else {
      return <Volume2 className="w-5 h-5" />;
    }
  };

  return (
    <div 
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={onToggleMute}
        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white group"
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        <div className="group-hover:scale-110 transition-transform">
          {getVolumeIcon()}
        </div>
      </button>

      {/* Volume Slider */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          showSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer accent-white appearance-none slider"
          title={`Volume: ${Math.round((muted ? 0 : volume) * 100)}%`}
          aria-label="Volume slider"
          style={{
            background: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`
          }}
        />
      </div>
    </div>
  );
}
