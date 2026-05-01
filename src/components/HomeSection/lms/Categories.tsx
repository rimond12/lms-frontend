"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  Ruler,
  HardHat,
  Settings,
  Layers,
  Briefcase,
  Cpu,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";

const categories = [
  {
    id: 1,
    name: "Civil Engineering",
    icon: HardHat,
    tools: ["AutoCAD", "Etabs", "Staad Pro"],
    slug: "civil-engineering",
    accent: "#DC2626",
  },
  {
    id: 2,
    name: "Architectural Design",
    icon: Ruler,
    tools: ["Revit", "SketchUp", "Lumion"],
    slug: "architectural-design",
    accent: "#1D4ED8",
  },
  {
    id: 3,
    name: "BIM Engineering",
    icon: Layers,
    tools: ["Navisworks", "Revit MEP"],
    slug: "bim-engineering",
    accent: "#7C3AED",
  },
  {
    id: 4,
    name: "Mechanical Engineering",
    icon: Settings,
    tools: ["SolidWorks", "Ansys"],
    slug: "mechanical-engineering",
    accent: "#059669",
  },
  {
    id: 5,
    name: "Project Management",
    icon: Briefcase,
    tools: ["Primavera P6", "MS Project"],
    slug: "project-management",
    accent: "#B91C1C",
  },
  {
    id: 6,
    name: "Electrical & Electronics",
    icon: Cpu,
    tools: ["PLC", "SCADA", "MATLAB"],
    slug: "electrical-engineering",
    accent: "#0891B2",
  },
];

const Categories = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-8 lg:py-10 bg-slate-50/30 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 " />

      <div className="max-w-6xl mx-auto px-4  sm:px-6 relative ">
        <ModernSectionHeader
          badge="Explore"
          title="Engineering Disciplines"
          viewAllLink="/all-courses"
          viewAllText="Browse All Courses"
        />

        {/* Carousel Container */}
        <div className="relative mt-8">
          {/* Navigation Buttons */}
          <div className="hidden md:flex absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-600 flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all hover:scale-110 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="hidden md:flex absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-600 flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all hover:scale-110 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Embla Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 lg:-ml-5">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_25.20%] min-w-0 pl-4 lg:pl-5"
                  >
                    <Link href={`/all-courses?category=${category.slug}`}>
                      <motion.div
                        whileHover={{
                          y: -5,
                          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
                        }}
                        initial={{ y: 0 }}
                        className="relative rounded-2xl p-6 h-full flex flex-col group cursor-pointer transition-all duration-300 border border-gray-100/80 hover:border-gray-200/60 overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, #ffffff 0%, ${category.accent}08 100%)`,
                        }}
                      >
                        {/* Hover Border Gradient (via pseudo element to allow distinct border colors) */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-gray-100 group-hover:to-gray-50 pointer-events-none transition-all duration-500" />

                        {/* 1. Large Watermark Icon (Background) */}
                        <div
                          className="absolute -bottom-6 -right-6 text-gray-50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none transform rotate-12"
                          style={{ color: `${category.accent}10` }}
                        >
                          <Icon size={140} strokeWidth={0.5} />
                        </div>

                        {/* Card Header: Icon + Arrow */}
                        <div className="relative z-10 flex items-start justify-between mb-4">
                          {/* Icon Box */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center relative shadow-sm group-hover:shadow-md transition-all duration-300"
                            style={{
                              backgroundColor: `${category.accent}15`,
                            }}
                          >
                            <Icon
                              size={24}
                              style={{ color: category.accent }}
                              strokeWidth={1.8}
                              className="relative z-10"
                            />
                          </div>

                          {/* Action Arrow */}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 shadow-sm">
                            <ArrowUpRight size={16} strokeWidth={2.5} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-black transition-colors leading-tight">
                            {category.name}
                          </h3>

                          {/* Tags / Pills for Tools */}
                          <div className="mt-auto flex flex-wrap gap-2">
                            {category.tools.map((tool, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-50 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wide border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-colors"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/all-courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            View All Categories
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
