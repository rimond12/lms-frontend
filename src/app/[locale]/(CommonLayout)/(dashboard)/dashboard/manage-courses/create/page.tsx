"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Shield,
  Award,
  AlertCircle,
  FolderOpen,
  Monitor,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Import reusable components
import { BasicInfoStep } from "@/components/admin/ProgramWizard/BasicInfoStep";
import { CurriculumStep } from "@/components/admin/ProgramWizard/CurriculumStep";
import { ExpertsStep } from "@/components/admin/ProgramWizard/ExpertsStep";
import { ProjectsStep } from "@/components/admin/ProgramWizard/ProjectsStep";
import { ModulesStep } from "@/components/admin/ProgramWizard/ModulesStep";
import { LearningSoftwareStep } from "@/components/admin/ProgramWizard/LearningSoftwareStep";
import { QuizzesStep } from "@/components/admin/ProgramWizard/QuizzesStep";
import { FAQStep } from "@/components/admin/ProgramWizard/FAQStep";
import { CertificateStep } from "@/components/admin/ProgramWizard/CertificateStep";
import { ReviewStep } from "@/components/admin/ProgramWizard/ReviewStep";
import { StepProgress } from "@/components/admin/ProgramWizard/StepProgress";
import { CompletionChecklist } from "@/components/admin/ProgramWizard/CompletionChecklist";
import StepInstructions from "@/components/admin/StepInstructions";

// Import API hooks for connecting to backend
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useAddMaterialMutation,
  useAddExpertMutation,
  useAddProjectMutation,
  useAddQuizMutation,
  useAddCurriculumMutation,
} from "@/app/redux/api/CourseApi/CourseApi";
import { useCreateQuizMutation } from "@/app/redux/api/QuizApi/quizApi";
import { useCreateAssignmentMutation } from "@/app/redux/api/AssignmentApi/AssignmentApi";

// Import data transformers
import {
  transformProgramData,
  transformCurriculumData,
  transformExpertData,
  transformMaterialData,
  transformQuizData,
  validateRequired,
  isEmpty,
} from "@/components/admin/ProgramWizard/helpers/dataTransformers";

// Import extracted types
import type {
  ProgramData,
  LearningSoftware,
  Curriculum,
  Expert,
  Project,
  Quiz,
  CertificatePreview,
} from "@/types/course-wizard.types";

// ============================================
// STEP CONFIGURATION
// ============================================

const STEPS = [
  { id: 1, label: "Basic Info", icon: FileText, color: "blue" },
  { id: 2, label: "Curriculum", icon: BookOpen, color: "purple" },
  { id: 3, label: "Experts", icon: Users, color: "green" },
  { id: 4, label: "Projects", icon: FolderOpen, color: "blue" },
  { id: 5, label: "Modules", icon: BookOpen, color: "orange" },
  { id: 6, label: "Learning Software", icon: Monitor, color: "purple" },
  { id: 7, label: "FAQ", icon: HelpCircle, color: "amber" },
  { id: 8, label: "Certificate", icon: Award, color: "yellow" },
  { id: 9, label: "Review", icon: Eye, color: "cyan" },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function CreateProgramWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string[]>
  >({});

  // API Mutations
  const [createProgram] = useCreateCourseMutation();
  const [updateProgram] = useUpdateCourseMutation();
  const [addMaterial] = useAddMaterialMutation();
  const [addExpert] = useAddExpertMutation();
  const [addProject] = useAddProjectMutation();
  const [addQuiz] = useAddQuizMutation();
  const [addCurriculum] = useAddCurriculumMutation();
  const [createQuiz] = useCreateQuizMutation();
  const [createAssignment] = useCreateAssignmentMutation();

  // Form State
  const [programData, setProgramData] = useState<ProgramData>({
    title: "",
    slug: "",
    type: "course",
    courseType: "online",
    description: "",
    shortDescription: "",
    level: "beginner",
    duration: "",
    tags: [],
    categories: [],
    primaryCategory: "",
    overviewVideoUrl: "",
    highlights: [],
  });

  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [learningSoftware, setLearningSoftware] = useState<LearningSoftware[]>(
    [],
  );
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [certificatePreview, setCertificatePreview] = useState<any>({
    title: "Certificate of Completion",
    description: "",
    photoUrl: "",
  });

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Basic Info
        if (!programData.title || programData.title.trim().length === 0) {
          errors.push(" title is required");
        }
        if (
          !programData.description ||
          programData.description.trim().length === 0
        ) {
          errors.push("Program description is required");
        }
        if (
          !programData.shortDescription ||
          programData.shortDescription.trim().length === 0
        ) {
          errors.push("Short description is required");
        }
        if (programData.title.length > 100) {
          errors.push("Title must be 100 characters or less");
        }
        break;

      case 2: // Curriculum (OPTIONAL - Topics are optional)
        // Curriculum is optional - validate only title if modules are added
        curriculum.forEach((module, idx) => {
          if (!module.moduleTitle || module.moduleTitle.trim().length === 0) {
            errors.push(`Module ${idx + 1}: Title is required`);
          }
        });
        break;

      case 3: // Experts
        if (experts.length === 0) {
          errors.push("At least one expert is required");
        }
        experts.forEach((expert, idx) => {
          if (!expert.name || expert.name.trim().length === 0) {
            errors.push(`Expert ${idx + 1}: Name is required`);
          }
          if (!expert.designation || expert.designation.trim().length === 0) {
            errors.push(`Expert ${idx + 1}: Designation is required`);
          }
          if (!expert.bio || expert.bio.trim().length === 0) {
            errors.push(`Expert ${idx + 1}: Bio is required`);
          }
        });
        break;

      case 4: // Projects (optional - no validation required)
        break;

      case 5: // Modules
        if (modules.length === 0) {
          errors.push("At least one module is required");
        }
        modules.forEach((module: any, idx: number) => {
          if (!module.title || module.title.trim().length === 0) {
            errors.push(`Module ${idx + 1}: Title is required`);
          }
          if (module.lessons.length === 0) {
            errors.push(`Module ${idx + 1}: At least one lesson is required`);
          }
          module.lessons.forEach((lesson: any, lessonIdx: number) => {
            if (!lesson.title || lesson.title.trim().length === 0) {
              errors.push(
                `Module ${idx + 1}, Lesson ${lessonIdx + 1}: Title is required`,
              );
            }
            if (!lesson.contentUrl || lesson.contentUrl.trim().length === 0) {
              errors.push(
                `Module ${idx + 1}, Lesson ${
                  lessonIdx + 1
                }: Content URL is required`,
              );
            }
          });
        });
        break;

      case 6: // Learning Software (optional - no validation required)
        break;

      case 7: // FAQ
        // Optional - no validation required or add checks if needed
        break;

      case 8: // Certificate
        // Optional
        break;

      default:
        break;
    }

    if (errors.length > 0) {
      setValidationErrors({
        ...validationErrors,
        [step]: errors,
      });
      return false;
    }

    // Clear errors if validation passed
    const newErrors = { ...validationErrors };
    delete newErrors[step];
    setValidationErrors(newErrors);
    return true;
  };

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith("/");
    }
  };

  // ============================================
  // NAVIGATION HANDLERS (for step 7 which doesn't need saving)
  // ============================================

  const handleNextStep = () => {
    // Just move to next step without saving (for Access Control, Certificates, Review steps)
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ============================================
  // STATE FOR STORING PROGRAM ID (after creation)
  // ============================================

  const [courseId, setcourseId] = useState<string | null>(null);

  // ============================================
  // STEP-BY-STEP SAVE HANDLERS
  // ============================================

  const handleSaveBasicInfo = async () => {
    if (!validateStep(1)) {
      toast.error("Please fix errors in Basic Info step");
      return;
    }

    try {
      setIsLoading(true);

      const transformedProgram = transformProgramData(programData);

      const createPayload = {
        ...transformedProgram,
        curriculum: [],
        materials: [],
        experts: [],
        tags: programData.tags,
      };

      const createdProgram = await createProgram(createPayload).unwrap();

      const newcourseId = (createdProgram as any)._id;
      setcourseId(newcourseId);

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(1);
      setCompletedSteps(newCompleted);

      toast.success("✓ Basic info saved successfully!");

      // Auto-advance to next step
      setTimeout(() => setCurrentStep(2), 500);
    } catch (error: any) {
      console.error("Error saving basic info:", error);
      toast.error(error?.data?.message || "Failed to save basic info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurriculum = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    if (!validateStep(2)) {
      toast.error("Please fix errors in Curriculum step");
      return;
    }

    try {
      setIsLoading(true);

      // If curriculum is empty, just mark as complete and advance
      if (!curriculum || curriculum.length === 0) {
        const newCompleted = new Set(completedSteps);
        newCompleted.add(2);
        setCompletedSteps(newCompleted);
        toast.success("✓ Curriculum step complete - moving to experts");
        setTimeout(() => setCurrentStep(3), 500);
        return;
      }

      // Transform curriculum data
      const transformedCurriculum = transformCurriculumData(curriculum);

      // Save each curriculum module
      let savedCount = 0;
      for (
        let moduleIdx = 0;
        moduleIdx < transformedCurriculum.length;
        moduleIdx++
      ) {
        const module = transformedCurriculum[moduleIdx];
        try {
          const response = await addCurriculum({
            courseId,
            curriculum: module,
          }).unwrap();

          savedCount++;
        } catch (err: any) {
          console.error(`❌ Error saving Module ${moduleIdx + 1}:`, err);
          console.error(`Error message: ${err?.message}`);
          console.error(`Error status: ${err?.status}`);
          console.error(`Error data:`, err?.data);
          toast.error(
            `Module ${moduleIdx + 1} error: ${
              err?.data?.message || err?.message || "Unknown error"
            }`,
          );
        }
      }

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(2);
      setCompletedSteps(newCompleted);

      if (savedCount > 0) {
        toast.success(
          `✓ ${savedCount}/${transformedCurriculum.length} curriculum modules saved!`,
        );
        setTimeout(() => setCurrentStep(3), 500);
      } else {
        toast.error(
          "Failed to save any curriculum modules. Check console for details.",
        );
      }
    } catch (error: any) {
      console.error("❌ Error in handleSaveCurriculum:", error);
      toast.error(
        error?.data?.message || error?.message || "Error in curriculum step",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExperts = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    if (!validateStep(3)) {
      toast.error("Please fix errors in Experts step");
      return;
    }

    try {
      setIsLoading(true);

      // DEBUG: Log what we're sending

      const transformedExperts = transformExpertData(experts);

      // Save each expert
      let savedCount = 0;
      for (const expert of transformedExperts) {
        try {
          const response = await addExpert({
            courseId,
            expert,
          }).unwrap();

          savedCount++;
        } catch (err: any) {
          console.error("❌ Error adding expert:", err);
          console.error("Error status:", err?.status);
          console.error("Error data:", err?.data);
          console.error("Error message:", err?.data?.message);
          if (err?.data?.errorSources) {
            console.error("Validation errors:", err.data.errorSources);
          }
        }
      }

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(3);
      setCompletedSteps(newCompleted);

      if (savedCount === 0) {
        toast.error("No experts saved. Check console for errors.");
        console.error("❌ savedCount is 0 - experts not saved");
        return;
      }

      toast.success(
        `✓ ${savedCount}/${transformedExperts.length} experts saved!`,
      );

      // Auto-advance to next step
      setTimeout(() => setCurrentStep(4), 500);
    } catch (error: any) {
      console.error("Error saving experts:", error);
      toast.error(error?.data?.message || "Failed to save experts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProjects = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    try {
      setIsLoading(true);

      // DEBUG: Log what we're sending

      // Filter out empty projects (projects with no title, description, or image)
      const validProjects = projects.filter(
        (project) =>
          project.title?.trim() || project.description?.trim() || project.image,
      );

      if (validProjects.length === 0) {
        // Mark step as completed and move to next step
        const newCompleted = new Set(completedSteps);
        newCompleted.add(4);
        setCompletedSteps(newCompleted);
        setTimeout(() => setCurrentStep(5), 500);
        return;
      }

      // Save each project
      let savedCount = 0;
      for (const project of validProjects) {
        try {
          const response = await addProject({
            courseId,
            project,
          }).unwrap();

          savedCount++;
        } catch (err: any) {
          console.error("❌ Error adding project:", err);
          console.error("Error status:", err?.status);
          console.error("Error data:", err?.data);
          console.error("Error message:", err?.data?.message);
          if (err?.data?.errorSources) {
            console.error("Validation errors:", err.data.errorSources);
          }
        }
      }

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(4);
      setCompletedSteps(newCompleted);

      if (savedCount === 0) {
        toast.error("No projects saved. Check console for errors.");
        console.error("❌ savedCount is 0 - projects not saved");
        return;
      }

      toast.success(`✓ ${savedCount}/${validProjects.length} projects saved!`);

      // Auto-advance to next step
      setTimeout(() => setCurrentStep(5), 500);
    } catch (error: any) {
      console.error("Error saving projects:", error);
      toast.error(error?.data?.message || "Failed to save projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModules = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    if (!validateStep(5)) {
      toast.error("Please fix errors in Modules step");
      return;
    }

    try {
      setIsLoading(true);

      // If no modules, just mark as complete
      if (modules.length === 0) {
        const newCompleted = new Set(completedSteps);
        newCompleted.add(5);
        setCompletedSteps(newCompleted);
        toast.success("✓ Modules step complete");
        setTimeout(() => setCurrentStep(6), 500);
        return;
      }

      // Process modules to create quizzes AND assignments first
      const processedModules = [];
      let quizzesCreated = 0;
      let assignmentsCreated = 0;

      for (const module of modules) {
        const processedModule = { ...module };

        // ==================== QUIZ CREATION ====================
        // If module has quiz data (embedded quiz object), create quiz first
        if (
          module.quiz &&
          module.quiz.title &&
          module.quiz.questions?.length > 0
        ) {
          try {
            // Transform quiz questions to match backend format
            const transformedQuestions = module.quiz.questions.map((q: any) => {
              const validOptions = q.options
                .filter((opt: any) => opt.text && opt.text.trim())
                .map((opt: any, idx: number) => ({
                  id: `option_${idx + 1}`,
                  text: opt.text.trim(),
                  isCorrect: opt.isCorrect || false,
                }));

              const correctOption = validOptions.find((o: any) => o.isCorrect);
              const correctAnswerId =
                correctOption?.id || validOptions[0]?.id || "option_1";

              return {
                questionText: q.questionText?.trim() || q.text?.trim() || "",
                marks: q.marks || 1,
                options: validOptions.map(({ id, text }: any) => ({
                  id,
                  text,
                })),
                correctAnswerId,
                feedback: q.feedback || "",
              };
            });

            // Create quiz payload
            const quizPayload = {
              title: module.quiz.title.trim(),
              description: module.quiz.description?.trim() || "",
              courseId: courseId,
              moduleId: module._id,
              quizType: "module" as const,
              questions: transformedQuestions,
              passingScore: module.quiz.passingScore || 60,
              attemptsAllowed: module.quiz.attemptsAllowed || 3,
              negativeMarkingEnabled:
                module.quiz.negativeMarkingEnabled || false,
              negativeMarkingPercentage:
                module.quiz.negativeMarkingPercentage || 0,
              canUserViewAnswers: module.quiz.canUserViewAnswers !== false,
            };

            const quizResponse = await createQuiz(quizPayload).unwrap();

            // Extract quiz ID from response
            const quizAny = quizResponse as any;
            const quizId =
              quizAny?.quiz?._id || quizAny?.data?.quiz?._id || quizAny?._id;

            if (quizId) {
              processedModule.quizId = quizId;
              quizzesCreated++;
            } else {
              console.warn("⚠️ Quiz created but no ID returned");
            }
          } catch (quizError: any) {
            console.error(
              `❌ Error creating quiz for module ${module.title}:`,
              quizError,
            );
            toast.error(`Quiz creation failed for module "${module.title}"`);
          }
        }

        // ==================== ASSIGNMENT CREATION ====================
        // If module has assignment data, create assignment first
        if (module.assignment && module.assignment.title) {
          try {
            // Validate required fields explicitly
            if (
              module.assignment.totalPoints < module.assignment.passingPoints
            ) {
              toast.error(
                `Assignment "${module.assignment.title}": Passing points cannot exceed Total points`,
              );
              throw new Error(
                "Validation Error: Passing points > Total points",
              );
            }

            // Create assignment payload
            const assignmentPayload = {
              courseId: courseId, // Required
              moduleId: module._id, // Link to this module
              title: module.assignment.title.trim(),
              description: module.assignment.description?.trim() || "",
              instructions:
                module.assignment.instructions?.trim() ||
                "Complete the assignment.",

              // Submission Settings
              submissionTypes:
                module.assignment.submissionTypes &&
                module.assignment.submissionTypes.length > 0
                  ? module.assignment.submissionTypes
                  : ["file-upload"],
              allowedFileTypes: module.assignment.allowedFileTypes || [],
              maxFileSize: module.assignment.maxFileSize || 50,
              maxFilesCount: module.assignment.maxFilesCount || 3,

              // Timing
              startDate: module.assignment.startDate || null,
              dueDate: module.assignment.dueDate || null,
              lateDueDate: module.assignment.lateDueDate || null,

              // Grading
              totalPoints: module.assignment.totalPoints || 100,
              passingPoints: module.assignment.passingPoints || 60,
              lateSubmissionPenalty:
                module.assignment.lateSubmissionPenalty || 0,
              allowResubmission: module.assignment.allowResubmission || false,
              maxAttempts: module.assignment.maxAttempts || 1,

              // Rubric
              rubric:
                module.assignment.rubric?.map((r: any) => ({
                  criteria: r.criteria,
                  maxPoints: r.maxPoints,
                  description: r.description || "",
                })) || [],

              isPublished: module.assignment.isPublished || false,
            };

            // Cast to any to bypass strict type checking if frontend interface mismatches slightly
            const assignmentResponse = await createAssignment(
              assignmentPayload as any,
            ).unwrap();

            // Extract assignment ID
            const assignAny = assignmentResponse as any;
            const assignmentId =
              assignAny?.assignment?._id ||
              assignAny?.data?._id ||
              assignAny?._id;

            if (assignmentId) {
              processedModule.assignmentId = assignmentId;
              assignmentsCreated++;
            } else {
              console.warn(
                "⚠️ Assignment created but no ID returned",
                assignAny,
              );
            }
          } catch (assignError: any) {
            console.error(
              `❌ Error creating assignment for module ${module.title}:`,
              assignError,
            );
            console.error(
              "Error Details:",
              assignError?.data || assignError?.message,
            );
            toast.error(
              `Assignment creation failed: ${assignError?.data?.message || assignError?.message || "Unknown error"}`,
            );
          }
        }

        // Remove embedded objects before saving (backend only wants IDs)
        delete processedModule.quiz;
        delete processedModule.assignment;

        processedModules.push(processedModule);
      }

      // Update course with processed modules

      await updateProgram({
        id: courseId,
        modules: processedModules,
      }).unwrap();

      const newCompleted = new Set(completedSteps);
      newCompleted.add(5);
      setCompletedSteps(newCompleted);

      // Create success message
      const msgs = [`${modules.length} modules saved`];
      if (quizzesCreated > 0) msgs.push(`${quizzesCreated} quizzes created`);
      if (assignmentsCreated > 0)
        msgs.push(`${assignmentsCreated} assignments created`);

      toast.success(`✓ ${msgs.join(", ")}!`);

      setTimeout(() => setCurrentStep(6), 500);
    } catch (error: any) {
      console.error("Error saving modules:", error);
      toast.error(error?.data?.message || "Failed to save modules");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLearningSoftware = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    try {
      setIsLoading(true);

      // Filter out empty software entries
      const validSoftware = learningSoftware.filter(
        (sw) => sw.title && sw.title.trim().length > 0,
      );

      // Update the program with learning software data
      await updateProgram({
        id: courseId,
        learningSoftware: validSoftware.map((sw) => ({
          title: sw.title.trim(),
          photoUrl: sw.photoUrl || "",
        })),
      }).unwrap();

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(6);
      setCompletedSteps(newCompleted);

      if (validSoftware.length > 0) {
        toast.success(
          `✓ ${validSoftware.length} learning software items saved!`,
        );
      } else {
        toast.success("✓ Learning software step completed!");
      }

      // Auto-advance to next step (FAQ)
      setTimeout(() => setCurrentStep(7), 500);
    } catch (error: any) {
      console.error("Error saving learning software:", error);
      toast.error(error?.data?.message || "Failed to save learning software");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FAQ HANDLER - STEP 8
  // ============================================

  const handleSaveFAQs = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    try {
      setIsLoading(true);

      // Filter out empty FAQ entries
      const validFaqs = faqs.filter(
        (faq: any) =>
          faq.question &&
          faq.question.trim().length > 0 &&
          faq.answer &&
          faq.answer.trim().length > 0,
      );

      // Update the program with FAQs data
      await updateProgram({
        id: courseId,
        faqs: validFaqs.map((faq: any, index: number) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
          order: index,
        })),
      }).unwrap();

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(7);
      setCompletedSteps(newCompleted);

      if (validFaqs.length > 0) {
        toast.success(`✓ ${validFaqs.length} FAQs saved!`);
      } else {
        toast.success("✓ FAQ step completed!");
      }

      // Auto-advance to next step (Certificate)
      setTimeout(() => setCurrentStep(8), 500);
    } catch (error: any) {
      console.error("Error saving FAQs:", error);
      toast.error(error?.data?.message || "Failed to save FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // CERTIFICATE HANDLER - STEP 9
  // ============================================

  const handleSaveCertificate = async () => {
    if (!courseId) {
      toast.error("Please save basic info first");
      return;
    }

    try {
      setIsLoading(true);

      // Update the program with certificate preview data
      await updateProgram({
        id: courseId,
        certificatePreview: {
          title:
            certificatePreview.title?.trim() || "Certificate of Completion",
          description: certificatePreview.description?.trim() || "",
          photoUrl: certificatePreview.photoUrl || "",
        },
      }).unwrap();

      // Mark step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(8);
      setCompletedSteps(newCompleted);

      toast.success("✓ Certificate preview saved!");

      // Auto-advance to next step (Review)
      setTimeout(() => setCurrentStep(9), 500);
    } catch (error: any) {
      console.error("Error saving certificate:", error);
      toast.error(error?.data?.message || "Failed to save certificate");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // PUBLISH HANDLER - FINAL STEP COMPLETION
  // ============================================

  const handlePublish = async () => {
    if (!courseId) {
      toast.error("Please complete all steps first");
      return;
    }

    try {
      setIsLoading(true);

      // Final validation
      if (!validateStep(currentStep)) {
        toast.error("Please fix validation errors before publishing");
        return;
      }

      // Mark all remaining steps as completed
      const newCompleted = new Set(completedSteps);
      for (let i = 6; i <= 7; i++) {
        newCompleted.add(i);
      }
      setCompletedSteps(newCompleted);

      toast.success("✓ Program published successfully with all components!");

      // Navigate to program details
      router.push(`/dashboard/manage-courses/`);
    } catch (error: any) {
      console.error("Error publishing program:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to publish program",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // VALIDATION STATUS
  // ============================================

  const canProceed = currentStep === 1 ? !!programData.title : true;
  const canPublish =
    programData.title &&
    experts.length > 0 &&
    modules.length > 0 &&
    quizzes.length > 0;

  const hasErrors =
    validationErrors[currentStep] && validationErrors[currentStep].length > 0;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/dashboard/manage-courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New</h1>
          <p className="text-gray-500">
            Follow the steps below to create a complete and professional course.
          </p>
        </motion.div>

        {/* Instructions - Collapsible */}
        <StepInstructions
          title="Instructions"
          description="Complete these 10 steps to create a fully-featured course. Required steps are marked with *."
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
          defaultExpanded={false}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Checklist */}

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Error Display */}
              {hasErrors && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex gap-3">
                    <AlertCircle
                      className="text-red-800 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">
                        Validation Errors
                      </h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {validationErrors[currentStep].map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Progress */}
              <StepProgress
                currentStep={currentStep}
                totalSteps={STEPS.length}
                completedSteps={completedSteps}
                onStepClick={setCurrentStep}
                steps={STEPS}
              />

              {/* Steps Content */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <BasicInfoStep
                    key="step1"
                    data={programData}
                    onUpdate={setProgramData}
                  />
                )}
                {currentStep === 2 && (
                  <CurriculumStep
                    key="step2"
                    data={curriculum}
                    onUpdate={setCurriculum}
                  />
                )}
                {currentStep === 3 && (
                  <ExpertsStep
                    key="step3"
                    data={experts}
                    onUpdate={setExperts}
                  />
                )}
                {currentStep === 4 && (
                  <ProjectsStep
                    key="step4"
                    data={projects}
                    onUpdate={setProjects}
                  />
                )}
                {currentStep === 5 && (
                  <ModulesStep
                    key="step5"
                    data={modules}
                    onUpdate={setModules}
                  />
                )}
                {currentStep === 6 && (
                  <LearningSoftwareStep
                    key="step6"
                    data={learningSoftware}
                    onUpdate={setLearningSoftware}
                  />
                )}
                {currentStep === 7 && (
                  <FAQStep key="step7" data={faqs} onUpdate={setFaqs} />
                )}
                {currentStep === 8 && (
                  <CertificateStep
                    key="step8"
                    data={certificatePreview}
                    onUpdate={setCertificatePreview}
                  />
                )}
                {currentStep === 9 && (
                  <ReviewStep
                    key="step9"
                    programData={programData}
                    curriculum={curriculum}
                    experts={experts}
                    projects={projects}
                    materials={modules}
                    quizzes={quizzes}
                  />
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 flex-wrap">
                {currentStep > 1 && (
                  <motion.button
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </motion.button>
                )}

                {/* Save Button for Steps 1-8 (before Review) */}
                {currentStep >= 1 && currentStep <= 8 && (
                  <motion.button
                    onClick={() => {
                      if (currentStep === 1) handleSaveBasicInfo();
                      else if (currentStep === 2) handleSaveCurriculum();
                      else if (currentStep === 3) handleSaveExperts();
                      else if (currentStep === 4) handleSaveProjects();
                      else if (currentStep === 5) handleSaveModules();
                      else if (currentStep === 6) handleSaveLearningSoftware();
                      else if (currentStep === 7) handleSaveFAQs();
                      else if (currentStep === 8) handleSaveCertificate();
                    }}
                    disabled={isLoading}
                    className="ml-auto flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin">
                          <Save size={18} />
                        </div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save & Continue
                      </>
                    )}
                  </motion.button>
                )}

                {/* Next Button removed - all steps now have Save & Continue */}

                {/* Publish Button for Final Step */}
                {currentStep === STEPS.length && (
                  <motion.button
                    onClick={handlePublish}
                    disabled={isLoading}
                    className="ml-auto flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin">
                          <Save size={18} />
                        </div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Publish Program
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
