"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Quote, X, User, Star } from "lucide-react";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import { useGetActiveStudentReviewsQuery } from "@/app/redux/api/studentReviewApi/studentReviewApi";

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
};

interface Review {
  _id: string;
  studentName?: string;
  studentPhoto?: string;
  designation?: string;
  reviewText?: string;
  youtubeUrl?: string;
}

// Video Modal
const VideoModal = ({
  isOpen,
  onClose,
  youtubeUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  youtubeUrl: string;
}) => {
  const videoId = getYouTubeVideoId(youtubeUrl);
  if (!isOpen || !videoId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Video Review"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Review Card
const ReviewCard = ({
  review,
  onPlayVideo,
}: {
  review: Review;
  onPlayVideo: (url: string) => void;
}) => {
  const hasVideo = !!review.youtubeUrl;
  const hasText = !!review.reviewText;
  const hasUser = !!(review.studentName || review.studentPhoto);
  const showContent = hasText || hasUser;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
      className="group h-full"
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 h-full flex flex-col relative">
        {/* Decorative Quote Icon Background */}
        {!hasVideo && (
          <div className="absolute top-2 right-4 opacity-5">
            <Quote size={80} className="text-gray-900" fill="currentColor" />
          </div>
        )}

        {/* Video Thumbnail */}
        {hasVideo && (
          <div
            className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
            onClick={() => onPlayVideo(review.youtubeUrl!)}
          >
            <img
              src={getYouTubeThumbnail(review.youtubeUrl!)}
              alt="Video"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow"
              >
                <Play className="w-5 h-5 text-red-600 ml-0.5 fill-red-600" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Content */}
        {showContent && (
          <div className="p-5 flex-1 flex flex-col relative z-10">
            {/* Quote for text-only */}
            {hasText && !hasVideo && (
              <div className="mb-3 text-red-500/80">
                <Quote className="w-6 h-6" fill="currentColor" />
              </div>
            )}

            {/* Review Text */}
            {hasText && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-4 font-medium">
                "{review.reviewText}"
              </p>
            )}

            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3.5 h-3.5 text-yellow-500"
                  fill="currentColor"
                />
              ))}
            </div>

            {/* User Info */}
            {hasUser && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                {review.studentPhoto ? (
                  <img
                    src={review.studentPhoto}
                    alt={review.studentName || "Student"}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-red-50 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {review.studentName || "Student"}
                  </p>
                  {review.designation && (
                    <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                      {review.designation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Component
const StudentReviews = () => {
  const { data, isLoading, error } = useGetActiveStudentReviewsQuery();
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const reviews = data?.data || [];

  if (error || (!isLoading && reviews.length === 0)) {
    return null;
  }

  return (
    <>
      <section className="py-8 lg:py-10 bg-slate-50/50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[80px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[80px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <ModernSectionHeader
            badge="Reviews"
            title="What Students Say"
            subtitle="Hear from our successful students about their learning experience."
            align="center"
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100"
                >
                  <div className="aspect-video bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="flex items-center gap-3 pt-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full" />
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
            >
              {reviews.map((review: Review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onPlayVideo={(url) => setActiveVideoUrl(url)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <VideoModal
        isOpen={!!activeVideoUrl}
        onClose={() => setActiveVideoUrl(null)}
        youtubeUrl={activeVideoUrl || ""}
      />
    </>
  );
};

export default StudentReviews;
