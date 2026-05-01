"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ChevronDown, ChevronUp, Play, Zap } from "lucide-react";
import AppImage from "@/components/ui/AppImage";

const faqs = [
  {
    question: "What is a digital learning platform?",
    answer:
      "A digital learning platform is an online system that provides educational courses, training programs, and learning materials accessible anytime and anywhere via the internet.",
  },
  {
    question: "Do I get a certificate after completion?",
    answer:
      "Yes, upon successfully completing a course and any required assessments, you will receive a verified digital certificate that you can share on LinkedIn and your resume.",
  },
  {
    question: "Can I access the courses on mobile?",
    answer:
      "Absolutely! Our platform is fully responsive and compatible with all devices. You can learn on-the-go using our mobile app or browser.",
  },
  {
    question: "Are the courses self-paced?",
    answer:
      "Most of our courses are self-paced, allowing you to learn at your own speed. However, some live bootcamps have specific schedules which will be clearly mentioned.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, mobile banking (Bkash, Nagad), and bank transfers for your convenience.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="py-10 lg:py-12 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          {/* Left Column: Video/Image */}
          <div className="relative h-full min-h-[300px] lg:min-h-0">
            {/* Decorative blob or background (optional) */}
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl z-0" />

            <div
              className="relative z-10 h-full rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-gray-100"
              onClick={() => setShowVideo(true)}
            >
              <AppImage
                photoUrl="https://www.onlc.com/blog/wp-content/uploads/2024/08/male-and-female-architects-with-laptop-meeting-and-2023-11-27-05-18-22-utc-1.jpg"
                alt="FAQ Video Thumbnail"
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Pulse effect */}
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 shadow-xl transition-transform duration-300 group-hover:scale-110">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 ml-1 fill-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Content */}
          <div className="flex flex-col justify-center py-4">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-100">
                <Zap className="w-3.5 h-3.5 fill-red-600" />
                Support
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 leading-tight uppercase">
              Most Asked <span className="text-red-600">Questions</span>
            </h2>

            {/* Accordion */}
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-100 transition-colors duration-300 ${openIndex === index ? "pb-6" : "pb-4"}`}
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full flex items-center justify-between text-left focus:outline-none group py-2"
                  >
                    <span
                      className={`text-base sm:text-lg font-bold transition-colors duration-300 pr-8 ${
                        openIndex === index
                          ? "text-red-900"
                          : "text-gray-800 group-hover:text-red-600"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-gray-400 group-hover:text-red-500 transition-colors">
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 text-sm sm:text-base text-gray-600 leading-relaxed max-w-[90%]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Video Modal Overlay (Placeholder) */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setShowVideo(false)}
          >
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <iframe
                width="100%"
                height="100%"
                src=""
                title="Video Placeholder"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideo(false);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-md"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FAQ;
