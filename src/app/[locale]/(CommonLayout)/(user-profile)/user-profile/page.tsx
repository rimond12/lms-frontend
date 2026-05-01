"use client";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { calculateCourseProgress } from "@/app/utils/calculateCourseProgress";
import {
  Edit,
  CheckCircle,
  FileText,
  BookOpen,
  Award,
  Target,
  Bell,
  Calendar,
  Zap,
  Layers,
  ArrowRight,
  Activity,
  User,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  MailWarning,
  X,
} from "lucide-react";
import { useGetUserQuizAttemptsQuery } from "@/app/redux/api/QuizApi/quizApi";
import { useGetMyBatchEnrollmentsQuery } from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetMySubmissionsQuery } from "@/app/redux/api/AssignmentApi/AssignmentApi";
import { useGetUserNoticesQuery, INotice } from "@/app/redux/api/noticeApi";

import { useState, useMemo, useEffect } from "react";
import { useResendVerificationEmail } from "@/app/[locale]/@auth/auth.hook";
import EditProfileForm from "@/components/forms/EditProfileForm";
import { toast } from "react-hot-toast";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import { useProfileCompletion } from "@/types/profile.type";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import Image from "next/image";

// --- Option 3: Premium Glassmorphism & Interactive Upgrade ---

const UserProfileContent = () => {
  const { user, refetch } = useUser();
  const { data: attempts } = useGetUserQuizAttemptsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: batchData, isLoading: enrollmentsLoading } =
    useGetMyBatchEnrollmentsQuery(undefined);

  const { data: noticesData, isLoading: noticesLoading } =
    useGetUserNoticesQuery({ page: 1, limit: 5 });

  const attemptsCount = attempts?.length ?? 0;

  const { mutate: resendEmail, isPending: isResending } =
    useResendVerificationEmail();

  const handleResendEmail = () => {
    if (user?.email) {
      resendEmail(user.email);
    }
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // Update immediately
    setCurrentTime(new Date());

    // Update every minute to avoid unnecessary re-renders
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Format Date: Mon, 09 Feb
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(currentTime);

  // Format Time: 03:10 PM
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(currentTime);

  // Use the profile completion hook
  const profileCompletion = useProfileCompletion();

  const handleEditSuccess = () => {
    refetch();
    toast.success("Profile updated successfully!");
  };

  // Calculate course analytics using shared utility
  const courseAnalytics = useMemo(() => {
    const enrollments = batchData?.data || [];
    let totalEnrolled = enrollments.length;
    let inProgress = 0;
    let completed = 0;
    let totalProgress = 0;
    let totalMaterialsViewed = 0;
    let certificatesEarned = 0;

    enrollments.forEach((enrollment: any) => {
      const cp = calculateCourseProgress(enrollment);
      const progress = enrollment.progress || {};

      totalProgress += cp.percentage;
      totalMaterialsViewed += cp.completedLessons;

      const batch =
        typeof enrollment.batchId === "object" ? enrollment.batchId : null;
      const isBatchCompleted = batch?.status === "completed";

      if (progress.certificateIssued) certificatesEarned++;
      // Count as Active if started AND batch is not completed
      if (cp.percentage > 0 && !isBatchCompleted) inProgress++;
      if (cp.percentage >= 100) completed++;
    });

    const averageProgress =
      totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

    return {
      totalEnrolled,
      inProgress,
      completed,
      averageProgress,
      totalMaterialsViewed,
      certificatesEarned,
    };
  }, [batchData]);

  // Get recent enrollments (top 5 with access)
  const recentEnrollments = useMemo(() => {
    const enrollments = batchData?.data || [];
    return enrollments.filter((e: any) => e.hasAccess).slice(0, 5);
  }, [batchData]);

  const recentNotices = noticesData?.data?.notices || [];

  // === NEW: Learning Streak Calculation ===
  const learningStreak = useMemo(() => {
    const enrollments = batchData?.data || [];
    if (enrollments.length === 0) return { days: 0, isActive: false };

    // Get the most recent activity date from all enrollments
    let mostRecentActivityDate: Date | null = null;
    enrollments.forEach((enrollment: any) => {
      const lastActivity = enrollment.progress?.lastActivityDate;
      if (lastActivity) {
        const activityDate = new Date(lastActivity);
        if (!mostRecentActivityDate || activityDate > mostRecentActivityDate) {
          mostRecentActivityDate = activityDate;
        }
      }
    });

    if (!mostRecentActivityDate) return { days: 0, isActive: false };

    const today = new Date();
    const recentDate = mostRecentActivityDate as Date;
    const diffTime = today.getTime() - recentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If last activity was today or yesterday, consider streak active
    const isActive = diffDays <= 1;

    // For demo, we'll show days since account creation or a minimum of 1 day if active
    const streakDays = isActive ? Math.max(1, 7 - diffDays) : 0;

    return { days: streakDays, isActive, lastActivity: mostRecentActivityDate };
  }, [batchData]);

  // === NEW: Continue Learning - Most Recent Active Course ===
  const continueLearning = useMemo(() => {
    const enrollments = batchData?.data || [];
    const activeEnrollments = enrollments.filter(
      (e: any) => e.hasAccess && e.progress?.materialsViewed > 0,
    );

    if (activeEnrollments.length === 0) {
      // If no progress, return first enrollment with access
      const firstWithAccess = enrollments.find((e: any) => e.hasAccess);
      if (firstWithAccess) {
        const course =
          typeof firstWithAccess.courseId === "object"
            ? firstWithAccess.courseId
            : null;
        const batch =
          typeof firstWithAccess.batchId === "object"
            ? firstWithAccess.batchId
            : null;
        const cp = calculateCourseProgress(firstWithAccess);

        return {
          enrollment: firstWithAccess,
          courseName: course?.title || "Course",
          batchName: batch?.batchName || "Batch",
          progress: 0,
          totalLessons: cp.totalItems,
          completedLessons: 0,
          enrollmentId: firstWithAccess._id,
        };
      }
      return null;
    }

    // Sort by last activity and get most recent
    const sorted = [...activeEnrollments].sort((a: any, b: any) => {
      const dateA = new Date(a.progress?.lastActivityDate || 0).getTime();
      const dateB = new Date(b.progress?.lastActivityDate || 0).getTime();
      return dateB - dateA;
    });

    const mostRecent = sorted[0];
    const course =
      typeof mostRecent.courseId === "object" ? mostRecent.courseId : null;
    const batch =
      typeof mostRecent.batchId === "object" ? mostRecent.batchId : null;
    const cp = calculateCourseProgress(mostRecent);

    return {
      enrollment: mostRecent,
      courseName: course?.title || "Course",
      batchName: batch?.batchName || "Batch",
      progress: cp.percentage,
      totalLessons: cp.totalItems,
      completedLessons: cp.completedItems,
      enrollmentId: mostRecent._id,
    };
  }, [batchData]);

  // === NEW: Next Milestone Calculation ===
  const nextMilestone = useMemo(() => {
    if (!continueLearning) return null;

    const { totalLessons, completedLessons, progress } = continueLearning;
    if (totalLessons === 0) return null;

    const remaining = totalLessons - completedLessons;

    // Calculate milestone messages based on progress
    if (progress >= 100) {
      return {
        message: "🎉 Course Completed!",
        type: "completed",
        remaining: 0,
      };
    } else if (progress >= 75) {
      return {
        message: `Almost there! ${remaining} lessons left`,
        type: "almost",
        remaining,
      };
    } else if (progress >= 50) {
      return {
        message: `Halfway done! ${remaining} more to go`,
        type: "halfway",
        remaining,
      };
    } else if (progress > 0) {
      return {
        message: `${remaining} lessons to complete`,
        type: "started",
        remaining,
      };
    } else {
      return {
        message: "Start your first lesson!",
        type: "new",
        remaining: totalLessons,
      };
    }
  }, [continueLearning]);

  // Fetch pending assignments
  const { data: submissionsData } = useGetMySubmissionsQuery({});

  // === NEW: Pending Assignments with Deadlines ===
  const pendingAssignments = useMemo(() => {
    const submissions = submissionsData?.data || [];
    const enrollments = batchData?.data || [];

    // Get assignments that haven't been submitted or are pending grading
    const pending = submissions
      .filter(
        (sub: any) => sub.status === "pending" || sub.status === "returned",
      )
      .slice(0, 3)
      .map((sub: any) => {
        const assignment =
          typeof sub.assignmentId === "object" ? sub.assignmentId : null;
        return {
          id: sub._id,
          title: assignment?.title || "Assignment",
          dueDate: assignment?.dueDate,
          status: sub.status,
        };
      });

    return pending;
  }, [submissionsData, batchData]);

  // Helper: Animated Stats Card with Glassmorphism
  const StatsCard = ({
    icon: Icon,
    label,
    value,
    colorClass,
    gradientRaw,
    delay,
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      transition={{ delay, type: "spring", stiffness: 300 }}
      className="relative overflow-hidden group rounded-2xl p-0.5"
    >
      {/* Gradient Border Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientRaw} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
      ></div>

      {/* Glass Content */}
      <div className="relative h-full bg-white/60 backdrop-blur-xl border border-white/50 p-5 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <Icon size={64} className={colorClass} />
        </div>

        <div className="flex flex-col h-full justify-between relative z-10">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradientRaw} text-white shadow-lg`}
          >
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              {value}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              {label}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Professional Engineering Hero Banner */}
      <div className="relative min-h-[13rem] overflow-hidden bg-slate-900">
        {/* Background Layer: Deep Technical Blue */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0B1120] to-slate-900"></div>

        {/* Technical Grid Pattern (Blueprint Effect) */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Abstract Architectural Lines / Circuit Traces */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>
          <div className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
          <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

          {/* Value Props / Decoration Circles */}
          <div className="absolute top-20 right-20 w-64 h-64 border border-slate-700/30 rounded-full opacity-30 animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute top-20 right-20 w-48 h-48 border border-cyan-700/20 rounded-full opacity-30 animate-[spin_40s_linear_infinite_reverse]"></div>
        </div>

        {/* ========== NEW: Banner Action Cards ========== */}
        <div className="relative z-10 pt-6 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Welcome Back
              </p>
              {/* <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 mb-2">
                {user?.name || "Student"}
                <span className="text-xl">👋</span>
              </h1> */}

              {/* Date & Time Display */}
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar size={14} className="text-cyan-400" />
                  <span className="text-xs font-medium">{formattedDate}</span>
                </div>
                <div className="w-px h-3 bg-slate-600"></div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Clock size={14} className="text-purple-400" />
                  <span className="text-xs font-bold tracking-wide">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Email Verification Warning */}
              {user && !user.emailVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md"
                >
                  <MailWarning size={16} className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-200">
                    Your email is not verified.
                  </span>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? "Sending..." : "Resend Link"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
        {/* ========== END: Banner Action Cards ========== */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Premium Identity Card (Stick/Float) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="sticky top-24"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 overflow-hidden">
                {/* Card Header Gradient */}
                <div className="h-18 bg-gradient-to-r from-black via-black to-black relative">
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>

                <div className="px-6 pb-6 text-center transform -translate-y-12">
                  <div className="relative inline-block">
                    <div className="p-1.5 bg-white rounded-full shadow-lg">
                      {user?.profilePhoto ? (
                        <AppImage
                          photoUrl={user.profilePhoto}
                          alt="Profile"
                          width={120}
                          height={120}
                          className="w-28 h-28 rounded-full object-cover border-2 border-slate-100"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-3xl font-bold border-2 border-slate-100">
                          {(user?.name || "U").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Verified Badge */}
                    {user?.emailVerified && (
                      <div
                        className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full ring-4 ring-white shadow-sm"
                        title="Verified"
                      >
                        <CheckCircle size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {user?.name}
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      {user?.email}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mt-4 mb-6">
                    <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                      Student
                    </Badge>
                    {user?.emailVerified && (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/user-profile/cv" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <FileText size={16} className="mr-2" /> CV
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full rounded-xl bg-slate-900 hover:bg-indigo-600 transition-colors text-white shadow-lg shadow-indigo-500/20"
                    >
                      <Edit size={16} className="mr-2" /> Edit
                    </Button>
                  </div>
                </div>

                {/* Profile Strength Meter */}
                <div className="bg-slate-50/80 p-5 border-t border-slate-100 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Profile Strength
                    </span>
                    <span className="text-xs font-black text-indigo-600">
                      {profileCompletion.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-200/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion.percentage}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={`h-full rounded-full relative overflow-hidden ${
                        profileCompletion.percentage === 100
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          : "bg-gradient-to-r from-indigo-400 to-blue-500"
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Content Dashboard */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* 2. Glassmorphism Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatsCard
                icon={BookOpen}
                label="Enrolled"
                value={courseAnalytics.totalEnrolled}
                colorClass="text-blue-500"
                gradientRaw="from-blue-400 to-indigo-600"
                delay={0.2}
              />
              <StatsCard
                icon={Activity}
                label="Active"
                value={courseAnalytics.inProgress}
                colorClass="text-purple-500"
                gradientRaw="from-purple-400 to-pink-600"
                delay={0.3}
              />
              <StatsCard
                icon={Award}
                label="Completed"
                value={courseAnalytics.completed}
                colorClass="text-emerald-500"
                gradientRaw="from-emerald-400 to-teal-600"
                delay={0.4}
              />
              <StatsCard
                icon={Target}
                label="Avg Progress"
                value={`${courseAnalytics.averageProgress}%`}
                colorClass="text-amber-500"
                gradientRaw="from-amber-400 to-orange-600"
                delay={0.5}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* 3. My Learning List (Card View) */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 tracking-tight">
                        Current Learning
                      </h3>
                    </div>
                    <Link href="/user-profile/my-courses-and-programs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                      >
                        View All <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="p-2">
                    {enrollmentsLoading ? (
                      <div className="space-y-3 p-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-24 bg-slate-50 rounded-2xl animate-pulse"
                          />
                        ))}
                      </div>
                    ) : recentEnrollments.length > 0 ? (
                      <div className="space-y-2">
                        {recentEnrollments.map(
                          (enrollment: any, idx: number) => {
                            const course =
                              typeof enrollment.courseId === "object"
                                ? enrollment.courseId
                                : null;
                            const batch =
                              typeof enrollment.batchId === "object"
                                ? enrollment.batchId
                                : null;
                            const isBatchExpired =
                              batch?.status === "completed";
                            const cp = calculateCourseProgress(enrollment);
                            const percent = cp.percentage;

                            return (
                              <motion.div
                                key={enrollment._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                              >
                                {isBatchExpired ? (
                                  <div className="p-4 rounded-2xl bg-white border border-gray-100 opacity-75 group flex gap-5 items-center cursor-not-allowed relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gray-50/50 z-10" />
                                    {/* Course Thumb */}
                                    <div className="relative w-28 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 grayscale z-0">
                                      {course?.bannerImage ? (
                                        <AppImage
                                          photoUrl={course.bannerImage}
                                          alt=""
                                          className="w-full h-full object-cover"
                                          width={112}
                                          height={80}
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                          <BookOpen size={24} />
                                        </div>
                                      )}
                                      {/* Float Badge */}
                                      <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20">
                                        Expired
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0 z-20">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-500 text-sm md:text-base line-clamp-1 mb-1">
                                          {course?.title || "Untitled Course"}
                                        </h4>
                                      </div>

                                      <p className="text-xs text-red-500 font-bold mb-3 flex items-center gap-1">
                                        <AlertCircle size={12} /> Access Expired
                                      </p>

                                      {/* Custom Progress Bar */}
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                          <div
                                            className="h-full rounded-full bg-gray-400 relative overflow-hidden"
                                            style={{ width: `${percent}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 min-w-[2.5rem] text-right">
                                          {percent}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Link
                                    href={`/user-profile/my-courses-and-programs/${enrollment._id}`}
                                  >
                                    <div className="p-4 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 border border-transparent hover:border-indigo-100 group flex gap-5 items-center">
                                      {/* Course Thumb */}
                                      <div className="relative w-28 h-20 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                                        {course?.bannerImage ? (
                                          <AppImage
                                            photoUrl={course.bannerImage}
                                            alt=""
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            width={112}
                                            height={80}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <BookOpen size={24} />
                                          </div>
                                        )}
                                        {/* Float Badge */}
                                        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                          {enrollment.batchId?.batchName ||
                                            "Batch"}
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                          <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">
                                            {course?.title || "Untitled Course"}
                                          </h4>
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                            <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-full">
                                              <ArrowRight size={14} />
                                            </div>
                                          </div>
                                        </div>

                                        <p className="text-xs text-slate-500 font-medium mb-3">
                                          Last activity recently
                                        </p>

                                        {/* Custom Progress Bar */}
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden"
                                              style={{ width: `${percent}%` }}
                                            >
                                              <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"></div>
                                            </div>
                                          </div>
                                          <span className="text-xs font-black text-slate-700 min-w-[2.5rem] text-right">
                                            {percent}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                )}
                              </motion.div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-inner">
                          <BookOpen size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">
                          Start Learning Today
                        </h4>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                          Explore our catalog and enroll in your first course to
                          see your progress here.
                        </p>
                        <Link href="/all-courses">
                          <Button className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white">
                            Browse Courses
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Quizzes",
                      value: attemptsCount,
                      icon: Zap,
                      color: "text-amber-500",
                      bg: "bg-amber-50",
                    },
                    {
                      label: "Lessons",
                      value: courseAnalytics.totalMaterialsViewed,
                      icon: Layers,
                      color: "text-blue-500",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Certificates",
                      value: courseAnalytics.certificatesEarned,
                      icon: Award,
                      color: "text-purple-500",
                      bg: "bg-purple-50",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-300 group cursor-default"
                    >
                      <div
                        className={`mb-2 p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <stat.icon size={20} />
                      </div>
                      <span className="text-xl font-black text-slate-800 leading-none mb-1">
                        {stat.value}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Timeline Notice Board (Right Col) */}
              <div className="xl:col-span-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-200/40 overflow-hidden h-full flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                        <Bell className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 tracking-tight">
                        Notice
                      </h3>
                    </div>
                    <Link
                      href="/user-profile/my-notice"
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      VIEW ALL
                    </Link>
                  </div>

                  <div className="p-0 flex-1 relative min-h-[300px]">
                    {noticesLoading ? (
                      <div className="space-y-6 p-6">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-20 bg-slate-50 rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    ) : recentNotices.length > 0 ? (
                      <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                        <div className="relative p-6 pt-2">
                          {/* Line */}
                          <div className="absolute left-[2.25rem] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-200 to-transparent"></div>

                          <div className="space-y-6 relative">
                            {recentNotices.slice(0, 5).map((notice, i) => (
                              <div
                                key={notice._id}
                                className="relative pl-10 group"
                              >
                                {/* Timeline Dot */}
                                <div
                                  className={`absolute left-1 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center ${
                                    i === 0
                                      ? "bg-indigo-500"
                                      : "bg-slate-300 group-hover:bg-indigo-400"
                                  } transition-colors duration-300`}
                                >
                                  {i === 0 && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                  )}
                                </div>

                                <div className="bg-white/50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 cursor-pointer">
                                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">
                                    {new Date(
                                      notice.createdAt,
                                    ).toLocaleDateString()}
                                  </span>

                                  <button
                                    onClick={() => {
                                      setSelectedNotice(notice);
                                      setShowDetailModal(true);
                                    }}
                                    className="block text-left w-full"
                                  >
                                    <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1 group-hover:text-indigo-700 transition-colors">
                                      {notice.title}
                                    </h4>
                                  </button>

                                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {notice.description ||
                                      notice.content
                                        .replace(/<[^>]*>?/gm, "")
                                        .substring(0, 80)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Bell size={24} className="opacity-50" />
                        </div>
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs">
                          No recent notifications to show.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileForm
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 z-[100]">
            {/* Modal Header with Image */}
            {selectedNotice.image ? (
              <div className="relative h-48 bg-slate-100">
                <Image
                  src={selectedNotice.image}
                  alt="Notice"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedNotice.title}
                  </h2>
                  {selectedNotice.description && (
                    <p className="text-white/80 text-sm mt-1">
                      {selectedNotice.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <DialogHeader className="p-6 pb-4 border-b border-slate-100">
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {selectedNotice.title}
                </DialogTitle>
                {selectedNotice.description && (
                  <DialogDescription className="text-slate-600 mt-1">
                    {selectedNotice.description}
                  </DialogDescription>
                )}
              </DialogHeader>
            )}

            <div className="p-6 space-y-6">
              {/* Date Badge */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Published on{" "}
                  {new Date(selectedNotice.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>

              {/* Content */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 overflow-hidden">
                <RichTextRenderer
                  htmlString={selectedNotice.content}
                  className="text-slate-700 leading-relaxed text-base"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">
                      Notice Information
                    </p>
                    <p className="text-blue-700 text-sm mt-0.5">
                      This notice was sent to you based on your enrollment
                      status.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default function UserProfilePage() {
  return <UserProfileContent />;
}
