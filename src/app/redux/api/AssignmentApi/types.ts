/**
 * Assignment API Types
 * TypeScript interfaces for Assignment and AssignmentSubmission
 */

// ==================== ASSIGNMENT TYPES ====================

export interface IAssignment {
  _id: string;
  courseId: string | { _id: string; title: string; slug: string };
  moduleId?: string | { _id: string; title: string };

  title: string;
  description: string;
  instructions: string;

  batchIds: (string | { _id: string; batchName: string; batchNumber: string })[];
  isSharedAcrossBatches: boolean;

  submissionTypes: ('file-upload' | 'url-submission' | 'text-submission')[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFilesCount?: number;

  startDate?: string;
  dueDate: string;
  lateDueDate?: string;

  totalPoints: number;
  passingPoints: number;
  lateSubmissionPenalty?: number;
  allowResubmission: boolean;
  maxAttempts: number;

  rubric?: {
    criteria: string;
    maxPoints: number;
    description: string;
  }[];

  // Reference files (admin-uploaded materials for students)
  referenceFiles?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt?: string;
  }[];

  isPublished: boolean;
  createdBy?: { _id: string; name: string; email: string };
  createdAt?: string;
  updatedAt?: string;

  // Virtual fields
  isOverdue?: boolean;
  isActive?: boolean;
}

export interface ICreateAssignmentRequest {
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  instructions: string;
  batchIds?: string[];
  isSharedAcrossBatches?: boolean;
  submissionTypes: ('file-upload' | 'url-submission' | 'text-submission')[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFilesCount?: number;
  startDate?: string;
  dueDate: string;
  lateDueDate?: string;
  totalPoints: number;
  passingPoints: number;
  lateSubmissionPenalty?: number;
  allowResubmission?: boolean;
  maxAttempts?: number;
  rubric?: {
    criteria: string;
    maxPoints: number;
    description: string;
  }[];
  isPublished?: boolean;
}

export interface IUpdateAssignmentRequest {
  title?: string;
  description?: string;
  instructions?: string;
  batchIds?: string[];
  isSharedAcrossBatches?: boolean;
  submissionTypes?: ('file-upload' | 'url-submission' | 'text-submission')[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFilesCount?: number;
  startDate?: string;
  dueDate?: string;
  lateDueDate?: string;
  totalPoints?: number;
  passingPoints?: number;
  lateSubmissionPenalty?: number;
  allowResubmission?: boolean;
  maxAttempts?: number;
  rubric?: {
    criteria: string;
    maxPoints: number;
    description: string;
  }[];
  isPublished?: boolean;
}

// ==================== SUBMISSION TYPES ====================

export interface ISubmissionFile {
  path: string;
  url: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface IAssignmentSubmission {
  _id: string;
  assignmentId: string | IAssignment;
  studentId: string | { _id: string; name: string; email: string; profilePhoto?: string };
  batchId: string | { _id: string; batchName: string; batchNumber: string };
  courseId: string | { _id: string; title: string };
  moduleId?: string;

  submittedAt: string;
  attempt: number;

  files?: ISubmissionFile[];
  textContent?: string;
  linkUrl?: string;

  status: 'submitted' | 'graded' | 'returned' | 'resubmit-required';
  isLateSubmission: boolean;

  pointsAwarded?: number;
  feedback?: string;
  gradedBy?: { _id: string; name: string; email: string };
  gradedAt?: string;

  rubricScores?: {
    criteria: string;
    points: number;
    comment?: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ISubmitAssignmentRequest {
  assignmentId: string;
  batchId: string;
  textContent?: string;
  linkUrl?: string;
}

export interface IGradeSubmissionRequest {
  pointsAwarded: number;
  feedback?: string;
  rubricScores?: {
    criteria: string;
    points: number;
    comment?: string;
  }[];
  status?: 'graded' | 'returned' | 'resubmit-required';
}

// ==================== STATISTICS ====================

export interface IAssignmentStats {
  assignmentId: string;
  batchId: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  pendingGrading: number;
  overdueCount: number;
  averageScore?: number;
  submissions: IAssignmentSubmission[];
}

// ==================== QUERY PARAMS ====================

export interface IGetAssignmentsQuery {
  courseId?: string;
  moduleId?: string;
  batchId?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}

export interface IGetSubmissionsQuery {
  assignmentId?: string;
  studentId?: string;
  batchId?: string;
  courseId?: string;
  status?: 'submitted' | 'graded' | 'returned' | 'resubmit-required';
  page?: number;
  limit?: number;
}
