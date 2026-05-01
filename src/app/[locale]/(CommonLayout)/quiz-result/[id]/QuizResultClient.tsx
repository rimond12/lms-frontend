"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetUserQuizAttemptQuery } from "@/app/redux/api/QuizApi/quizApi";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  User,
  Calendar,
  Trophy,
  User2,
  ZoomIn,
  X,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import AppImage from "@/components/ui/AppImage";
import { motion, AnimatePresence } from "framer-motion";

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions?: number;
  totalMarks: number;
  obtainedMarks: number;
  negativeMarks: number;
  percentage: number;
  questionResults?: {
    questionId: string;
    questionText: string;
    questionImage?: string;
    selectedOptionId: string;
    selectedOptionText?: string;
    correctOptionId: string;
    correctOptionText?: string;
    allOptions?: {
      id: string;
      text: string;
      image?: string;
    }[];
    isCorrect: boolean;
    marksAwarded: number;
    feedback?: string;
  }[];
  results?: {
    questionId: string;
    questionText: string;
    questionImage?: string;
    selectedOptionId: string;
    selectedOptionText?: string;
    correctOptionId: string;
    correctOptionText?: string;
    allOptions?: {
      id: string;
      text: string;
      image?: string;
    }[];
    isCorrect: boolean;
    marksAwarded: number;
    feedback?: string;
  }[];
}

interface Quiz {
  _id?: string;
  title: string;
  description: string;
  overallFeedback: string;
  canUserViewAnswers?: boolean;
}

interface StoredQuizResult {
  quiz: Quiz;
  result: QuizResult;
  timeSpent?: number;
  user?: string;
}

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

export default function QuizResultClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const quizId = params.id as string;
  const [resultData, setResultData] = useState<StoredQuizResult | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Try to get the user's actual attempt from the database
  const { data: userAttempt, isLoading } = useGetUserQuizAttemptQuery(quizId, {
    skip: !user,
  });

  useEffect(() => {
    // First try to use the database attempt
    if (userAttempt?.attempt) {
      const attempt = userAttempt.attempt;
      setResultData({
        quiz: {
          _id:
            typeof attempt.quizId === "object"
              ? (attempt.quizId as any)?._id
              : attempt.quizId,
          title:
            typeof attempt.quizId === "object"
              ? (attempt.quizId as any)?.title
              : "Quiz",
          description:
            typeof attempt.quizId === "object"
              ? (attempt.quizId as any)?.description
              : "",
          overallFeedback:
            typeof attempt.quizId === "object"
              ? (attempt.quizId as any)?.overallFeedback || ""
              : "",
          canUserViewAnswers:
            typeof attempt.quizId === "object"
              ? ((attempt.quizId as any)?.canUserViewAnswers ?? false)
              : false,
        },
        result: (attempt.result || {
          totalQuestions: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          totalMarks: 0,
          obtainedMarks: 0,
          negativeMarks: 0,
          percentage: 0,
          questionResults: [],
        }) as QuizResult,
        timeSpent: attempt.timeSpent,
        user: attempt.userName || attempt.userId?.toString(),
      });
      return;
    }

    // Fallback to session storage (for just completed quizzes)
    const storedResult = sessionStorage.getItem("quizResult");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);

        // Ensure canUserViewAnswers has a proper fallback
        if (parsed.quiz) {
          parsed.quiz.canUserViewAnswers =
            parsed.quiz.canUserViewAnswers ?? false;
        }

        setResultData(parsed);
      } catch (error) {
        console.error("Error parsing quiz result:", error);
        // Don't redirect - will show "no result" UI below
      }
    }
    // NOTE: Removed automatic redirect to /give-quiz to prevent infinite loop
    // If no result found, show appropriate UI instead of redirecting
  }, [userAttempt, isLoading, quizId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Show "no result found" UI if loading is done but no data
  if (!resultData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8">
          <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Result Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find any quiz result for this quiz. This might be
            because you haven&apos;t attempted this quiz yet.
          </p>
          <Link
            href={`/give-quiz/${quizId}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Take Quiz
          </Link>
        </div>
      </div>
    );
  }

  const { quiz, result } = resultData;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-800";
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Great job! Well done!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Not bad! You can do better!";
    if (percentage >= 50) return "Needs improvement. Try again!";
    return "Don't give up! Practice makes perfect!";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/">
              <button className="p-2 rounded-full hover:bg-gray-200 shrink-0">
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Quiz Results
              </h1>
              {(user || resultData.user) && (
                <div className="flex items-center gap-2 mt-1">
                  <User2 className="text-gray-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate">
                    Results for: {resultData.user || user?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end sm:justify-start shrink-0">
            <Link href="/my-quizzes">
              <button className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                <span className="hidden sm:inline">View All Attempts</span>
                <span className="sm:hidden">View All</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Quiz Title */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {quiz.title}
          </h2>
          <RichTextRenderer htmlString={quiz.description} />
        </Card>

        {/* Score Summary */}
        <Card className="mb-8">
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(result.percentage)} mb-4`}
            >
              <div className="text-center">
                <span
                  className={`text-4xl font-bold ${getScoreColor(result.percentage)} block`}
                >
                  {result.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-600">
                  {result.obtainedMarks}/{result.totalMarks}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {getPerformanceMessage(result.percentage)}
            </h3>
            <p className="text-lg text-gray-600 mb-4">
              You scored {result.obtainedMarks} out of {result.totalMarks} marks
            </p>

            {/* Additional Info */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              {resultData.timeSpent && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    Time spent: {Math.floor(resultData.timeSpent / 60)}m{" "}
                    {resultData.timeSpent % 60}s
                  </span>
                </div>
              )}
              {userAttempt?.attempt && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    Completed:{" "}
                    {new Date(
                      userAttempt.attempt.submittedAt || Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600 w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Correct</p>
              <p className="text-2xl font-bold text-green-600">
                {result.correctAnswers}
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="text-red-800 w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Incorrect</p>
              <p className="text-2xl font-bold text-red-800">
                {result.incorrectAnswers}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="text-gray-600 w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Unanswered</p>
              <p className="text-2xl font-bold text-gray-600">
                {result.unansweredQuestions || 0}
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Award className="text-blue-600 w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.totalQuestions}
              </p>
            </div>
          </div>

          {result.negativeMarks > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm">
                <strong>Negative Marking:</strong> {result.negativeMarks} marks
                deducted for incorrect answers
              </p>
            </div>
          )}
        </Card>

        {/* Detailed Results */}
        {quiz.canUserViewAnswers === true ? (
          // Show detailed results when canUserViewAnswers is explicitly true
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Detailed Review
            </h3>
            <div className="space-y-6">
              {(result.questionResults || result.results || []).map(
                (questionResult, index) => (
                  <div
                    key={questionResult.questionId}
                    className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {questionResult.isCorrect ? (
                          <CheckCircle className="text-green-600 w-6 h-6" />
                        ) : questionResult.selectedOptionId ? (
                          <XCircle className="text-red-800 w-6 h-6" />
                        ) : (
                          <Clock className="text-gray-400 w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Question {index + 1}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              questionResult.isCorrect
                                ? "bg-green-100 text-green-800"
                                : questionResult.selectedOptionId
                                  ? "bg-red-100 text-[#AF4444]"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {questionResult.marksAwarded > 0
                              ? `+${questionResult.marksAwarded}`
                              : questionResult.marksAwarded < 0
                                ? questionResult.marksAwarded
                                : "0"}{" "}
                            marks
                          </span>
                        </div>

                        <RichTextRenderer
                          htmlString={questionResult.questionText}
                          className="mb-3"
                        />

                        {/* Display question image if available */}
                        {questionResult.questionImage && (
                          <div
                            className="mb-3 relative group cursor-pointer inline-block rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50"
                            onClick={() =>
                              setZoomedImage(questionResult.questionImage!)
                            }
                          >
                            <AppImage
                              photoUrl={questionResult.questionImage}
                              alt="Question"
                              width={500}
                              height={300}
                              className="max-w-full h-auto"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
                                <ZoomIn className="w-5 h-5" />
                                Click to Zoom
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {!questionResult.selectedOptionId && (
                            <p className="text-gray-500 italic">
                              No answer selected
                            </p>
                          )}

                          {questionResult.selectedOptionId &&
                            !questionResult.isCorrect && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700">
                                  <strong>Your answer:</strong>{" "}
                                  {questionResult.selectedOptionText ||
                                    questionResult.selectedOptionId}
                                </p>
                              </div>
                            )}

                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700">
                              <strong>Correct answer:</strong>{" "}
                              {questionResult.correctOptionText ||
                                questionResult.correctOptionId}
                            </p>
                          </div>

                          {/* Show all options if available */}
                          {questionResult.allOptions &&
                            questionResult.allOptions.length > 0 && (
                              <div className="mt-4">
                                <p className="font-medium text-gray-700 mb-3">
                                  All Options:
                                </p>
                                <div className="space-y-2">
                                  {questionResult.allOptions.map(
                                    (option, optIndex) => (
                                      <div
                                        key={option.id}
                                        className={`p-3 rounded-lg border-2 ${
                                          option.id ===
                                          questionResult.correctOptionId
                                            ? "bg-green-50 border-green-300"
                                            : option.id ===
                                                  questionResult.selectedOptionId &&
                                                !questionResult.isCorrect
                                              ? "bg-red-50 border-red-300"
                                              : "bg-gray-50 border-gray-200"
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <span
                                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                              option.id ===
                                              questionResult.correctOptionId
                                                ? "bg-green-600 text-white"
                                                : option.id ===
                                                      questionResult.selectedOptionId &&
                                                    !questionResult.isCorrect
                                                  ? "bg-red-800 text-white"
                                                  : "bg-gray-400 text-white"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + optIndex)}
                                          </span>

                                          <div className="flex-grow">
                                            <div
                                              className="text-gray-700"
                                              dangerouslySetInnerHTML={{
                                                __html: option.text,
                                              }}
                                            />

                                            {option.image && (
                                              <div
                                                className="mt-2 relative group cursor-pointer inline-block rounded border overflow-hidden"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setZoomedImage(option.image!);
                                                }}
                                              >
                                                <AppImage
                                                  photoUrl={option.image}
                                                  alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                  width={128}
                                                  height={80}
                                                  className="max-w-32 h-auto"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                  <ZoomIn className="w-6 h-6 text-white" />
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex-shrink-0">
                                            {option.id ===
                                              questionResult.correctOptionId && (
                                              <CheckCircle className="text-green-600 w-5 h-5" />
                                            )}
                                            {option.id ===
                                              questionResult.selectedOptionId &&
                                              !questionResult.isCorrect && (
                                                <XCircle className="text-red-800 w-5 h-5" />
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {questionResult.feedback && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-blue-800 text-sm">
                                <strong>Explanation:</strong>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: questionResult.feedback,
                                  }}
                                />
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </Card>
        ) : (
          // Show summary only when canUserViewAnswers is false, undefined, or any other value
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Quiz Results
            </h3>
            <div className="text-center py-8">
              <Trophy className="text-blue-600 w-16 h-16 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                You have completed this quiz successfully!
              </p>
              <p className="text-gray-500 mt-2">
                Detailed answers are not available for this quiz.
              </p>
            </div>
          </Card>
        )}

        {quiz.overallFeedback && (
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Overall Feedback
            </h3>
            <RichTextRenderer htmlString={quiz.overallFeedback} />
          </Card>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <AppImage
                photoUrl={zoomedImage}
                alt="Zoomed image"
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
