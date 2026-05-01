"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Download, Smartphone } from "lucide-react";

const MobileAppSection = () => {
  const features = [
    "Offline viewing support",
    "Interactive quizzes on mobile",
    "Push notifications for classes",
    "Track progress anywhere",
  ];

  return (
    <section className="py-16 lg:py-20 bg-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Content Side */}
          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold tracking-wider uppercase mb-5 border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Mobile App
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-5">
                Learn Anytime,{" "}
                <span className="text-red-500">Anywhere.</span>
              </h2>
              <p className="text-base text-white/70 mb-8 leading-relaxed">
                Take your learning journey with you. Download our mobile app to
                watch lessons, track progress, and practice on the go—even offline.
              </p>

              <ul className="space-y-3 mb-8">
                {features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-white/80 text-sm"
                  >
                    <CheckCircle className="text-red-500 w-4 h-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-3 bg-white text-gray-900 px-5 py-3 rounded-lg hover:bg-gray-100 transition-all font-semibold text-sm">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-medium text-gray-500">
                      Download on
                    </div>
                    <div className="text-sm font-bold leading-none">
                      App Store
                    </div>
                  </div>
                </button>

                <button className="flex items-center gap-3 bg-white text-gray-900 px-5 py-3 rounded-lg hover:bg-gray-100 transition-all font-semibold text-sm">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-medium text-gray-500">
                      Get it on
                    </div>
                    <div className="text-sm font-bold leading-none">
                      Google Play
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-1 relative w-full flex justify-center">
            <div className="relative w-56 md:w-64 h-[400px] md:h-[450px]">
              {/* Phone Frame */}
              <div className="absolute inset-0 bg-gray-800 rounded-[2.5rem] border-4 border-gray-700 shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-2 bg-white rounded-[2rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-6 bg-red-600 flex items-center justify-center">
                    <div className="w-16 h-1 bg-white/30 rounded-full" />
                  </div>
                  {/* App Content Mockup */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                        <div className="h-2 w-14 bg-gray-100 rounded mt-1" />
                      </div>
                    </div>
                    {/* Course Cards */}
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="h-16 bg-gray-100 rounded-lg mb-2" />
                      <div className="h-2 w-3/4 bg-gray-200 rounded mb-1" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="h-16 bg-gray-100 rounded-lg mb-2" />
                      <div className="h-2 w-3/4 bg-gray-200 rounded mb-1" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    </div>
                    {/* Bottom Nav */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-around bg-gray-50 rounded-xl py-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-6 h-6 bg-gray-200 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow Effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-red-600/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
