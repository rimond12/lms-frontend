"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { ArrowRight, Star, Upload, User, Globe, Briefcase, Calendar, MessageSquare, Play, Video, Film, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  useGetApprovedSuccessStoriesQuery,
  useSubmitSuccessStoryMutation,
  TSuccessStory,
} from "@/app/redux/api/successStoryApi/successStoryApi";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

// Helper functions for YouTube URLs
export const getYouTubeVideoId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
};

// Global Video Modal Component with Spring & Cinema Animations
export const SuccessStoryVideoModal = ({
  isOpen,
  onClose,
  videoUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}) => {
  if (!isOpen || !videoUrl) return null;
  const videoId = getYouTubeVideoId(videoUrl);
  const fullVideoUrl = videoUrl.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.immigrantjobsworld.com"}${videoUrl}`
    : videoUrl;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="relative w-full max-w-5xl aspect-video bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] ring-1 ring-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Bar */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-40 flex items-center justify-between px-6 pointer-events-none">
            <div className="flex items-center gap-2 text-white/90">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-blue-400" /> HD Video Review
              </span>
            </div>
            <button
              onClick={onClose}
              className="pointer-events-auto w-10 h-10 bg-black/60 hover:bg-black/90 text-white/90 hover:text-white rounded-full flex items-center justify-center transition-all border border-white/20 shadow-lg hover:scale-110 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1`}
              title="Video Review"
              className="w-full h-full pt-2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={fullVideoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain pt-2 bg-black"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const TestimonialCard = ({
  story,
  onPlayVideo,
}: {
  story: TSuccessStory;
  onPlayVideo?: (videoUrl: string) => void;
}) => {
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.immigrantjobsworld.com";
    return `${apiBaseUrl}${imagePath}`;
  };

  const hasVideo = !!story.videoUrl;
  const youtubeVideoId = getYouTubeVideoId(story.videoUrl);
  const videoThumbnail = youtubeVideoId
    ? getYouTubeThumbnail(story.videoUrl!)
    : story.image
    ? getImageUrl(story.image)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[340px] overflow-hidden group">
      <div>
        {/* Video Thumbnail Header if story has video */}
        {hasVideo ? (
          <div
            className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden group/video"
            onClick={() => onPlayVideo && onPlayVideo(story.videoUrl!)}
          >
            {videoThumbnail ? (
              <img
                src={videoThumbnail}
                alt={story.fullName}
                className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-900 via-slate-900 to-indigo-900 flex items-center justify-center">
                <Film className="w-12 h-12 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Video Badge */}
            <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ভিডিও রিভিউ</span>
            </div>

            {/* Play Button Overlay with Animated Radar Waves */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Radar Waves */}
                <span className="absolute -inset-3 rounded-full bg-blue-500/40 animate-ping opacity-75" />
                <span className="absolute -inset-6 rounded-full bg-amber-400/30 animate-pulse opacity-50" />

                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative w-14 h-14 bg-white text-blue-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)] ring-4 ring-white/40 group-hover/video:ring-amber-400/80 transition-all"
                >
                  <Play className="w-7 h-7 ml-1 fill-blue-700" />
                </motion.div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="p-6">
          {/* Rating and Date */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-0.5 text-yellow-500">
              {Array.from({ length: story.rating || 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {story.date}
            </span>
          </div>

          {/* Story Text */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 italic line-clamp-5">
            &ldquo;{story.story}&rdquo;
          </p>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="p-6 pt-0">
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-blue-50">
            {story.image ? (
              <img
                src={getImageUrl(story.image) || ""}
                alt={story.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
              {story.fullName}
              {hasVideo && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" title="Has video review" />
              )}
            </h4>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <Globe className="w-3 h-3 text-blue-600" /> {story.country} | {story.profession}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessStories: React.FC = () => {
  const t = useTranslations("successStories");
  const tImm = useTranslations("immigrantSuccess");
  const locale = useLocale();
  const isBn = locale === "bn";
  
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.successStories;
  const heading = (isBn ? null : cms?.heading) || t("heading");
  const headingHighlight = (isBn ? null : cms?.headingHighlight) || t("headingHighlight");
  const subheading = (isBn ? null : cms?.subheading) || t("subheading");

  const { data: response, isLoading: isStoriesLoading } = useGetApprovedSuccessStoriesQuery();
  const [submitStory, { isLoading: isSubmitting }] = useSubmitSuccessStoryMutation();
  const stories = response?.data || [];

  const [isOpen, setIsOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoInputMode, setVideoInputMode] = useState<"file" | "url">("file");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    image: "",
    country: "",
    profession: "",
    story: "",
    rating: 5,
    videoUrl: "",
    date: new Date().getFullYear() + " " + (tImm("testimonial.company")?.includes("সফল প্রার্থী") ? "সফল প্রার্থী" : "Successful Candidate"),
  });

  const slidesPerViewDesktop = 3;
  const totalPages = Math.ceil(stories.length / slidesPerViewDesktop);

  const handlePageClick = (pageIndex: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(pageIndex * slidesPerViewDesktop);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.immigrantjobsworld.com";
    return `${apiBaseUrl}${imagePath}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("image", file);

    setIsUploadingPhoto(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
      const responseUpload = await fetch(`${apiBaseUrl}/success-stories/upload-image`, {
        method: "POST",
        body: formDataObj,
      });

      if (!responseUpload.ok) throw new Error("Upload failed");

      const responseData = await responseUpload.json();
      const imageUrl = responseData?.data?.imageUrl;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Profile photo uploaded successfully");
    } catch (err) {
      toast.error("Photo upload failed");
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file must be less than 100MB");
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("video", file);

    setIsUploadingVideo(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
      const responseUpload = await fetch(`${apiBaseUrl}/success-stories/upload-video`, {
        method: "POST",
        body: formDataObj,
      });

      if (!responseUpload.ok) throw new Error("Video upload failed");

      const responseData = await responseUpload.json();
      const videoUrl = responseData?.data?.videoUrl;

      setFormData((prev) => ({ ...prev, videoUrl }));
      toast.success("Review video uploaded successfully!");
    } catch (err) {
      toast.error("Video upload failed. Please try again or use a YouTube link.");
      console.error(err);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.country.trim() || !formData.profession.trim() || !formData.story.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await submitStory(formData).unwrap();
      toast.success("Your success story has been submitted! It will appear on the landing page once approved by the administrator.");
      setIsOpen(false);
      setFormData({
        fullName: "",
        image: "",
        country: "",
        profession: "",
        story: "",
        rating: 5,
        videoUrl: "",
        date: new Date().getFullYear() + " " + (tImm("testimonial.company")?.includes("সফল প্রার্থী") ? "সফল প্রার্থী" : "Successful Candidate"),
      });
    } catch (err) {
      toast.error("Failed to submit success story. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <section className="py-12 sm:py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Title */}
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800">
              {heading}{" "}
              <span className="text-blue-700">{headingHighlight}</span>
            </h2>
            <div className="w-20 h-1.5 bg-blue-700 mx-auto mt-3 rounded-full" />
            <p className="text-gray-500 mt-3 text-sm md:text-base px-4">
              {subheading}
            </p>
          </div>

          {/* White Container */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-blue-50 overflow-hidden">
            {/* Top Bar Header */}
            <div className="bg-blue-700 px-4 sm:px-8 py-5 flex justify-between items-center gap-4">
              <p className="text-white font-bold text-sm sm:text-lg italic uppercase tracking-wide">
                {t("filterLabel") || "Candidates Journeys"}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="bg-white hover:bg-slate-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-white shadow-md flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {tImm("share.submitBtn") || "Share Your Success"}
              </button>
            </div>

            {/* Swiper Section */}
            <div className="px-4 sm:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6">
              {isStoriesLoading ? (
                <div className="text-center py-16 text-gray-400 font-semibold text-sm sm:text-base animate-pulse">
                  Loading success stories...
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-semibold text-sm sm:text-base">
                  {t("empty") || "No success stories available right now."}
                </div>
              ) : (
                <>
                  <div className="relative group">
                    {/* Prev Button — desktop only */}
                    <button className="success-prev absolute left-[-16px] sm:left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-blue-700 text-white p-2.5 sm:p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-900 hidden md:flex items-center justify-center">
                      <FaChevronLeft size={12} />
                    </button>

                    {/* Next Button — desktop only */}
                    <button className="success-next absolute right-[-16px] sm:right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-blue-700 text-white p-2.5 sm:p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-900 hidden md:flex items-center justify-center">
                      <FaChevronRight size={12} />
                    </button>

                    <Swiper
                      modules={[Navigation, Autoplay, Pagination]}
                      spaceBetween={16}
                      slidesPerView={1}
                      autoplay={{ delay: 5000, disableOnInteraction: false }}
                      navigation={{
                        nextEl: ".success-next",
                        prevEl: ".success-prev",
                      }}
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
                      {stories.map((story: TSuccessStory, index: number) => (
                        <SwiperSlide key={story._id || index}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: index * 0.08,
                              duration: 0.4,
                            }}
                            className="h-full"
                          >
                            <TestimonialCard
                              story={story}
                              onPlayVideo={(url) => setActiveVideoUrl(url)}
                            />
                          </motion.div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
                      <button className="success-prev w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-700 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all">
                        <FaChevronLeft size={12} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, i: number) => {
                        const isActive =
                          activeIndex >= i * slidesPerViewDesktop &&
                          activeIndex < (i + 1) * slidesPerViewDesktop;
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageClick(i)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition-all duration-200 ${
                              isActive
                                ? "bg-blue-700 text-white shadow-lg shadow-blue-200"
                                : "bg-white text-blue-700 border-2 border-blue-700 hover:bg-blue-700 hover:text-white"
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}

                      <button className="success-next w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-700 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all">
                        <FaChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CTA Footer */}
            <div className="text-center pb-8 sm:pb-10 pt-4 px-4 sm:px-6 border-t border-blue-50">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/success-stories"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-900 text-white px-6 sm:px-7 py-2.5 sm:py-3 text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all group"
                >
                  {t("viewAll") || "All Success Stories"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/all-courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white px-6 sm:px-7 py-2.5 sm:py-3 text-sm font-bold rounded-xl transition-all duration-200"
                >
                  {t("viewCourses") || "View Training Programs"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Success Story Submission Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-blue-50">
            <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
              <DialogTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-700" />
                {tImm("share.heading") || "আপনার সাফল্যের গল্প জমা দিন"}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-1">আপনার গৌরবময় বিদেশ যাত্রার অভিজ্ঞতা আমাদের সাথে শেয়ার করুন</p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="submit-fullName" className="text-sm font-semibold text-slate-700">
                    পূর্ণ নাম <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="submit-fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="যেমন: মো. রাকিবুল ইসলাম"
                      required
                      className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="submit-profession" className="text-sm font-semibold text-slate-700">
                    পেশা / পদবী <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="submit-profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      placeholder="যেমন: সিনিয়র টেকনিশিয়ান"
                      required
                      className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="submit-country" className="text-sm font-semibold text-slate-700">
                    গন্তব্য দেশ <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="submit-country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="যেমন: Saudi Arabia"
                      required
                      className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="submit-date" className="text-sm font-semibold text-slate-700">
                    তারিখ / সফলতার বছর
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="submit-date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="যেমন: ২০২৪ সফল প্রার্থী"
                      className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Image Field */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">আপনার ছবি / প্রোফাইল ফটো</Label>
                <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                  {formData.image ? (
                    <img
                      src={getImageUrl(formData.image) || ""}
                      alt="Candidate Preview"
                      className="w-14 h-14 rounded-full object-cover border border-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = formData.image;
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="publicImageFile"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="publicImageFile" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-blue-700" />
                      {isUploadingPhoto ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}
                    </Label>
                    <p className="text-[10px] text-slate-400 mt-1">সর্বোচ্চ ২ মেগাবাইট (JPEG, PNG, WebP)</p>
                  </div>
                </div>
              </div>

              {/* Video Review Field */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-700" />
                    আপনার অভিজ্ঞতার ভিডিও (Video Review) - অপশনাল
                  </Label>
                  <div className="flex gap-1 text-[11px] font-semibold bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode("file")}
                      className={`px-2.5 py-0.5 rounded-md transition-colors ${videoInputMode === "file" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500"}`}
                    >
                      ভিডিও ফাইল
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode("url")}
                      className={`px-2.5 py-0.5 rounded-md transition-colors ${videoInputMode === "url" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500"}`}
                    >
                      ইউটিউব লিঙ্ক
                    </button>
                  </div>
                </div>

                {videoInputMode === "file" ? (
                  <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Film className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="file"
                        id="publicVideoFile"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <Label htmlFor="publicVideoFile" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-blue-700" />
                        {isUploadingVideo ? "ভিডিও আপলোড হচ্ছে..." : "ভিডিও ফাইল সিলেক্ট করুন"}
                      </Label>
                      {formData.videoUrl ? (
                        <p className="text-xs font-semibold text-emerald-600 truncate mt-1 flex items-center gap-1">
                          ✓ ভিডিও ফাইল সফলভাবে আপলোড হয়েছে
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1">সর্বোচ্চ ১০০ মেগাবাইট (MP4, WebM, MOV)</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                    />
                    <p className="text-[10px] text-slate-400">আপনার ইউটিউব ভিডিও লিঙ্কটি এখানে পেস্ট করুন</p>
                  </div>
                )}
              </div>

              {/* Story Text */}
              <div className="space-y-1.5">
                <Label htmlFor="submit-story" className="text-sm font-semibold text-slate-700">
                  আপনার সাফল্যের গল্প <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="submit-story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="যেমন: Immigrant Jobs World-এর মাধ্যমে আমি খুব সহজেই চাকরি পেয়েছি..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400 leading-relaxed"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">রেটিং (Rating)</Label>
                <div className="flex gap-1.5 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 font-semibold ml-2">({formData.rating} Stars Selected)</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="h-11 rounded-lg text-sm px-5"
                >
                  বাতিল করুন
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto || isUploadingVideo}
                  className="h-11 rounded-lg text-sm bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 shadow-md shadow-blue-100"
                >
                  {isSubmitting ? "জমা হচ্ছে..." : "গল্প জমা দিন"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      {/* Video Modal */}
      <SuccessStoryVideoModal
        isOpen={!!activeVideoUrl}
        onClose={() => setActiveVideoUrl(null)}
        videoUrl={activeVideoUrl || ""}
      />
    </>
  );
};

export default SuccessStories;

