export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'USER' | 'HR' | 'MARKETING_TEAM' | 'CUSTOMER_SERVICE_TEAM';
  status: 'ACTIVE' | 'BLOCKED';
  profilePhoto?: string;
  mobileNumber?: string;
  nid?: string;
  address?: string;
  emailVerified?: boolean;
  age?: number;
  cvUrl?: string;
  experienceCertificateUrl?: string;
  universityCertificateUrl?: string;
  
  // Academic Qualifications
  degreeType?: string;
  universityName?: string;
  degreeTitle?: string;
  
  // Previous Job Experience
  jobExperiences?: {
    organizationName: string;
    startDate: string; // dd-mm-yyyy format
    position: string;
    endDate?: string; // dd-mm-yyyy format or 'Present'
  }[];
  
  // IEB Membership
  iebNo?: string;
  
  // Professional Affiliation / Recognition
  affiliationTitle?: string;
  affiliationInstitution?: string;
  affiliationStartDate?: string;
  affiliationValidTill?: string;
  affiliationDocument?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  nid?: string;
  role?: 'STUDENT' | 'TEACHER' | 'USER';
  address?: string;
}
// Sr. Structural Engineer - MAK Consultant

export interface UpdateUserData {
  name?: string;
  mobileNumber?: string;
  nid?: string;
  address?: string;
  profilePhoto?: string;
  age?: number;
  cvUrl?: string;
  experienceCertificateUrl?: string;
  universityCertificateUrl?: string;
  
  // Academic Qualifications
  degreeType?: string;
  universityName?: string;
  degreeTitle?: string;
  
  // Previous Job Experience
  jobExperiences?: {
    organizationName: string;
    startDate: string; // dd-mm-yyyy format
    position: string;
    endDate?: string; // dd-mm-yyyy format or 'Present'
  }[];
  
  // IEB Membership
  iebNo?: string;
  
  // Professional Affiliation / Recognition
  affiliationTitle?: string;
  affiliationInstitution?: string;
  affiliationStartDate?: string;
  affiliationValidTill?: string;
  affiliationDocument?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}