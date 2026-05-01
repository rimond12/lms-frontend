"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Users,
  TrendingUp,
  HelpCircle,
  Award,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useGetQuizzesQuery } from "@/app/redux/api/QuizApi/quizApi";
import { useUser } from "@/app/[locale]/@auth/user.provider";

// ==================== UI COMPONENTS ====================
const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  description?: string;
}) => (
  <Card className="p-5">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </Card>
);

// ==================== MAIN COMPONENT ====================
export default function AdminQuizDashboard() {
  const { user } = useUser();
  const { data: quizzesData, isLoading, error } = useGetQuizzesQuery();

  const quizzes = quizzesData?.quizzes || [];

  // Calculate statistics
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter((q) => q.isPublished).length;
  const draftQuizzes = totalQuizzes - publishedQuizzes;
  const totalQuestions = quizzes.reduce(
    (sum, q) => sum + (q.questions?.length || 0),
    0,
  );

  const moduleQuizzes = quizzes.filter((q) => q.quizType === "module").length;
  const midCourseQuizzes = quizzes.filter(
    (q) => q.quizType === "mid-course",
  ).length;
  const finalExams = quizzes.filter((q) => q.quizType === "final-exam").length;

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium">
              Failed to load analytics. Please try again.
            </p>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quiz Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || "Admin"}
              </p>
            </div>
            <Link
              href="/dashboard/manage-courses"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Manage Courses
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Quizzes"
            value={totalQuizzes}
            icon={HelpCircle}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Questions"
            value={totalQuestions}
            icon={BookOpen}
            color="bg-purple-500"
          />
          <StatCard
            title="Published"
            value={publishedQuizzes}
            icon={Award}
            color="bg-green-500"
          />
          <StatCard
            title="Drafts"
            value={draftQuizzes}
            icon={Clock}
            color="bg-yellow-500"
          />
        </motion.div>

        {/* Quiz Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Quiz Types Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Module Quizzes</span>
                </div>
                <span className="font-bold text-gray-900">{moduleQuizzes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700">Mid-Course Assessments</span>
                </div>
                <span className="font-bold text-gray-900">
                  {midCourseQuizzes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-700">Final Exams</span>
                </div>
                <span className="font-bold text-gray-900">{finalExams}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Coming Soon
            </h3>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">
                Student performance analytics and detailed insights will be
                available soon.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Recent Quizzes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Quizzes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pass Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.slice(0, 10).map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {quiz.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {quiz.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            quiz.quizType === "module"
                              ? "bg-blue-100 text-blue-700"
                              : quiz.quizType === "mid-course"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {quiz.quizType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {quiz.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {quiz.passingScore}%
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
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No quizzes found. Create quizzes within your courses.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
