/**
 * Shared utility for calculating course progress consistently.
 *
 * This function dynamically computes progress from the actual course structure
 * (modules + lessons + quizzes) rather than relying on stale enrollment fields.
 *
 * FALLBACK: If course.modules don't have populated lessons (e.g. in the enrollment
 * list API), we fall back to the stored enrollment.progress totals which are
 * kept up-to-date by the backend when lessons are marked as viewed.
 *
 * Used by: User Profile page, My Courses page, and any future pages.
 */

export interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalAssignments: number;
  completedAssignments: number;
  totalItems: number;
  completedItems: number;
  /** Overall progress percentage, clamped to 0–100 */
  percentage: number;
}

export function calculateCourseProgress(enrollment: any): CourseProgressResult {
  const course =
    typeof enrollment.courseId === "object" ? enrollment.courseId : null;
  const progress = enrollment.progress || {
    materialsViewed: 0,
    totalMaterials: 0,
    quizzesCompleted: 0,
    totalQuizzes: 0,
    assignmentsCompleted: 0,
    totalAssignments: 0,
  };

  // --- Count total lessons from course structure ---
  // Legacy materials (flat array on course)
  const legacyMaterials = course?.materials || [];
  // Module-based lessons
  const modules = course?.modules || [];

  let totalLessonsFromStructure = legacyMaterials.length;
  modules.forEach((mod: any) => {
    totalLessonsFromStructure += mod.lessons?.length || 0;
  });

  // --- Count total quizzes from course structure ---
  const moduleQuizCount = modules.filter((m: any) => m.quizId).length;
  const legacyQuizCount = (course?.quizIds || []).length;
  const totalQuizzesFromStructure = Math.max(moduleQuizCount, legacyQuizCount);

  // --- Count total assignments from course structure ---
  const totalAssignmentsFromStructure = modules.filter(
    (m: any) => m.assignmentId
  ).length;

  // --- FALLBACK: Use stored enrollment.progress totals when course structure
  //     doesn't have populated lessons (e.g. in the enrollment list API).
  //     The backend keeps these totals up-to-date via markMaterialViewed. ---
  const totalLessons =
    totalLessonsFromStructure > 0
      ? totalLessonsFromStructure
      : progress.totalMaterials || 0;

  const totalQuizzes =
    totalQuizzesFromStructure > 0
      ? totalQuizzesFromStructure
      : progress.totalQuizzes || 0;

  const totalAssignments =
    totalAssignmentsFromStructure > 0
      ? totalAssignmentsFromStructure
      : progress.totalAssignments || 0;

  // --- Completed counts ---
  const completedLessons = Math.min(
    progress.materialsViewed || 0,
    totalLessons
  );
  const completedQuizzes = Math.min(
    progress.quizzesCompleted || 0,
    totalQuizzes
  );
  const completedAssignments = Math.min(
    progress.assignmentsCompleted || 0,
    totalAssignments
  );

  const totalItems = totalLessons + totalQuizzes + totalAssignments;
  const completedItems =
    completedLessons + completedQuizzes + completedAssignments;

  const percentage =
    totalItems > 0
      ? Math.min(100, Math.round((completedItems / totalItems) * 100))
      : 0;

  return {
    totalLessons,
    completedLessons,
    totalQuizzes,
    completedQuizzes,
    totalAssignments,
    completedAssignments,
    totalItems,
    completedItems,
    percentage,
  };
}
