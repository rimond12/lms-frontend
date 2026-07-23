"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import {
  useGetCvBuilderCmsQuery,
  useSaveCvMutation,
  useGenerateCvAiContentMutation,
} from "@/app/redux/api/cvBuilderApi/cvBuilderApi";
import { IUserCv } from "@/types/cvBuilder.types";
import { CvForm } from "@/components/cvBuilder/CvForm";
import { CvPreview } from "@/components/cvBuilder/CvPreview";
import { CvAiModal } from "@/components/cvBuilder/CvAiModal";
import { CvExportButton } from "@/components/cvBuilder/CvExportButton";
import {
  Sparkles,
  Save,
  Eye,
  Edit,
  Palette,
  LayoutTemplate,
  CheckCircle,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_CV: IUserCv = {
  title: "Professional CV",
  templateId: "modern",
  accentColor: "#1a4da1",
  isDraft: true,
  personalInfo: {
    fullName: "Rahim Ahmed",
    jobTitle: "Senior Structural Engineer",
    email: "rahim.engineer@example.com",
    phone: "+880 1712 345678",
    address: "Dhaka, Bangladesh",
    website: "https://rahim-engineering.com",
    linkedin: "linkedin.com/in/rahim-ahmed",
    github: "github.com/rahim-immigrant",
    photoUrl: "",
    summary:
      "Results-oriented Structural & Civil Engineer with 6+ years of experience managing complex building projects, structural analysis, and BIM modeling. Adept in ETABS, AutoCAD, Revit, and project compliance.",
    careerObjective:
      "To leverage extensive structural engineering expertise and modern BIM modeling to contribute to international infrastructure and building projects.",
  },
  workExperience: [
    {
      company: "Structural Consultancy",
      position: "Lead Structural Engineer",
      location: "Dhaka, Bangladesh",
      startDate: "Jan 2021",
      endDate: "Present",
      isCurrent: true,
      responsibilities:
        "• Led structural analysis and detailing for 15+ multi-story residential and commercial towers.\n• Coordinated with architectural and MEP teams to resolve BIM clash detections.\n• Supervised site execution, structural load testing, and quality control audits.",
      achievements: "Reduced structural steel consumption by 12% through ETABS design optimization.",
    },
  ],
  education: [
    {
      institution: "Bangladesh University of Engineering and Technology (BUET)",
      degree: "B.Sc. in Civil Engineering",
      location: "Dhaka, Bangladesh",
      startDate: "2016",
      endDate: "2020",
      grade: "3.82 / 4.00",
      description: "Focused on Structural Analysis, Concrete Technology, and Geotechnical Engineering.",
    },
  ],
  skills: [
    { name: "AutoCAD", level: "Expert", category: "Software" },
    { name: "ETABS & SAFE", level: "Expert", category: "Software" },
    { name: "Revit Structure", level: "Advanced", category: "BIM" },
    { name: "Project Management", level: "Advanced", category: "General" },
    { name: "Site Inspection & Audits", level: "Advanced", category: "General" },
  ],
  projects: [
    {
      title: "25-Story Commercial Tower Structural Design",
      role: "Lead Structural Engineer",
      techStack: "ETABS, SAFE, AutoCAD",
      description:
        "Designed wind and earthquake-resistant reinforced concrete structure complying with BNBC and ACI codes.",
      link: "https://example.com/project-1",
    },
  ],
  certifications: [
    {
      name: "SolidWorks Professional (CSWP)",
      issuer: "Dassault Systèmes",
      issueDate: "2023",
    },
    {
      name: "Project Management Professional (PMP)",
      issuer: "PMI",
      issueDate: "2024",
    },
  ],
  languages: [
    { language: "Bengali", proficiency: "Native" },
    { language: "English", proficiency: "Fluent" },
  ],
  customSections: [],
};

const ACCENT_COLORS = [
  { name: "Royal Blue", hex: "#1a4da1" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Slate Navy", hex: "#0f172a" },
  { name: "Sky Blue", hex: "#0284c7" },
  { name: "Purple Accent", hex: "#7c3aed" },
];

const TEMPLATES = [
  { id: "modern", name: "Modern" },
  { id: "executive", name: "Executive" },
  { id: "minimalist", name: "Minimalist" },
  { id: "tech", name: "Tech / Eng" },
];

export default function CvBuilderPage() {
  const locale = useLocale();
  const previewRef = useRef<HTMLDivElement>(null);

  const { data: cmsData } = useGetCvBuilderCmsQuery();
  const [saveCv, { isLoading: isSaving }] = useSaveCvMutation();
  const [generateAi, { isLoading: isAiLoading }] = useGenerateCvAiContentMutation();

  const [cv, setCv] = useState<IUserCv>(INITIAL_CV);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiOriginalText, setAiOriginalText] = useState("");
  const [aiSuggestedText, setAiSuggestedText] = useState("");
  const [aiApplyCallback, setAiApplyCallback] = useState<((text: string) => void) | null>(null);

  // Auto-Save Draft to LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("cv_builder_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let modified = false;
        if (parsed.workExperience) {
          parsed.workExperience = parsed.workExperience.map((exp: any) => {
            if (exp.company && (/CADD|CADD CORE/i.test(exp.company) || /Immigrant Jobs World/i.test(exp.company))) {
              modified = true;
              return { ...exp, company: "Structural Consultancy" };
            }
            return exp;
          });
        }
        if (parsed.personalInfo?.github && /rahim-cad/i.test(parsed.personalInfo.github)) {
          parsed.personalInfo.github = parsed.personalInfo.github.replace(/rahim-cad/gi, "rahim-dev");
          modified = true;
        }
        if (modified) {
          localStorage.setItem("cv_builder_draft", JSON.stringify(parsed));
        }
        setCv(parsed);
      } catch (e) {
        console.error("Failed to parse local draft", e);
      }
    }
  }, []);

  const handleResetSample = () => {
    setCv(INITIAL_CV);
    localStorage.setItem("cv_builder_draft", JSON.stringify(INITIAL_CV));
    toast.success("Sample CV reset to default!");
  };

  const handleCvChange = (updated: IUserCv) => {
    setCv(updated);
    localStorage.setItem("cv_builder_draft", JSON.stringify(updated));
  };

  // Explicit Save to Database / LocalStorage
  const handleSaveDraft = async () => {
    try {
      localStorage.setItem("cv_builder_draft", JSON.stringify(cv));
      const res = await saveCv(cv).unwrap();
      if (res?.data?._id) {
        setCv((prev) => ({ ...prev, _id: res.data._id }));
      }
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("CV saved successfully!");
    } catch (err) {
      // Guest or offline save
      localStorage.setItem("cv_builder_draft", JSON.stringify(cv));
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Draft saved locally!");
    }
  };

  // Open AI Assistant Trigger
  const handleOpenAi = async (
    action: "enhanceSummary" | "generateObjective" | "generateWorkExperienceBullets" | "improveSkills" | "generalAssistant",
    inputText?: string,
    onApply?: (resultText: string) => void
  ) => {
    setAiOriginalText(inputText || "");
    setAiSuggestedText("Generating AI recommendations...");
    setAiApplyCallback(() => onApply || null);
    setAiModalOpen(true);

    try {
      const res = await generateAi({
        action,
        inputText,
        contextData: { jobTitle: cv.personalInfo?.jobTitle },
        language: locale === "bn" ? "bn" : "en",
      }).unwrap();

      if (res?.data?.result) {
        setAiSuggestedText(res.data.result);
      }
    } catch (err: any) {
      toast.error("AI service error. Please try again.");
      setAiSuggestedText(inputText || "");
    }
  };

  const sectionsConfig = cmsData?.data?.sections || [];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* Top Header Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                AI-Powered CV Builder
              </h1>
              <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                <span>Create professional ATS-friendly CVs with AI assistance</span>
                {lastSaved && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle size={12} /> Saved at {lastSaved}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Tools Toolbar */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto">
            {/* Color Accent Picker */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
              <Palette size={15} className="text-slate-500 ml-1" />
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleCvChange({ ...cv, accentColor: c.hex })}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all ${
                    cv.accentColor === c.hex ? "scale-125 ring-2 ring-blue-500 ring-offset-1" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Template Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto max-w-full">
              <LayoutTemplate size={15} className="text-slate-500 ml-1.5 shrink-0 hidden sm:inline" />
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleCvChange({ ...cv, templateId: t.id })}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    cv.templateId === t.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              {/* Reset Sample */}
              <button
                onClick={handleResetSample}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                title="Reset to default sample data"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Save Draft */}
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all hover:scale-105"
              >
                <Save size={14} />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Draft"}</span>
              </button>

              {/* PDF Export */}
              <CvExportButton previewRef={previewRef} cvTitle={cv.personalInfo?.fullName || "My_CV"} />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Screen Section Toggle (Form vs Preview) */}
        <div className="flex lg:hidden items-center justify-center p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <button
            onClick={() => setMobileView("form")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mobileView === "form"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Edit size={15} />
            <span>Fill CV Form</span>
          </button>
          <button
            onClick={() => setMobileView("preview")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mobileView === "preview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Eye size={15} />
            <span>Live CV Preview</span>
          </button>
        </div>

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Interactive Form */}
          <div
            className={`lg:col-span-6 space-y-6 ${
              mobileView === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            <CvForm
              cv={cv}
              onChange={handleCvChange}
              sectionsConfig={sectionsConfig}
              onOpenAi={handleOpenAi}
              locale={locale}
            />
          </div>

          {/* Right Side: Live Preview */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-24 ${
              mobileView === "form" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileCheck size={16} className="text-emerald-500" />
                Real-Time Live CV Preview
              </span>
              <span className="text-[11px] text-slate-400 italic">
                Template: <strong className="uppercase text-slate-700 dark:text-slate-200">{cv.templateId}</strong>
              </span>
            </div>
            <CvPreview cv={cv} previewRef={previewRef} />
          </div>
        </div>
      </div>

      {/* AI Modal */}
      <CvAiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        originalText={aiOriginalText}
        suggestedText={aiSuggestedText}
        isLoading={isAiLoading}
        onAccept={(appliedText) => {
          if (aiApplyCallback) {
            aiApplyCallback(appliedText);
          }
        }}
      />
    </div>
  );
}
