"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  BookOpen,
  Star,
  GraduationCap,
  Briefcase,
  Headphones,
} from "lucide-react";

// Updated stats data: Added more stats and kept compact
const statsData = [
  {
    id: 1,
    label: "Active Students",
    value: "15k+",
    icon: GraduationCap,
    color: "orange",
  },
  {
    id: 2,
    label: "Total Courses",
    value: "120+",
    icon: BookOpen,
    color: "purple",
  },
  {
    id: 3,
    label: "Instructors",
    value: "50+",
    icon: Users,
    color: "blue",
  },
  {
    id: 4,
    label: "Satisfaction",
    value: "4.9/5",
    icon: Star,
    color: "emerald",
  },
  {
    id: 5,
    label: "Job Placement",
    value: "95%",
    icon: Briefcase,
    color: "pink",
  },
  {
    id: 6,
    label: "Support",
    value: "24/7",
    icon: Headphones,
    color: "cyan",
  },
];

const colorVariants: any = {
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-100", // Darker icon bg
    softBg: "bg-orange-50/40 hover:bg-orange-50/80", // Card bg
    text: "text-orange-600",
    border: "border-orange-100 group-hover:border-orange-200",
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-100",
    softBg: "bg-purple-50/40 hover:bg-purple-50/80",
    text: "text-purple-600",
    border: "border-purple-100 group-hover:border-purple-200",
  },
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-100",
    softBg: "bg-blue-50/40 hover:bg-blue-50/80",
    text: "text-blue-600",
    border: "border-blue-100 group-hover:border-blue-200",
  },
  emerald: {
    bg: "bg-emerald-500",
    light: "bg-emerald-100",
    softBg: "bg-emerald-50/40 hover:bg-emerald-50/80",
    text: "text-emerald-600",
    border: "border-emerald-100 group-hover:border-emerald-200",
  },
  pink: {
    bg: "bg-pink-500",
    light: "bg-pink-100",
    softBg: "bg-pink-50/40 hover:bg-pink-50/80",
    text: "text-pink-600",
    border: "border-pink-100 group-hover:border-pink-200",
  },
  cyan: {
    bg: "bg-cyan-500",
    light: "bg-cyan-100",
    softBg: "bg-cyan-50/40 hover:bg-cyan-50/80",
    text: "text-cyan-600",
    border: "border-cyan-100 group-hover:border-cyan-200",
  },
};

// Simple animated counter hook
const useCounter = (
  end: number,
  duration: number = 2000,
  start: boolean = false
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
};

const parseStatValue = (value: string): number => {
  const numericValue = value.replace(/[^0-9.]/g, "");
  return parseFloat(numericValue) || 0;
};

const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-10 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-5%] left-[10%] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsData.map((stat, index) => {
            const colors = colorVariants[stat.color];
            const numericValue = parseStatValue(stat.value);
            const isNumber =
              !isNaN(numericValue) &&
              !stat.value.includes("/") &&
              stat.value !== "24/7";

            // eslint-disable-next-line react-hooks/rules-of-hooks
            const animatedValue = isNumber
              ? useCounter(numericValue, 1500, isInView)
              : 0;

            // Reconstruct display value
            let displayValue = stat.value;
            if (isNumber) {
              const suffix = stat.value.replace(/[0-9.]/g, "");
              displayValue = `${animatedValue.toLocaleString()}${suffix}`;
            }

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group h-full"
              >
                <div
                  className={`
                  relative rounded-2xl p-4 h-full
                  ${colors.softBg} border ${colors.border}
                  transition-all duration-300
                  flex flex-col items-center text-center justify-center
                `}
                >
                  <div
                    className={`
                    w-12 h-12 mb-3 rounded-xl
                    bg-white shadow-sm
                    flex items-center justify-center
                    group-hover:-translate-y-1 transition-transform duration-300
                  `}
                  >
                    <stat.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <div className="space-y-0.5">
                    <h3
                      className={`text-xl md:text-2xl font-bold ${colors.text} tracking-tight`}
                    >
                      {displayValue}
                    </h3>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide opacity-80">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
