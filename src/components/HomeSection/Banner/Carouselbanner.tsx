"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";
import { useGetBannersQuery } from "@/app/redux/api/BannerApi/BannerApi";

/**
 * SliderBanner Component
 * A header carousel with drag-to-change, auto-play, and indicator dots.
 * The height is dynamic based on the image aspect ratio.
 */
export const CarouselBanner = () => {
  const { data: bannersResponse, isLoading } = useGetBannersQuery();
  const banners = bannersResponse?.data || [];
  const activeBanners = banners
    .filter((banner) => banner.isActive)
    .sort((a, b) => a.order - b.order);

  const bannerImages = activeBanners.map((banner: any) =>
    banner.imageUrl.startsWith("http")
      ? banner.imageUrl
      : `https://api.immigrantjobsworld.com/${banner.imageUrl}`,
  );

  const [[page, direction], setPage] = React.useState([0, 0]);

  // The 'wrap' function from popmotion allows us to loop through the images infinitely
  const imageIndex = wrap(0, bannerImages.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // Corrected useEffect for reliable auto-sliding.
  // By using an empty dependency array `[]`, this effect runs only once on mount.
  // We use the functional form of setPage to prevent stale state within the interval closure.
  // This ensures the loop continues indefinitely without being reset by user interactions.
  React.useEffect(() => {
    const interval = setInterval(() => {
      // We pass a function to setPage to get the latest state.
      // We set the direction to 1 to always slide to the next image.
      setPage(([currentPage]) => [currentPage + 1, 1]);
    }, 5000); // 5000ms = 5 seconds
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures the interval is not reset on re-renders.

  // If no active banners, don't render the carousel
  if (bannerImages.length === 0) {
    return null;
  }

  // Animation variants that change based on the direction of pagination
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      zIndex: 2,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 1,
    }),
  };

  // Threshold for the drag gesture to trigger a slide change
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading banners...</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing mb-0">
      {/* This invisible image acts as a spacer. 
        It sets the container's height based on the current image's aspect ratio.
      */}
      <img
        src={bannerImages[imageIndex]}
        alt=""
        aria-hidden="true"
        className="w-full h-auto invisible"
      />

      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page}
          src={bannerImages[imageIndex]}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", duration: 0.8, ease: "easeInOut" },
            opacity: { duration: 0.4 },
          }}
          className="absolute top-0 left-0  w-full object-cover"
          alt={
            activeBanners[imageIndex]?.altText ||
            `Banner image ${imageIndex + 1}`
          }
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        />
      </AnimatePresence>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {bannerImages.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setPage([i, i > imageIndex ? 1 : -1])}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              imageIndex === i
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
