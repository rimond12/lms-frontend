"use client";

import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaChevronRight,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface Seminar {
  date: string;
  time: string;
  title: string;
  type: "ONLINE" | "OFFLINE";
  status: string;
}

const SeminarSchedule: React.FC = () => {
  const seminars: Seminar[] = [
    {
      date: "৩০ জানুয়ারী ২০২৬",
      time: "9:00 PM",
      title: "RCC Building Structural Analysis Design & Detailing Mastercourse",
      type: "ONLINE",
      status: "Seminar time is coming soon 🎉",
    },
    {
      date: "৩০ জানুয়ারী ২০২৬",
      time: "8:00 PM",
      title: "Professional AutoCAD Mastercourse (Civil & Arch)",
      type: "ONLINE",
      status: "Seminar time is coming soon 🎉",
    },
    {
      date: "৩০ জানুয়ারী ২০২৬",
      time: "8:00 PM",
      title: "Professional AutoCAD Mastercourse (Civil & Arch)",
      type: "ONLINE",
      status: "Seminar time is coming soon 🎉",
    },
    {
      date: "৩০ জানুয়ারী ২০২৬",
      time: "8:00 PM",
      title: "Professional AutoCAD Mastercourse (Civil & Arch)",
      type: "ONLINE",
      status: "Seminar time is coming soon 🎉",
    },
    {
      date: "২৬ জানুয়ারী ২০২৬",
      time: "9:00 PM",
      title: "Professional Architectural BIM Modeling Mastercourse",
      type: "ONLINE",
      status: "Seminar time is coming soon 🎉",
    },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-white to-blue-100 overflow-hidden">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute top-10 left-1/4 w-12 h-12 bg-blue-200 rounded-full opacity-30"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      <motion.div
        className="absolute top-20 right-1/3 w-10 h-10 bg-blue-700/20 rounded-full opacity-20"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 inline-block relative">
            ফ্রি/পেইড সেমিনারের <span className="text-blue-700">সময়সূচী</span>
            <div className="w-20 h-1.5 bg-blue-700 mx-auto mt-3 rounded-full" />
          </h2>
        </motion.div>

        {/* Seminar List */}
        <div className="flex flex-col space-y-6">
          {seminars.map((item: Seminar, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              {/* Date & Time */}
              <div className="bg-blue-50 p-5 rounded-2xl text-center min-w-[160px] border border-blue-100 group-hover:bg-blue-700 transition-colors duration-300">
                <p className="text-blue-700 font-bold text-xl group-hover:text-white transition-colors">
                  {item.date}
                </p>
                <div className="flex items-center justify-center text-blue-700/70 text-sm mt-1 group-hover:text-blue-100">
                  <FaClock className="mr-1" /> {item.time}
                </div>
              </div>

              {/* Middle */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-700 mt-1">
                    <FaCalendarAlt size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl leading-tight group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      {item.type === "ONLINE" ? (
                        <span className="flex items-center text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full text-xs">
                          <FaVideo className="mr-2" /> {item.type}
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-600 font-semibold bg-orange-50 px-3 py-1 rounded-full text-xs">
                          <FaMapMarkerAlt className="mr-2" /> {item.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 border border-slate-200 italic shadow-inner">
                  {item.status}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center transition-all active:scale-95 shadow-lg shadow-blue-200 group-hover:shadow-blue-400"
                >
                  যোগ দিন
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <FaChevronRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Float Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float-delay {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default SeminarSchedule;
