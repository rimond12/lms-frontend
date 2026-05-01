// ============================================
// COURSE WIZARD TYPE DEFINITIONS
// Shared types for both create and edit pages
// ============================================

/**
 * Main program/course data structure
 * Used by both create/page.tsx and edit/page.tsx
 */
export interface ProgramData {
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
  highlights?: Array<{ icon: string; label: string; order?: number }>;
  startDate?: string;
  endDate?: string;
  isProtected?: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  // Category fields
  categories?: string[];
  primaryCategory?: string;
  // Sponsor fields (used in edit page)
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;
  // Location fields (used in edit page)
  venueName?: string;
  locations?: string;
}

/**
 * Learning software item (e.g., AutoCAD, Revit)
 */
export interface LearningSoftware {
  _id?: string;
  title: string;
  photoUrl: string;
}

/**
 * Curriculum module structure
 */
export interface Curriculum {
  _id?: string; // Store ID to identify existing curriculum (edit mode)
  moduleTitle: string;
  description: string;
  topics: Topic[];
}

/**
 * Topic within a curriculum module
 */
export interface Topic {
  title: string;
  description: string;
  duration?: number;
}

/**
 * Expert/instructor information
 */
export interface Expert {
  _id?: string; // Store ID to identify existing experts (edit mode)
  name: string;
  designation: string; // Backend requires: designation
  bio: string;
  profileImage?: string;
}

/**
 * Project showcase item
 */
export interface Project {
  _id?: string; // Store ID to identify existing projects (edit mode)
  title?: string;
  description?: string;
  image?: string;
}

/**
 * Course material/resource
 */
export interface Material {
  _id?: string; // Store ID to identify existing materials (edit mode)
  title: string;
  description: string;
  fileUrl: string; // Backend requires: fileUrl (not url)
  type: "lecture" | "file" | "url";
  subType?: "pdf" | "video" | "doc" | "image" | "link" | "external-link";
  duration?: number;
}

/**
 * Quiz question structure
 */
export interface Question {
  questionText: string;
  marks: number;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

/**
 * Quiz configuration
 */
export interface Quiz {
  _id?: string; // Store ID to identify existing quizzes (edit mode)
  title: string;
  description: string;
  subject: string;
  totalQuestions: number;
  passingScore: number;
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  questions: Question[];
}

/**
 * Certificate preview data
 */
export interface CertificatePreview {
  title: string;
  description: string;
  photoUrl: string;
}

/**
 * Step configuration for the wizard
 */
export interface WizardStep {
  id: number;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

/**
 * FAQ item structure
 */
export interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
}
