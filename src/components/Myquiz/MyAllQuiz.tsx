"use client";

import {
  useGetUserQuizAttemptsQuery,
  QuizAttempt,
} from "@/app/redux/api/QuizApi/quizApi";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowRight,
  Zap,
  Star,
  Award,
  BookOpen,
  Sparkles,
  FlameKindling,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { motion, AnimatePresence } from "framer-motion";
import QuizStatsCard from "./QuizStatsCard";
import { useState, useMemo } from "react";
import {
  calculateQuizStats,
  getScoreColor,
  getScoreBgColor,
  getPerformanceBadge,
  formatDate,
  formatDuration,
} from "./quizUtils";

const Card = ({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "glass";
}) => {
  const baseClasses =
    "rounded-2xl border transition-all duration-300 hover:shadow-xl";
  const variants = {
    default: "bg-white border-gray-200 shadow-lg hover:shadow-2xl",
    gradient:
      "bg-gradient-to-br from-white via-blue-50 to-purple-50 border-blue-200/50 shadow-lg hover:shadow-2xl",
    glass:
      "bg-white/80 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl",
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
        damping: 20,
      }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <div className="relative overflow-hidden">{children}</div>
    </motion.div>
  );
};

// Custom Hook to group attempts
const useGroupedQuizAttempts = (attempts: QuizAttempt[] | undefined) => {
  return useMemo(() => {
    if (!attempts) return [];

    const groupedMap = new Map<
      string,
      {
        quizId: string;
        quizTitle: string;
        attempts: QuizAttempt[];
        bestAttempt: QuizAttempt;
        latestAttempt: QuizAttempt;
      }
    >();

    attempts.forEach((attempt) => {
      const quizId =
        typeof attempt.quizId === "object"
          ? (attempt.quizId as any)?._id
          : attempt.quizId;
      const quizTitle =
        typeof attempt.quizId === "object"
          ? (attempt.quizId as any)?.title
          : "Quiz";

      if (!quizId) return;

      if (!groupedMap.has(quizId)) {
        groupedMap.set(quizId, {
          quizId,
          quizTitle,
          attempts: [attempt],
          bestAttempt: attempt,
          latestAttempt: attempt,
        });
      } else {
        const group = groupedMap.get(quizId)!;
        group.attempts.push(attempt);

        // Update best attempt
        const currentPercentage = attempt.result?.percentage ?? 0;
        const bestPercentage = group.bestAttempt.result?.percentage ?? 0;
        if (currentPercentage > bestPercentage) {
          group.bestAttempt = attempt;
        }

        // Update latest attempt based on submittedAt
        const currentSubmit = new Date(attempt.submittedAt || 0).getTime();
        const latestSubmit = new Date(
          group.latestAttempt.submittedAt || 0,
        ).getTime();
        if (currentSubmit > latestSubmit) {
          group.latestAttempt = attempt;
        }
      }
    });

    // Convert map to array and sort by latest submitted attempt
    return Array.from(groupedMap.values()).sort((a, b) => {
      const timeA = new Date(a.latestAttempt.submittedAt || 0).getTime();
      const timeB = new Date(b.latestAttempt.submittedAt || 0).getTime();
      return timeB - timeA;
    });
  }, [attempts]);
};

export default function MyAllQuiz() {
  const { user } = useUser();

  const { data: rawAttempts } = useGetUserQuizAttemptsQuery(undefined, {
    skip: !user,
  });

  const groupedAttempts = useGroupedQuizAttempts(rawAttempts);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Calculate overall statistics
  const stats = calculateQuizStats(rawAttempts || []);
  const {
    totalAttempts,
    passedAttempts,
    avgScore,
    bestScore,
    totalTimeSpent,
    streak,
  } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br relative overflow-hidden">
      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-12"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-extrabold bg-gradient-to-r uppercase from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4"
            >
              My Quiz Journey
            </motion.h1>

            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-3 text-lg text-gray-600"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </motion.div>
                <span>
                  Welcome back,{" "}
                  <span className="font-semibold text-gray-800">
                    {user.name}
                  </span>
                  !
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FlameKindling className="w-5 h-5 text-orange-500" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Overview */}
          {rawAttempts && rawAttempts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              <QuizStatsCard
                icon={BookOpen}
                value={totalAttempts}
                label="Total Attempts"
                subtitle={`${groupedAttempts.length} unique quizzes`}
                color="blue"
                trend="neutral"
              />
              <QuizStatsCard
                icon={Trophy}
                value={passedAttempts}
                label="Quizzes Passed"
                subtitle={`${Math.round((passedAttempts / Math.max(1, totalAttempts)) * 100)}% success rate`}
                color="green"
                trend={passedAttempts > totalAttempts / 2 ? "up" : "down"}
              />
              <QuizStatsCard
                icon={Star}
                value={`${avgScore}%`}
                label="Average Score"
                subtitle={`Best: ${bestScore.toFixed(1)}%`}
                color="purple"
                trend={
                  avgScore >= 70 ? "up" : avgScore >= 50 ? "neutral" : "down"
                }
              />
              <QuizStatsCard
                icon={Zap}
                value={streak}
                label="Current Streak"
                subtitle={`${Math.round(totalTimeSpent / 60)} min total`}
                color="orange"
                trend={streak > 0 ? "up" : "neutral"}
              />
            </motion.div>
          )}

          {/* Grouped Quiz Attempts */}
          <AnimatePresence mode="wait">
            {!groupedAttempts || groupedAttempts.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <Card variant="gradient" className="text-center py-20">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mb-6"
                  >
                    <Trophy size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">
                    No Quiz Adventures Yet!
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Your quiz journey starts here. Take your first quiz and
                    watch your knowledge grow!
                  </p>
                  <Link href="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
                    >
                      Start Your Journey 🚀
                    </motion.button>
                  </Link>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="quiz-attempts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-gray-800 flex items-center gap-3"
                  >
                    <Award className="text-blue-600" />
                    Your Quiz History Grouped
                  </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {groupedAttempts.map((group, index) => {
                    const bestPercentage =
                      group.bestAttempt.result?.percentage ?? 0;
                    const badge = getPerformanceBadge(bestPercentage);
                    const isExpanded = expandedQuizId === group.quizId;

                    return (
                      <motion.div
                        key={group.quizId}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100,
                        }}
                      >
                        <Card
                          variant="default"
                          className="p-6 relative overflow-hidden group/card shadow-sm hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50"
                        >
                          {/* Background Pattern */}
                          <div
                            className={`absolute inset-0 opacity-5 group-hover/card:opacity-10 transition-opacity bg-gradient-to-br from-${badge.color}-400 to-${badge.color}-600`}
                          ></div>

                          <div className="relative">
                            <div className="flex justify-between items-start mb-4">
                              <div className="pr-4">
                                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                                  {group.quizTitle}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                    <BookOpen size={14} />
                                    {group.attempts.length}{" "}
                                    {group.attempts.length === 1
                                      ? "Attempt"
                                      : "Attempts"}
                                  </span>
                                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Last active:{" "}
                                    {formatDate(
                                      group.latestAttempt.submittedAt || "",
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {/* Best Score */}
                              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                                <p className="text-sm text-gray-500 mb-1 font-medium">
                                  Personal Best
                                </p>
                                <div
                                  className={`px-4 py-1.5 rounded-lg font-bold text-xl ${getScoreBgColor(bestPercentage)} ${getScoreColor(bestPercentage)}`}
                                >
                                  {bestPercentage.toFixed(1)}%
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                  {group.bestAttempt.result?.obtainedMarks ?? 0}{" "}
                                  / {group.bestAttempt.result?.totalMarks ?? 0}{" "}
                                  Marks
                                </p>
                              </div>

                              {/* Latest Stats */}
                              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
                                <p className="text-sm text-gray-500 mb-2 font-medium text-center">
                                  Best Attempt Details
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 flex items-center gap-2">
                                    <CheckCircle
                                      size={14}
                                      className="text-green-500"
                                    />{" "}
                                    Correct
                                  </span>
                                  <span className="font-semibold">
                                    {group.bestAttempt.result?.correctAnswers ??
                                      0}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 flex items-center gap-2">
                                    <XCircle
                                      size={14}
                                      className="text-red-500"
                                    />{" "}
                                    Wrong
                                  </span>
                                  <span className="font-semibold">
                                    {group.bestAttempt.result
                                      ?.incorrectAnswers ?? 0}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 flex items-center gap-2">
                                    <Clock
                                      size={14}
                                      className="text-gray-400"
                                    />{" "}
                                    Skipped
                                  </span>
                                  <span className="font-semibold">
                                    {group.bestAttempt.result
                                      ?.skippedQuestions ?? 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <Link
                                href={`/quiz-result/${group.quizId}`}
                                className="flex-1"
                              >
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  Best Result Details
                                  <ArrowRight size={16} />
                                </motion.button>
                              </Link>

                              {group.attempts.length > 1 && (
                                <button
                                  onClick={() =>
                                    setExpandedQuizId(
                                      isExpanded ? null : group.quizId,
                                    )
                                  }
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                  View All ({group.attempts.length})
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              )}
                            </div>

                            {/* Expanded View for all attempts */}
                            <AnimatePresence>
                              {isExpanded && group.attempts.length > 1 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900 mb-2">
                                      Previous Attempts
                                    </p>
                                    {/* Sort attempts by date descending before rendering */}
                                    {[...group.attempts]
                                      .sort(
                                        (a, b) =>
                                          new Date(
                                            b.submittedAt || 0,
                                          ).getTime() -
                                          new Date(
                                            a.submittedAt || 0,
                                          ).getTime(),
                                      )
                                      .map((attempt, index) => (
                                        <div
                                          key={attempt._id || index}
                                          className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm gap-3"
                                        >
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                Attempt {attempt.attemptNumber}
                                              </span>
                                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(
                                                  attempt.submittedAt || "",
                                                )}
                                              </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Score:{" "}
                                              {attempt.result?.percentage?.toFixed(
                                                1,
                                              ) ?? "0.0"}
                                              % (
                                              {attempt.result?.obtainedMarks ??
                                                0}
                                              /{attempt.result?.totalMarks ?? 0}
                                              )
                                            </div>
                                          </div>
                                          <Link
                                            href={`/quiz-result/${group.quizId}?attemptId=${attempt._id}`}
                                          >
                                            <button className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 whitespace-nowrap bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors w-full sm:w-auto justify-center">
                                              View <ArrowRight size={14} />
                                            </button>
                                          </Link>
                                        </div>
                                      ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
