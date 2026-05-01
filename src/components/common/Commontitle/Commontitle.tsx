"use client"
import React from 'react';
import { motion } from 'framer-motion';



export const Title3DFlip = () => {

  const titleText = "Level Up Your Skills".split(" ");
  const subtitleText = "From Novice to Pro, One Course at a Time.";

 
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2, // Time in seconds between each word animating in
      },
    },
  };



  const wordVariants: any = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90, // Start flipped back
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0, // End in the final position
      transition: {
        type: 'spring' as const, // Use a spring animation for a bouncy, natural feel
        damping: 12,
        stiffness: 100,
      },
    },
  };
  
  // Subtitle variants
  // A simple fade-in animation for the subtitle after the main title has appeared.
  const subtitleVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
          opacity: 1, 
          y: 0,
          transition: {
              delay: titleText.length * 0.2, // Delay should be after all words have animated
              duration: 0.8
          }
      }
  }

  return (
    <div className="text-center">
      {/* We add a `perspective` style to the parent div. This is crucial for the 3D effect.
        Without perspective, the `rotateX` transform would look like a simple vertical squash.
      */}
      <motion.h1
        // The `motion.h1` element is the container for our animated words.
        // It applies the containerVariants to orchestrate the animation.
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-3xl md:text-6xl font-bold text-gray-950 mb-4 flex justify-center items-center flex-wrap"
        style={{ perspective: '1000px' }} // Adds depth for the 3D rotation
      >
        {titleText.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className="inline-block mr-[1ch]" // Use 'ch' unit for spacing based on character width
            style={{ transformOrigin: 'bottom' }} // Rotates from the bottom edge
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
      
      <motion.p 
        variants={subtitleVariants}
        initial="hidden"
        animate="visible"
        className="text-lg md:text-xl text-gray-400"
      >
        {subtitleText}
      </motion.p>
    </div>
  );
};
