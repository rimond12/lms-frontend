"use client";

import React, { useState, useRef, useEffect } from "react";
import { IUserCv, ICvSectionConfig, IPersonalInfo, IWorkExperience, IEducation, ISkill, IProject, ICertification, ILanguage, ICustomSection } from "@/types/cvBuilder.types";
import {
  User,
  Target,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Globe,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useUploadCvPhotoMutation } from "@/app/redux/api/cvBuilderApi/cvBuilderApi";
import { getImageUrl } from "@/utils/imageUtils";
import { toast } from "react-hot-toast";

interface Props {
  cv: IUserCv;
  onChange: (updatedCv: IUserCv) => void;
  sectionsConfig?: ICvSectionConfig[];
  onOpenAi: (
    action: "enhanceSummary" | "generateObjective" | "generateWorkExperienceBullets" | "improveSkills" | "generalAssistant",
    inputText?: string,
    onApply?: (resultText: string) => void
  ) => void;
  locale?: string;
}

export const CvForm: React.FC<Props> = ({
  cv,
  onChange,
  sectionsConfig = [],
  onOpenAi,
  locale = "en",
}) => {
  const [activeTab, setActiveTab] = useState<string>("personalInfo");
  const [showTips, setShowTips] = useState<Record<string, boolean>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  const isBn = locale === "bn";

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleTip = (key: string) => {
    setShowTips((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSectionConfig = (key: string) => {
    return sectionsConfig.find((s) => s.key === key) || {
      key,
      nameEn: key,
      nameBn: key,
      isEnabled: true,
      instructionsEn: "Fill out the fields below accurately.",
      instructionsBn: "নিচের ফিল্ডগুলো সঠিকভাবে পূরণ করুন।",
      tipEn: "Keep your details clear and concise.",
      tipBn: "আপনার বিবরণ পরিষ্কার ও সংক্ষিপ্ত রাখুন।",
      exampleEn: "Example entries provided for reference.",
      exampleBn: "নমুনাস্বরূপ এন্ট্রি দেওয়া হলো।",
    };
  };

  // Field Updater Helpers
  const updatePersonalInfo = (field: keyof IPersonalInfo, value: string) => {
    onChange({
      ...cv,
      personalInfo: {
        ...cv.personalInfo,
        [field]: value,
      },
    });
  };

  const [uploadPhotoMutation, { isLoading: isUploadingPhoto }] = useUploadCvPhotoMutation();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? "ফাইলের আকার ৫ মেগাবাইটের নিচে হতে হবে" : "File size must be under 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(isBn ? "অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন" : "Please select an image file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await uploadPhotoMutation(formData).unwrap();
      const photoPath = res?.data?.photoPath || res?.data?.url || res?.data?.relativePath;
      if (photoPath) {
        updatePersonalInfo("photoUrl", photoPath);
        toast.success(isBn ? "ছবি সফলভাবে আপলোড করা হয়েছে" : "Photo uploaded successfully");
      }
    } catch (err: any) {
      // Local preview fallback if offline or guest user
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updatePersonalInfo("photoUrl", event.target.result as string);
          toast.success(isBn ? "ছবি যুক্ত করা হয়েছে" : "Photo added");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Work Experience Handlers
  const addWorkExp = () => {
    onChange({
      ...cv,
      workExperience: [
        ...(cv.workExperience || []),
        { company: "", position: "", location: "", startDate: "", endDate: "", isCurrent: false, responsibilities: "", achievements: "" },
      ],
    });
  };

  const updateWorkExp = (index: number, field: keyof IWorkExperience, value: any) => {
    const updated = [...(cv.workExperience || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, workExperience: updated });
  };

  const removeWorkExp = (index: number) => {
    const updated = (cv.workExperience || []).filter((_, i) => i !== index);
    onChange({ ...cv, workExperience: updated });
  };

  // Education Handlers
  const addEducation = () => {
    onChange({
      ...cv,
      education: [
        ...(cv.education || []),
        { institution: "", degree: "", fieldOfStudy: "", location: "", startDate: "", endDate: "", isCurrent: false, grade: "", description: "" },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof IEducation, value: any) => {
    const updated = [...(cv.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = (cv.education || []).filter((_, i) => i !== index);
    onChange({ ...cv, education: updated });
  };

  // Skill Handlers
  const addSkill = () => {
    onChange({
      ...cv,
      skills: [...(cv.skills || []), { name: "", level: "Intermediate", category: "General" }],
    });
  };

  const updateSkill = (index: number, field: keyof ISkill, value: string) => {
    const updated = [...(cv.skills || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, skills: updated });
  };

  const removeSkill = (index: number) => {
    const updated = (cv.skills || []).filter((_, i) => i !== index);
    onChange({ ...cv, skills: updated });
  };

  // Project Handlers
  const addProject = () => {
    onChange({
      ...cv,
      projects: [...(cv.projects || []), { title: "", role: "", techStack: "", description: "", link: "" }],
    });
  };

  const updateProject = (index: number, field: keyof IProject, value: string) => {
    const updated = [...(cv.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, projects: updated });
  };

  const removeProject = (index: number) => {
    const updated = (cv.projects || []).filter((_, i) => i !== index);
    onChange({ ...cv, projects: updated });
  };

  // Certification Handlers
  const addCert = () => {
    onChange({
      ...cv,
      certifications: [...(cv.certifications || []), { name: "", issuer: "", issueDate: "", credentialId: "", url: "" }],
    });
  };

  const updateCert = (index: number, field: keyof ICertification, value: string) => {
    const updated = [...(cv.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, certifications: updated });
  };

  const removeCert = (index: number) => {
    const updated = (cv.certifications || []).filter((_, i) => i !== index);
    onChange({ ...cv, certifications: updated });
  };

  // Language Handlers
  const addLang = () => {
    onChange({
      ...cv,
      languages: [...(cv.languages || []), { language: "", proficiency: "Fluent" }],
    });
  };

  const updateLang = (index: number, field: keyof ILanguage, value: string) => {
    const updated = [...(cv.languages || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, languages: updated });
  };

  const removeLang = (index: number) => {
    const updated = (cv.languages || []).filter((_, i) => i !== index);
    onChange({ ...cv, languages: updated });
  };

  const tabs = [
    { id: "personalInfo", label: isBn ? "ব্যক্তিগত তথ্য" : "Personal Info", icon: <User size={16} /> },
    { id: "summary", label: isBn ? "সারসংক্ষেপ" : "Summary", icon: <FileText size={16} /> },
    { id: "careerObjective", label: isBn ? "অবজেক্টিভ" : "Objective", icon: <Target size={16} /> },
    { id: "workExperience", label: isBn ? "অভিজ্ঞতা" : "Experience", icon: <Briefcase size={16} /> },
    { id: "education", label: isBn ? "শিক্ষা" : "Education", icon: <GraduationCap size={16} /> },
    { id: "skills", label: isBn ? "দক্ষতা" : "Skills", icon: <Wrench size={16} /> },
    { id: "projects", label: isBn ? "প্রকল্প" : "Projects", icon: <FolderGit2 size={16} /> },
    { id: "certifications", label: isBn ? "সার্টিফিকেট" : "Certifications", icon: <Award size={16} /> },
    { id: "languages", label: isBn ? "ভাষা" : "Languages", icon: <Globe size={16} /> },
  ];

  const currentCfg = getSectionConfig(activeTab);

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const prevTab = activeIndex > 0 ? tabs[activeIndex - 1] : null;
  const nextTab = activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
      {/* Tab Selector Bar with Scroll Control Arrows */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => scrollTabs("left")}
          className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-sm"
          title="Scroll Left"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={tabsRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x touch-pan-x scroll-smooth flex-1 py-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 snap-start shrink-0 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollTabs("right")}
          className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-sm"
          title="Scroll Right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Helpful Instructions & Tips Drawer */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
            <HelpCircle size={16} />
            <span>{isBn ? currentCfg.nameBn : currentCfg.nameEn} — {isBn ? "সহায়ক নির্দেশিকা ও টিপস" : "Instructions & Tips"}</span>
          </div>
          <button
            onClick={() => toggleTip(activeTab)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center gap-1 font-semibold"
          >
            <span>{showTips[activeTab] ? "Hide Tips" : "View Tips"}</span>
            {showTips[activeTab] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {isBn ? currentCfg.instructionsBn : currentCfg.instructionsEn}
        </p>

        {showTips[activeTab] && (
          <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-900/50 space-y-2 text-xs text-slate-700 dark:text-slate-200 animate-fade-in">
            {currentCfg.tipEn && (
              <p>
                <strong className="text-blue-600 dark:text-blue-400">💡 Pro Tip:</strong>{" "}
                {isBn ? currentCfg.tipBn : currentCfg.tipEn}
              </p>
            )}
            {currentCfg.exampleEn && (
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="font-bold text-slate-500 block mb-1">Example Reference:</span>
                <span className="italic text-slate-600 dark:text-slate-300">
                  {isBn ? currentCfg.exampleBn : currentCfg.exampleEn}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Form Sections */}

      {/* 1. Personal Info */}
      {activeTab === "personalInfo" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                value={cv.personalInfo?.fullName || ""}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                placeholder="e.g. Rahim Ahmed"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Job Title *</label>
              <input
                type="text"
                value={cv.personalInfo?.jobTitle || ""}
                onChange={(e) => updatePersonalInfo("jobTitle", e.target.value)}
                placeholder="e.g. Senior Structural Engineer"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={cv.personalInfo?.email || ""}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="rahim@example.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                value={cv.personalInfo?.phone || ""}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+880 1700000000"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Address</label>
              <input
                type="text"
                value={cv.personalInfo?.address || ""}
                onChange={(e) => updatePersonalInfo("address", e.target.value)}
                placeholder="Dhaka, Bangladesh"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? "প্রোফাইল ছবি (অপশনাল)" : "Profile Picture (Optional)"}
              </label>
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                {cv.personalInfo?.photoUrl ? (
                  <div className="relative group shrink-0">
                    <img
                      src={getImageUrl(cv.personalInfo.photoUrl)}
                      alt="Profile Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => updatePersonalInfo("photoUrl", "")}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-transform hover:scale-110"
                      title="Remove Photo"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <Camera size={20} />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    type="file"
                    id="cv-photo-file-input"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="cv-photo-file-input"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
                        isUploadingPhoto
                          ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      }`}
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>{isBn ? "আপলোড হচ্ছে..." : "Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>
                            {cv.personalInfo?.photoUrl
                              ? isBn
                                ? "ছবি পরিবর্তন"
                                : "Change Photo"
                              : isBn
                              ? "ছবি আপলোড"
                              : "Upload Photo"}
                          </span>
                        </>
                      )}
                    </label>
                    {cv.personalInfo?.photoUrl && (
                      <button
                        type="button"
                        onClick={() => updatePersonalInfo("photoUrl", "")}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      >
                        {isBn ? "মুছে ফেলুন" : "Remove"}
                      </button>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-500 truncate">
                    {isBn ? "JPG, PNG বা WEBP (সর্বোচ্চ ৫MB)" : "JPG, PNG or WEBP (Max 5MB)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={cv.personalInfo?.linkedin || ""}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                placeholder="linkedin.com/in/rahim"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile</label>
              <input
                type="text"
                value={cv.personalInfo?.github || ""}
                onChange={(e) => updatePersonalInfo("github", e.target.value)}
                placeholder="github.com/rahim"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Website / Portfolio</label>
              <input
                type="text"
                value={cv.personalInfo?.website || ""}
                onChange={(e) => updatePersonalInfo("website", e.target.value)}
                placeholder="rahim portfolio.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Summary */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Professional Summary Text
            </label>
            <button
              onClick={() =>
                onOpenAi("enhanceSummary", cv.personalInfo?.summary, (res) =>
                  updatePersonalInfo("summary", res)
                )
              }
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all hover:scale-105"
            >
              <Sparkles size={14} />
              <span>Enhance Summary with AI</span>
            </button>
          </div>
          <textarea
            rows={6}
            value={cv.personalInfo?.summary || ""}
            onChange={(e) => updatePersonalInfo("summary", e.target.value)}
            placeholder="Write a concise overview of your background, experience, and core skills..."
            className="w-full p-4 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>
      )}

      {/* 3. Career Objective */}
      {activeTab === "careerObjective" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Career Objective Statement
            </label>
            <button
              onClick={() =>
                onOpenAi("generateObjective", cv.personalInfo?.jobTitle, (res) =>
                  updatePersonalInfo("careerObjective", res)
                )
              }
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all hover:scale-105"
            >
              <Sparkles size={14} />
              <span>Generate Objective with AI</span>
            </button>
          </div>
          <textarea
            rows={5}
            value={cv.personalInfo?.careerObjective || ""}
            onChange={(e) => updatePersonalInfo("careerObjective", e.target.value)}
            placeholder="State your immediate career goals and how you aim to add value to target employers..."
            className="w-full p-4 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>
      )}

      {/* 4. Work Experience */}
      {activeTab === "workExperience" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Work Experience Entries ({cv.workExperience?.length || 0})
            </h3>
            <button
              onClick={addWorkExp}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow shadow-blue-500/20"
            >
              <Plus size={14} />
              <span>Add Position</span>
            </button>
          </div>

          {(cv.workExperience || []).map((exp, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 relative"
            >
              <button
                onClick={() => removeWorkExp(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateWorkExp(idx, "company", e.target.value)}
                    placeholder="e.g. Structural Consultancy"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Job Title / Position *</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateWorkExp(idx, "position", e.target.value)}
                    placeholder="e.g. Project Lead Engineer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={exp.location || ""}
                    onChange={(e) => updateWorkExp(idx, "location", e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate || ""}
                    onChange={(e) => updateWorkExp(idx, "startDate", e.target.value)}
                    placeholder="Jan 2021"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                  <input
                    type="text"
                    disabled={exp.isCurrent}
                    value={exp.isCurrent ? "Present" : exp.endDate || ""}
                    onChange={(e) => updateWorkExp(idx, "endDate", e.target.value)}
                    placeholder="Dec 2023"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-${idx}`}
                  checked={!!exp.isCurrent}
                  onChange={(e) => updateWorkExp(idx, "isCurrent", e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor={`current-${idx}`} className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Currently working in this role
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Responsibilities & Accomplishments</label>
                  <button
                    onClick={() =>
                      onOpenAi("generateWorkExperienceBullets", `${exp.position} at ${exp.company}: ${exp.responsibilities}`, (res) =>
                        updateWorkExp(idx, "responsibilities", res)
                      )
                    }
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:underline"
                  >
                    <Sparkles size={12} />
                    <span>Generate Bullets with AI</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={exp.responsibilities || ""}
                  onChange={(e) => updateWorkExp(idx, "responsibilities", e.target.value)}
                  placeholder="• Managed team of 10 structural draftsmen...\n• Designed structural framework reducing cost by 15%..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Education */}
      {activeTab === "education" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Education History ({cv.education?.length || 0})
            </h3>
            <button
              onClick={addEducation}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow shadow-blue-500/20"
            >
              <Plus size={14} />
              <span>Add Degree</span>
            </button>
          </div>

          {(cv.education || []).map((edu, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 relative"
            >
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Degree / Qualification *</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                    placeholder="e.g. B.Sc. in Civil Engineering"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Institution / University *</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="e.g. BUET / University Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={edu.startDate || ""}
                    onChange={(e) => updateEducation(idx, "startDate", e.target.value)}
                    placeholder="2016"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                  <input
                    type="text"
                    value={edu.endDate || ""}
                    onChange={(e) => updateEducation(idx, "endDate", e.target.value)}
                    placeholder="2020"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Grade / CGPA</label>
                  <input
                    type="text"
                    value={edu.grade || ""}
                    onChange={(e) => updateEducation(idx, "grade", e.target.value)}
                    placeholder="3.85 / 4.00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Skills */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Skills & Expertise ({cv.skills?.length || 0})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onOpenAi("improveSkills", cv.personalInfo?.jobTitle, (res) => {
                    const newSkills = res.split(",").map((s) => ({ name: s.trim(), level: "Intermediate" }));
                    onChange({ ...cv, skills: [...(cv.skills || []), ...newSkills] });
                  })
                }
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow shadow-purple-500/20"
              >
                <Sparkles size={12} />
                <span>AI Skill Suggestions</span>
              </button>
              <button
                onClick={addSkill}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow shadow-blue-500/20"
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(cv.skills || []).map((skill, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(idx, "name", e.target.value)}
                  placeholder="Skill name e.g. ETABS"
                  className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/30 outline-none"
                />
                <select
                  value={skill.level || "Intermediate"}
                  onChange={(e) => updateSkill(idx, "level", e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 shrink-0 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  onClick={() => removeSkill(idx)}
                  className="text-red-500 hover:text-red-700 p-1 shrink-0 transition-transform hover:scale-110"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Projects */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Projects ({cv.projects?.length || 0})
            </h3>
            <button
              onClick={addProject}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow shadow-blue-500/20"
            >
              <Plus size={14} />
              <span>Add Project</span>
            </button>
          </div>

          {(cv.projects || []).map((proj, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 relative"
            >
              <button
                onClick={() => removeProject(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(idx, "title", e.target.value)}
                    placeholder="25-Story High Rise Building Design"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Your Role / Tech Stack</label>
                  <input
                    type="text"
                    value={proj.techStack || ""}
                    onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                    placeholder="AutoCAD, ETABS, Revit"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Project Link (Optional)</label>
                <input
                  type="text"
                  value={proj.link || ""}
                  onChange={(e) => updateProject(idx, "link", e.target.value)}
                  placeholder="https://github.com/project-link"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Project Description</label>
                <textarea
                  rows={2}
                  value={proj.description || ""}
                  onChange={(e) => updateProject(idx, "description", e.target.value)}
                  placeholder="Detailed description of project outcome..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. Certifications */}
      {activeTab === "certifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Certifications & Credentials ({cv.certifications?.length || 0})
            </h3>
            <button
              onClick={addCert}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow shadow-blue-500/20"
            >
              <Plus size={14} />
              <span>Add Certification</span>
            </button>
          </div>

          {(cv.certifications || []).map((cert, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
            >
              <input
                type="text"
                value={cert.name}
                onChange={(e) => updateCert(idx, "name", e.target.value)}
                placeholder="Certification Name e.g. CSWA"
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="text"
                value={cert.issuer || ""}
                onChange={(e) => updateCert(idx, "issuer", e.target.value)}
                placeholder="Issuing Organization"
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cert.issueDate || ""}
                  onChange={(e) => updateCert(idx, "issueDate", e.target.value)}
                  placeholder="Date e.g. 2023"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={() => removeCert(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 9. Languages */}
      {activeTab === "languages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Languages ({cv.languages?.length || 0})
            </h3>
            <button
              onClick={addLang}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow shadow-blue-500/20"
            >
              <Plus size={14} />
              <span>Add Language</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(cv.languages || []).map((lang, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => updateLang(idx, "language", e.target.value)}
                  placeholder="Language e.g. English"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
                <select
                  value={lang.proficiency || "Fluent"}
                  onChange={(e) => updateLang(idx, "proficiency", e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Basic">Basic</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
                <button
                  onClick={() => removeLang(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Step Navigation Footer */}
      <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => prevTab && setActiveTab(prevTab.id)}
          disabled={!prevTab}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <ArrowLeft size={15} />
          <span>{prevTab ? (isBn ? `পূর্ববর্তী: ${prevTab.label}` : `Previous: ${prevTab.label}`) : (isBn ? "প্রথম ধাপ" : "First Step")}</span>
        </button>

        <button
          type="button"
          onClick={() => nextTab && setActiveTab(nextTab.id)}
          disabled={!nextTab}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{nextTab ? (isBn ? `পরবর্তী: ${nextTab.label}` : `Next: ${nextTab.label}`) : (isBn ? "সম্পূর্ণ" : "Completed")}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
