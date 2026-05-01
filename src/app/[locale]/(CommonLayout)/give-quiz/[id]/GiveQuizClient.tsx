"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useGetQuizByIdQuery,
  useSubmitQuizAnswersMutation,
  useGetUserQuizAttemptQuery,
} from "@/app/redux/api/QuizApi/quizApi";
import { useCheckAccessQuery } from "@/app/redux/api/enrollmentApi/enrollmentApi";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Send,
  Clock,
  User,
  Trophy,
  Target,
  BookOpen,
  Award,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { isAuthenticated } from "@/utils/auth";
import AppImage from "@/components/ui/AppImage";

// Glassmorphism Card Component
const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl ${className}`}
  >
    {children}
  </div>
);

// Progress Panel Component
const ProgressPanel = ({
  answeredCount,
  totalQuestions,
  questions,
  selectedAnswers,
  totalMarks,
  negativeMarking,
  isMobileOpen,
  onMobileClose,
}: {
  answeredCount: number;
  totalQuestions: number;
  questions: any[];
  selectedAnswers: Record<string, string>;
  totalMarks: number;
  negativeMarking: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) => (
  <>
    {/* Desktop Progress Panel */}
    <div className="fixed left-4 top-85 transform -translate-y-1/2 z-50 hidden lg:block">
      <GlassCard className="p-4 w-72 space-y-6 animate-slide-in-left">
        {/* Progress Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="text-blue-500 dark:text-blue-400" size={24} />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Quiz Progress
            </h3>
          </div>

          {/* Circular Progress */}
          <div className="relative w-24 h-20 mx-auto">
            <svg
              className="w-24 h-24 transform -rotate-90 "
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-300 dark:text-gray-600"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - answeredCount / totalQuestions)}`}
                className="text-blue-500 dark:text-blue-400 transition-all duration-700 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {Math.round((answeredCount / totalQuestions) * 100)}%
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {answeredCount} of {totalQuestions} completed
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
            <BookOpen
              size={20}
              className="mx-auto mb-1 text-blue-600 dark:text-blue-400"
            />
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {totalQuestions}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Questions
            </div>
          </div>

          <div className="text-center p-3 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
            <Award
              size={20}
              className="mx-auto mb-1 text-green-600 dark:text-green-400"
            />
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {totalMarks}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Total Marks
            </div>
          </div>

          <div className="text-center p-3 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200/30 dark:border-red-700/30 col-span-2">
            <div className="text-lg font-bold text-red-700 dark:text-red-300">
              {negativeMarking}%
            </div>
            <div className="text-xs text-red-800 dark:text-red-400">
              Negative Marking
            </div>
          </div>
        </div>

        {/* Question Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            Question Status
          </h4>
          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110 ${
                  selectedAnswers[question._id!]
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title={`Question ${index + 1} - ${selectedAnswers[question._id!] ? "Answered" : "Not Answered"}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>

    {/* Mobile Progress Sidebar */}
    <div
      className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isMobileOpen ? "visible" : "invisible"}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute left-0 top-0 h-full w-80 max-w-[80vw] transform transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <GlassCard className="h-full p-4 rounded-r-2xl rounded-l-none space-y-6 overflow-y-auto">
          {/* Close Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="text-blue-500 dark:text-blue-400" size={20} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Quiz Progress
              </h3>
            </div>
            <button
              onClick={onMobileClose}
              className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Circular Progress */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <svg
                className="w-20 h-20 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-300 dark:text-gray-600"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - answeredCount / totalQuestions)}`}
                  className="text-blue-500 dark:text-blue-400 transition-all duration-700 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {Math.round((answeredCount / totalQuestions) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {answeredCount} of {totalQuestions} completed
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3">
            <div className="text-center p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
              <BookOpen
                size={20}
                className="mx-auto mb-1 text-blue-600 dark:text-blue-400"
              />
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {totalQuestions} Questions
              </div>
            </div>

            <div className="text-center p-3 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
              <Award
                size={20}
                className="mx-auto mb-1 text-green-600 dark:text-green-400"
              />
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {totalMarks} Total Marks
              </div>
            </div>

            <div className="text-center p-3 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200/30 dark:border-red-700/30">
              <div className="text-lg font-bold text-red-700 dark:text-red-300">
                {negativeMarking}% Negative Marking
              </div>
            </div>
          </div>

          {/* Question Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              Question Status
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    selectedAnswers[question._id!]
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  </>
);

export default function GiveQuizClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params.id as string;
  const courseId = (searchParams.get("courseId") as string) || "";

  const { user, isLoading: userLoading } = useUser();

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isMobileProgressOpen, setIsMobileProgressOpen] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerSpace, setFooterSpace] = useState(0);

  const { data, isLoading, error } = useGetQuizByIdQuery(quizId);
  const { data: existingAttempt, isLoading: isCheckingAttempt } =
    useGetUserQuizAttemptQuery(quizId, {
      skip: !user || userLoading,
    });
  const { data: accessData, isLoading: isCheckingAccess } = useCheckAccessQuery(
    { courseId, resourceType: "quiz" },
    { skip: !user || userLoading || !courseId },
  );
  const [submitQuizAnswers, { isLoading: isSubmitting }] =
    useSubmitQuizAnswersMutation();

  useEffect(() => {
    // Simple authentication check

    if (user && !startTime) {
      setStartTime(new Date());
    }
  }, [router, user, userLoading, startTime]);

  useEffect(() => {
    // Wait for user loading to complete and ensure we have user data
    if (userLoading || !user) return;

    if (existingAttempt) {
      toast.error("You have already attempted this quiz");
      router.push(`/quiz-result/${quizId}`);
      return;
    }
  }, [existingAttempt, quizId, router, userLoading, user]);

  // Additional effect to handle dynamic footer height updates when content changes
  useEffect(() => {
    if (isQuizStarted && footerRef.current) {
      const updateFooterSpace = () => {
        const h = footerRef.current?.getBoundingClientRect().height;
        if (h) {
          setFooterSpace(h + 48);
        }
      };

      // Update footer space when answers change
      updateFooterSpace();
    }
  }, [selectedAnswers, isQuizStarted]);

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
    if (!startTime) {
      setStartTime(new Date());
    }
  };

  // Dynamically calculate footer height to prevent overlap instead of fixed padding
  useEffect(() => {
    if (!isQuizStarted) {
      setFooterSpace(0);
      return;
    }

    const measure = () => {
      if (footerRef.current) {
        const h = footerRef.current.getBoundingClientRect().height;
        // Add larger buffer for better spacing and prevent overlap
        setFooterSpace(h + 48); // 48px gap for better spacing
      }
    };

    // Use setTimeout to ensure the footer is rendered before measuring
    const measureWithDelay = () => {
      setTimeout(measure, 100);
    };

    measureWithDelay();
    window.addEventListener("resize", measureWithDelay);

    // Also re-measure when content changes
    const resizeObserver = new ResizeObserver(measure);
    if (footerRef.current) {
      resizeObserver.observe(footerRef.current);
    }

    return () => {
      window.removeEventListener("resize", measureWithDelay);
      resizeObserver.disconnect();
    };
  }, [isQuizStarted]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (!questionId || !optionId) {
      console.error("Invalid questionId or optionId:", {
        questionId,
        optionId,
      });
      return;
    }

    setSelectedAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: optionId,
      };
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!data || !user || !startTime) {
      console.error("Missing required data:", {
        data: !!data,
        user: !!user,
        startTime: !!startTime,
      });
      return;
    }

    const quiz = data.quiz;
    const questions = quiz?.questions || [];

    const unansweredQuestions = questions.filter(
      (q) => !selectedAnswers[q._id || ""],
    );

    if (unansweredQuestions?.length > 0) {
      const confirm = window.confirm(
        `You have ${unansweredQuestions?.length} unanswered questions. Submit anyway?`,
      );
      if (!confirm) return;
    }

    try {
      const answers = Object.entries(selectedAnswers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        }),
      );

      const endTime = new Date();
      const timeSpent = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000,
      ); // in seconds

      const result = await submitQuizAnswers({
        quizId,
        courseId,
        answers,
      }).unwrap();

      // Store result in sessionStorage for the result page
      sessionStorage.setItem(
        "quizResult",
        JSON.stringify({
          quiz: data.quiz,
          result: result.result,
          timeSpent,
          user: user.name,
        }),
      );

      toast.success(
        "Quiz submitted successfully! Redirecting to your applications...",
      );
      router.push("/user-profile/my-applications");
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      if (error?.data?.message?.includes("already attempted")) {
        // toast.error('You have already attempted this quiz');
        router.push(`/quiz-result/${quizId}`);
      } else {
        toast.error(error?.data?.message || "Failed to submit quiz");
      }
    }
  };

  if (isLoading || isCheckingAttempt || userLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/10"></div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8 lg:pl-80">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <GlassCard className="h-20 p-6">
                <div className="h-8 bg-gray-300/50 dark:bg-gray-600/50 rounded w-1/3"></div>
              </GlassCard>
              <GlassCard className="h-64 p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300/50 dark:bg-gray-600/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300/50 dark:bg-gray-600/50 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-300/50 dark:bg-gray-600/50 rounded"></div>
                </div>
              </GlassCard>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} className="h-40 p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-300/50 dark:bg-gray-600/50 rounded w-2/3"></div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((j) => (
                          <div
                            key={j}
                            className="h-4 bg-gray-300/50 dark:bg-gray-600/50 rounded w-full"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/10"></div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Trophy className="text-red-800 dark:text-red-400" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Quiz Not Found
            </h2>
            <p className="text-red-800 dark:text-red-400 mb-6">
              Error loading quiz. Please try again.
            </p>
            <Link href="/">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Go Home
              </button>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  // If user loading is done but user is not authenticated, show a different message
  if (!userLoading && (!user || !user._id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/10"></div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Redirecting to login...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Check enrollment access
  if (!isCheckingAccess && accessData) {
    const { hasAccess, enrollmentStatus, reason } = accessData.data;

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/10"></div>
          </div>

          <div className="relative p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <GlassCard className="p-8 text-center max-w-md animate-fade-in">
              {enrollmentStatus === "pending_approval" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Clock
                      className="text-amber-600 dark:text-amber-400"
                      size={32}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Enrollment Pending Approval
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your enrollment is awaiting admin approval. You'll receive
                    access to quizzes once approved.
                  </p>
                </>
              ) : enrollmentStatus === "rejected" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="text-red-800 dark:text-red-400" size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Access Denied
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your enrollment was not approved. Please contact support for
                    more information.
                  </p>
                </>
              ) : enrollmentStatus === "cancelled" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center">
                    <X className="text-gray-600 dark:text-gray-400" size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Enrollment Cancelled
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your enrollment has been cancelled. Please re-enroll to
                    access quizzes.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <BookOpen
                      className="text-blue-600 dark:text-blue-400"
                      size={32}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Enrollment Required
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You need to enroll in this program to access the quiz.
                  </p>
                </>
              )}
              <Link href={`/all-courses/${courseId}`}>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  View Program Details
                </button>
              </Link>
            </GlassCard>
          </div>
        </div>
      );
    }
  }

  const quiz = data.quiz;
  const questions = quiz?.questions || [];
  const answeredCount = Object.keys(selectedAnswers)?.length;
  const totalQuestions = questions?.length || 0;
  const totalMarks = questions?.reduce((sum, q) => sum + q.marks, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/10"></div>
      </div>

      {/* Progress Panel */}
      {isQuizStarted && (
        <ProgressPanel
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          questions={questions}
          selectedAnswers={selectedAnswers}
          totalMarks={totalMarks}
          negativeMarking={quiz.negativeMarkingPercentage}
          isMobileOpen={isMobileProgressOpen}
          onMobileClose={() => setIsMobileProgressOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`relative p-3 sm:p-4 lg:p-8 lg:pl-80 min-h-screen scroll-smooth quiz-main-content`}
        style={{
          paddingBottom:
            isQuizStarted && footerSpace ? `${footerSpace}px` : "120px", // Fallback padding
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Link href="/">
                    <button className="p-2 sm:p-3 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 group flex-shrink-0">
                      <ArrowLeft
                        size={20}
                        className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      />
                    </button>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                      {quiz.title}
                    </h1>
                    {user && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={14} className="sm:size-4 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          Taking quiz as:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {user.name}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Menu and Progress */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  {/* Mobile Progress Button */}
                  {isQuizStarted && (
                    <button
                      onClick={() => setIsMobileProgressOpen(true)}
                      className="lg:hidden p-2 sm:p-3 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors flex items-center gap-2"
                    >
                      <Menu
                        size={20}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                        {answeredCount}/{totalQuestions}
                      </span>
                    </button>
                  )}

                  {/* Desktop Progress Indicator */}
                  {isQuizStarted && (
                    <div className="hidden lg:flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {answeredCount}/{totalQuestions}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          completed
                        </div>
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${(answeredCount / totalQuestions) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
          {/* Quiz Description */}
          <div
            className="mb-6 sm:mb-8 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <GlassCard className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-white" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 ">
                    Course Instructions
                  </h2>
                </div>

                <div
                  className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: quiz.description }}
                />

                {/* Class Link Button */}
                {quiz.classLink && (
                  <div className="flex justify-center">
                    <a
                      href={quiz.classLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 font-medium text-sm sm:text-base"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <ExternalLink
                          size={16}
                          className="group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span>Join Live Class</span>
                    </a>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-white/20 dark:border-gray-700/30">
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 hover:scale-105 transition-transform duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <BookOpen className="text-white" size={20} />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalQuestions}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600/80 dark:text-blue-400/80">
                      Questions
                    </div>
                  </div>

                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200/30 dark:border-green-700/30 hover:scale-105 transition-transform duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Trophy className="text-white" size={20} />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalMarks}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600/80 dark:text-green-400/80">
                      Total Marks
                    </div>
                  </div>

                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl border border-red-200/30 dark:border-red-700/30 hover:scale-105 transition-transform duration-300 sm:col-span-1 col-span-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-800 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Target className="text-white" size={20} />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-400">
                      {quiz.negativeMarkingPercentage}%
                    </div>
                    <div className="text-xs sm:text-sm text-red-800/80 dark:text-red-400/80">
                      Negative Marking
                    </div>
                  </div>
                </div>

                {/* Start Quiz Button */}
                {!isQuizStarted && (
                  <div className="flex justify-center pt-6 border-t border-white/20 dark:border-gray-700/30">
                    <button
                      onClick={handleStartQuiz}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 font-medium text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <Clock
                          size={20}
                          className="group-hover:rotate-12 transition-transform duration-300"
                        />
                        <span>Start Quiz Now</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Questions Section - Collapsible */}
          {isQuizStarted && (
            <div
              className="space-y-6 sm:space-y-8 mb-6 sm:mb-8 animate-slide-down"
              style={{ scrollMarginBottom: "200px" }}
            >
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  className="animate-slide-up transition-all duration-200 scroll-mt-8 quiz-question-card"
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                >
                  <GlassCard className="p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex gap-3 sm:gap-6">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            selectedAnswers[question._id!]
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30 scale-110"
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {selectedAnswers[question._id!] ? (
                            <CheckCircle
                              size={20}
                              className="sm:size-6 text-white"
                            />
                          ) : (
                            <Circle
                              size={20}
                              className="sm:size-6 text-gray-500 dark:text-gray-400"
                            />
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                          Q{index + 1}
                        </div>
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Question {index + 1}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <span className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                                {question.marks} marks
                              </span>
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                                  selectedAnswers[question._id!]
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 animate-pulse"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {selectedAnswers[question._id!]
                                  ? "✓ Answered"
                                  : "○ Not Answered"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 sm:mb-6">
                          <div
                            className="text-gray-700 dark:text-gray-300 mb-4 text-base sm:text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: question.questionText,
                            }}
                          />
                          {question.questionImage && (
                            <div className="mt-4">
                              <AppImage
                                photoUrl={question.questionImage}
                                alt={`Question ${index + 1}`}
                                width={400}
                                height={250}
                                className="max-w-full sm:max-w-md rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => {
                            const optionId = option.id;
                            const isSelected =
                              selectedAnswers[question._id!] === optionId;

                            return (
                              <div
                                key={optionId}
                                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                                  isSelected
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/20 scale-[1.02]"
                                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                                }`}
                                onClick={() =>
                                  handleAnswerSelect(question._id!, optionId)
                                }
                              >
                                {/* Gradient border effect */}
                                {isSelected && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-2xl"></div>
                                )}

                                <div className="relative flex items-start gap-3 sm:gap-4 p-4 sm:p-6">
                                  <div className="flex-shrink-0 mt-1">
                                    <input
                                      type="radio"
                                      name={question._id}
                                      value={optionId}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(
                                          question._id!,
                                          e.target.value,
                                        );
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                    />
                                  </div>

                                  <div className="flex-grow min-w-0">
                                    <div className="flex items-start">
                                      <span
                                        className={`font-bold mr-2 sm:mr-3 text-base sm:text-lg transition-colors flex-shrink-0 ${
                                          isSelected
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-700 dark:text-gray-300"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optionIndex)}.
                                      </span>
                                      <div className="flex-grow min-w-0">
                                        <div
                                          className={`text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed transition-colors break-words ${
                                            isSelected
                                              ? "text-gray-800 dark:text-gray-200 font-medium"
                                              : ""
                                          }`}
                                          dangerouslySetInnerHTML={{
                                            __html: option.text,
                                          }}
                                        />
                                        {option.image && (
                                          <div className="mt-3">
                                            <AppImage
                                              photoUrl={option.image}
                                              alt={`Option ${optionIndex + 1}`}
                                              width={300}
                                              height={200}
                                              className="max-w-full sm:max-w-xs rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Selection indicator */}
                                  {isSelected && (
                                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center animate-scale-in">
                                        <CheckCircle
                                          size={14}
                                          className="sm:size-4 text-white"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          )}

          {/* Content spacer to ensure footer doesn't overlap */}
          {isQuizStarted && (
            <div className="quiz-content-spacer" aria-hidden="true"></div>
          )}
        </div>
      </div>
      {/* Fixed Footer Submit Bar */}
      {isQuizStarted && (
        <div
          ref={footerRef}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 quiz-fixed-footer"
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:pl-80">
            <div className="p-3 sm:p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {answeredCount} / {totalQuestions} (
                      {Math.round((answeredCount / totalQuestions) * 100)}%)
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${(answeredCount / totalQuestions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group relative w-full md:w-auto overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl md:rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-green-600/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-300/20 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send
                          size={18}
                          className="group-hover:-translate-y-0.5 transition-transform duration-300"
                        />
                        <span className="tracking-wide">Submit Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
