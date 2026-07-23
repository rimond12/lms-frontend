"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions?: number;
  totalMarks: number;
  obtainedMarks: number;
  negativeMarks: number;
  percentage: number;
  results: {
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

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const [resultData, setResultData] = useState<StoredQuizResult | null>(null);

  // Helper function to get option text by ID
  const getOptionText = (
    optionId: string,
    allOptions?: { id: string; text: string; image?: string }[],
  ) => {
    if (!allOptions) return `Option ${optionId}`;
    const option = allOptions.find((opt) => opt.id === optionId);
    return option?.text || `Option ${optionId}`;
  };

  useEffect(() => {
    // Get result from sessionStorage
    const storedResult = sessionStorage.getItem("quizResult");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResultData(parsed);
      } catch (error) {
        console.error("Error parsing quiz result:", error);
        router.push(`/dashboard/manage-quiz/quiz-details/${quizId}`);
      }
    } else {
      // If no result found, redirect back to quiz
      router.push(`/dashboard/manage-quiz/quiz-details/${quizId}`);
    }
  }, [quizId, router]);

  if (!resultData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/manage-quiz")}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="sm:text-xl  md:text-3xl font-bold text-gray-900">
              Quiz Results
            </h1>
          </div>
        </div>

        {/* Quiz Title */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {quiz.title}
          </h2>
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: quiz.description }}
          />
        </Card>

        {/* Score Summary */}
        <Card className="mb-8">
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(result.percentage)} mb-4`}
            >
              <span
                className={`text-3xl font-bold ${getScoreColor(result.percentage)}`}
              >
                {result.percentage.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Your Score
            </h3>
            <p className="text-lg text-gray-600">
              {result.obtainedMarks} out of {result.totalMarks} marks
            </p>
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
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Detailed Results
          </h3>
          <div className="space-y-6">
            {result.results.map((questionResult, index) => (
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

                    <div
                      className="text-gray-700 mb-3"
                      dangerouslySetInnerHTML={{
                        __html: questionResult.questionText,
                      }}
                    />

                    {/* Display question image if available */}
                    {questionResult.questionImage && (
                      <div className="mb-3">
                        <img
                          src={
                            questionResult.questionImage.startsWith("http")
                              ? questionResult.questionImage
                              : `${process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com"}/${questionResult.questionImage}`
                          }
                          alt="Question"
                          className="max-w-full h-auto rounded-lg border"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Show answer summary */}
                      {!questionResult.selectedOptionId && (
                        <p className="text-gray-500 italic">
                          No answer selected
                        </p>
                      )}

                      {/* Show user's answer when they selected something */}
                      {questionResult.selectedOptionId && (
                        <div
                          className={`p-3 border rounded-lg ${
                            questionResult.isCorrect
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div
                            className={
                              questionResult.isCorrect
                                ? "text-green-700"
                                : "text-red-700"
                            }
                          >
                            <strong>Your answer:</strong>{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  questionResult?.selectedOptionText ||
                                  getOptionText(
                                    questionResult.selectedOptionId,
                                    questionResult.allOptions,
                                  ),
                              }}
                            />
                            {questionResult.isCorrect && (
                              <span className="ml-2 inline-flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show correct answer if user was wrong or didn't answer */}
                      {!questionResult.isCorrect && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-green-700">
                            <strong>Correct answer:</strong>{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  questionResult.correctOptionText ||
                                  getOptionText(
                                    questionResult.correctOptionId,
                                    questionResult.allOptions,
                                  ),
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Show all options */}
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

                                        {/* Display option image if available */}
                                        {option.image && (
                                          <div className="mt-2">
                                            <img
                                              src={
                                                option.image.startsWith("http")
                                                  ? option.image
                                                  : `${process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com"}/${option.image}`
                                              }
                                              alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                                              className="max-w-32 h-auto rounded border"
                                            />
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
                            <strong>Feedback:</strong>
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
            ))}
          </div>
        </Card>

        {/* Overall Feedback */}
        {quiz.overallFeedback && (
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Overall Feedback
            </h3>
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: quiz.overallFeedback }}
            />
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/manage-quiz">
            <button className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              View All Quizzes
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
