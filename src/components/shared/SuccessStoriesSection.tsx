'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Award, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SuccessStory } from '@/types/successStory';
import { successStoriesData } from '@/data/successStoriesData';
import Image from 'next/image';

interface SuccessStoriesSectionProps {
  stories?: SuccessStory[];
  autoSlide?: boolean;
  slideInterval?: number;
}

export default function SuccessStoriesSection({
  stories = successStoriesData,
  autoSlide = true,
  slideInterval = 3000,
}: SuccessStoriesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoSlide);
  const [selectedVideo, setSelectedVideo] = useState<SuccessStory | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get YouTube video ID
  const getYouTubeVideoId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return '';
  };

  // Auto slide functionality
  useEffect(() => {
    if (isPlaying && !isHovered && !selectedVideo) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % stories.length);
      }, slideInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isHovered, selectedVideo, stories.length, slideInterval]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleVideoClick = (story: SuccessStory) => {
    setSelectedVideo(story);
    setIsPlaying(false);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setIsPlaying(autoSlide);
  };

  // Get visible cards (show 3 at a time)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % stories.length;
      cards.push(stories[index]);
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <>
      {/* Main Section - Matching Course Details Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100/50 shadow-sm overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header - Matching Other Sections */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-black rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              ক্যাড কোর সাফল্যের গল্প
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-black transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-black transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative overflow-hidden">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            {visibleCards.map((story, index) => (
              <motion.div
                key={`${story.id}-${currentIndex}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleVideoClick(story)}
              >
                {/* Video Card */}
                <div className="relative aspect-[17/10] rounded-xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Thumbnail */}
                  <Image
                    src={story.thumbnail}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play Button */}
                  <div className="absolute inset-0  flex items-center justify-center">
                    <motion.div
                      className="w-10 h-10  rounded-full bg-black bg-opacity-40 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Play className="w-4 h-4  text-white fill-white ml-1" />
                    </motion.div>
                  </div>

                 

                  {/* Duration Badge */}
                  

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                   
                 
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-purple-600'
                  : 'w-1.5 bg-purple-200 hover:bg-purple-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-6 pt-6 border-t border-purple-100 text-center">
          <a
            href="/success-stories"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors group"
          >
            <Play className="w-4 h-4" />
            সব সাফল্যের গল্প দেখুন
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player */}
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.videoUrl)}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-6 bg-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">
                  {selectedVideo.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                      <Image
                        src={selectedVideo.avatar}
                        alt={selectedVideo.engineer}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{selectedVideo.engineer}</span>
                  </div>
                  <span className="text-purple-400">{selectedVideo.category}</span>
                  <span>{selectedVideo.views}</span>
                  <span>{selectedVideo.date}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
