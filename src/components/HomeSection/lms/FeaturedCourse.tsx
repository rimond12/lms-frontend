"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import CourseCard from "@/components/shared/CourseCard";

const FeaturedCourse = () => {
  // Auto-slide effect for highlights
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => prev + 1);
    }, 2500); // Change every 2.5s
    return () => clearInterval(interval);
  }, []);

  const {
    data: coursesData,
    isLoading,
    error,
  } = useGetCoursesQuery({
    limit: 6,
    page: 1,
  });

  const featuredCourses = coursesData?.data || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="py-8 lg:py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ModernSectionHeader
          badge="Featured"
          title="Popular Courses"
          subtitle="Industry-focused programs designed to accelerate your engineering career."
          viewAllLink="/all-courses"
          viewAllText="View All Courses"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden animate-pulse border border-gray-100"
              >
                <div className="h-36 lg:h-40 bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Unable to load courses.</p>
          </div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5"
            >
              {featuredCourses.slice(0, 6).map((course: any) => {
                const activeBatches = course.batches || [];
                const now = new Date();

                const nextBatch = activeBatches.find((b: any) => {
                  if (b.status === "upcoming" && new Date(b.startDate) >= now)
                    return true;
                  if (b.status === "running") return true;
                  return false;
                });

                const startDate = nextBatch?.startDate;
                const batchStatus = nextBatch?.status;

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
                const accentColor =
                  ACCENTS[(course.title.length + 5) % ACCENTS.length];

                return (
                  <CourseCard
                    key={course._id}
                    course={course}
                    highlightIndex={highlightIndex}
                  />
                );
              })}
            </motion.div>

            {/* Mobile CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center mt-8 lg:hidden"
            >
              <Link
                href="/all-courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                View All Courses
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourse;
