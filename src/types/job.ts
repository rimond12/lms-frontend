// ============================================
// Job Types
// ============================================

export type TJobType = "Internship" | "Full time" | "Part time";
export type TJobStatus = "draft" | "published" | "closed";

export interface IJob {
  _id: string;
  title: string;
  slug: string;
  type: TJobType;
  status: TJobStatus;
  deadline?: string;
  viewCount: number;
  duration?: string;
  salary?: string;
  date: string;
  category: string;
  location?: string;
  vacancy?: string;
  experience?: string;
  about?: string;
  qualifications?: string[];
  responsibilities?: string[];
  benefits?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ICreateJobPayload = Omit<
  IJob,
  "_id" | "viewCount" | "createdAt" | "updatedAt"
>;
export type IUpdateJobPayload = Partial<ICreateJobPayload>;

// ============================================
// Job Application Types
// ============================================

export type TApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected";

// ✅ Single admin note object
export interface IAdminNote {
  text: string;
  createdAt: string;
}

export interface IApplication {
  _id: string;
  jobId: string | IJob;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  resumeLink: string;
  academicQualifications: string;
  presentAddress: string;
  portfolio?: string;
  whyHireYou?: string;
  exprience?: string;
  vacancy?: string;
  certifications?: string[];
  softSkills?: string[];
  hardSkills?: string[];
  status: TApplicationStatus;
  adminNote?: string; // পুরনো single note (backward compat)
  adminNotes?: IAdminNote[]; // ✅ নতুন multiple notes
  interviewDate?: string;
  isEmailSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ICreateApplicationPayload = Omit<
  IApplication,
  | "_id"
  | "status"
  | "adminNote"
  | "adminNotes"
  | "interviewDate"
  | "isEmailSent"
  | "createdAt"
  | "updatedAt"
>;

export interface IUpdateApplicationStatus {
  id: string;
  status: TApplicationStatus;
  adminNote?: string;
  interviewDate?: string;
}

export interface IBulkUpdateStatus {
  ids: string[];
  status: TApplicationStatus;
}

export interface IJobFilters {
  type?: TJobType;
  status?: TJobStatus;
  category?: string;
}

export interface IApplicationFilters {
  status?: TApplicationStatus;
  jobId?: string;
  search?: string;
}

export interface IJobAnalytics {
  total: number;
  published: number;
  draft: number;
  closed: number;
  topViewed: {
    title: string;
    viewCount: number;
    type: string;
    status: string;
  }[];
}

export interface IApplicationAnalytics {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interview: number;
  accepted: number;
  rejected: number;
  perJob: { jobTitle: string; count: number }[];
}
