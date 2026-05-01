"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, AlertCircle } from "lucide-react";

interface Question {
  questionText: string;
  marks: number;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

interface Quiz {
  _id?: string; // Store ID to identify existing quizzes
  title: string;
  description: string;
  subject: string;
  totalQuestions: number;
  passingScore: number;
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  questions: Question[];
}

interface QuizzesStepProps {
  data: Quiz[];
  onUpdate: (data: Quiz[]) => void;
}

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

/**
 * Step 5: Quiz Management
 * Manages quizzes for the program with full question support
 * Each quiz is created with questions and linked to the program in the backend
 * Follows backend schema exactly: POST /api/quizzes with quiz object and questions array
 */
export const QuizzesStep: React.FC<QuizzesStepProps> = ({ data, onUpdate }) => {
  const addQuiz = () => {
    onUpdate([
      ...data,
      {
        title: "",
        description: "",
        subject: "",
        totalQuestions: 0,
        passingScore: 60,
        duration: 30,
        totalMarks: 100,
        negativeMarking: true,
        negativeMarkValue: -0.5,
        questions: [],
      },
    ]);
  };

  const updateQuiz = (idx: number, field: string, value: any) => {
    const newData = [...data];
    (newData[idx] as any)[field] = value;
    onUpdate(newData);
  };

  const removeQuiz = (idx: number) => {
    onUpdate(data.filter((_, i) => i !== idx));
  };

  const addQuestion = (quizIdx: number) => {
    const newData = [...data];
    newData[quizIdx].questions.push({
      questionText: "",
      marks: 10,
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
    newData[quizIdx].totalQuestions = newData[quizIdx].questions.length;
    onUpdate(newData);
  };

  const updateQuestion = (
    quizIdx: number,
    questionIdx: number,
    field: string,
    value: any
  ) => {
    const newData = [...data];
    (newData[quizIdx].questions[questionIdx] as any)[field] = value;
    onUpdate(newData);
  };

  const updateOption = (
    quizIdx: number,
    questionIdx: number,
    optionIdx: number,
    field: string,
    value: any
  ) => {
    const newData = [...data];
    (newData[quizIdx].questions[questionIdx].options[optionIdx] as any)[
      field
    ] = value;
    onUpdate(newData);
  };

  const addOption = (quizIdx: number, questionIdx: number) => {
    const newData = [...data];
    newData[quizIdx].questions[questionIdx].options.push({
      text: "",
      isCorrect: false,
    });
    onUpdate(newData);
  };

  const removeOption = (quizIdx: number, questionIdx: number, optionIdx: number) => {
    const newData = [...data];
    const options = newData[quizIdx].questions[questionIdx].options;
    if (options.length > 2) {
      options.splice(optionIdx, 1);
      onUpdate(newData);
    }
  };

  const removeQuestion = (quizIdx: number, questionIdx: number) => {
    const newData = [...data];
    newData[quizIdx].questions.splice(questionIdx, 1);
    newData[quizIdx].totalQuestions = newData[quizIdx].questions.length;
    onUpdate(newData);
  };

  // Calculate total marks from questions
  const getTotalMarks = (quizIdx: number): number => {
    return data[quizIdx].questions.reduce((sum, q) => sum + q.marks, 0);
  };

  // Validate quiz has at least one question
  const isQuizValid = (quiz: Quiz): boolean => {
    if (!quiz.title || quiz.title.trim().length === 0) return false;
    if (quiz.questions.length === 0) return false;
    return quiz.questions.every((q) => {
      if (!q.questionText || q.questionText.trim().length === 0) return false;
      if (q.options.length < 2) return false;
      if (!q.options.some((o) => o.isCorrect)) return false;
      return true;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Quizzes List */}
      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No quizzes added yet</p>
          <button
            onClick={addQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={18} />
            Add First Quiz
          </button>
        </div>
      ) : (
        data.map((quiz, quizIdx) => (
          <motion.div
            key={quizIdx}
            className={`border-2 rounded-lg p-5 transition-all ${
              isQuizValid(quiz)
                ? "border-green-300 hover:border-green-400 hover:shadow-md"
                : "border-orange-300 hover:border-orange-400 bg-orange-50"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Quiz Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Quiz {quizIdx + 1}
                </h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {getTotalMarks(quizIdx)} marks
                  </span>
                  {!isQuizValid(quiz) && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                      <AlertCircle size={12} /> Incomplete
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeQuiz(quizIdx)}
                className="flex items-center gap-1 text-red-800 hover:text-red-700 font-medium text-sm transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>

            {/* Quiz Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quiz Title <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={quiz.title}
                  onChange={(e) => updateQuiz(quizIdx, "title", e.target.value)}
                  placeholder="e.g., TypeScript Fundamentals Quiz"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  value={quiz.description}
                  onChange={(e) =>
                    updateQuiz(quizIdx, "description", e.target.value)
                  }
                  placeholder="What will students be tested on?"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent resize-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Subject <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={quiz.subject}
                  onChange={(e) =>
                    updateQuiz(quizIdx, "subject", e.target.value)
                  }
                  placeholder="e.g., TypeScript"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                />
              </div>

              {/* Quiz Configuration */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Quiz Settings</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Total Marks <span className="text-red-800">*</span>
                    </label>
                    <input
                      type="number"
                      value={quiz.totalMarks}
                      onChange={(e) =>
                        updateQuiz(quizIdx, "totalMarks", parseInt(e.target.value))
                      }
                      placeholder="100"
                      min="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Passing Percentage (%) <span className="text-red-800">*</span>
                    </label>
                    <input
                      type="number"
                      value={quiz.passingScore}
                      onChange={(e) =>
                        updateQuiz(quizIdx, "passingScore", Math.min(Math.max(parseInt(e.target.value), 0), 100))
                      }
                      placeholder="60"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Duration (minutes) <span className="text-red-800">*</span>
                    </label>
                    <input
                      type="number"
                      value={quiz.duration}
                      onChange={(e) =>
                        updateQuiz(quizIdx, "duration", parseInt(e.target.value))
                      }
                      placeholder="30"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Negative Mark Value
                    </label>
                    <input
                      type="number"
                      value={quiz.negativeMarkValue}
                      onChange={(e) =>
                        updateQuiz(quizIdx, "negativeMarkValue", parseFloat(e.target.value))
                      }
                      placeholder="-0.5"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={quiz.negativeMarking}
                        onChange={(e) =>
                          updateQuiz(quizIdx, "negativeMarking", e.target.checked)
                        }
                        className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-red-800"
                      />
                      <span>Enable Negative Marking</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">
                    Questions ({quiz.questions.length})
                  </h4>
                  <button
                    onClick={() => addQuestion(quizIdx)}
                    className="text-red-800 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Question
                  </button>
                </div>

                {quiz.questions.length === 0 ? (
                  <div className="bg-white rounded p-3 text-center text-sm text-gray-600 border border-dashed border-gray-300">
                    No questions added yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quiz.questions.map((question, questionIdx) => (
                      <motion.div
                        key={questionIdx}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-700">
                            Question {questionIdx + 1}
                          </h5>
                          <button
                            onClick={() => removeQuestion(quizIdx, questionIdx)}
                            className="text-red-800 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Question Text <span className="text-red-800">*</span>
                            </label>
                            <textarea
                              value={question.questionText}
                              onChange={(e) =>
                                updateQuestion(
                                  quizIdx,
                                  questionIdx,
                                  "questionText",
                                  e.target.value
                                )
                              }
                              placeholder="Enter the question"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">
                                Marks <span className="text-red-800">*</span>
                              </label>
                              <input
                                type="number"
                                value={question.marks}
                                onChange={(e) =>
                                  updateQuestion(
                                    quizIdx,
                                    questionIdx,
                                    "marks",
                                    parseInt(e.target.value)
                                  )
                                }
                                placeholder="10"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent"
                              />
                            </div>
                          </div>

                          {/* Options */}
                          <div className="bg-gray-50 rounded p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <h6 className="text-xs font-medium text-gray-600">
                                Options
                              </h6>
                              <button
                                onClick={() => addOption(quizIdx, questionIdx)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                + Add Option
                              </button>
                            </div>

                            {question.options.map((option, optionIdx) => (
                              <div key={optionIdx} className="flex gap-2">
                                <input
                                  type="checkbox"
                                  checked={option.isCorrect}
                                  onChange={(e) =>
                                    updateOption(
                                      quizIdx,
                                      questionIdx,
                                      optionIdx,
                                      "isCorrect",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-2 focus:ring-green-500 mt-1 flex-shrink-0"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) =>
                                    updateOption(
                                      quizIdx,
                                      questionIdx,
                                      optionIdx,
                                      "text",
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Option ${optionIdx + 1}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {question.options.length > 2 && (
                                  <button
                                    onClick={() =>
                                      removeOption(quizIdx, questionIdx, optionIdx)
                                    }
                                    className="text-red-800 hover:text-red-700 flex-shrink-0"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <span className="font-medium">✓ Backend Compliant:</span> This
                  quiz will be created via the <code className="text-blue-700">POST /api/quizzes</code> endpoint
                  with all questions included.
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* Add Quiz Button */}
      <button
        onClick={addQuiz}
        className="w-full py-3 border-2 border-dashed border-red-300 text-red-800 rounded-lg hover:bg-red-50 font-medium transition-colors"
      >
        + Add Quiz
      </button>
    </motion.div>
  );
};

export default QuizzesStep;
