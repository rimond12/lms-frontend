"use client";
import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, Play, Trophy } from "lucide-react";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import { howItWorksSteps } from "@/data/homeData";

const HowItWorks = () => {
  const icons = [UserPlus, Search, Play, Trophy];

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ModernSectionHeader
          badge="Process"
          title="How It Works"
          subtitle="Start your learning journey in four simple steps."
          align="center"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {howItWorksSteps.map((step, index) => {
            const IconComponent = icons[index];
            return (
              <motion.div
                key={step.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4 }}
                className="group relative"
              >
                <div className="bg-white rounded-xl p-5 lg:p-6 h-full border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Step Number */}
                  <div className="absolute -top-3 right-4 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors duration-300">
                    <IconComponent className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700 group-hover:text-white transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line - Desktop only */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
