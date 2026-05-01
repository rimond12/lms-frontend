"use client";

import * as React from "react";
import { motion } from "framer-motion";

// You can replace these with your actual image paths
const bannerImages = [
  "",
  "",
  "",
  "",
];

/**
 * SliderBanner Component
 * A smoothly auto-scrolling banner using Framer Motion and Tailwind CSS.
 * It creates a seamless, infinite loop effect with multiple images.
 */
export  const SliderBanner = () => {
  // We need to duplicate the images array to create a seamless loop
  const duplicatedImages = [...bannerImages, ...bannerImages];

  // Adjust duration based on the number of images to maintain a consistent scroll speed
  const duration = bannerImages.length * 15;

  // Animation variants for the sliding container
  const bannerVariants = {
    animate: {
      x: ["0%", "-100%"], // Animate from the start to the end of the first set of images
      transition: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: duration,
        ease: "linear" as const,
      },
    },
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden relative">
      {/* The motion.div contains two sets of images. Its width is dynamic based on the images.
        We animate its 'x' position by -100%, which corresponds to the total width of one full set of images.
        This creates the illusion of an endless scroll.
      */}
      <motion.div
        className="h-full flex"
        variants={bannerVariants}
        animate="animate"
      >
        {/* We render the duplicated image set */}
        {duplicatedImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Banner image ${index % bannerImages.length + 1}`}
            // Using 'h-full w-auto' preserves the aspect ratio while fitting the banner's height.
            // 'object-cover' ensures the image covers the area without distortion if aspect ratios differ.
            // 'flex-shrink-0' prevents images from shrinking to fit the container.
            // 'pr-4' or 'gap-4' on the parent can be used for spacing.
            className="h-full w-auto object-cover flex-shrink-0 pr-4"
          />
        ))}
      </motion.div>
      
      {/* Optional: Add a subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Optional: Add text or other content on top of the banner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-white text-4xl md:text-6xl font-bold text-center drop-shadow-lg">
          Your Awesome Banner
        </h1>
      </div>
    </div>
  );
};

// // Main App component to display the banner
// export default function App() {
//   return (
//     <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        
//     </div>
//   );
// }
