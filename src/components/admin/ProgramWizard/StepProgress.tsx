"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface Step {
  id: number;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  steps: Step[];
}

/**
 * Step Progress Indicator
 * Shows current step, completed steps, and allows navigation between steps
 */
export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  steps,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active step when it changes
  useEffect(() => {
    if (activeStepRef.current && scrollContainerRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentStep]);

  return (
    <div className="mb-8">
      {/* Step Counter */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Step {currentStep} of {totalSteps}
        </h3>
        <span className="text-sm text-gray-500">
          ({completedSteps.size}/{totalSteps} completed)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-gray-800 to-black"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Step Indicators with Scroll */}
      <div className="relative">
        {/* Right scroll indicator gradient */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 hidden md:block" />

        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 scroll-smooth"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#9CA3AF #E5E7EB",
          }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;

            return (
              <motion.button
                key={step.id}
                ref={isCurrent ? activeStepRef : null}
                onClick={() => onStepClick(step.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all cursor-pointer min-w-[44px] ${
                  isCurrent
                    ? `bg-gray-100 border-2 border-gray-800 text-gray-900 shadow-md`
                    : isCompleted
                    ? `bg-green-100 border-2 border-green-600 text-green-900`
                    : "bg-gray-100 border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                <span className="hidden sm:inline text-sm whitespace-nowrap">
                  {step.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Scroll hint text */}
        <p className="text-xs text-gray-500 mt-2 text-center md:hidden">
          ← Swipe to see all steps →
        </p>
      </div>
    </div>
  );
};

export default StepProgress;
