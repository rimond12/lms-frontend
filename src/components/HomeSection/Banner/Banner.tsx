"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
  FaPlay,
  FaArrowRight,
  FaGraduationCap,
  FaLightbulb,
  FaUsers,
} from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa6";
import Link from "next/link";

export default function Banner() {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [theme, setTheme] = useState("light");
  const YT_EMBED_URL =
    "https://www.youtube.com/embed/-Jter4o1Ffw?si=rld_BKxnZTTn0u4d";

  const BANNER_IMAGES = {
    student1:
      "https://res.cloudinary.com/dalpf8iip/image/upload/v1755163420/253_lnu73r.jpg",
    student2:
      "https://res.cloudinary.com/dalpf8iip/image/upload/v1755163555/2582_afuiuw.jpg",
    course:
      "https://res.cloudinary.com/dalpf8iip/image/upload/v1755163851/25106040_1_cickxm.jpg",
    stuctural:
      "https://res.cloudinary.com/dalpf8iip/image/upload/v1755162116/33770886_2208.i607.014.S.m012.c12.metal_constructions_industrial_buildings_isometric_flowchart_mabbny.jpg",
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handlePlayVideo = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.open("https://www.youtube.com/watch?v=-Jter4o1Ffw", "_blank");
    } else {
      setIsVideoPlaying(true);
    }
  };

  const closeOverlay = () => setIsVideoPlaying(false);

  useEffect(() => {
    if (!isVideoPlaying) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isVideoPlaying]);

  return (
    <div className="">
      <div className="relative mb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 overflow-hidden transition-colors duration-500">
        {/* Background Grid Pattern */}
        <div className="absolute left-0 top-0 w-3/5 h-full opacity-10 dark:opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(26,77,161,0.3) 1.5px, transparent 0)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        {/* Building SVG - Top Right */}
        <div className="absolute top-16 right-16 w-24 h-24 hidden md:block">
          <motion.div
            className="w-24 h-24"
            animate={{
              y: [0, -4, 0],
              rotate: [0, 2, -2, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.svg
              className="w-full h-full"
              viewBox="0 0 200 240"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <rect x="0" y="220" width="200" height="20" fill="#2c2c2c" />
              <rect
                x="40"
                y="80"
                width="120"
                height="140"
                fill="#e8e8e8"
                stroke="#bbb"
                strokeWidth="1"
              />
              <rect x="35" y="215" width="130" height="8" fill="#666" />
              <rect x="50" y="80" width="4" height="140" fill="#999" />
              <rect x="75" y="80" width="4" height="140" fill="#999" />
              <rect x="100" y="80" width="4" height="140" fill="#999" />
              <rect x="125" y="80" width="4" height="140" fill="#999" />
              <rect x="146" y="80" width="4" height="140" fill="#999" />
              <rect x="40" y="105" width="120" height="3" fill="#aaa" />
              <rect x="40" y="135" width="120" height="3" fill="#aaa" />
              <rect x="40" y="165" width="120" height="3" fill="#aaa" />
              <rect x="40" y="195" width="120" height="3" fill="#aaa" />
              <rect
                x="60"
                y="90"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="85"
                y="90"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="110"
                y="90"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="135"
                y="90"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="60"
                y="115"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="85"
                y="115"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="110"
                y="115"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="135"
                y="115"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="60"
                y="145"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="85"
                y="145"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="110"
                y="145"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="135"
                y="145"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="60"
                y="175"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="85"
                y="175"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="110"
                y="175"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="135"
                y="175"
                width="15"
                height="12"
                fill="#87CEEB"
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x="90"
                y="195"
                width="20"
                height="25"
                fill="#654321"
                stroke="#333"
                strokeWidth="1"
              />
              <rect x="92" y="197" width="16" height="21" fill="#8B4513" />
              <circle cx="106" cy="208" r="1" fill="#FFD700" />
              <polygon
                points="30,80 100,40 170,80"
                fill="#8B4513"
                stroke="#654321"
                strokeWidth="2"
              />
              <rect x="98" y="38" width="4" height="42" fill="#654321" />
              <rect
                x="130"
                y="50"
                width="8"
                height="25"
                fill="#1a4da1"
                stroke="#133a7a"
                strokeWidth="1"
              />
              <rect x="128" y="48" width="12" height="3" fill="#133a7a" />
              <rect x="40" y="77" width="120" height="3" fill="#ccc" />
              <rect x="38" y="217" width="124" height="2" fill="#888" />
            </motion.svg>
          </motion.div>
        </div>

        {/* Graduation Cap */}
        <motion.div
          className="absolute top-72 left-24 text-[#1a4da1] dark:text-blue-400 opacity-60"
          animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaGraduationCap className="w-12 h-12" />
        </motion.div>

        {/* Book Icon */}
        <motion.div className="absolute top-72 right-48 w-8 h-8 text-[#1a4da1] dark:text-blue-400 opacity-60">
          <FaBookOpen className="w-full h-full" />
        </motion.div>

        {/* Decorative dots */}
        <div className="absolute top-48 right-32 w-4 h-4 bg-blue-300 dark:bg-blue-800 rounded-full opacity-50 shadow-sm"></div>
        <div className="absolute top-64 right-20 w-2.5 h-2.5 bg-blue-300 dark:bg-blue-800 rounded-full opacity-60"></div>
        <div className="absolute bottom-48 left-40 w-6 h-6 border-2 border-blue-300 dark:border-blue-700 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-blue-300 dark:bg-blue-800 rounded-full opacity-50"></div>

        {/* Floating Circles */}
        <motion.div
          className="absolute top-80 left-16 w-10 h-10 border-2 border-blue-300 dark:border-blue-700 rounded-full opacity-30"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute bottom-40 right-40 w-6 h-6 bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-700 dark:to-blue-800 rounded-full opacity-40"
          animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ✅ Royal Blue Play Button */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center z-20 pointer-events-none">
          <motion.div
            className="relative pointer-events-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400 dark:border-blue-500"
              animate={{ scale: [1, 2, 3], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400 dark:border-blue-500"
              animate={{ scale: [1, 2.5, 4], opacity: [0.6, 0.3, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
            <motion.button
              onClick={handlePlayVideo}
              className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 cursor-pointer bg-[#1a4da1] rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaPlay className="text-white ml-1 w-5 h-5 md:w-6 md:h-6" />
              <div className="absolute inset-0 rounded-full bg-[#1a4da1] opacity-50 blur-md"></div>
            </motion.button>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-full lg:max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[500px]">
              {/* Left Side */}
              <motion.div
                className="space-y-6 sm:space-y-8 lg:space-y-7 max-w-2xl mx-auto lg:mx-0"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* ✅ Royal Blue headline */}
                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-3xl uppercase font-bold leading-tight tracking-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <span className="text-gray-900 dark:text-gray-100">
                    Bangladesh{" "}
                  </span>
                  <span className="bg-gradient-to-r from-[#1a4da1] via-[#1a4da1] to-[#133a7a] bg-clip-text text-transparent">
                    Association
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#1a4da1] via-[#1a4da1] to-[#133a7a] bg-clip-text text-transparent">
                    of
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {" "}
                    Structural
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#1a4da1] via-[#1a4da1] to-[#1a4da1] bg-clip-text text-transparent">
                    Engineers
                  </span>
                </motion.h1>

                <motion.p
                  className="text-gray-600 dark:text-gray-400 text-base sm:text-md leading-relaxed max-w-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Shaping Bangladesh's future with world-class structural
                  engineering, innovation, and integrity. Building resilient
                  communities and setting new standards for excellence.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <motion.button
                    className="group bg-black text-white px-6 sm:px-8 py-3 rounded-xl flex items-center gap-3 font-semibold text-base sm:text-lg shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/join-BASE">JOIN BASE</Link>
                    <motion.div className="group-hover:translate-x-1 transition-transform duration-300">
                      <FaArrowRight className="sm:w-4 sm:h-4 w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <div className="flex -space-x-2">
                      {[
                        "from-blue-400 to-blue-500",
                        "from-blue-500 to-blue-600",
                        "from-blue-600 to-blue-700",
                      ].map((g, i) => (
                        <div
                          key={i}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${g} border-2 border-white dark:border-gray-800 shadow-lg flex items-center justify-center`}
                        >
                          <FaUsers className="text-white text-xs w-5 h-5" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right Side */}
              <motion.div
                className="relative space-y-4 sm:space-y-5 pl-0 lg:pl-8"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  {[BANNER_IMAGES.student1, BANNER_IMAGES.student2].map(
                    (src, i) => (
                      <motion.div
                        key={i}
                        className="relative"
                        animate={{ y: [-4, 4, -4] }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.7,
                        }}
                      >
                        <div className="bg-gray-800 rounded-2xl p-1 shadow-2xl">
                          <div className="rounded-2xl h-36 sm:h-52 relative overflow-hidden">
                            <img
                              src={src}
                              alt="Student"
                              className="object-cover rounded-2xl w-full h-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 sm:p-4 relative col-span-1"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="w-full h-20 sm:h-24 rounded-xl mb-3 relative overflow-hidden">
                      <img
                        src={BANNER_IMAGES.course}
                        alt="Course"
                        className="object-cover rounded-xl w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white bg-opacity-25 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                          <FaPlay className="text-white text-sm ml-0.5 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                      Join Our Bangladesh Association of Structural Engineers
                    </h3>
                  </motion.div>

                  {/* ✅ Royal Blue experience card */}
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl h-36 sm:h-auto shadow-2xl p-3 sm:p-4 flex items-center gap-3 col-span-1 border border-[#1a4da1]/20 dark:border-gray-600 relative overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#1a4da1] rounded-full blur-xl"></div>
                    </div>
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-[#1a4da1] via-[#1a4da1] to-[#133a7a] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg relative"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FaLightbulb className="text-white text-xl w-6 h-6" />
                      <div className="absolute inset-0 bg-[#1a4da1] rounded-full blur-md opacity-50"></div>
                    </motion.div>
                    <div className="relative z-10">
                      <motion.p
                        className="font-bold text-xl text-gray-900 uppercase dark:text-gray-100"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                      >
                        08+ Years
                      </motion.p>
                      <motion.p
                        className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.3 }}
                      >
                        of experience
                      </motion.p>
                    </div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-60"></div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scattered dots */}
        <div className="absolute top-36 right-24 w-2.5 h-2.5 bg-blue-400 dark:bg-blue-800 rounded-full opacity-50 shadow-sm"></div>
        <div className="absolute bottom-48 right-32 w-3 h-3 bg-blue-400 dark:bg-blue-800 rounded-full opacity-40 shadow-sm"></div>
        <div className="absolute top-2/3 right-16 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-800 rounded-full opacity-60"></div>
        <div className="absolute bottom-64 left-8 w-4 h-4 border-2 border-blue-300 dark:border-blue-700 rounded-full opacity-30"></div>
        <div className="absolute top-80 left-8 w-2.5 h-2.5 bg-blue-300 dark:bg-blue-800 rounded-full opacity-50"></div>
      </div>

      {/* Video Overlay */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/70"
          onClick={closeOverlay}
        >
          <div
            className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close video"
              className="absolute -top-3 -right-3 md:top-3 md:right-3 z-10 rounded-full bg-white text-gray-800 hover:bg-gray-100 w-9 h-9 shadow-lg"
              onClick={closeOverlay}
            >
              ✕
            </button>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={YT_EMBED_URL}
              title="Intro Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
