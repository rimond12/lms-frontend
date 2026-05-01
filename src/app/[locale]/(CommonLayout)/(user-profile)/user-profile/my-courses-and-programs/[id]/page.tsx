"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import {
  useGetEnrollmentByIdQuery, // Removed legacy query
  useMarkMaterialViewedMutation, // Removed legacy mutation
} from "@/app/redux/api/enrollmentApi/enrollmentApi";
import {
  useGetBatchEnrollmentByIdQuery,
  useMarkBatchMaterialViewedMutation,
  useMarkBatchQuizCompletedMutation,
  useGetProgressMapQuery,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetStudentBatchModulesQuery } from "@/app/redux/api/batchModuleApi/batchModuleApi";
import CourseContentSidebar from "@/components/enrollments/CourseContentSidebar";
import CourseVideoPlayerWithTabs from "@/components/enrollments/CourseVideoPlayerWithTabs";
import InlineQuizPlayer from "@/components/enrollments/InlineQuizPlayer";
import AssignmentDetailView from "@/components/enrollments/AssignmentDetailView";
import { toast } from "sonner";

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-20 bg-gray-300" />
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="h-12 bg-gray-300 rounded w-1/3" />
      <div className="h-48 bg-gray-300 rounded" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-300 rounded" />
        ))}
      </div>
    </div>
  </div>
);

export default function EnrollmentDetailPage() {
  const [isMobile, setIsMobile] = useState(false);

  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.id as string;

  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(
    null,
  );
  const [viewedMaterials, setViewedMaterials] = useState<Set<string>>(
    new Set(),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Try to fetch from BOTH APIs - one will succeed
  // Legacy API call removed
  // const {
  //   data: oldEnrollmentData,
  //   isLoading: oldEnrollmentLoading,
  //   error: oldEnrollmentError,
  // } = useGetEnrollmentByIdQuery(enrollmentId);

  const {
    data: batchEnrollmentData,
    isLoading: batchEnrollmentLoading,
    error: batchEnrollmentError,
  } = useGetBatchEnrollmentByIdQuery(enrollmentId);

  // const [markMaterialViewed] = useMarkMaterialViewedMutation(); // Removed legacy mutation
  const [markBatchMaterialViewed] = useMarkBatchMaterialViewedMutation();
  const [markBatchQuizCompleted] = useMarkBatchQuizCompletedMutation();

  // Determine which enrollment data to use
  const isBatchEnrollment = !!(
    batchEnrollmentData?.data && !batchEnrollmentError
  );
  // const isOldEnrollment = !!(oldEnrollmentData?.data && !oldEnrollmentError); // Removed

  const isLoading = batchEnrollmentLoading;
  const hasError = !!batchEnrollmentError;

  // Get batchId for fetching batch-specific modules
  const batchId = isBatchEnrollment
    ? typeof batchEnrollmentData?.data?.batchId === "object"
      ? batchEnrollmentData?.data?.batchId?._id
      : batchEnrollmentData?.data?.batchId
    : null;

  // Fetch batch-specific modules if this is a batch enrollment
  const { data: batchModulesData, isLoading: batchModulesLoading } =
    useGetStudentBatchModulesQuery(batchId as string, {
      skip: !batchId || !isBatchEnrollment,
    });

  // Fetch progress map for sequential progression enforcement
  const { data: progressMapData } = useGetProgressMapQuery(enrollmentId, {
    skip: !isBatchEnrollment,
  });
  const progressMap = progressMapData?.data;

  // Build lock map from progress map: itemId -> { isLocked, lockReason, isCompleted }
  const lockMap = useMemo(() => {
    const map = new Map<
      string,
      {
        isLocked: boolean;
        lockReason?: string;
        isCompleted: boolean;
        status?: string;
      }
    >();
    if (!progressMap?.modules) return map;
    for (const mod of progressMap.modules) {
      for (const item of mod.items) {
        map.set(item.itemId, {
          isLocked: item.isLocked,
          lockReason: item.lockReason,
          isCompleted: item.isCompleted,
          status: item.status,
        });
      }
    }
    return map;
  }, [progressMap]);

  const progressionType = progressMap?.progressionType || "sequential";

  // Normalize enrollment data from either source
  let enrollment: any = null;
  let course: any = null;
  let progress: any = null;

  if (isBatchEnrollment) {
    const batchEnrollment = batchEnrollmentData?.data;
    const batch = batchEnrollment?.batchId as any;
    // courseId is populated directly on enrollment, not inside batch
    course =
      typeof batchEnrollment?.courseId === "object"
        ? batchEnrollment.courseId
        : null;
    enrollment = {
      ...batchEnrollment,
      status: batchEnrollment?.hasAccess
        ? "active"
        : batchEnrollment?.enrollmentStatus,
      courseId: course,
    };
    progress = batchEnrollment?.progress;
  }
  // else if (isOldEnrollment) { ... } // Removed legacy block

  const materials = course?.materials || [];

  // Use batch-specific modules if available, otherwise fall back to course modules
  const batchModules = batchModulesData?.data || [];
  const courseModules = course?.modules || [];
  const modules =
    isBatchEnrollment && batchModules.length > 0 ? batchModules : courseModules;

  // Wait for everything to be ready
  const isContentLoading =
    // (oldEnrollmentLoading && batchEnrollmentLoading) ||
    (isBatchEnrollment && batchModulesLoading) || batchEnrollmentLoading;

  // Collect quizzes from both legacy quizIds and module quizIds
  const legacyQuizzes = course?.quizIds || [];
  const moduleQuizzes = modules
    .filter((mod: any) => mod.quizId)
    .map((mod: any) => {
      // quizId might be string or populated object
      const quizId =
        typeof mod.quizId === "string" ? mod.quizId : mod.quizId?._id;
      return {
        _id: quizId,
        title: mod.quizId?.title || `${mod.title} Quiz`,
        moduleTitle: mod.title,
      };
    });

  // Combine all quizzes (avoid duplicates)
  const allQuizIds = new Set([
    ...legacyQuizzes.map((q: any) => (typeof q === "string" ? q : q._id)),
    ...moduleQuizzes.map((q: any) => q._id),
  ]);
  const quizzes = [
    ...legacyQuizzes,
    ...moduleQuizzes.filter(
      (mq: any) =>
        !legacyQuizzes.some(
          (lq: any) => (typeof lq === "string" ? lq : lq._id) === mq._id,
        ),
    ),
  ];

  // Calculate real totals from content to avoid DB mismatches
  const calculatedTotalMaterials = useMemo(() => {
    let count = materials.length;
    modules.forEach((mod: any) => {
      count += mod.lessons?.length || 0;
    });
    return count;
  }, [materials, modules]);

  const materialsViewed =
    progressMap?.overallProgress?.completedLessons ??
    (progress?.materialsViewed || 0);
  // Use calculated total instead of DB total which might be stale
  const totalMaterials =
    progressMap?.overallProgress?.totalLessons ?? calculatedTotalMaterials;

  const quizzesCompleted =
    progressMap?.overallProgress?.completedQuizzes ??
    (progress?.quizzesCompleted || 0);
  // Use actual quiz count
  const totalQuizzes =
    progressMap?.overallProgress?.totalQuizzes ?? quizzes.length;

  const certificateIssued = progress?.certificateIssued || false;

  const materialsPercentage =
    totalMaterials > 0
      ? Math.round((materialsViewed / totalMaterials) * 100)
      : 0;
  const quizzesPercentage =
    totalQuizzes > 0 ? Math.round((quizzesCompleted / totalQuizzes) * 100) : 0;

  // Use progress map percentage when available for accuracy (includes assignments)
  const overallPercentage =
    progressMap?.overallProgress?.percentage ??
    Math.min(
      100,
      Math.round(
        ((materialsViewed + quizzesCompleted) /
          Math.max(totalMaterials + totalQuizzes, 1)) *
          100,
      ),
    );

  // Find active material from both modules and legacy materials
  const activeMaterial = useMemo(() => {
    if (!activeMaterialId) return null;
    // First check modules (new structure) - lessons with contentUrl
    for (const mod of modules) {
      const found = mod.lessons?.find((l: any) => l._id === activeMaterialId);
      if (found) {
        // Map lesson to material format for video player compatibility
        return {
          ...found,
          _id: found._id,
          title: found.title,
          description: found.description,
          type: found.type || "video", // default to video
          fileUrl: found.contentUrl || found.fileUrl, // contentUrl is the video URL
          url: found.contentUrl || found.url,
          duration: found.duration,
        };
      }
    }
    // Fallback to legacy materials
    return materials.find((m: any) => m._id === activeMaterialId) || null;
  }, [activeMaterialId, modules, materials]);

  const completedQuizzes =
    enrollment?.completedQuizzes?.map((q: any) =>
      typeof q === "string" ? q : q._id,
    ) || [];

  // Get a stable reference to viewedMaterials IDs from enrollment
  const enrollmentViewedMaterialsJson = useMemo(() => {
    if (
      !enrollment?.viewedMaterials ||
      !Array.isArray(enrollment.viewedMaterials)
    ) {
      return "[]";
    }
    return JSON.stringify(
      enrollment.viewedMaterials.map((m: any) =>
        typeof m === "string" ? m : m._id || m,
      ),
    );
  }, [enrollment?.viewedMaterials]);

  // Initialize viewedMaterials from enrollment data (only when enrollmentViewedMaterialsJson changes)
  React.useEffect(() => {
    try {
      const viewedIds = JSON.parse(enrollmentViewedMaterialsJson);
      if (Array.isArray(viewedIds) && viewedIds.length > 0) {
        setViewedMaterials(new Set(viewedIds));
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }, [enrollmentViewedMaterialsJson]);

  // Build flat list of all lessons for navigation (modules first, then legacy materials)
  const allLessons = useMemo(() => {
    const lessons: any[] = [];
    // Add lessons from modules
    for (const mod of modules) {
      if (mod.lessons && Array.isArray(mod.lessons)) {
        for (const lesson of mod.lessons) {
          lessons.push({
            ...lesson,
            _id: lesson._id,
            title: lesson.title,
            type: lesson.type || "video",
            fileUrl: lesson.contentUrl || lesson.fileUrl,
            url: lesson.contentUrl || lesson.url,
            moduleTitle: mod.title,
          });
        }
      }
    }
    // Add legacy materials
    for (const mat of materials) {
      lessons.push({
        ...mat,
        moduleTitle: "Materials",
      });
    }
    return lessons;
  }, [modules, materials]);

  // Auto-select first video material if none selected
  React.useEffect(() => {
    // Debug Log removed

    if (
      !activeMaterialId &&
      !activeQuizId &&
      !activeAssignmentId &&
      allLessons.length > 0 &&
      !isContentLoading
    ) {
      /*
      console.log("State Restore: Attempting to restore...", {
        enrollmentId,
        allLessonsCount: allLessons.length,
        isContentLoading,
      });
      */

      // 1. Try to restore from localStorage
      const savedLessonId = localStorage.getItem(
        `lastPlayedLesson_${enrollmentId}`,
      );
      // console.log("State Restore: Saved ID found:", savedLessonId);

      const savedLesson = savedLessonId
        ? allLessons.find((l: any) => l._id === savedLessonId)
        : null;

      if (savedLesson) {
        setActiveMaterialId(savedLesson._id);
        return;
      }

      // 2. Default Logic: First try to find the first unlocked, incomplete lesson
      const firstUnlockedIncomplete = allLessons.find((l: any) => {
        const info = lockMap.get(l._id);
        return !info?.isLocked && !info?.isCompleted;
      });
      if (firstUnlockedIncomplete) {
        setActiveMaterialId(firstUnlockedIncomplete._id);
        return;
      }

      // 3. Fallback: first unlocked video lesson
      const firstVideo = allLessons.find((l: any) => {
        const info = lockMap.get(l._id);
        const isUnlocked = !info?.isLocked;
        return (
          isUnlocked &&
          (l.type === "video" ||
            l.type === "lecture" ||
            l.contentType === "video")
        );
      });
      if (firstVideo) {
        setActiveMaterialId(firstVideo._id);
      } else if (allLessons[0]) {
        // If no video, select first lesson
        setActiveMaterialId(allLessons[0]._id);
      }
    }
  }, [
    activeMaterialId,
    activeQuizId,
    activeAssignmentId,
    allLessons, // Removed .length to ensure it updates when lessons load
    isContentLoading,
    enrollmentId, // Added dependency
  ]);

  // Get current lesson index for navigation
  const currentLessonIndex = useMemo(() => {
    if (!activeMaterialId) return -1;
    return allLessons.findIndex((l: any) => l._id === activeMaterialId);
  }, [activeMaterialId, allLessons]);

  const hasPreviousLesson = currentLessonIndex > 0;
  const hasNextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1;

  const handlePreviousLesson = () => {
    if (hasPreviousLesson) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      const lockInfo = lockMap.get(prevLesson._id);
      if (lockInfo?.isLocked) {
        toast.error("Previous lesson is locked");
        return;
      }
      setActiveMaterialId(prevLesson._id);
      localStorage.setItem(`lastPlayedLesson_${enrollmentId}`, prevLesson._id);
      handleMaterialView(prevLesson._id);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      const lockInfo = lockMap.get(nextLesson._id);
      if (lockInfo?.isLocked) {
        toast.error(
          lockInfo.lockReason || "Complete current content first to proceed",
        );
        return;
      }
      setActiveMaterialId(nextLesson._id);
      localStorage.setItem(`lastPlayedLesson_${enrollmentId}`, nextLesson._id);
      handleMaterialView(nextLesson._id);
    }
  };

  const handleMaterialSelect = (material: any) => {
    // Check lock status from progress map
    const lockInfo = lockMap.get(material._id);
    if (lockInfo?.isLocked) {
      toast.error(lockInfo.lockReason || "Complete previous content first");
      return;
    }
    setActiveMaterialId(material._id);
    localStorage.setItem(`lastPlayedLesson_${enrollmentId}`, material._id);
    setActiveQuizId(null);
    setActiveAssignmentId(null);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection

    // Auto-mark as viewed when lesson is selected (clicked/opened)
    // This ensures progress is tracked even if video player events don't fire
    handleMaterialView(material._id);
  };

  const handleMaterialView = async (materialId: string) => {
    try {
      // Check if material is already viewed to prevent duplicate API calls and toasts
      if (viewedMaterials.has(materialId)) {
        return;
      }

      if (isBatchEnrollment) {
        // Use batch enrollment API
        await markBatchMaterialViewed({
          enrollmentId: enrollment?._id,
          materialId,
        }).unwrap();
      }
      // else { ... } // Removed legacy material view logic
      setViewedMaterials((prev) => new Set([...prev, materialId]));
      toast.success("Material marked as viewed!");
    } catch (error) {
      toast.error("Failed to mark material as viewed");
    }
  };

  const handleQuizSelect = (quizId: string) => {
    // Check lock status from progress map
    const lockInfo = lockMap.get(quizId);
    if (lockInfo?.isLocked) {
      toast.error(lockInfo.lockReason || "Complete previous content first");
      return;
    }
    // Show quiz inline instead of redirecting
    setActiveQuizId(quizId);
    setActiveMaterialId(null); // Clear active material when showing quiz
    setActiveAssignmentId(null);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleAssignmentSelect = (assignmentId: string) => {
    // Check lock status from progress map
    const lockInfo = lockMap.get(assignmentId);
    if (lockInfo?.isLocked) {
      toast.error(lockInfo.lockReason || "Complete previous content first");
      return;
    }
    setActiveAssignmentId(assignmentId);
    setActiveMaterialId(null);
    setActiveQuizId(null);
    setIsSidebarOpen(false);
  };

  const handleQuizClose = () => {
    setActiveQuizId(null);
    // Optionally re-select first material
    if (allLessons.length > 0 && !activeMaterialId) {
      setActiveMaterialId(allLessons[0]._id);
    }
  };

  const handleQuizComplete = async (result: any) => {
    // Mark quiz as completed in the enrollment so progress map updates
    if (activeQuizId && enrollment?._id) {
      try {
        await markBatchQuizCompleted({
          enrollmentId: enrollment._id,
          quizId: activeQuizId,
        }).unwrap();
        toast.success("Quiz completed! Progress updated.");
      } catch (err: any) {
        console.error("Failed to mark quiz completed:", err);
      }
    }
  };

  // Helper to find assignment details
  const activeAssignment = useMemo(() => {
    if (!activeAssignmentId) return null;
    for (const mod of modules) {
      if (mod.assignmentId) {
        // assignmentId is either ID string or object.
        // Logic: if string matches OR if object._id matches
        if (
          typeof mod.assignmentId === "string" &&
          mod.assignmentId === activeAssignmentId
        ) {
          // We might not have details if it's just a string, but backend populates it.
          // If populated, it won't be a string matching ID (it would be object).
          // If it's a string, we can't show details.
          return null;
        } else if (
          typeof mod.assignmentId === "object" &&
          (mod.assignmentId as any)._id === activeAssignmentId
        ) {
          return mod.assignmentId;
        }
      }
    }
    return null;
  }, [activeAssignmentId, modules]);

  // Show loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Get batchId for assignment submission
  // Note: batchId comes from batchEnrollmentData, not the normalized 'enrollment' object
  const currentBatchId = isBatchEnrollment
    ? typeof batchEnrollmentData?.data?.batchId === "object"
      ? batchEnrollmentData?.data?.batchId?._id
      : batchEnrollmentData?.data?.batchId
    : undefined;

  // Assignment View Component - Now uses the enhanced AssignmentDetailView
  const AssignmentView = () => {
    if (!activeAssignmentId || !course?._id) return null;
    return (
      <AssignmentDetailView
        assignmentId={activeAssignmentId}
        courseId={course._id}
        batchId={currentBatchId}
        onClose={() => {
          setActiveAssignmentId(null);
          if (allLessons.length > 0) {
            setActiveMaterialId(allLessons[0]._id);
          }
        }}
      />
    );
  };

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-800 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Course
          </h2>
          <p className="text-gray-600 mb-4">
            An error occurred while loading your enrollment data. Please try
            again.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if enrollment exists
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Enrollment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find this enrollment. It may have been deleted or
            you don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Security check: Only allow access if enrollment is active (or hasAccess for batch enrollments)
  const hasAccess = isBatchEnrollment
    ? enrollment.hasAccess
    : enrollment.status === "active";

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <Lock className="w-12 h-12 text-red-800 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-4">
            {isBatchEnrollment
              ? enrollment.enrollmentStatus === "pending_payment"
                ? "Your payment is pending approval. You will receive access once approved."
                : enrollment.enrollmentStatus === "payment_approved"
                  ? "Your payment has been approved. Access will be granted when the batch starts."
                  : "You do not have access to this course content yet."
              : enrollment.status === "pending_approval"
                ? "Your enrollment is pending admin approval. You will receive access once approved."
                : enrollment.status === "cancelled"
                  ? "Your enrollment has been cancelled. Please contact support for more information."
                  : "You do not have access to this course content."}
          </p>
          <button
            onClick={() => router.push("/user-profile/my-courses-and-programs")}
            className="w-full px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {isMobile ? (
        // Mobile: Sticky Video on top, Scrollable Playlist below
        <div className="h-full flex flex-col overflow-hidden">
          {/* Sticky Video/Quiz Player */}
          <div
            className={`shrink-0 ${!activeQuizId && !activeAssignmentId ? "sticky top-0 z-10" : ""} bg-white shadow-md`}
          >
            {activeQuizId ? (
              <InlineQuizPlayer
                quizId={activeQuizId}
                courseId={course?._id}
                onComplete={handleQuizComplete}
                onClose={handleQuizClose}
              />
            ) : activeAssignmentId ? (
              <AssignmentView />
            ) : (
              <CourseVideoPlayerWithTabs
                activeMaterial={activeMaterial}
                courseTitle={course?.title || "Course"}
                courseDescription={course?.description}
                materials={materials}
                quizzes={quizzes}
                courseId={course?._id || ""}
                hasViewed={
                  activeMaterialId
                    ? viewedMaterials.has(activeMaterialId)
                    : false
                }
                onViewed={() => {
                  if (activeMaterialId) {
                    handleMaterialView(activeMaterialId);
                  }
                }}
                program={course}
                materialsPercentage={materialsPercentage}
                quizzesPercentage={quizzesPercentage}
                overallPercentage={overallPercentage}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                router={router}
                onPreviousLesson={handlePreviousLesson}
                onNextLesson={handleNextLesson}
                hasPreviousLesson={hasPreviousLesson}
                hasNextLesson={hasNextLesson}
                currentLessonIndex={currentLessonIndex}
                totalLessons={allLessons.length}
              />
            )}
          </div>

          {/* Scrollable Playlist - Independent scroll */}
          <div className="flex-1 overflow-y-auto">
            <CourseContentSidebar
              courseTitle={course?.title || "Course"}
              courseDescription={course?.description}
              materials={materials}
              modules={modules}
              quizzes={quizzes}
              viewedMaterials={viewedMaterials}
              completedQuizzes={completedQuizzes}
              activeMaterialId={activeMaterialId}
              onMaterialSelect={handleMaterialSelect}
              onQuizSelect={handleQuizSelect}
              onAssignmentSelect={handleAssignmentSelect}
              courseId={course?._id || ""}
              materialsProgress={materialsPercentage}
              quizzesProgress={quizzesPercentage}
              overallProgress={overallPercentage}
              lockMap={lockMap}
              progressionType={progressionType}
              completedAssignments={enrollment?.completedAssignments || []}
            />
          </div>
        </div>
      ) : (
        // Desktop: Sticky Video on left, Scrollable Sidebar on right
        <div className="h-full flex flex-row overflow-hidden">
          {/* Video/Quiz Player Container - Scrollable */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
            {/* Main Content Area */}
            {activeAssignmentId ? (
              <div className="p-4 lg:p-6 pb-24 min-h-full">
                <AssignmentView />
              </div>
            ) : activeQuizId ? (
              <div className="p-4 lg:p-6 pb-24 min-h-full">
                <InlineQuizPlayer
                  quizId={activeQuizId}
                  courseId={course?._id}
                  onComplete={handleQuizComplete}
                  onClose={handleQuizClose}
                />
              </div>
            ) : (
              <div className="h-full">
                <CourseVideoPlayerWithTabs
                  activeMaterial={activeMaterial}
                  courseTitle={course?.title || "Course"}
                  courseDescription={course?.description}
                  materials={materials}
                  quizzes={quizzes}
                  courseId={course?._id || ""}
                  hasViewed={
                    activeMaterialId
                      ? viewedMaterials.has(activeMaterialId)
                      : false
                  }
                  onViewed={() => {
                    if (activeMaterialId) {
                      handleMaterialView(activeMaterialId);
                    }
                  }}
                  program={course}
                  materialsPercentage={materialsPercentage}
                  quizzesPercentage={quizzesPercentage}
                  overallPercentage={overallPercentage}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  router={router}
                  onPreviousLesson={handlePreviousLesson}
                  onNextLesson={handleNextLesson}
                  hasPreviousLesson={hasPreviousLesson}
                  hasNextLesson={hasNextLesson}
                  currentLessonIndex={currentLessonIndex}
                  totalLessons={allLessons.length}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Independent Scroll */}
          <div className="w-80 shrink-0 h-full overflow-y-auto border-l border-gray-200 bg-slate-50/50">
            <CourseContentSidebar
              courseTitle={course?.title || "Course"}
              courseDescription={course?.description}
              materials={materials}
              modules={modules}
              quizzes={quizzes}
              viewedMaterials={viewedMaterials}
              completedQuizzes={completedQuizzes}
              activeMaterialId={activeMaterialId}
              onMaterialSelect={handleMaterialSelect}
              onQuizSelect={handleQuizSelect}
              onAssignmentSelect={handleAssignmentSelect}
              courseId={course?._id || ""}
              materialsProgress={materialsPercentage}
              quizzesProgress={quizzesPercentage}
              overallProgress={overallPercentage}
              lockMap={lockMap}
              progressionType={progressionType}
              completedAssignments={enrollment?.completedAssignments || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
