import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useMemo } from "react";

// Re-export quiz types from QuizApi for backward compatibility
export type {
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  QuizResult,
  QuizAnalytics,
  UserQuizStatus,
  QuizAttemptAnswer,
  QuizQuestionResult,
} from "@/app/redux/api/QuizApi/quizApi";

// Legacy interface for backward compatibility with populated data
export interface QuizAttemptRecord {
  _id: string;
  quizId: {
    _id: string;
    title: string;
    description: string;
    overallFeedback?: string;
    canUserViewAnswers?: boolean;
    showCorrectAnswers?: boolean;
  };
  courseId?: {
    _id: string;
    title: string;
    slug: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  userEmail: string;
  userName: string;
  attemptNumber: number;
  answers: {
    questionId: string;
    selectedOptionId: string | null;
    timeSpent?: number;
  }[];
  result: {
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    totalMarks: number;
    obtainedMarks: number;
    negativeMarks: number;
    finalScore: number;
    percentage: number;
    passingScore: number;
    passed: boolean;
    questionResults: {
      questionId: string;
      questionText: string;
      questionImage?: string;
      selectedOptionId: string | null;
      selectedOptionText?: string;
      correctOptionId: string;
      correctOptionText?: string;
      isCorrect: boolean;
      isSkipped: boolean;
      marksAwarded: number;
      negativeMarks: number;
      feedback?: string;
    }[];
    feedback?: string;
  };
  status: 'in-progress' | 'submitted' | 'graded';
  timeSpent?: number;
  startedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
