"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetQuizByIdQuery,
  useSubmitQuizAnswersMutation,
  Quiz,
  QuizQuestion,
} from "@/app/redux/api/QuizApi/quizApi";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  Send,
  HelpCircle,
  Award,
  Target,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

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

export default function GiveQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  // Get courseId from query parameters if available
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const courseId = searchParams.get("courseId") || "";

  const { data, isLoading, error } = useGetQuizByIdQuery(quizId);
  const [submitQuizAnswers, { isLoading: isSubmitting }] =
    useSubmitQuizAnswersMutation();

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!data?.quiz) return;

    const questions = data.quiz.questions || [];
    const unansweredQuestions = questions.filter(
      (q) => !selectedAnswers[q._id || ""],
    );

    if (unansweredQuestions.length > 0) {
      const confirm = window.confirm(
        `You have ${unansweredQuestions.length} unanswered questions. Submit anyway?`,
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

      await submitQuizAnswers({
        quizId,
        courseId: courseId || data.quiz.courseId || "",
        answers,
      }).unwrap();

      toast.success("Quiz submitted successfully!");
      router.push(`/dashboard/manage-quiz/quiz-result/${quizId}`);
    } catch (error) {
      toast.error("Failed to submit quiz");
      console.error("Error submitting quiz:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.quiz) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-800">Error loading quiz. Please try again.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const quiz = data.quiz;
  const questions = quiz.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  quiz.quizType === "module"
                    ? "bg-blue-100 text-blue-700"
                    : quiz.quizType === "mid-course"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-purple-100 text-purple-700"
                }`}
              >
                {quiz.quizType === "module"
                  ? "Module Quiz"
                  : quiz.quizType === "mid-course"
                    ? "Mid-Course Assessment"
                    : "Final Exam"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Progress: {answeredCount}/{totalQuestions}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quiz Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Quiz Instructions
              </h2>
              {quiz.description && (
                <p className="text-gray-700">{quiz.description}</p>
              )}
              {quiz.instructions && (
                <p className="text-gray-600 text-sm">{quiz.instructions}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalQuestions}
                  </p>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {totalMarks}
                  </p>
                  <p className="text-sm text-gray-600">Total Marks</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {quiz.passingScore}%
                  </p>
                  <p className="text-sm text-gray-600">Pass Score</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {quiz.timeLimit ? `${quiz.timeLimit}m` : "∞"}
                  </p>
                  <p className="text-sm text-gray-600">Time Limit</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <motion.div
              key={question._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {selectedAnswers[question._id || ""] ? (
                      <CheckCircle size={24} className="text-green-600" />
                    ) : (
                      <Circle size={24} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Question {index + 1} ({question.marks} marks)
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedAnswers[question._id || ""]
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {selectedAnswers[question._id || ""]
                          ? "Answered"
                          : "Not Answered"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 mb-3">
                        {question.questionText}
                      </p>
                      {question.questionImage && (
                        <img
                          src={
                            question.questionImage.startsWith("http")
                              ? question.questionImage
                              : `${process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com"}/${question.questionImage}`
                          }
                          alt={`Question ${index + 1}`}
                          className="max-w-md rounded-lg shadow-sm"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={option.id}
                          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedAnswers[question._id || ""] === option.id
                              ? "bg-blue-50 border-blue-300 shadow-sm"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            handleAnswerSelect(question._id || "", option.id)
                          }
                        >
                          <input
                            type="radio"
                            name={question._id}
                            checked={
                              selectedAnswers[question._id || ""] === option.id
                            }
                            readOnly
                            className="form-radio text-blue-600 mt-1"
                          />

                          <div className="flex-grow">
                            <div className="flex items-start">
                              <span className="font-medium text-gray-900 mr-2">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <div className="flex-grow">
                                <span className="text-gray-700">
                                  {option.text}
                                </span>
                                {option.image && (
                                  <img
                                    src={
                                      option.image.startsWith("http")
                                        ? option.image
                                        : `${process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com"}/${option.image}`
                                    }
                                    alt={`Option ${optionIndex + 1}`}
                                    className="max-w-xs mt-2 rounded shadow-sm"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Submit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mt-8 sticky bottom-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>
                  Questions answered: {answeredCount} of {totalQuestions}
                </p>
                <p>Questions remaining: {totalQuestions - answeredCount}</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                  onClick={() => router.back()}
                >
                  Save & Exit
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </button>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ You have {totalQuestions - answeredCount} unanswered
                  questions. You can submit now or continue answering.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
