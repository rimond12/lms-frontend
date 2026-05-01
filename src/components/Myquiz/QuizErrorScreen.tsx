"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

interface QuizErrorScreenProps {
  onRetry: () => void;
}

const QuizErrorScreen: React.FC<QuizErrorScreenProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white rounded-2xl p-8 shadow-xl"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <XCircle className="w-8 h-8 text-red-800" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">We couldn't load your quiz attempts. Please try again.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg font-medium"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizErrorScreen;
