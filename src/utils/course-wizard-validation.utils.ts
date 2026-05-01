import type { 
  ProgramData, 
  Curriculum, 
  Expert, 
  Project, 
  Quiz 
} from "@/types/course-wizard.types";

// ============================================
// VALIDATION UTILITIES FOR COURSE WIZARD
// ============================================

/**
 * Validates the Basic Info step (Step 1)
 */
export function validateBasicInfo(programData: ProgramData): string[] {
  const errors: string[] = [];

  if (!programData.title || programData.title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!programData.description || programData.description.trim().length === 0) {
    errors.push("Program description is required");
  }
  if (!programData.shortDescription || programData.shortDescription.trim().length === 0) {
    errors.push("Short description is required");
  }
  if (programData.title && programData.title.length > 100) {
    errors.push("Title must be 100 characters or less");
  }

  return errors;
}

/**
 * Validates the Curriculum step (Step 2)
 */
export function validateCurriculum(curriculum: Curriculum[]): string[] {
  const errors: string[] = [];

  curriculum.forEach((module, idx) => {
    if (!module.moduleTitle || module.moduleTitle.trim().length === 0) {
      errors.push(`Module ${idx + 1}: Title is required`);
    }
  });

  return errors;
}

/**
 * Validates the Experts step (Step 3)
 */
export function validateExperts(experts: Expert[]): string[] {
  const errors: string[] = [];

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

  return errors;
}

/**
 * Validates the Modules step (Step 5)
 */
export function validateModules(modules: any[]): string[] {
  const errors: string[] = [];

  if (modules.length === 0) {
    errors.push("At least one module is required");
  }

  modules.forEach((module: any, idx: number) => {
    if (!module.title || module.title.trim().length === 0) {
      errors.push(`Module ${idx + 1}: Title is required`);
    }
    if (!module.lessons || module.lessons.length === 0) {
      errors.push(`Module ${idx + 1}: At least one lesson is required`);
    }
    module.lessons?.forEach((lesson: any, lessonIdx: number) => {
      if (!lesson.title || lesson.title.trim().length === 0) {
        errors.push(`Module ${idx + 1}, Lesson ${lessonIdx + 1}: Title is required`);
      }
      if (!lesson.contentUrl || lesson.contentUrl.trim().length === 0) {
        errors.push(`Module ${idx + 1}, Lesson ${lessonIdx + 1}: Content URL is required`);
      }
    });
  });

  return errors;
}

/**
 * Validates a URL string
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith("/");
  }
}

/**
 * Master validation function that validates a specific step
 */
export function validateStep(
  step: number,
  data: {
    programData: ProgramData;
    curriculum: Curriculum[];
    experts: Expert[];
    modules: any[];
  }
): string[] {
  switch (step) {
    case 1:
      return validateBasicInfo(data.programData);
    case 2:
      return validateCurriculum(data.curriculum);
    case 3:
      return validateExperts(data.experts);
    case 4:
      return []; // Projects are optional
    case 5:
      return validateModules(data.modules);
    case 6:
      return []; // Learning Software is optional
    case 7:
      return []; // FAQ is optional
    case 8:
      return []; // Certificate is optional
    default:
      return [];
  }
}
