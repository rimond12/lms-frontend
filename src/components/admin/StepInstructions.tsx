"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface Step {
  id: number;
  label: string;
  icon?: React.ElementType;
  color?: string;
}

interface StepInstructionsProps {
  title?: string;
  description?: string;
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (stepId: number) => void;
  defaultExpanded?: boolean;
}

export default function StepInstructions({
  title = "Instructions",
  description = "Follow these steps to complete the process.",
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  defaultExpanded = false,
}: StepInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">
              {completedSteps.size}/{steps.length} completed • Step{" "}
              {currentStep}: {steps[currentStep - 1]?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {isExpanded ? "Hide" : "Show"} steps
          </span>
          <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <p className="text-xs text-gray-500 mb-3">{description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => onStepClick?.(step.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      currentStep === step.id
                        ? "bg-gray-900 text-white border-gray-900"
                        : completedSteps.has(step.id)
                        ? "bg-gray-50 border-gray-200 text-gray-700"
                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-4 h-4 text-[10px] font-bold rounded flex items-center justify-center ${
                          currentStep === step.id
                            ? "bg-white text-gray-900"
                            : completedSteps.has(step.id)
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {completedSteps.has(step.id) ? "✓" : step.id}
                      </span>
                      <span className="text-xs font-medium truncate">
                        {step.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
