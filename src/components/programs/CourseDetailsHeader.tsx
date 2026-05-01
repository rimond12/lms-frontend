"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  BarChart3,
  Clock,
  Play,
  ArrowRight,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";

interface CourseDetailsHeaderProps {
  course: any;
  slug: string;
  batchStatus: "upcoming" | "running" | "none";
  canEnroll: boolean;
  nextBatch?: any;
  formatDate: (date: string) => string;
}

const getYouTubeVideoId = (url: string): string => {
  if (!url) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
};

export default function CourseDetailsHeader({
  course,
  slug,
  batchStatus,
  canEnroll,
  nextBatch,
  formatDate,
}: CourseDetailsHeaderProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="relative bg-[#0B0F19] overflow-hidden">
      {/* Modern Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#1a4da1] opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] bg-indigo-500 opacity-[0.15] blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500 opacity-[0.1] blur-[100px]"></div>
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0F19]/30 to-[#0B0F19]" />

      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-5">
            {/* Badges Section */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-1.5 bg-gradient-to-r from-[#1a4da1] to-[#133a7a] text-white text-xs font-semibold rounded-full capitalize shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-shadow">
                {course.type || "Course"}
              </span>
              {course.level && (
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full capitalize border border-white/10">
                  {course.level}
                </span>
              )}
              {batchStatus === "running" && (
                <span className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Live Now
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-5 text-justify max-w-lg">
              {course.shortDescription || course.description?.slice(0, 250)}
            </p>

            {/* Stats Grid */}
            <div className="flex flex-wrap gap-2">
              {[
                {
                  icon: Clock,
                  value: course.duration || "Flexible",
                  label: "Duration",
                },
                {
                  icon: BarChart3,
                  value: course.level
                    ? course.level.charAt(0).toUpperCase() +
                      course.level.slice(1)
                    : "All Levels",
                  label: "Level",
                },
                {
                  icon: Users,
                  value: `${course.enrolledCount || 0}+`,
                  label: "Students",
                },
                { icon: Award, value: "Yes", label: "Certificate" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-md border border-white/10 text-xs"
                >
                  <stat.icon className="w-3.5 h-3.5 text-[#1a4da1]" />
                  <span className="font-medium text-white">{stat.value}</span>
                  <span className="text-gray-500">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - Mobile */}
            <div className="pt-2 lg:hidden">
              {canEnroll ? (
                <Link
                  href={`/all-courses/${slug}/enroll`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1a4da1] hover:bg-[#133a7a] text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/25"
                >
                  Enroll Now
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span className="inline-block px-6 py-3 bg-gray-700 text-gray-400 font-medium rounded-lg">
                  Enrollment Closed
                </span>
              )}
            </div>
          </div>

          {/* Right Content - Video/Image */}
          <div className="relative">
            {course.overviewVideoUrl && !showVideo ? (
              <div
                className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group cursor-pointer"
                onClick={() => setShowVideo(true)}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/10 via-transparent to-white/5 z-20 pointer-events-none group-hover:bg-gradient-to-tr group-hover:from-gray-900/20 group-hover:via-gray-900/5 group-hover:to-white/10 transition-all duration-300" />

                {/* YouTube Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeVideoId(course.overviewVideoUrl)}/maxresdefault.jpg`}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${getYouTubeVideoId(course.overviewVideoUrl)}/hqdefault.jpg`;
                  }}
                />

                {/* Play Button - Always Visible */}
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    {/* Red Pulse Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a4da1] to-[#133a7a] rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

                    {/* Main Play Button */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-[#1a4da1] to-[#133a7a] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/50 transform group-hover:scale-110 transition-all duration-300 border-4 border-white/20">
                      <Play className="w-10 h-10 text-white ml-1 fill-white" />
                    </div>

                    {/* Live Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#1a4da1] to-[#133a7a] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      WATCH
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : course.overviewVideoUrl && showVideo ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/10 via-transparent to-white/5 z-10 pointer-events-none" />
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(course.overviewVideoUrl)}?autoplay=1`}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group cursor-pointer">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/10 via-transparent to-white/5 z-20 pointer-events-none group-hover:bg-gradient-to-tr group-hover:from-gray-900/20 group-hover:via-gray-900/5 group-hover:to-white/10 transition-all duration-300" />

                <AppImage
                  photoUrl={
                    course.bannerImage ||
                    "https://placehold.co/600x340/1f2937/6b7280?text=Course"
                  }
                  alt={course.title}
                  width={600}
                  height={340}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Play Button - Always Visible */}
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative"
                  >
                    {/* Red Pulse Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a4da1] to-[#133a7a] rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

                    {/* Main Play Button */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-[#1a4da1] to-[#133a7a] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/50 transform group-hover:scale-110 transition-all duration-300 border-4 border-white/20">
                      <Play className="w-10 h-10 text-white ml-1 fill-white" />
                    </div>

                    {/* Live Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#1a4da1] to-[#133a7a] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      WATCH
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Floating Card - Batch Info */}
            {nextBatch && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-200/50 max-w-xs hidden sm:block"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Next Batch
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {nextBatch.batchName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(nextBatch.startDate)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}