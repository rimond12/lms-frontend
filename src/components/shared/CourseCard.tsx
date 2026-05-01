"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  Video,
  Award,
  Briefcase,
  Book,
  CheckCircle,
  Settings,
  Users,
  ArrowRight,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";

interface CourseCardProps {
  course: any; // We can improve typing later
  highlightIndex: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, highlightIndex }) => {
  const activeBatches = course.batches || [];
  const now = new Date();

  const nextBatch = activeBatches.find((b: any) => {
    if (b.status === "upcoming" && new Date(b.startDate) >= now) return true;
    if (b.status === "running") return true;
    return false;
  });

  const startDate = nextBatch?.startDate;
  const batchStatus = nextBatch?.status;

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Select consistent accent color
  const ACCENTS = [
    "#7C3AED", // Purple
    "#059669", // Emerald
    "#B91C1C", // Dark Red
    "#0891B2", // Cyan
    "#DC2626", // Red
    "#DB2777", // Pink
    "#1D4ED8", // Blue
    "#EA580C", // Orange
  ];
  const accentColor = ACCENTS[(course.title.length + 5) % ACCENTS.length];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group h-full"
    >
      <Link href={`/all-courses/${course.slug}`} className="block h-full">
        {/* Card Container - Matches Categories Style */}
        <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group-hover:shadow-2xl border border-gray-100 dark:border-gray-700">
          {/* 1. Dynamic Gradient Border Effect via Shadow/Inset */}
          <div
            className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 1px ${accentColor}30`,
            }}
          />

          {/* 2. Soft Ambient Background Gradient */}
          <div
            className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 100% 0%, ${accentColor}10 0%, transparent 50%), radial-gradient(circle at 0% 100%, ${accentColor}05 0%, transparent 50%)`,
            }}
          />

          {/* 3. Linear Gradient Base */}
          <div
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${accentColor}08 0%, transparent 100%)`,
            }}
          />

          {/* 1. Image Section */}
          <div className="relative h-48 w-full overflow-hidden z-10">
            <AppImage
              photoUrl={
                course.bannerImage ||
                "https://placehold.co/600x400/f8fafc/64748b?text=Course"
              }
              alt={course.title}
              width={600}
              height={400}
              className="w-full h-full object-fill transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            {/* Live Badge */}
            <div
              className={`absolute top-3 right-3 ${
                batchStatus !== "running" ? "bg-blue-600" : "bg-[#1a4da1]"
              } text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                batchStatus === "running" ? "animate-pulse" : ""
              }`}
            >
              {batchStatus === "running" && (
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              )}
              {batchStatus === "running" ? "LIVE" : course.type || "COURSE"}
            </div>
          </div>

          {/* 2. Content Section */}
          <div className="p-4 flex flex-col grow relative z-10">
            {/* Course Title */}
            <h3
              className="text-lg font-bold text-gray-900 dark:text-white mb-2 min-h-[56px] line-clamp-2 leading-snug"
              style={{
                fontFamily: "banglaFont",
              }}
            >
              {course.title}
            </h3>

            {/* Highlights Slider - Premium Design */}
            <div className="mb-4 h-7 overflow-hidden relative w-full">
              <div className="absolute inset-0 flex items-center gap-2">
                <AnimatePresence mode="popLayout">
                  {course.highlights && course.highlights.length > 0 ? (
                    (() => {
                      const visibleItems = [];
                      const count = course.highlights.length;
                      for (let i = 0; i < 3; i++) {
                        const itemIndex = (highlightIndex + i) % count;
                        visibleItems.push({
                          ...course.highlights[itemIndex],
                          virtualKey: `${course.highlights[itemIndex]._id}-${
                            highlightIndex + i
                          }`,
                        });
                      }

                      return visibleItems.map((current: any) => {
                        const icons: Record<string, any> = {
                          clock: Clock,
                          video: Video,
                          award: Award,
                          briefcase: Briefcase,
                          book: Book,
                          check: CheckCircle,
                          settings: Settings,
                          users: Users,
                        };
                        const IconComponent =
                          icons[current.icon] || CheckCircle;

                        return (
                          <motion.div
                            key={current.virtualKey}
                            layout
                            initial={{
                              opacity: 0,
                              x: 20,
                              scale: 0.95,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              x: -20,
                              scale: 0.95,
                            }}
                            transition={{
                              duration: 0.4,
                              ease: "easeInOut",
                            }}
                            className="flex-1 min-w-0 h-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded flex items-center px-2 gap-1.5"
                          >
                            <IconComponent className="w-3.5 h-3.5 text-[#1a4da1] shrink-0" />
                            <span className="truncate text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-none pt-0.5">
                              {current.label}
                            </span>
                          </motion.div>
                        );
                      });
                    })()
                  ) : (
                    /* Fallback */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full bg-gray-50 border border-gray-100 rounded flex items-center px-3 gap-2"
                    >
                      <Users className="w-4 h-4 text-[#1a4da1]" />
                      <span className="text-xs font-medium text-gray-700">
                        {course.modules?.length || 0} Modules
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grow" />

            {/* 3. Footer Section */}
            <div>
              {/* Software Tools from DB */}
              {course.learningSoftware &&
                course.learningSoftware.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">
                      Tools You'll Learn
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {course.learningSoftware
                        .slice(0, 5)
                        .map((software: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded p-1 bg-gray-50 border border-gray-100 flex items-center justify-center relative"
                            title={software.title}
                          >
                            <AppImage
                              photoUrl={software.photoUrl}
                              alt={software.title}
                              width={32}
                              height={32}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ))}
                      {course.learningSoftware.length > 5 && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          +{course.learningSoftware.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  {startDate && batchStatus !== "running"
                    ? `Starts ${formatDate(startDate)}`
                    : "Enroll Now"}
                </span>
                <div className="font-semibold text-[#1a4da1] flex items-center gap-1.5 transition-all duration-300 group-hover:gap-2 text-xs">
                  View Details
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;