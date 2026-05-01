"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetUserQuizAttemptsQuery } from "@/app/redux/api/QuizApi/quizApi";
import {
  Trophy,
  Clock,
  Zap,
  Star,
  BookOpen,
  FlameKindling,
} from "lucide-react";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import MyAllQuiz from "@/components/Myquiz/MyAllQuiz";
import QuizStatsCard from "@/components/Myquiz/QuizStatsCard";
import QuizLoadingScreen from "@/components/Myquiz/QuizLoadingScreen";
import QuizErrorScreen from "@/components/Myquiz/QuizErrorScreen";
import { calculateQuizStats } from "@/components/Myquiz/quizUtils";

export default function MyQuizzesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  const {
    data: attempts,
    isLoading,
    error,
    refetch,
  } = useGetUserQuizAttemptsQuery(undefined, {
    skip: !user,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Calculate quiz statistics using utility function
  const stats = calculateQuizStats(attempts || []);

  if (isLoading) {
    return <QuizLoadingScreen />;
  }

  if (error) {
    return <QuizErrorScreen onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Quiz List Section */}
          <MyAllQuiz />
        </div>
      </div>
    </div>
  );
}
