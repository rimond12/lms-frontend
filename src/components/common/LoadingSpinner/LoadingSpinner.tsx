"use client";

import React from "react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = true,
  message = "Processing...",
  size = "md",
}) => {
  const containerSizeMap = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const ringSizeMap = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const logoSizeMap = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-18 h-18",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-300">
      {/* Dynamic Animated Floating Logo Assembly */}
      <div
        className={`relative flex items-center justify-center ${containerSizeMap[size]}`}
      >
        {/* Soft Glowing Background Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-2xl animate-pulse" />

        {/* Outer Static Subtle Track */}
        <div
          className={`absolute ${ringSizeMap[size]} rounded-full border-2 border-white/20 dark:border-white/10`}
        />

        {/* Primary Rotating Gradient Ring (Electric Blue to Royal Indigo) */}
        <div
          className={`absolute ${ringSizeMap[size]} rounded-full border-[3.5px] border-transparent border-t-blue-500 border-r-indigo-500 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]`}
          style={{ animationDuration: "0.85s" }}
        />

        {/* Inner Counter-Rotating Accent Ring (Purple to Cyan) */}
        <div
          className={`absolute ${ringSizeMap[size]} rounded-full border-[2.5px] border-transparent border-b-purple-400 border-l-cyan-400 animate-spin`}
          style={{ animationDuration: "1.3s", animationDirection: "reverse" }}
        />

        {/* Floating Center Logo Badge (No Card Background Box) */}
        <div className="relative z-10 bg-white/90 dark:bg-slate-900/90 p-4 rounded-full shadow-2xl shadow-blue-600/30 border border-white/90 dark:border-slate-800 flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105">
          <img
            src="/images/imigrant-1.png"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/imigrant-2.png";
            }}
            alt="Loading..."
            className={`${logoSizeMap[size]} object-contain animate-pulse`}
          />
        </div>
      </div>

      {/* Floating Text Message & Animated Dots */}
      {message && (
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <p className="text-sm font-bold text-white dark:text-slate-100 tracking-wide drop-shadow-md">
            {message}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.32s] shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s] shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/30 dark:bg-black/50 backdrop-blur-md transition-all duration-300">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;