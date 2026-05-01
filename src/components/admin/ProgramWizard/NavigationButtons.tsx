"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  canPublish: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPublish: () => void;
}

/**
 * Navigation Buttons
 * Handles step navigation and final submission
 */
export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  canPublish,
  isLoading = false,
  onPrevious,
  onNext,
  onPublish,
}) => {
  return (
    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
      {/* Previous Button */}
      {currentStep > 1 && (
        <motion.button
          onClick={onPrevious}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={18} />
          Previous
        </motion.button>
      )}

      {/* Next Button or Publish Button */}
      {currentStep < totalSteps ? (
        <motion.button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`ml-auto flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            canProceed && !isLoading
              ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
          }`}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
        >
          Next
          <ChevronRight size={18} />
        </motion.button>
      ) : (
        <motion.button
          onClick={onPublish}
          disabled={!canPublish || isLoading}
          className={`ml-auto flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            canPublish && !isLoading
              ? "bg-green-600 text-white hover:bg-black cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
          }`}
          whileHover={canPublish ? { scale: 1.02 } : {}}
          whileTap={canPublish ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <>
              <div className="animate-spin">
                <Save size={18} />
              </div>
              Publishing...
            </>
          ) : (
            <>
              <Save size={18} />
              Publish Program
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default NavigationButtons;
