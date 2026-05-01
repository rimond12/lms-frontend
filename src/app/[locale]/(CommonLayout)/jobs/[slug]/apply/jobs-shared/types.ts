// Step এখন শুধু 2টা
export type Step = 1 | 2;

export type FormData = {
  // ── Profile থেকে auto-fill (Review এ দেখাবে) ──
  name: string;
  email: string;
  phone: string;
  address: string;
  cvUrl: string;
  academicQualifications: string;

  // ── Questionnaire ──
  exprience: string;
  whyHireYou: string;
  hardSkills: string[];
  softSkills: string[];
  certifications: string[];
  answers: Record<string, string>; // existing Yes/No questions
};

export const INITIAL_FORM_DATA: FormData = {
  // Profile fields (empty — useEffect এ fill হবে)
  name: "",
  email: "",
  phone: "",
  address: "",
  cvUrl: "",
  academicQualifications: "",

  // Questionnaire
  exprience: "",
  whyHireYou: "",
  hardSkills: [],
  softSkills: [],
  certifications: [],
  answers: {},
};
