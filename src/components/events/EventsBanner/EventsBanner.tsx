import React from 'react';
import { motion } from 'framer-motion';

// Framer Motion Variants for animations
const bannerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
    },
  },
};

const iconBounce = (delay = 0) => ({
  animate: {
    y: ["0%", "-20%", "0%"],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    delay,
  }
});


// Main Component
const EventsBanner = () => {
  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-16">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-0 -left-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
  transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          x: [0, -20, 20, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
  transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
      />
       <motion.div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
  transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', delay: 4 }}
      />


      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl"></div>

      {/* Floating Decorative Elements */}
       <motion.div
        className="absolute top-4 left-1/4 w-16 h-16 bg-black/5 rounded-full"
        animate={{ y: [0, -20, 0] }}
  transition={{ duration: 6, repeat: Infinity }}
       />
       <motion.div
        className="absolute top-8 right-1/3 w-12 h-12 bg-red-800/10 rounded-full"
        animate={{ y: [0, -20, 0] }}
  transition={{ duration: 6, repeat: Infinity, delay: 1 }}
       />
       <motion.div
        className="absolute bottom-4 left-1/3 w-8 h-8 bg-red-800/5 rounded-full"
        animate={{ y: [0, -20, 0] }}
  transition={{ duration: 6, repeat: Infinity, delay: 2 }}
       />
       <motion.div
        className="absolute bottom-6 right-1/4 w-14 h-14 bg-black/5 rounded-full"
        animate={{ y: [0, -20, 0] }}
  transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
       />

      {/* Geometric Shapes */}
       <motion.div
        className="absolute top-6 left-8 w-6 h-6 border-2 border-black/20 rotate-45"
        animate={{ rotate: 360 }}
  transition={{ duration: 10, repeat: Infinity }}
       />
       <motion.div
        className="absolute bottom-8 right-8 w-4 h-4 bg-red-800/30 rotate-12"
        animate={{ y: [0, 10, 0] }}
  transition={{ duration: 2, repeat: Infinity }}
       />

      {/* Main Content Container */}
      <motion.div
        className="relative max-w-5xl mx-auto px-6 text-center"
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >



        

        <div className="space-y-6">
          {/* "Live Events" Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/5 backdrop-blur-sm border border-black/10 rounded-full text-gray-900 text-sm font-bold"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-800"></span>
            </span>
            🎉 LIVE EVENTS HAPPENING NOW!
          </motion.div>

          {/* Dynamic Heading */}
          <motion.h1
            variants={fadeIn}
            className="text-3xl md:text-4xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight"
          >
            <motion.span className="inline-block" >🎤</motion.span>
            <span className="mx-2"> PROFESSIONAL EVENTS</span>
            <motion.span className="inline-block">🌟</motion.span>
          </motion.h1>

          {/* Subheading Text */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto"
          >
            💡 Join exciting workshops, connect with experts, and boost your career!
            <span className="font-bold text-red-800 block mt-1">Don't miss out!</span>
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              className="bg-[#B44745] text-white px-8 py-3 rounded-full font-bold shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.7)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              animate={{ boxShadow: ["0 0 10px rgba(239, 68, 68, 0.3)", "0 0 20px rgba(239, 68, 68, 0.7)", "0 0 10px rgba(239, 68, 68, 0.3)"]}}
            >
              🎊 Explore Events
            </motion.button>
            <motion.button
              className="bg-black/10 backdrop-blur-sm border border-black/20 text-gray-900 hover:bg-black hover:text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📅 View Calendar
            </motion.button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-6 sm:gap-10 pt-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600 tracking-wider">Events</div>
            </div>
            <div className="w-px h-10 bg-gray-900/20 self-center"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1K+</div>
              <div className="text-sm text-gray-600 tracking-wider">Members</div>
            </div>
            <div className="w-px h-10 bg-gray-900/20 self-center"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">25+</div>
              <div className="text-sm text-gray-600 tracking-wider">Speakers</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-8 md:h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default EventsBanner;
