"use client"

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  HelpCircle, 
  Trash2, 
  Eye,
  Award,
  Clock,
  Target,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDeleteQuizMutation, useGetQuizzesQuery, Quiz } from '@/app/redux/api/QuizApi/quizApi';

// ==================== UI COMPONENTS ====================
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType; 
  color: string;
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </Card>
);

const QuizTypeLabel = ({ type }: { type: string }) => {
  const config = {
    'module': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Module Quiz' },
    'mid-course': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Mid-Course' },
    'final-exam': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Final Exam' },
  }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const QuizCard = ({ 
  quiz, 
  onDelete 
}: { 
  quiz: Quiz; 
  onDelete: (id: string, title: string) => void;
}) => {
  const totalQuestions = quiz.questions?.length || 0;
  const totalMarks = quiz.questions?.reduce((sum, q) => sum + q.marks, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <QuizTypeLabel type={quiz.quizType} />
              {quiz.isPublished ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  <AlertCircle className="w-3 h-3" />
                  Draft
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{quiz.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {quiz.description || 'No description'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <HelpCircle className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{totalQuestions}</p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{totalMarks}</p>
            <p className="text-xs text-gray-500">Total Marks</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{quiz.passingScore}%</p>
            <p className="text-xs text-gray-500">Pass Score</p>
          </div>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-3 py-3 text-xs text-gray-500">
          {quiz.timeLimit && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {quiz.timeLimit} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {quiz.attemptsAllowed === 0 ? 'Unlimited' : `${quiz.attemptsAllowed} attempts`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
          <Link
            href={`/dashboard/manage-quiz/quiz-details/${quiz._id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Link>
          <button
            onClick={() => quiz._id && onDelete(quiz._id, quiz.title)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ManageQuizPage() {
  const { data, isLoading, error } = useGetQuizzesQuery();
  const [deleteQuiz] = useDeleteQuizMutation();

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      try {
        await deleteQuiz(quizId).unwrap();
        toast.success('Quiz deleted successfully');
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium">Error loading quizzes. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const quizzes = data?.quizzes || [];
  const moduleQuizzes = quizzes.filter(q => q.quizType === 'module');
  const midCourseQuizzes = quizzes.filter(q => q.quizType === 'mid-course');
  const finalExams = quizzes.filter(q => q.quizType === 'final-exam');
  const publishedQuizzes = quizzes.filter(q => q.isPublished);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600 mt-1">
              Quizzes are now integrated within courses. Edit quizzes from the course management.
            </p>
          </div>
          <Link href="/dashboard/manage-courses">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Manage Courses
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Quizzes" 
            value={quizzes.length} 
            icon={HelpCircle} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Module Quizzes" 
            value={moduleQuizzes.length} 
            icon={BookOpen} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="Final Exams" 
            value={finalExams.length} 
            icon={Award} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Published" 
            value={publishedQuizzes.length} 
            icon={CheckCircle} 
            color="bg-green-500" 
          />
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-8 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">New Quiz System</h3>
              <p className="text-sm text-blue-700 mt-1">
                Quizzes are now integrated with courses. To create or edit quizzes, go to{' '}
                <Link href="/dashboard/manage-courses" className="underline font-medium">
                  Course Management
                </Link>{' '}
                and add quizzes directly to modules.
              </p>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Quizzes are created within courses. Add modules to your courses and create quizzes for each module.
            </p>
            <Link
              href="/dashboard/manage-courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Go to Course Management
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onDelete={handleDeleteQuiz}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
