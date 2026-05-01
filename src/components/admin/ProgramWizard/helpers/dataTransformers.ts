/**
 * Data Transformation Helpers
 * Converts frontend form data to backend API schema
 */

// Quiz Data Transformer
export interface QuizPayload {
  quiz: {
    title: string;
    description: string;
    subject: string;
    duration: number;
    totalMarks: number;
    passingPercentage: number;
    negativeMarking: boolean;
    negativeMarkValue: number;
  };
  questions: Array<{
    questionText: string;
    marks: number;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export interface QuizFormData {
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Transform quiz form data to backend API format
 * Note: Backend expects complete questions with options
 * Frontend wizard only collects basic quiz info - questions added separately
 */
export const transformQuizData = (quizzes: QuizFormData[]): Omit<QuizPayload, 'questions'>[] => {
  return quizzes.map((quiz) => ({
    quiz: {
      title: quiz.title,
      description: quiz.description,
      subject: quiz.title, // Use title as subject if not separately provided
      duration: quiz.duration,
      totalMarks: 100,
      passingPercentage: quiz.passingScore,
      negativeMarking: true,
      negativeMarkValue: -0.5,
    },
  }));
};

// Expert Data Transformer
export interface ExpertPayload {
  name: string;
  designation: string; // Backend requires: designation
  bio: string;
  profileImage?: string; // profile photo URL
}

export interface ExpertFormData {
  name: string;
  designation: string; // Backend requires: designation
  bio: string;
  profileImage?: string; // profile photo URL
}

/**
 * Transform expert form data to backend API format
 * Backend expects: name, designation, bio, profileImage
 */
export const transformExpertData = (experts: ExpertFormData[]): ExpertPayload[] => {
  return experts.map((expert) => ({
    name: expert.name.trim(),
    designation: expert.designation.trim() || "Expert",
    bio: expert.bio.trim(),
    profileImage: expert.profileImage || undefined,
  }));
};

// Material Data Transformer
export interface MaterialPayload {
  title: string;
  description: string;
  fileUrl: string; // Backend requires: fileUrl
  type: "pdf" | "video" | "doc" | "image" | "link" | "external-link";
  duration?: number;
}

export interface MaterialFormData {
  title: string;
  description: string;
  fileUrl: string; // Backend requires: fileUrl
  type: "lecture" | "file" | "url";
  subType?: "pdf" | "video" | "doc" | "image" | "link" | "external-link"; // For backward compatibility
  duration?: number;
}

/**
 * Transform and validate material form data to backend API format
 * Maps new UI types (lecture, file, url) to backend types
 */
export const transformMaterialData = (materials: MaterialFormData[]): MaterialPayload[] => {
  return materials.map((material) => {
    // Map UI types to backend types
    let backendType: MaterialPayload["type"] = "link";
    
    if (material.type === "lecture") {
      backendType = "video"; // Lectures default to video type for backend
    } else if (material.type === "file") {
      backendType = material.subType || "pdf"; // File materials use subType or default to pdf
    } else if (material.type === "url") {
      backendType = "external-link"; // URL materials are external links
    }

    // For file uploads, fileUrl should already be set; for others validate it's a URL
    if (material.type === "lecture" || material.type === "url") {
      if (!isValidUrl(material.fileUrl)) {
        throw new Error(`Invalid URL for material "${material.title}": ${material.fileUrl}`);
      }
    }

    return {
      title: material.title.trim(),
      description: material.description.trim(),
      fileUrl: material.fileUrl.trim(),
      type: backendType,
      duration: material.type === "lecture" ? material.duration : undefined,
    };
  });
};

// Curriculum Data Transformer
export interface CurriculumPayload {
  moduleTitle: string;
  description: string;
  topics: Array<{
    title: string;
    description: string;
    duration: number;
  }>;
  order?: number;
}

export interface CurriculumFormData {
  moduleTitle: string;
  description: string;
  topics: Array<{
    title: string;
    description: string;
    duration?: number;
  }>;
}

/**
 * Transform curriculum form data to backend API format
 * Backend expects: moduleTitle, description, topics array
 * Matches the CurriculumSchema exactly
 */
export const transformCurriculumData = (
  curriculum: CurriculumFormData[]
): CurriculumPayload[] => {
  return curriculum.map((module, idx) => ({
    moduleTitle: module.moduleTitle.trim(),
    description: module.description.trim(),
    topics: module.topics.map((topic) => ({
      title: topic.title.trim(),
      description: topic.description.trim(),
      duration: topic.duration || 0,
    })),
    order: idx + 1,
  }));
};

// Program Data Transformer
export interface ProgramPayload {
  title: string;
  slug: string;
  type: "training" | "seminar" | "webinar" | "workshop" | "course";
  description: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  accessType: "free" | "paid" | "members-only" | "invite-only";
  capacity?: number;
  tags: string[];
  duration?: string;
  price?: number;
  discountedPrice?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  isProtected?: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  shortDescription?: string;
  bannerImage?: string;
  overviewVideoUrl?: string;
  
  // Category fields
  categories?: string[];
  primaryCategory?: string;
  
  // Sponsor fields
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;

  // Sponsor locations fields
  venueName?: string;
  locations?: string | string[];
  
  // Highlights
  highlights?: Array<{ icon: string; label: string; order?: number }>;
}

export interface ProgramFormData {
  title: string;
  slug: string;
  type: "training" | "seminar" | "webinar" | "workshop" | "course";
  description: string;
  shortDescription: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  duration: string;
  price?: number;
  discountedPrice?: number;
  currency?: string;
  capacity?: number;
  tags: string[];
  bannerImage?: string;
  overviewVideoUrl?: string;
  startDate?: string;
  endDate?: string;
  isProtected?: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Category fields
  categories?: string[];
  primaryCategory?: string;
  
  // Sponsor fields
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;

  // Sponsor locations fields
  venueName?: string;
  locations?: string | string[];
  
  // Highlights
  highlights?: Array<{ icon: string; label: string; order?: number }>;
}

/**
 * Transform program form data to backend API format
 * Validates all required fields
 */
export const transformProgramData = (program: ProgramFormData): ProgramPayload => {
  // Validate required fields
  if (!program.title || program.title.trim().length === 0) {
    throw new Error(" title is required");
  }

  if (!program.description || program.description.trim().length === 0) {
    throw new Error("Program description is required");
  }

  return {
    title: program.title.trim(),
    slug: (program.slug || generateSlug(program.title)).trim(),
    type: program.type,
    description: program.description.trim(),
    shortDescription: program.shortDescription.trim() || program.description.trim().substring(0, 100),
    level: program.level,
    accessType: program.price && program.price > 0 ? "paid" : "free",
    capacity: program.capacity || 100,
    tags: program.tags.filter((tag) => tag.trim()),
    duration: program.duration.trim(),
    price: program.price,
    discountedPrice: program.discountedPrice,
    currency: program.currency || "BDT",
    startDate: program.startDate,
    endDate: program.endDate,
    isProtected: program.isProtected || false,
    metaDescription: program.metaDescription,
    metaKeywords: program.metaKeywords,
    bannerImage: program.bannerImage || undefined,
    overviewVideoUrl: program.overviewVideoUrl || undefined,
    
    // Category fields
    categories: program.categories?.filter(c => c) || [],
    primaryCategory: program.primaryCategory || undefined,
    
    // Sponsor fields
    sponsorTitle: program.sponsorTitle?.trim() || undefined,
    sponsorPhotoUrl: program.sponsorPhotoUrl?.trim() || undefined,

    // Sponsor locations fields
    venueName: program.venueName?.trim() || undefined,
    locations: program.locations || undefined,
    
    // Highlights
    highlights: program.highlights?.filter(h => h.label?.trim()) || undefined,
  };
};

// Access Control Data Transformer
export interface AccessControlPayload {
  accessType: "all-access" | "materials-only" | "quiz-only";
  accessScope: "all-users" | "members-only" | "individual-users";
}

export interface AccessControlFormData {
  accessType: "all-access" | "materials-only" | "quiz-only";
  accessScope: "all-users" | "members-only" | "individual-users";
}

/**
 * Transform access control form data to backend API format
 */
export const transformAccessControlData = (data: AccessControlFormData): AccessControlPayload => {
  return {
    accessType: data.accessType,
    accessScope: data.accessScope,
  };
};

// Certificate Rules Data Transformer
export interface CertificateRulePayload {
  minPercentage: number;
  issueAutomatically?: boolean;
  validityDays?: number;
  certificateTitle?: string;
  templateUrl?: string;
}

export interface CertificateRuleFormData {
  minPercentage: number;
  issueAutomatically?: boolean;
  validityDays?: number;
  certificateTitle?: string;
  templateUrl?: string;
}

/**
 * Transform certificate rule form data to backend API format
 */
export const transformCertificateRuleData = (
  data: CertificateRuleFormData
): CertificateRulePayload => {
  return {
    minPercentage: Math.min(Math.max(data.minPercentage || 60, 0), 100),
    issueAutomatically: data.issueAutomatically !== false,
    validityDays: data.validityDays || 365,
    certificateTitle: data.certificateTitle || "Certificate of Completion",
    templateUrl: data.templateUrl,
  };
};

// Utility Functions
/**
 * Check if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    // Also allow relative paths
    return url.startsWith("/") || url.startsWith("http");
  }
};

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\u0980-\u09FF\s-]/g, "") // Remove special characters but keep Bengali (\u0980-\u09FF) and alphanumeric
    .replace(/-+/g, "-") // Replace multiple hyphens
    .replace(/^-+|-+$/g, "") // Trim hyphens from start/end
    .substring(0, 100);
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  }
  return !value;
};

/**
 * Validate all required fields in an object
 */
export const validateRequired = (
  obj: Record<string, any>,
  fields: string[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  fields.forEach((field) => {
    if (isEmpty(obj[field])) {
      errors.push(`${field} is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
