"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Volume2,
  CheckCircle,
  Lock,
  Award,
  BookOpen,
  Circle,
  PlayCircle,
  File,
  Link,
  Clock,
  FolderOpen,
  ClipboardList,
} from "lucide-react";

// Legacy material interface (for backward compatibility)
interface Material {
  _id: string;
  title: string;
  description?: string;
  type: "pdf" | "video" | "doc" | "image" | "link" | "external-link" | "audio";
  fileUrl: string;
  url?: string;
  duration?: string | number;
  videoProvider?: "youtube" | "vdocipher" | "direct";
  vdocipherVideoId?: string;
}

// New lesson interface (for module structure)
interface Lesson {
  _id: string;
  title: string;
  description?: string;
  type: "video" | "pdf" | "document" | "link";
  contentUrl: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
  videoProvider?: "youtube" | "vdocipher" | "direct";
  vdocipherVideoId?: string;
}

// New module interface
interface Module {
  _id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  resources?: any[];
  quizId?: string | any; // Can be string ID or populated object
  assignmentId?: string | any; // Can be string ID or populated object
  order?: number;
}

interface CourseContentSidebarProps {
  courseTitle: string;
  courseDescription?: string;
  materials?: Material[];
  modules?: Module[];
  quizzes: any[];
  viewedMaterials: Set<string>;
  completedQuizzes: string[];
  activeMaterialId?: string | null;
  onMaterialSelect: (material: Material | Lesson) => void;
  onQuizSelect: (quizId: string) => void;
  onAssignmentSelect?: (assignmentId: string) => void;
  courseId: string;
  materialsProgress: number;
  quizzesProgress: number;
  overallProgress: number;
  lockMap?: Map<string, { isLocked: boolean; lockReason?: string; isCompleted: boolean; status?: string }>;
  progressionType?: 'free' | 'sequential';
  completedAssignments?: string[];
}

export default function CourseContentSidebar({
  courseTitle,
  courseDescription,
  materials = [],
  modules = [],
  quizzes,
  viewedMaterials,
  completedQuizzes,
  activeMaterialId,
  onMaterialSelect,
  onQuizSelect,
  onAssignmentSelect,
  courseId,
  overallProgress,
  lockMap,
  progressionType = 'sequential',
  completedAssignments = [],
}: CourseContentSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m._id)), // Expand all by default
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["materials", "quizzes"]),
  );

  // Infinite scroll state
  const ITEMS_PER_PAGE = 10;
  const [visibleModulesCount, setVisibleModulesCount] =
    useState(ITEMS_PER_PAGE);
  const [visibleMaterialsCount, setVisibleMaterialsCount] =
    useState(ITEMS_PER_PAGE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll - load more when reaching bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Load more modules
          setVisibleModulesCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, modules.length),
          );
          // Load more materials
          setVisibleMaterialsCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, materials.length),
          );
        }
      },
      { threshold: 0.1, root: scrollContainerRef.current },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [modules.length, materials.length]);

  // Auto-scroll to active lesson when it changes
  useEffect(() => {
    if (activeMaterialId) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        const activeElement = document.querySelector(
          `[data-lesson-id="${activeMaterialId}"]`,
        );
        if (activeElement && scrollContainerRef.current) {
          activeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeMaterialId]);

  // Determine if using new module structure or legacy materials
  const hasModules = modules && modules.length > 0;

  // Count total lessons across all modules
  const totalLessons = useMemo(() => {
    if (hasModules) {
      return modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    }
    return materials.length;
  }, [modules, materials, hasModules]);

  // Count viewed lessons
  const viewedLessonsCount = viewedMaterials.size;

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getFileIcon = (type: string, isActive: boolean) => {
    const className = `w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`;
    switch (type) {
      case "video":
        return <PlayCircle className={className} />;
      case "audio":
        return <Volume2 className={className} />;
      case "pdf":
      case "doc":
      case "document":
        return <FileText className={className} />;
      case "image":
        return <FileText className={className} />;
      case "link":
      case "external-link":
        return <Link className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  const formatDuration = (duration: number | string | undefined) => {
    if (!duration) return null;
    if (typeof duration === "string") return duration;
    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Render module with lessons (new structure)
  const renderModule = (module: Module, moduleIndex: number) => {
    const isExpanded = expandedModules.has(module._id);
    const moduleLessonsViewed = module.lessons.filter((l) =>
      viewedMaterials.has(l._id),
    ).length;
    const moduleTotalDuration = module.lessons.reduce(
      (acc, l) => acc + (l.duration || 0),
      0,
    );
    
    // Check module completion: all lessons + quiz + graded assignment
    const lessonsComplete = moduleLessonsViewed === module.lessons.length;
    const quizIdStr = module.quizId
      ? (typeof module.quizId === "string" ? module.quizId : (module.quizId as any)?._id)
      : null;
    const quizComplete = quizIdStr ? completedQuizzes.includes(quizIdStr) : true;
    const assignIdStr = module.assignmentId
      ? (typeof module.assignmentId === "string" ? module.assignmentId : (module.assignmentId as any)?._id)
      : null;
    const assignComplete = assignIdStr ? completedAssignments.includes(assignIdStr) : true;
    const isCompleted = lessonsComplete && quizComplete && assignComplete;

    // Count total items in module (lessons + quiz? + assignment?)
    const totalModuleItems = module.lessons.length + (quizIdStr ? 1 : 0) + (assignIdStr ? 1 : 0);
    const completedModuleItems = moduleLessonsViewed + (quizComplete && quizIdStr ? 1 : 0) + (assignComplete && assignIdStr ? 1 : 0);

    // Check if this module is locked (sequential progression)
    const isModuleLocked = progressionType === 'sequential' && lockMap && module.lessons.length > 0
      ? (lockMap.get(module.lessons[0]._id)?.isLocked ?? false)
      : false;

    return (
      <div key={module._id} className=" p-1 mx-2 ">
        {/* Module Header - Cleaner & More Compact */}
        <button
          onClick={() => toggleModule(module._id)}
          className="w-full flex items-center justify-between px-2 py-1.5 bg-linear-to-r  bg-gray-950 to-gray-700 hover:from-gray-700 hover:to-gray-600 transition-all group rounded-md shadow-sm mx-1.5"
        >
          <div className="flex items-start gap-1.5 flex-1">
            <div className="mt-0.5">
              <div
                className={`p-0.5 rounded ${
                  isCompleted ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <FolderOpen className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                  Module {moduleIndex + 1}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-white leading-tight mb-0.5 line-clamp-2">
                {module.title}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[9px] font-medium px-1.5 rounded-full ${
                    isCompleted
                      ? "bg-green-500/20 text-green-300 border border-green-500/40"
                      : "bg-gray-600 text-gray-300 border border-gray-500"
                  }`}
                >
                  {completedModuleItems}/{totalModuleItems} done
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 pl-1">
            {isModuleLocked ? (
              <Lock className="w-3 h-3 text-gray-400" />
            ) : isCompleted ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : null}
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-white" />
            ) : (
              <ChevronDown className="w-3 h-3 text-white" />
            )}
          </div>
        </button>

        {/* Lessons List - Clearly Indented */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-1.5"
            >
              {/* Visual Separator */}
              <div className="mx-3 mb-1.5   border-gray-300">
                <div className="text-[11px] font-medium text-gray-600 mb-1 pl-1.5">
                  📚 Lessons ({module.lessons.length})
                </div>
              </div>

              <div className="px-3  py-1.5 space-y-1.5  border-gray-200 ml-3">
                {/* Indented lessons */}
                {module.lessons.map((lesson, lessonIndex) => {
                  const isActive = activeMaterialId === lesson._id;
                  const isViewed = viewedMaterials.has(lesson._id);
                  const lessonLockInfo = lockMap?.get(lesson._id);
                  const isLessonLocked = lessonLockInfo?.isLocked ?? false;

                  return (
                    <button
                      key={lesson._id}
                      data-lesson-id={lesson._id}
                      onClick={() => onMaterialSelect(lesson as any)}
                      className={`w-full text-left p-1.5 rounded-md transition-all duration-200 group flex items-start gap-2 border ${
                        isLessonLocked
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                          : isActive
                            ? "bg-blue-600 text-white shadow-sm border-blue-600"
                            : "bg-white hover:bg-blue-50 text-gray-700 hover:shadow-sm border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isLessonLocked ? (
                          <div className="p-2 bg-gray-200 rounded-full">
                            <Lock className="w-3 h-3 text-gray-400" />
                          </div>
                        ) : isViewed && !isActive ? (
                          <div className="p-2 bg-green-50 rounded-full">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                        ) : (
                          <div
                            className={`p-2 rounded-full ${
                              isActive ? "bg-white/20" : "bg-gray-100"
                            }`}
                          >
                            <div
                              className={`w-3 h-3 ${
                                isActive ? "text-white" : "text-gray-500"
                              }`}
                            >
                              {lesson.type === "video" && (
                                <PlayCircle className="w-3 h-3" />
                              )}
                              {lesson.type === "pdf" && (
                                <FileText className="w-3 h-3" />
                              )}
                              {lesson.type === "document" && (
                                <FileText className="w-3 h-3" />
                              )}
                              {lesson.type === "link" && (
                                <Link className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 p-1">
                        <p
                          className={`text-[11px]  font-bold p-1 leading-tight mb-0.5 line-clamp-2 ${
                            isLessonLocked ? "text-gray-400" : isActive ? "text-white" : "text-gray-900"
                          }`}
                        >
                          <span
                            className={`${
                              isLessonLocked ? "text-gray-400" : isActive ? "text-blue-100" : "text-gray-500"
                            } font-normal mr-1`}
                          >
                            {lessonIndex + 1}.
                          </span>
                          {lesson.title}
                        </p>
                        {isLessonLocked && lessonLockInfo?.lockReason && (
                          <p className="text-[9px] text-gray-400 mt-0.5 pl-1">
                            🔒 {lessonLockInfo.lockReason}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Module Quiz - Show at end of lessons */}
                {module.quizId && (() => {
                  const quizIdStr = typeof module.quizId === "string" ? module.quizId : (module.quizId as any)?._id;
                  const quizLockInfo = quizIdStr ? lockMap?.get(quizIdStr) : undefined;
                  const isQuizLocked = quizLockInfo?.isLocked ?? false;

                  return (
                    <button
                      onClick={() => {
                        if (quizIdStr) {
                          onQuizSelect(quizIdStr);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 group flex items-start gap-3 border-2 shadow-sm ${
                        isQuizLocked
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                          : "bg-linear-to-r from-amber-100 to-amber-50 hover:from-amber-200 hover:to-amber-100 border-amber-300"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`p-1.5 rounded-lg ${isQuizLocked ? "bg-gray-400" : "bg-amber-400"}`}>
                          {isQuizLocked ? <Lock className="w-4 h-4 text-white" /> : <Award className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-snug mb-1 ${isQuizLocked ? "text-gray-500" : "text-amber-900"}`}>
                          {isQuizLocked ? "🔒 Module Quiz" : "🏆 Module Quiz"}
                        </p>
                        <p className={`text-xs font-medium ${isQuizLocked ? "text-gray-400" : "text-amber-800"}`}>
                          {isQuizLocked ? (
                            quizLockInfo?.lockReason || "Complete previous items to unlock"
                          ) : completedQuizzes.includes(quizIdStr || "") ? (
                            <span className="flex items-center gap-1 text-green-700">
                              <CheckCircle className="w-3.5 h-3.5" /> Completed ✓
                            </span>
                          ) : (
                            "Test your knowledge"
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })()}

                {/* Module Assignment - Show at end of lessons */}
                {module.assignmentId && (() => {
                  const assignmentIdStr = typeof module.assignmentId === "string" ? module.assignmentId : (module.assignmentId as any)?._id;
                  const assignmentLockInfo = assignmentIdStr ? lockMap?.get(assignmentIdStr) : undefined;
                  const isAssignmentLocked = assignmentLockInfo?.isLocked ?? false;
                  const isAssignmentCompleted = assignmentIdStr ? completedAssignments.includes(assignmentIdStr) : false;

                  return (
                    <button
                      onClick={() => {
                        if (assignmentIdStr && onAssignmentSelect) {
                          onAssignmentSelect(assignmentIdStr);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 group flex items-start gap-3 border-2 shadow-sm mt-2 ${
                        isAssignmentLocked
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                          : isAssignmentCompleted
                            ? "bg-linear-to-r from-green-100 to-green-50 border-green-300"
                            : "bg-linear-to-r from-indigo-100 to-indigo-50 hover:from-indigo-200 hover:to-indigo-100 border-indigo-300"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`p-1.5 rounded-lg ${
                          isAssignmentLocked ? "bg-gray-400" : isAssignmentCompleted ? "bg-green-500" : "bg-indigo-500"
                        }`}>
                          {isAssignmentLocked ? (
                            <Lock className="w-4 h-4 text-white" />
                          ) : isAssignmentCompleted ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <ClipboardList className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-snug mb-1 ${
                          isAssignmentLocked ? "text-gray-500" : isAssignmentCompleted ? "text-green-900" : "text-indigo-900"
                        }`}>
                          {isAssignmentLocked ? "🔒 Assignment" : isAssignmentCompleted ? "✅ Assignment" : "📝 Assignment"}
                        </p>
                        <p className={`text-xs font-medium ${
                          isAssignmentLocked ? "text-gray-400" : isAssignmentCompleted ? "text-green-700" : "text-indigo-800"
                        }`}>
                          {isAssignmentLocked ? (
                            assignmentLockInfo?.lockReason || "Complete previous items to unlock"
                          ) : isAssignmentCompleted ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Graded ✓
                            </span>
                          ) : (
                            typeof module.assignmentId === "object"
                              ? (module.assignmentId as any).title
                              : "Complete Assignment"
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render legacy materials (flat list) with infinite scroll
  const renderLegacyMaterials = () => (
    <div className="px-2 pb-2 space-y-1">
      {materials.slice(0, visibleMaterialsCount).map((material, index) => {
        const isActive = activeMaterialId === material._id;
        const isViewed = viewedMaterials.has(material._id);

        return (
          <button
            key={material._id}
            data-lesson-id={material._id}
            onClick={() => onMaterialSelect(material)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group flex items-start gap-3 ${
              isActive
                ? "bg-emerald-600 text-white shadow-lg scale-[1.02]"
                : "hover:bg-white text-gray-600 hover:shadow-md hover:scale-[1.01]"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isViewed && !isActive ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                getFileIcon(material.type, isActive)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium leading-snug mb-1 ${
                  isActive ? "text-white" : "text-gray-900"
                }`}
              >
                {index + 1}. {material.title}
              </p>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs capitalize ${
                    isActive ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {material.type}
                </span>
                {material.duration && (
                  <>
                    <span
                      className={`text-[10px] ${
                        isActive ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      •
                    </span>
                    <span
                      className={`text-xs ${
                        isActive ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      {formatDuration(material.duration)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Sticky Course Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-200 bg-white">
        {/* Overall Progress - Compact Single Line */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-blue-600 min-w-[3ch]">
            {overallProgress}%
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 whitespace-nowrap">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>
              {viewedLessonsCount}/{totalLessons}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Content with Smooth Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Content Section */}
        <div className="py-2">
          <button
            onClick={() => toggleSection("materials")}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white transition-colors group border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="font-semibold text-xs text-gray-900">
                Course Content
              </span>
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                {hasModules ? `${modules.length}` : `${materials.length}`}
              </span>
            </div>
            {expandedSections.has("materials") ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.has("materials") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {hasModules
                  ? modules
                      .slice(0, visibleModulesCount)
                      .map((module, idx) => renderModule(module, idx))
                  : renderLegacyMaterials()}

                {/* Load More Trigger for Infinite Scroll */}
                {((hasModules && visibleModulesCount < modules.length) ||
                  (!hasModules &&
                    visibleMaterialsCount < materials.length)) && (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-xs text-gray-400">
                      Scroll for more...
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Invisible trigger for infinite scroll */}
        <div ref={loadMoreRef} className="h-1" />
      </div>
    </div>
  );
}
