export interface IUser {
    address?: string;
    _id: string;
    name: string;
    role: USER_ROLE;
    email: string;
    status: string;
    emailVerified: boolean;
    mobileNumber: string;
    nid?: string;
    profilePhoto: string;
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
    
    // BASE Membership ID (generated after approval)
    // membershipId removed
    
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  } 

export interface IPayment {
  transactionId: string;
  _id?: string;
  user: any;
  course: any;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

  export type USER_ROLE = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'USER' | 'HR' | 'MARKETING_TEAM' | 'CUSTOMER_SERVICE_TEAM';
  

  export interface IInput {
  variant?: "flat" | "bordered" | "faded" | "underlined";
  size?: any
  required?: boolean;
  type?: string;
  label?: string;
  name: string;
  disabled?: boolean; 
  placeholder?: string;
  errorMessage?: string;
  className?: string;
} 

export type ICertificate = { 
  _id: string
  certificateId?: string;
  studentId: string;
  studentName: string;
  courseName: string;
  issueDate: string | Date;
  instructorName: string;
  status: 'pending' | 'issued' | 'revoked' | 'applied' | 'approved' | 'rejected'; 
  comment?: string;
  photoUrl?: string;
  appliedAt?: Date;
  approvedAt?: Date;
};


// Types:
export interface CertificateApplication {
  _id?: string;
  certificateId?: string;
    studentId: string;
    studentName: string;
    courseName: string;
    issueDate: string | Date;
    instructorName: string;
    status: 'pending' | 'issued' | 'revoked' | 'applied' | 'approved' | 'rejected'; 
    comment?: string;
    photoUrl?: string;
    appliedAt?: Date;
    approvedAt?: Date;
}




export interface IIndustrialOfferBanner {
  _id?: string;
  title: string;
  description: string;
  buyNowText?: string;
  learnMoreText?: string;
  date?: any; 
  time?: any; 
  remainingDays?: number;
  photoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}


