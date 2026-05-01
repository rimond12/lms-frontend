"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ModernSectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
  dark?: boolean;
}

const ModernSectionHeader: React.FC<ModernSectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  align = "left",
  viewAllLink,
  viewAllText = "View All",
  className,
  dark = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 ",
        align === "center" && "md:flex-col md:items-center text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {badge && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4",
              dark
                ? "bg-white/10 text-white/90 ModernSectionHeaderborder border-white/20"
                : "bg-gray-900 text-white"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {badge}
          </motion.span>
        )}
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05,
              },
            },
          }}
          className={cn(
            "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight uppercase",
            dark ? "text-white" : "text-gray-900"
          )}
        >
          {title.split(" ").map((word, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20, color: "#DC2626" },
                visible: { opacity: 1, y: 0, color: dark ? "#FFFFFF" : "#111827" },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.02,
                  delayChildren: 0.2,
                },
              },
            }}
            transition={{ delay: 0.1 }}
            className={cn(
              "mt-3 text-base leading-relaxed",
              dark ? "text-white/70" : "text-gray-600"
            )}
          >
            {subtitle.split(" ").map((word, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 10, color: "#DC2626" },
                  visible: { opacity: 1, y: 0, color: dark ? "#D1D5DB" : "#6B7280" },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="inline-block mr-1"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        )}
      </div>

      {viewAllLink && align !== "center" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="shrink-0"
        >
          <Link
            href={viewAllLink}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group",
              dark
                ? "text-white/80 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {viewAllText}
            <ChevronRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ModernSectionHeader;
