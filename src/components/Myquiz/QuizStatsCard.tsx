"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const Card = ({ children, className, variant = 'default' }: { 
  children: React.ReactNode, 
  className?: string, 
  variant?: 'default' | 'gradient' | 'glass'
}) => {
  const baseClasses = "rounded-2xl border transition-all duration-300 hover:shadow-xl";
  const variants = {
    default: "bg-white border-gray-200 shadow-lg hover:shadow-2xl",
    gradient: "bg-gradient-to-br from-white via-blue-50 to-purple-50 border-blue-200/50 shadow-lg hover:shadow-2xl",
    glass: "bg-white/80 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl"
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <div className="relative overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

interface QuizStatsCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const QuizStatsCard: React.FC<QuizStatsCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  subtitle,
  trend 
}) => (
  <Card variant="gradient" className="p-6">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 ">
        <div className={`w-full h-full bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-xl`}></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-4 rounded-2xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg`}
          >
            <Icon className="text-white" size={28} />
          </motion.div>
          <div>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900"
            >
              {value}
            </motion.div>
            <div className="text-sm font-medium text-gray-600">{label}</div>
            {subtitle && (
              <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            )}
          </div>
        </div>
        
        {trend && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-green-100 text-green-700' :
              trend === 'down' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}
          >
            <TrendingUp size={12} className={trend === 'down' ? 'rotate-180' : ''} />
            {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
          </motion.div>
        )}
      </div>
    </motion.div>
  </Card>
);

export default QuizStatsCard;
