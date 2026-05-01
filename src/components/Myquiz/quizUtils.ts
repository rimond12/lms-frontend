// Quiz utility functions
import { Star, Trophy, Medal, Target, CheckCircle, Brain } from 'lucide-react';
import { QuizAttempt } from '@/app/redux/api/QuizApi/quizApi';

// Re-export for backward compatibility
export type { QuizAttempt };

export const calculateStreak = (attempts: QuizAttempt[]): number => {
  if (!attempts || attempts.length === 0) return 0;
  const sortedAttempts = [...attempts].sort((a, b) => 
    new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );
  let streak = 0;
  for (const attempt of sortedAttempts) {
    if ((attempt.result?.percentage ?? 0) >= 50) streak++;
    else break;
  }
  return streak;
};

export const getScoreColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-emerald-600';
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 60) return 'text-yellow-600';
  if (percentage >= 50) return 'text-orange-600';
  return 'text-red-800';
};

export const getScoreBgColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-gradient-to-r from-emerald-100 to-emerald-200 border-emerald-300';
  if (percentage >= 80) return 'bg-gradient-to-r from-green-100 to-green-200 border-green-300';
  if (percentage >= 70) return 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300';
  if (percentage >= 60) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
  if (percentage >= 50) return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
  return 'bg-gradient-to-r from-red-100 to-red-200 border-red-300';
};

export const getPerformanceBadge = (percentage: number) => {
  if (percentage >= 95) return { text: 'OUTSTANDING', icon: Star, color: 'emerald' };
  if (percentage >= 90) return { text: 'EXCELLENT', icon: Trophy, color: 'green' };
  if (percentage >= 80) return { text: 'GREAT', icon: Medal, color: 'blue' };
  if (percentage >= 70) return { text: 'GOOD', icon: Target, color: 'indigo' };
  if (percentage >= 60) return { text: 'FAIR', icon: CheckCircle, color: 'yellow' };
  return { text: 'NEEDS WORK', icon: Brain, color: 'red' };
};

export const formatDate = (dateString: string): string => {
  // Frontend formatting - uses Asia/Dhaka timezone for consistency
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka' // Bangladesh timezone - consistent with backend
  });
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const calculateQuizStats = (attempts: QuizAttempt[]) => {
  const totalAttempts = attempts?.length || 0;
  const passedAttempts = attempts?.filter(a => (a.result?.percentage ?? 0) >= 50).length || 0;
  const avgScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + (a.result?.percentage ?? 0), 0) / totalAttempts) 
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...attempts.map(a => a.result?.percentage ?? 0)) 
    : 0;
  const totalTimeSpent = attempts?.reduce((sum, a) => sum + (a.timeSpent || 0), 0) || 0;
  const streak = calculateStreak(attempts || []);

  return {
    totalAttempts,
    passedAttempts,
    avgScore,
    bestScore,
    totalTimeSpent,
    streak
  };
};
