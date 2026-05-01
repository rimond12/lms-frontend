"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Check,
  Circle,
  Clock,
  Target,
  RefreshCw,
  HelpCircle,
  Settings,
  X,
  FileText,
} from "lucide-react";
import {
  QuizQuestion,
  QuizOption,
  QuizType,
} from "@/app/redux/api/QuizApi/quizApi";
import ImageUploadField from "@/components/shared/ImageUploadField";
import { getServerBaseUrl } from "@/utils/serverUrl";

// ==================== TYPES ====================
export interface ModuleQuiz {
  _id?: string;
  title: string;
  description: string;
  instructions?: string;
  quizType: QuizType;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsAfter: "immediate" | "submission" | "manual";
  canUserViewAnswers: boolean;
  showCorrectAnswers: boolean;
  negativeMarkingEnabled: boolean;
  negativeMarkingPercentage: number;
  passFeedback?: string;
  failFeedback?: string;
  isActive: boolean;
  isPublished: boolean;
}

interface ModuleQuizEditorProps {
  quiz: ModuleQuiz | null;
  moduleTitle: string;
  onSave: (quiz: ModuleQuiz) => void;
  onRemove: () => void;
  isExpanded?: boolean;
}

// ==================== DEFAULT QUIZ ====================
const createDefaultQuiz = (moduleTitle: string): ModuleQuiz => ({
  title: `${moduleTitle} - Quiz`,
  description: "",
  instructions: "Answer all questions carefully. Good luck!",
  quizType: "module",
  questions: [],
  timeLimit: undefined,
  passingScore: 60,
  attemptsAllowed: 0, // unlimited
  shuffleQuestions: false,
  shuffleOptions: false,
  showResultsAfter: "immediate",
  canUserViewAnswers: true,
  showCorrectAnswers: true,
  negativeMarkingEnabled: false,
  negativeMarkingPercentage: 0,
  passFeedback: "Congratulations! You passed the quiz.",
  failFeedback: "You didn't pass. Please try again.",
  isActive: true,
  isPublished: false,
});

// ==================== HELPER FUNCTIONS ====================
const generateId = () => Math.random().toString(36).substr(2, 9);

// ==================== QUESTION EDITOR COMPONENT ====================
const QuestionEditor: React.FC<{
  question: QuizQuestion;
  index: number;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
}> = ({ question, index, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addOption = () => {
    const newOption: QuizOption = {
      id: generateId(),
      text: "",
    };
    onUpdate({ options: [...question.options, newOption] });
  };

  const updateOption = (optionId: string, text: string) => {
    onUpdate({
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt,
      ),
    });
  };

  const removeOption = (optionId: string) => {
    if (question.options.length <= 2) return;
    onUpdate({
      options: question.options.filter((opt) => opt.id !== optionId),
      correctAnswerId:
        question.correctAnswerId === optionId ? "" : question.correctAnswerId,
    });
  };

  const setCorrectAnswer = (optionId: string) => {
    onUpdate({ correctAnswerId: optionId });
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Get token from cookies
      const cookieString = document.cookie;
      const tokenCookie = cookieString
        .split("; ")
        .find((row) => row.startsWith("accessToken="));
      const token = tokenCookie ? tokenCookie.split("=")[1] : undefined;

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${getServerBaseUrl()}/api/quizzes/upload-image`,
        {
          method: "POST",
          body: formData,
          headers,
        },
      );

      const data = await res.json();
      if (!data?.data?.imagePath) throw new Error("Upload failed");
      return data.data.imagePath;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Question Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-700">
            Question {index + 1}
          </span>
          {question.questionText && (
            <span className="text-sm text-gray-500 max-w-xs truncate">
              {question.questionText.replace(/<[^>]*>/g, "").substring(0, 40)}
              ...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {question.marks} marks
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Question Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => onUpdate({ questionText: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Question Image */}
              <div>
                <ImageUploadField
                  label="Question Image (Optional)"
                  value={question.questionImage || ""}
                  onChange={(imagePath) =>
                    onUpdate({ questionImage: imagePath })
                  }
                  onUpload={handleImageUpload}
                  placeholder="Upload image for this question..."
                />
              </div>

              {/* Marks */}
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={question.marks}
                    onChange={(e) =>
                      onUpdate({ marks: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options (Select correct answer)
                  </label>
                  <button
                    onClick={addOption}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        question.correctAnswerId === option.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <button
                        onClick={() => setCorrectAnswer(option.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          question.correctAnswerId === option.id
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {question.correctAnswerId === option.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-sm text-gray-500 font-medium w-6">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          updateOption(option.id, e.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        className="flex-1 px-3 py-2 border-0 bg-transparent focus:ring-0 focus:outline-none"
                      />
                      <div className="flex-1 ml-4 border-l pl-4 border-gray-200">
                        <ImageUploadField
                          label="Option Image"
                          value={option.image || ""}
                          onChange={(imagePath) => {
                            const newOptions = [...question.options];
                            newOptions[optIndex] = {
                              ...newOptions[optIndex],
                              image: imagePath,
                            };
                            onUpdate({ options: newOptions });
                          }}
                          onUpload={handleImageUpload}
                          placeholder="Image..."
                        />
                      </div>
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(option.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!question.correctAnswerId && (
                  <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    Click the circle to mark the correct answer
                  </p>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (shown after attempt)
                </label>
                <textarea
                  value={question.feedback || ""}
                  onChange={(e) => onUpdate({ feedback: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ModuleQuizEditor({
  quiz,
  moduleTitle,
  onSave,
  onRemove,
  isExpanded: initialExpanded = false,
}: ModuleQuizEditorProps) {
  const [localQuiz, setLocalQuiz] = useState<ModuleQuiz>(() => {
    const initial = quiz || createDefaultQuiz(moduleTitle);
    return { ...initial, questions: initial.questions || [] };
  });
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [showSettings, setShowSettings] = useState(false);

  // Sync state when quiz prop changes (e.g., getting an _id after initial save)
  useEffect(() => {
    if (quiz) {
      setLocalQuiz((prev) => ({
        ...prev,
        ...quiz,
        questions: quiz.questions || [],
      }));
    }
  }, [quiz]);

  // Update local quiz
  const updateQuiz = (updates: Partial<ModuleQuiz>) => {
    const updated = { ...localQuiz, ...updates };
    setLocalQuiz(updated);
    onSave(updated);
  };

  // Add question
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      questionText: "",
      options: [
        { id: generateId(), text: "" },
        { id: generateId(), text: "" },
        { id: generateId(), text: "" },
        { id: generateId(), text: "" },
      ],
      correctAnswerId: "",
      marks: 1,
      feedback: "",
      order: localQuiz.questions.length,
    };
    updateQuiz({ questions: [...localQuiz.questions, newQuestion] });
  };

  // Update question
  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = [...localQuiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    updateQuiz({ questions: updatedQuestions });
  };

  // Remove question
  const removeQuestion = (index: number) => {
    updateQuiz({
      questions: localQuiz.questions.filter((_, i) => i !== index),
    });
  };

  // Calculate stats
  const questions = localQuiz.questions || [];
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const questionCount = questions.length;

  if (!quiz && !isExpanded) {
    // No quiz yet - show add button
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
      >
        <FileText className="w-5 h-5" />
        Add Quiz to this Module
      </button>
    );
  }

  return (
    <div className="border border-indigo-200 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-linear-to-r from-indigo-500 to-purple-600 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-white" />
          <div>
            <h4 className="font-semibold text-white">Module Quiz</h4>
            <p className="text-indigo-200 text-sm">
              {questionCount} questions • {totalMarks} marks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {localQuiz.isPublished && (
            <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full">
              Published
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={localQuiz.title}
                    onChange={(e) => updateQuiz({ title: e.target.value })}
                    placeholder="Quiz title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={localQuiz.passingScore}
                    onChange={(e) =>
                      updateQuiz({
                        passingScore: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={localQuiz.description}
                  onChange={(e) => updateQuiz({ description: e.target.value })}
                  placeholder="Brief description of this quiz..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Settings className="w-4 h-4" />
                {showSettings ? "Hide Settings" : "Advanced Settings"}
                {showSettings ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Advanced Settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Time Limit (mins)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={localQuiz.timeLimit || ""}
                        onChange={(e) =>
                          updateQuiz({
                            timeLimit: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="No limit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <RefreshCw className="w-4 h-4" />
                        Attempts Allowed
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={localQuiz.attemptsAllowed}
                        onChange={(e) =>
                          updateQuiz({
                            attemptsAllowed: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0 = Unlimited"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        0 = Unlimited attempts
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Negative Marking (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={localQuiz.negativeMarkingPercentage}
                        onChange={(e) =>
                          updateQuiz({
                            negativeMarkingEnabled:
                              parseInt(e.target.value) > 0,
                            negativeMarkingPercentage:
                              parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="shuffleQuestions"
                        checked={localQuiz.shuffleQuestions}
                        onChange={(e) =>
                          updateQuiz({ shuffleQuestions: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="shuffleQuestions"
                        className="text-sm text-gray-700"
                      >
                        Shuffle Questions
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="shuffleOptions"
                        checked={localQuiz.shuffleOptions}
                        onChange={(e) =>
                          updateQuiz({ shuffleOptions: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="shuffleOptions"
                        className="text-sm text-gray-700"
                      >
                        Shuffle Options
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showCorrectAnswers"
                        checked={localQuiz.showCorrectAnswers}
                        onChange={(e) =>
                          updateQuiz({ showCorrectAnswers: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="showCorrectAnswers"
                        className="text-sm text-gray-700"
                      >
                        Show Correct Answers
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    Questions ({questionCount})
                  </h5>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                {questionCount === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No questions yet</p>
                    <button
                      onClick={addQuestion}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Add your first question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localQuiz.questions.map((question, index) => (
                      <QuestionEditor
                        key={question._id || index}
                        question={question}
                        index={index}
                        onUpdate={(updates) => updateQuestion(index, updates)}
                        onRemove={() => removeQuestion(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="font-medium text-gray-700">
                    Publish Quiz
                  </label>
                  <p className="text-sm text-gray-500">
                    Students can access published quizzes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateQuiz({ isPublished: !localQuiz.isPublished })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    localQuiz.isPublished ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      localQuiz.isPublished ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
