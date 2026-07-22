export interface ICvSectionConfig {
  key: string;
  nameEn: string;
  nameBn: string;
  isEnabled: boolean;
  order: number;
  isRequired: boolean;
  instructionsEn?: string;
  instructionsBn?: string;
  tipEn?: string;
  tipBn?: string;
  exampleEn?: string;
  exampleBn?: string;
}

export interface IAiPromptTemplates {
  enhanceSummary?: string;
  generateObjective?: string;
  generateWorkExperienceBullets?: string;
  improveSkills?: string;
  generalAssistant?: string;
}

export interface IAiConfig {
  isEnabled: boolean;
  modelName: string;
  promptTemplates: IAiPromptTemplates;
  systemPrompt: string;
}

export interface ICvTemplateConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  isDefault: boolean;
  category: string;
  thumbnail?: string;
}

export interface ICvBuilderCMS {
  sections: ICvSectionConfig[];
  aiConfig: IAiConfig;
  templates: ICvTemplateConfig[];
  updatedAt?: string;
}

export interface IPersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
  summary?: string;
  careerObjective?: string;
}

export interface IWorkExperience {
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  responsibilities?: string;
  achievements?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  grade?: string;
  description?: string;
}

export interface ISkill {
  name: string;
  level?: string;
  category?: string;
}

export interface IProject {
  title: string;
  role?: string;
  techStack?: string;
  description?: string;
  link?: string;
}

export interface ICertification {
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ILanguage {
  language: string;
  proficiency?: string;
}

export interface ICustomSectionItem {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface ICustomSection {
  title: string;
  items: ICustomSectionItem[];
}

export interface IUserCv {
  _id?: string;
  userId?: string;
  title: string;
  templateId: string;
  accentColor?: string;
  personalInfo: IPersonalInfo;
  workExperience: IWorkExperience[];
  education: IEducation[];
  skills: ISkill[];
  projects: IProject[];
  certifications: ICertification[];
  languages: ILanguage[];
  customSections: ICustomSection[];
  isDraft: boolean;
  createdAt?: string;
  updatedAt?: string;
}
