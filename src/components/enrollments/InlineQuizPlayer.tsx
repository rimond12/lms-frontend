"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Loader2,
  BookOpen,
  Target,
  AlertCircle,
  PlayCircle,
  ZoomIn,
  X,
} from "lucide-react";
import {
  useGetQuizForStudentQuery,
  useSubmitQuizAnswersMutation,
  useStartQuizAttemptMutation,
} from "@/app/redux/api/QuizApi/quizApi";
import { toast } from "sonner";
import { getFullDocumentUrl } from "@/utils/serverUrl";

// ==================== TYPES ====================
interface QuizQuestion {
  _id?: string;
  questionText: string;
  questionImage?: string;
  marks: number;
  options: {
    id: string;
    text: string;
    image?: string;
  }[];
  correctAnswerId?: string;
  feedback?: string;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalMarks: number;
  obtainedMarks: number;
  negativeMarks: number;
  percentage: number;
  passed: boolean;
  results?: {
    questionId: string;
    isCorrect: boolean;
    marksAwarded: number;
    selectedOptionId: string;
    correctOptionId: string;
  }[];
}

interface InlineQuizPlayerProps {
  quizId: string;
  courseId?: string;
  moduleTitle?: string;
  onComplete?: (result: QuizResult) => void;
  onClose?: () => void;
}

// ==================== MAIN COMPONENT ====================
export default function InlineQuizPlayer({
  quizId,
  courseId,
  moduleTitle,
  onComplete,
  onClose,
}: InlineQuizPlayerProps) {
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [attemptData, setAttemptData] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // API Hooks
  // We use useGetQuizForStudentQuery instead of useGetQuizByIdQuery to get status too!
  const { data, isLoading, error, refetch } = useGetQuizForStudentQuery(quizId);
  const [submitQuizAnswers] = useSubmitQuizAnswersMutation();
  const [startAttempt, { isLoading: isStarting }] =
    useStartQuizAttemptMutation();

  const quiz = data?.quiz;
  const status = data?.status;
  const questions: QuizQuestion[] = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  // Formatting Time function
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer Interval
  useEffect(() => {
    if (!quiz?.timeLimit || !attemptData || isSubmitting || quizResult) return;

    // timeLimit is in minutes
    const attemptTime = new Date(attemptData.startedAt).getTime();
    const timeLimitMs = quiz.timeLimit * 60 * 1000;
    const endTime = attemptTime + timeLimitMs;

    const timerId = setInterval(() => {
      const now = new Date().getTime();
      setTimeLeft(Math.max(0, endTime - now));
    }, 1000);

    // Initial tick
    setTimeLeft(Math.max(0, endTime - new Date().getTime()));

    return () => clearInterval(timerId);
  }, [quiz?.timeLimit, attemptData, isSubmitting, quizResult]);

  // Auto-submit when time is perfectly zero
  const lastTimeLeft = useRef(timeLeft);
  useEffect(() => {
    lastTimeLeft.current = timeLeft;
  }, [timeLeft]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && answeredCount < questions.length) {
      const confirm = window.confirm(
        `You have ${questions.length - answeredCount} unanswered questions. Submit anyway?`,
      );
      if (!confirm) return;
    }

    try {
      setIsSubmitting(true);
      const answers = Object.entries(selectedAnswers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        }),
      );

      const result = await submitQuizAnswers({
        quizId,
        courseId: courseId || "",
        answers,
        timeSpent: attemptData
          ? Math.floor(
              (new Date().getTime() -
                new Date(attemptData.startedAt).getTime()) /
                1000,
            )
          : 0,
      }).unwrap();

      const quizResultData: QuizResult = result.result || {
        totalQuestions: questions.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalMarks: 0,
        obtainedMarks: 0,
        negativeMarks: 0,
        percentage: 0,
        passed: false,
      };

      setQuizResult(quizResultData);

      // We should refetch the status so our attempts used updates correctly
      refetch();

      if (isAutoSubmit) {
        toast.info("Quiz auto-submitted because time's up!");
      } else {
        toast.success("Quiz submitted successfully!");
      }

      if (onComplete) {
        onComplete(quizResultData);
      }
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      toast.error(err?.data?.message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  // The actual auto submission effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && !isSubmitting && !quizResult) {
      // time limit reached
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitting, quizResult]);

  // Handlers
  const handleStart = async () => {
    try {
      const res = await startAttempt({
        quizId,
        courseId: courseId || "",
      }).unwrap();
      setAttemptData(res.attempt);

      // Load saved answers from in-progress attempt if any
      if (res.attempt.answers && res.attempt.answers.length > 0) {
        const saved: Record<string, string> = {};
        res.attempt.answers.forEach((a: any) => {
          if (a.selectedOptionId) saved[a.questionId] = a.selectedOptionId;
        });
        setSelectedAnswers(saved);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start quiz");
    }
  };

  const handleSelectAnswer = useCallback(
    (questionId: string, optionId: string) => {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));
    },
    [],
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setAttemptData(null);
    setTimeLeft(null);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading quiz...</p>
      </div>
    );
  }

  // Error State
  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Not Found</h3>
        <p className="text-gray-600 text-center mb-6">
          We couldn&apos;t load this quiz. Please try again.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  // Result State
  if (quizResult) {
    const isPassed = quizResult.percentage >= (quiz.passingScore || 60);

    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Result Header */}
          <div
            className={`text-center p-8 rounded-2xl mb-6 ${
              isPassed
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              {isPassed ? (
                <Award className="w-10 h-10 text-white" />
              ) : (
                <Target className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isPassed ? "Congratulations!" : "Keep Practicing!"}
            </h2>
            <p className="text-white/90">
              {isPassed
                ? "You have passed this quiz!"
                : `You need ${quiz.passingScore || 60}% to pass. Try again!`}
            </p>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {quizResult.percentage}%
              </div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">
                {quizResult.correctAnswers}
              </div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-red-500">
                {quizResult.incorrectAnswers}
              </div>
              <div className="text-sm text-gray-500">Wrong</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {quizResult.obtainedMarks}
              </div>
              <div className="text-sm text-gray-500">Marks</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {status?.canRetake && (
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Retake Quiz
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Continue Learning
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Start Screen State
  if (!attemptData) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl overflow-hidden p-6 sm:p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-lg w-full text-center">
          <BookOpen className="w-14 h-14 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {quiz.title}
          </h2>
          {moduleTitle && <p className="text-gray-500 mb-6">{moduleTitle}</p>}

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Time Limit</p>
                <p className="text-sm font-semibold text-gray-900">
                  {quiz.timeLimit ? `${quiz.timeLimit} mins` : "No Limit"}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Attempts</p>
                <p className="text-sm font-semibold text-gray-900">
                  {status
                    ? `${status.attemptsUsed} / ${quiz.attemptsAllowed === 0 ? "Unlimited" : quiz.attemptsAllowed}`
                    : "Loading..."}
                </p>
              </div>
            </div>
            {quiz.negativeMarkingEnabled &&
              quiz.negativeMarkingPercentage > 0 && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 col-span-2">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-500 font-medium">
                      Negative Marking Active
                    </p>
                    <p className="text-sm font-semibold text-red-700">
                      {quiz.negativeMarkingPercentage}% marks will be deducted
                      for every incorrect answer.
                    </p>
                  </div>
                </div>
              )}
          </div>

          {status?.canRetake ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isStarting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PlayCircle className="w-5 h-5" />
              )}
              {status.attemptsUsed > 0
                ? "Start Another Attempt"
                : "Start Quiz Now"}
            </button>
          ) : (
            <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              You have reached the maximum allowed attempts for this quiz.
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz Taking State
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {quiz.title}
            </h2>
            {moduleTitle && (
              <p className="text-sm text-gray-500">{moduleTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-medium text-sm ${
                  timeLeft < 60000
                    ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {answeredCount}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question Area */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentQuestion && (
              <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                {/* Question Number & Marks */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentQuestion.marks} mark
                    {currentQuestion.marks !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Question Text & Image */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.questionText}
                </h3>
                {currentQuestion.questionImage && (
                  <div
                    className="mb-6 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center p-4 relative group cursor-pointer"
                    onClick={() =>
                      setZoomedImage(
                        getFullDocumentUrl(currentQuestion.questionImage!),
                      )
                    }
                  >
                    <img
                      src={getFullDocumentUrl(currentQuestion.questionImage)}
                      alt="Question"
                      className="max-h-64 object-contain rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
                        <ZoomIn className="w-5 h-5" />
                        Click to Zoom
                      </div>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const questionId =
                      currentQuestion._id || `q${currentQuestionIndex}`;
                    const isSelected =
                      selectedAnswers[questionId] === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleSelectAnswer(questionId, option.id)
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div
                            className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>

                          <div className="flex-1 flex flex-col gap-3">
                            <span
                              className={`${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}
                            >
                              {option.text}
                            </span>
                            {option.image && (
                              <div
                                className="relative mt-2 self-start rounded-lg border border-gray-200 shadow-sm overflow-hidden group cursor-pointer block"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedImage(
                                    getFullDocumentUrl(option.image!),
                                  );
                                }}
                              >
                                <img
                                  src={getFullDocumentUrl(option.image)}
                                  alt={`Option ${String.fromCharCode(65 + idx)}`}
                                  className="max-h-40 object-contain block"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            )}
                          </div>

                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {questions.map((q, idx) => {
            const qId = q._id || `q${idx}`;
            return (
              <button
                key={qId}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  idx === currentQuestionIndex
                    ? "bg-blue-600 text-white"
                    : selectedAnswers[qId]
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
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
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
