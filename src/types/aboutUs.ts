export interface JobExperience {
  organization: string;
  position: string;
  startDate: Date | string;
  endDate?: Date | string;
  description?: string;
}

export interface AcademicQualification {
  degree: string;
  field: string;
  institution: string;
  passingYear: number;
  grade?: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Expert {
  _id: string;
  photoUrl?: string;
  name: string;
  slugUrl: string;
  designation: string;
  institution: string;
  specialization: string;
  bio: string;
  jobExperiences: JobExperience[];
  academicQualifications: AcademicQualification[];
  socialLinks?: SocialLinks;
  achievements?: string[];
  publications?: string[];
  // About Us Page Fields
  category?: string;
  isPinned?: boolean;
  pinOrder?: number;
  isActive?: boolean;
  showOnAboutPage?: boolean;
  shortBio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertInput {
  name: string;
  slugUrl?: string;
  designation: string;
  institution: string;
  specialization: string;
  bio: string;
  shortBio?: string;
  jobExperiences: JobExperience[];
  academicQualifications: AcademicQualification[];
  socialLinks?: SocialLinks;
  achievements?: string[];
  publications?: string[];
  category?: string;
  isPinned?: boolean;
  pinOrder?: number;
  isActive?: boolean;
  showOnAboutPage?: boolean;
}

export interface AboutUsContent {
  _id: string;
  title: string;
  description: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  additionalSections?: {
    title: string;
    content: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutUsContentInput {
  title: string;
  description: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  additionalSections?: {
    title: string;
    content: string;
  }[];
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface ExpertsByCategory {
  [category: string]: Expert[];
}
