"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  _id?: string;
  title?: string;
  description?: string;
  image?: string;
}

interface ProjectsSectionProps {
  projects?: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects = [] }) => {
  // ---------------------------------------------------------------------------
  // State & Refs
  // ---------------------------------------------------------------------------
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxProject, setLightboxProject] = useState<Project | null>(null);

  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  const totalProjects = projects.length;

  // Ensure generous buffer to handle rapid clicking without running out of items.
  // We want the buffer to be large enough so that even if the user clicks
  // 'Next' 5-10 times rapidly before the snap (500ms) occurs, we still have items.
  // Target buffer size: ~12 items or more just to be super safe.
  const getBuffer = useCallback(() => {
    if (totalProjects === 0) return [];
    let buffer: Project[] = [];
    // We want at least itemsPerPage + 10 items in buffer
    const targetSize = Math.max(itemsPerPage + 10, totalProjects);
    while (buffer.length < targetSize) {
      buffer = [...buffer, ...projects];
    }
    return buffer;
  }, [totalProjects, itemsPerPage, projects]);

  const bufferProjects = getBuffer();
  // Full List: [Buffer (Prev)] [Original (Middle)] [Buffer (Next)]
  const extendedProjects = [...bufferProjects, ...projects, ...bufferProjects];
  const startIndex = bufferProjects.length;

  // ---------------------------------------------------------------------------
  // Responsive / Setup
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Reset to reliable starting position
    setCurrentIndex(startIndex);

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [startIndex]);

  const nextSlide = useCallback(() => {
    if (totalProjects === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [totalProjects]);

  const prevSlide = useCallback(() => {
    if (totalProjects === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [totalProjects]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Auto-advance
  useEffect(() => {
    if (isPaused || lightboxOpen || totalProjects === 0) return;

    slideIntervalRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [isPaused, lightboxOpen, totalProjects, nextSlide]);

  // Handle Snap after Transition
  useEffect(() => {
    if (!isTransitioning) return;

    // Wait for CSS transition (500ms) then check if we need to snap
    transitionTimeoutRef.current = setTimeout(() => {
      // Logic to snap if out of bounds

      // Right side boundary check:
      // Middle Block ends at `startIndex + totalProjects`.
      if (currentIndex >= startIndex + totalProjects) {
        setIsTransitioning(false);
        const offset = currentIndex - (startIndex + totalProjects);
        setCurrentIndex(startIndex + offset);
      }

      // Left side boundary check:
      // Before Middle Block.
      else if (currentIndex < startIndex) {
        setIsTransitioning(false);
        const offset = startIndex - currentIndex;
        setCurrentIndex(startIndex + totalProjects - offset);
      }
    }, 500); // Must match transition duration

    return () => {
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, [currentIndex, isTransitioning, totalProjects, startIndex]);

  // ---------------------------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------------------------
  const openLightbox = (project: Project) => {
    setLightboxProject(project);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxProject(null);
  };

  if (totalProjects === 0) return null;

  return (
    <>
      <div
        className="relative group/slider select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-110 border border-gray-200"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-110 border border-gray-200"
          aria-label="Next project"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Slider Window */}
        <div className="overflow-hidden px-1 py-4 -my-4">
          <div
            className="flex"
            style={{
              // Shift by percentage.
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              transition: isTransitioning
                ? "transform 500ms ease-in-out"
                : "none",
            }}
          >
            {extendedProjects.map((project, index) => (
              <div
                key={`${project._id || index}-${index}`}
                className="shrink-0 px-2"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <div
                  className="group relative aspect-[4/4] rounded-xl overflow-hidden cursor-pointer bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                  onClick={() => openLightbox(project)}
                >
                  <AppImage
                    photoUrl={project.image || "https://placehold.co/600x400"}
                    alt={project.title || "Project"}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {project.title || "Project"}
                    </h4>
                    {project.description && (
                      <p className="text-white/80 text-xs mt-2 line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm transform scale-50 group-hover:scale-100 hover:bg-white">
                    <ZoomIn className="w-4 h-4 text-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                // When clicking a dot, we want to jump to that index in the "middle" set
                setIsTransitioning(true);
                setCurrentIndex(startIndex + index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                // Normalize index.
                (((currentIndex - startIndex) % totalProjects) +
                  totalProjects) %
                  totalProjects ===
                index
                  ? "w-6 bg-red-500"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && lightboxProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-50 border border-white/10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid lg:grid-cols-[1.5fr,1fr] bg-white">
                <div className="relative aspect-video lg:aspect-auto lg:h-[60vh] bg-black">
                  <AppImage
                    photoUrl={
                      lightboxProject.image || "https://placehold.co/800x600"
                    }
                    alt={lightboxProject.title || "Project"}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-8 flex flex-col justify-center bg-white h-full overflow-y-auto max-h-[40vh] lg:max-h-[60vh]">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {lightboxProject.title || "Untitled Project"}
                  </h3>
                  {lightboxProject.description ? (
                    <div className="prose prose-sm text-gray-600">
                      <p className="whitespace-pre-line leading-relaxed">
                        {lightboxProject.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No description available.
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation within Lightbox */}
              {projects.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = projects.findIndex(
                        (p) => p._id === lightboxProject._id,
                      );
                      const prevIdx =
                        (idx - 1 + projects.length) % projects.length;
                      setLightboxProject(projects[prevIdx]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all border border-white/10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = projects.findIndex(
                        (p) => p._id === lightboxProject._id,
                      );
                      const nextIdx = (idx + 1) % projects.length;
                      setLightboxProject(projects[nextIdx]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all border border-white/10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectsSection;
