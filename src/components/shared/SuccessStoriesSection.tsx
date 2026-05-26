"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useGetApprovedSuccessStoriesQuery } from "@/app/redux/api/successStoryApi/successStoryApi";
import { TestimonialCard } from "@/app/[locale]/(CommonLayout)/(home)/Landing-page/SuccessStories/SuccessStories";

interface SuccessStoriesSectionProps {
  autoSlide?: boolean;
  slideInterval?: number;
}

export default function SuccessStoriesSection({
  autoSlide = true,
  slideInterval = 5000,
}: SuccessStoriesSectionProps) {
  const { data: response, isLoading } = useGetApprovedSuccessStoriesQuery();
  const stories = response?.data || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100/50 shadow-sm animate-pulse text-center text-slate-500 font-medium">
        Loading success stories...
      </div>
    );
  }

  if (stories.length === 0) {
    return null; // Don't render anything if there are no approved success stories
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100/50 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            সাফল্যের গল্প (Success Stories)
          </h2>
        </div>

        {/* Navigation Controls */}
        {stories.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          autoplay={
            autoSlide
              ? { delay: slideInterval, disableOnInteraction: false }
              : false
          }
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 16 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {stories.map((story, index) => (
            <SwiperSlide key={story._id || index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full py-1"
              >
                <TestimonialCard story={story} />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Progress Indicators */}
      {stories.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => swiperRef.current?.slideTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-blue-600"
                  : "w-1.5 bg-blue-200 hover:bg-blue-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="mt-6 pt-6 border-t border-blue-100 text-center">
        <a
          href="/success-stories"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors group"
        >
          সব সাফল্যের গল্প দেখুন
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>
      </div>
    </motion.div>
  );
}
