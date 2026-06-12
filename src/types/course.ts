/**
 * Course Types
 * Defines types for the Course management API
 */

export interface IMaterial {
  _id?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  url?: string; // For API compatibility
  type?: 'pdf' | 'video' | 'doc' | 'image' | 'link' | 'external-link';
  duration?: number; // in minutes
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpert {
  _id?: string;
  userId?: string;
  name: string;
  designation: string;
  photoUrl?: string;
  profileImage?: string;
  bio?: string;
  specialization?: string[];
  social?: {
    linkedIn?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuiz {
  _id?: string;
  title: string;
  description?: string;
  totalQuestions?: number;
  passingScore?: number;
  duration?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITopic {
  _id?: string;
  title: string;
  description?: string;
  duration?: number; // in minutes
  order?: number;
}

export interface ICurriculum {
  _id?: string;
  moduleTitle: string;
  description?: string;
  topics: ITopic[];
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICertificateRule {
  minPercentage: number;
  templateUrl?: string;
  issueAutomatically?: boolean;
  validityDays?: number;
  certificateTitle?: string;
}

export interface IAccessControl {
  accessType: 'all-access' | 'materials-only' | 'quiz-only';
  accessScope: 'all-users' | 'members-only' | 'individual-users';
}

export interface IProject {
  _id?: string;
  title?: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILearningSoftware {
  _id?: string;
  title: string;
  photoUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IHighlight {
  _id?: string;
  icon: string;  // clock, video, award, briefcase, book, check
  label: string;
  order?: number;
}

export interface ICourse {
  _id?: string;
  title: string;
  slug: string;
  type: 'training' | 'seminar' | 'webinar' | 'workshop' | 'course';
  courseType?: 'online' | 'offline';
  description: string;
  bannerImage?: string;
  overviewVideoUrl?: string;
  highlights?: IHighlight[];
  photoUrl?: string;
  shortDescription?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  duration?: string; // e.g., "2 weeks", "8 hours"
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  tags?: string[];
  price?: number;
  discountedPrice?: number;
  currency?: string;
  isProtected?: boolean;
  accessType: 'free' | 'paid' | 'invite-only' | 'members-only';
  isActive?: boolean;
  isPublished?: boolean;
  capacity?: number;
  enrolledCount?: number;

  // Location & Venue
  venueName?: string;
  locations?: string;
  sponsorTitle?: string;

  // Categories
  categories?: string[];
  primaryCategory?: string;

  // Relations
  materials?: IMaterial[];
  experts?: IExpert[];
  projects?: IProject[];
  curriculum?: ICurriculum[];
  modules?: IModule[];
  quizzes?: IQuiz[];
  quizIds?: string[];
  learningSoftware?: ILearningSoftware[];
  faqs?: IFAQ[];
  certificatePreview?: ICertificatePreview;

  // Access Control
  accessControl?: IAccessControl;

  // Certificate
  certificateRule?: ICertificateRule;

  // SEO
  metaDescription?: string;
  metaKeywords?: string[];

  // Admin Fields
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICreateCourseRequest {
  title: string;
  slug: string;
  type: 'training' | 'seminar' | 'webinar' | 'workshop' | 'course';
  courseType?: 'online' | 'offline';
  description: string;
  shortDescription?: string;
  bannerImage?: string;
  overviewVideoUrl?: string;
  photoUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  tags?: string[];
  price?: number;
  discountedPrice?: number;
  currency?: string;
  isProtected?: boolean;
  accessType: 'free' | 'paid' | 'invite-only' | 'members-only';
  capacity?: number;
  accessControl?: IAccessControl;
  materials?: IMaterial[];
  experts?: IExpert[];
  projects?: IProject[];
  curriculum?: ICurriculum[];
  certificateRule?: ICertificateRule;
  metaDescription?: string;
  metaKeywords?: string[];
  learningSoftware?: ILearningSoftware[];
  // Categories
  categories?: string[];
  primaryCategory?: string;
}

export interface ILesson {
  _id?: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'document' | 'link';
  contentUrl: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
}

export interface IModule {
  _id?: string;
  title: string;
  description?: string;
  lessons: ILesson[];
  resources?: any[];
  quizId?: string;
  order?: number;
}

export interface IUpdateCourseRequest {
  title?: string;
  courseType?: 'online' | 'offline';
  slug?: string;
  description?: string;
  shortDescription?: string;
  bannerImage?: string;
  overviewVideoUrl?: string;
  photoUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  duration?: string;
  level?: string;
  tags?: string[];
  price?: number;
  discountedPrice?: number;
  currency?: string;
  isProtected?: boolean;
  accessType?: string;
  capacity?: number;
  accessControl?: IAccessControl;
  isActive?: boolean;
  isPublished?: boolean;
  materials?: IMaterial[];
  modules?: IModule[];
  experts?: IExpert[];
  projects?: IProject[];
  curriculum?: ICurriculum[];
  certificateRule?: ICertificateRule;
  metaDescription?: string;
  metaKeywords?: string[];
  learningSoftware?: ILearningSoftware[];
  // FAQ and Certificate Preview
  faqs?: IFAQ[];
  certificatePreview?: ICertificatePreview;
}

export interface IFAQ {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
}

export interface ICertificatePreview {
  title?: string;
  description?: string;
  photoUrl?: string;
}

export interface ICourseResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ICourse | ICourse[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IUploadResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    path: string;
  };
}

// ============================================
// ENROLLMENT TYPES
// ============================================

export interface IEnrollmentProgress {
  materialsViewed: number;
  totalMaterials: number;
  quizzesAttempted?: number;
  quizzesCompleted: number;
  certificateIssued: boolean;
  percentage?: number;
  lastActivityDate?: string;
}

export interface IEnrollment {
  isViewed: boolean;
  _id: string;
  userId: string;
  courseId: string | ICourse;
  status: 'active' | 'completed' | 'cancelled' | 'suspended' | 'pending_approval';
  accessType?: 'all-access' | 'materials-only' | 'quiz-only';
  accessScope?: 'all-users' | 'members-only' | 'individual-users';
  paymentStatus?: 'free' | 'paid' | 'pending';
  paymentId?: string;
  enrollmentDate: string;
  completionDate?: string;
  viewedMaterials?: string[];
  completedQuizzes?: string[];
  progress?: IEnrollmentProgress;
  invitationCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEnrollmentInput {
  courseId: string;
  paymentId?: string;
  invitationCode?: string;
}

export interface IAccessCheckResponse {
  hasAccess: boolean;
  accessLevel: 'all-access' | 'materials-only' | 'quiz-only';
  reason?: string;
  enrollmentStatus?: string;
}

// ============================================
// CERTIFICATE TYPES
// ============================================

export interface ICertificateData {
  _id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  certificateNumber: string;
  quizScore?: number;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'revoked' | 'expired';
  verificationCode: string;
  revokedAt?: string;
  revokedReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICertificateInput {
  userId: string;
  courseId: string;
  quizScore?: number;
  completionDate?: string;
}

// ============================================
// ACCESS CONTROL & INVITATION TYPES
// ============================================

export interface IAccessControlGrant {
  _id: string;
  userId: string;
  courseId: string;
  accessLevel: 'all-access' | 'materials-only' | 'quiz-only';
  isActive: boolean;
  grantedDate: string;
  expiryDate?: string;
  revokedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAccessControlInput {
  userId: string;
  courseId: string;
  accessLevel: 'all-access' | 'materials-only' | 'quiz-only';
  expiryDate?: string;
}

export interface IInvitation {
  _id: string;
  courseId: string;
  courseTitle?: string;
  token: string;
  expiryDate: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IInvitationInput {
  courseId: string;
  expiryDays?: number;
}

export interface IBulkInvitationInput {
  courseId: string;
  count: number;
  expiryDays?: number;
}

export interface IInvitationValidation {
  isValid: boolean;
  token?: string;
  courseId?: string;
  courseTitle?: string;
  expiryDate?: string;
  reason?: string;
}

export interface BulkAssignInput {
  courseId: string;
  userIds: string[];
}

export interface BulkAssignResponse {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    reason: string;
  }>;
}

export interface ICourseStats {
  totalEnrollments: number;
  materialsCount: number;
  expertsCount: number;
  quizzesCount: number;
  certificatesIssued: number;
  averageCompletion: number;
  activeUsers: number;
}

// ============================================
// PROGRESS MAP TYPES (Sequential Learning)
// ============================================

export interface IProgressItem {
  itemId: string;
  itemType: 'lesson' | 'quiz' | 'assignment';
  title: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  lockReason?: string;
  status?: string;
}

export interface IModuleProgressItem {
  moduleId: string;
  title: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  lockReason?: string;
  items: IProgressItem[];
}

export interface IOverallProgress {
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalAssignments: number;
  completedAssignments: number;
  totalItems: number;
  completedItems: number;
  percentage: number;
}

export interface IProgressMap {
  enrollmentId: string;
  progressionType: 'free' | 'sequential';
  modules: IModuleProgressItem[];
  overallProgress: IOverallProgress;
}


