"use client";

import { motion } from "framer-motion";
import { Play, Eye, CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Card } from "../ui/Card";

export interface Video {
  id: string;
  title: string;
  engineer: string;
  category: string;
  company: string;
  views: string;
  date: string;
  duration: string;
  thumbnail: string;
  avatar: string;
  videoUrl: string;
}

interface VideoCardProps {
  video: Video;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleVideoClick = () => {
    window.open(video.videoUrl, "_blank");
  };

  return (
    <Card
      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVideoClick}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        {!imageError ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <Play className="w-16 h-16 text-blue-700" />
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-blue-700 rounded-full p-4 shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1.1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Play className="w-8 h-8 text-white fill-white" />
          </motion.div>
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {video.duration}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {video.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-700 transition-colors min-h-[3rem]">
          {video.title}
        </h3>

        {/* Engineer Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={video.avatar}
              alt={video.engineer}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {video.engineer}
            </p>
            <p className="text-xs text-gray-500 truncate">{video.company}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-700" />
            <span>{video.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-blue-700" />
            <span>{video.date}</span>
          </div>
        </div>
      </div>

      {/* Hover Border */}
      <motion.div
        className="absolute inset-0 border-2 border-blue-700 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </Card>
  );
};
