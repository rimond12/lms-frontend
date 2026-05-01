"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useGetQuizzesQuery } from '@/app/redux/api/QuizApi/quizApi';

// ==================== UI COMPONENTS ====================
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType; 
  color: string;
  trend?: string;
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

// ==================== MAIN COMPONENT ====================
export default function AllResults() {
  const { data: quizzesData, isLoading } = useGetQuizzesQuery();
  
  const quizzes = quizzesData?.quizzes || [];
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.isPublished).length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Analytics</h1>
          <p className="text-gray-600">Overview of all quizzes and student performance</p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard 
            title="Total Quizzes" 
            value={totalQuizzes}
            icon={BookOpen} 
            color="bg-blue-500"
          />
          <StatCard 
            title="Published" 
            value={publishedQuizzes}
            icon={BarChart3} 
            color="bg-green-500"
          />
          <StatCard 
            title="Total Questions" 
            value={totalQuestions}
            icon={AlertCircle} 
            color="bg-purple-500"
          />
          <StatCard 
            title="Active Students" 
            value="-"
            icon={Users} 
            color="bg-indigo-500"
          />
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Analytics Dashboard Coming Soon
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto mb-6">
                We're building a comprehensive analytics dashboard to track student performance,
                quiz completion rates, and detailed insights. Stay tuned!
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/dashboard/manage-quiz"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  View Quizzes
                </Link>
                <Link
                  href="/dashboard/manage-courses"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Manage Courses
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Overview</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.slice(0, 5).map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{quiz.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {quiz.quizType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {quiz.questions?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.isPublished ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {quizzes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No quizzes found. Create quizzes within your courses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
