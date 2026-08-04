"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsSectionMutation,
  useUploadLandingPageCmsImageMutation,
  ILandingPageCMS,
  IHeroSlide,
  IServiceItem,
  IOurServiceItem,
  ITrainingPoint,
  IPartnerLogo,
  IImmigrantJobFeature,
  IImmigrantJobType,
  IOfflineCourse,
} from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { toast } from "react-hot-toast";
import {
  Save, Plus, Trash2, Loader2, Image as ImageIcon,
  BarChart3, Globe, Settings, Users, BookOpen,
  Briefcase, Star, Layout, Upload, X,
} from "lucide-react";

// ─── Shared UI Primitives ──────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
);

const Input = ({
  value, onChange, placeholder, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4da1]/20 focus:border-[#1a4da1] bg-white transition-all"
  />
);

const Textarea = ({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4da1]/20 focus:border-[#1a4da1] bg-white transition-all resize-none"
  />
);

const SectionCard = ({
  title, icon: Icon, children,
}: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
      <div className="w-8 h-8 rounded-lg bg-[#1a4da1] flex items-center justify-center">
        <Icon size={16} className="text-white" />
      </div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SaveButton = ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a4da1] hover:bg-[#133a7a] text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
    {loading ? "Saving..." : "Save Changes"}
  </button>
);

const AddRowBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs font-semibold text-[#1a4da1] hover:text-[#133a7a] mt-3"
  >
    <Plus size={14} /> {label}
  </button>
);

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
  >
    <Trash2 size={14} />
  </button>
);

// ─── EN/BN Side-by-Side Field helper ─────────────────────────────
function BilingualField({
  label,
  enValue, onEnChange, enPlaceholder,
  bnValue, onBnChange, bnPlaceholder,
  multiline = false,
}: {
  label: string;
  enValue: string;
  onEnChange: (v: string) => void;
  enPlaceholder?: string;
  bnValue: string;
  onBnChange: (v: string) => void;
  bnPlaceholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">EN</span>
          </div>
          {multiline
            ? <Textarea value={enValue} onChange={onEnChange} placeholder={enPlaceholder} rows={2} />
            : <Input value={enValue} onChange={onEnChange} placeholder={enPlaceholder} />}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-extrabold text-green-700 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded">BN</span>
            <span className="text-[9px] text-slate-400">বাংলা</span>
          </div>
          {multiline
            ? <Textarea value={bnValue} onChange={onBnChange} placeholder={bnPlaceholder} rows={2} />
            : <Input value={bnValue} onChange={onBnChange} placeholder={bnPlaceholder} />}
        </div>
      </div>
    </div>
  );
}

// ─── Section Header Banner Helper ─────────────────────────────────
const SectionHeader = ({
  step,
  title,
  subLabel,
  locationHint,
  description,
  icon: Icon,
  onLoadDefaults,
}: {
  step: number;
  title: string;
  subLabel: string;
  locationHint: string;
  description: string;
  icon: React.ElementType;
  onLoadDefaults?: () => void;
}) => (
  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1a4da1] to-blue-900 text-white shadow-md mb-6 relative overflow-hidden">
    <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
          <Icon size={24} className="text-blue-200" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/40 text-blue-100 px-2.5 py-0.5 rounded-full border border-blue-400/30">
              SECTION #{step} ON HOMEPAGE
            </span>
            <span className="text-[11px] text-blue-200 font-semibold flex items-center gap-1">
              📍 Location: {locationHint}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {title}
            <span className="text-xs font-normal text-blue-200 bg-white/10 px-2 py-0.5 rounded-md">
              {subLabel}
            </span>
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed max-w-3xl">
            {description}
          </p>
        </div>
      </div>
      {onLoadDefaults && (
        <button
          type="button"
          onClick={onLoadDefaults}
          className="shrink-0 text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start md:self-center shadow-sm"
        >
          ✨ Fill Default Text
        </button>
      )}
    </div>
  </div>
);

const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL || "";

function resolveImageUrl(value: string): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return `${FILE_URL}/${value}`;
}

function CmsImageUpload({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [uploadImage, { isLoading }] = useUploadLandingPageCmsImageMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files are allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await uploadImage(fd).unwrap();
      onChange(res.data.imagePath);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const preview = resolveImageUrl(value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Input value={value} onChange={onChange} placeholder="/images/hero.jpg or https://..." />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#1a4da1] hover:bg-[#133a7a] text-white rounded-lg transition-all disabled:opacity-60 whitespace-nowrap"
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="preview"
            className="h-20 w-auto max-w-full object-cover rounded-lg border border-slate-200"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab definitions ───────────────────────────────────────────────

export interface ITabConfig {
  id: string;
  step: number;
  label: string;
  subLabel: string;
  locationHint: string;
  description: string;
  icon: React.ElementType;
}

const TABS: ITabConfig[] = [
  {
    id: "hero",
    step: 1,
    label: "1. Hero Banner & Features",
    subLabel: "Top Banner Section",
    locationHint: "Top of Landing Page",
    description: "Controls the main hero background slider images, primary headline, subtitle, and the 6 quick feature buttons (JOBS, Technical Training, CV, Visa, Language, Consultancy).",
    icon: Layout,
  },
  {
    id: "immigrantJobsSection",
    step: 2,
    label: "2. Immigrant Jobs World",
    subLabel: "Jobs Search & Listings",
    locationHint: "2nd Section (Under Hero)",
    description: "Controls the Aviation & Overseas Jobs section header, featured jobs badges, 'Why Job Seekers Choose Us' 4 feature cards, Employment Types (Full-time/Part-time/Internship), and bottom CTA banner.",
    icon: Briefcase,
  },
  {
    id: "services",
    step: 3,
    label: "3. Recruitment Solutions",
    subLabel: "Overseas Career Services",
    locationHint: "3rd Section",
    description: "Controls the recruitment solutions badge, main headline ('Complete Recruitment Solutions to Build Your Career Abroad'), and the 6 recruitment service cards.",
    icon: Globe,
  },
  {
    id: "courseModules",
    step: 4,
    label: "4. Course Programs",
    subLabel: "Online & Offline Masterclass",
    locationHint: "4th Section",
    description: "Controls the course section titles, category tab labels (Online vs. Offline Courses), and the list of offline classroom masterclasses (duration, pricing, locations, timings).",
    icon: BookOpen,
  },
  {
    id: "ourServices",
    step: 5,
    label: "5. Key Services & Support",
    subLabel: "24/7 Support & Library",
    locationHint: "5th Section",
    description: "Controls the key services grid (24/7 Support, Digital Library, Job Placement, Classroom Resources, On-Job Training, Certificates).",
    icon: Settings,
  },
  {
    id: "trainingSection",
    step: 6,
    label: "6. Training Center & Program",
    subLabel: "Practical Skill Center",
    locationHint: "6th Section",
    description: "Controls the Training Program badge, main title, subheading, left column feature points (Work Skills, Language, Culture), main blue certified center card, and schedule cards.",
    icon: BookOpen,
  },
  {
    id: "ourJourney",
    step: 7,
    label: "7. Partners & Clients",
    subLabel: "Scrolling Logo Marquees",
    locationHint: "7th Section",
    description: "Controls the partner marquee section title, subtitle, and logo items across 3 continuous scrolling marquee rows.",
    icon: Users,
  },
  {
    id: "applySection",
    step: 8,
    label: "8. Direct Application Form",
    subLabel: "Candidate Lead Form & Map",
    locationHint: "8th Section",
    description: "Controls the 'Apply Directly' headline, subtitle, global network feature highlights (Global Network, Data Security, Fast Response), and map header text.",
    icon: Star,
  },
  {
    id: "successStories",
    step: 9,
    label: "9. Student Success Stories",
    subLabel: "Testimonials & Share Story",
    locationHint: "9th Section",
    description: "Controls the Success Stories heading, subheading, and the bottom 'Share Your Success Story Abroad' callout box with submit, nominate, and process buttons.",
    icon: Star,
  },
  {
    id: "popularCourses",
    step: 10,
    label: "10. Popular Courses Slider",
    subLabel: "Featured Courses Slider Block",
    locationHint: "Optional Section Block",
    description: "Controls the section title prefix ('Our'), highlighted title ('Popular Courses'), and 'See All Courses' button for the course slider block.",
    icon: BookOpen,
  },
];

// ─── Section Editors ──────────────────────────────────────────────

const DEFAULT_COURSES = [
  { name: "JOBS", sub: "Find Opportunities", iconKey: "FaBriefcase", nameBn: "চাকরি", subBn: "সুযোগ খুঁজুন" },
  { name: "TECHNICAL TRAINING", sub: "Build Skills", iconKey: "FaChalkboardTeacher", nameBn: "টেকনিক্যাল ট্রেনিং", subBn: "দক্ষতা অর্জন" },
  { name: "CV CREATION", sub: "Professional Resume", iconKey: "FaCheckCircle", nameBn: "সিভি তৈরি", subBn: "প্রফেশনাল রিজিউম" },
  { name: "VISA VERIFICATION", sub: "Check Status Safely", iconKey: "FaPassport", nameBn: "ভিসা যাচাইকরণ", subBn: "নিরাপদে যাচাই করুন" },
  { name: "LANGUAGE LEARNING", sub: "Learn New Languages", iconKey: "FaLanguage", nameBn: "ভাষা শিক্ষা", subBn: "নতুন ভাষা শিখুন" },
  { name: "CONSULTANCY", sub: "Expert Guidance", iconKey: "FaHandshake", nameBn: "পরামর্শ", subBn: "বিশেষজ্ঞ গাইডেন্স" },
];

const DEFAULT_HERO: ILandingPageCMS["hero"] = {
  bannerSlides: [{ image: "/images/main-hero.jpeg", altText: "Hero Banner" }],
  headline: "Elevate Your Skills to a Professional Level",
  headlineBn: "নিজের স্কিলকে প্রফেশনাল লেভেলে উন্নীত করুন",
  sub: "Be skilled, move forward — Join today...",
  subBn: "দক্ষ হোন, এগিয়ে যান — আজই জয়েন করুন...",
  courses: DEFAULT_COURSES,
};

function HeroEditor({ data, onSave, saving }: { data: ILandingPageCMS["hero"]; onSave: (d: ILandingPageCMS["hero"]) => void; saving: boolean }) {
  const buildSafeData = (d?: ILandingPageCMS["hero"]): ILandingPageCMS["hero"] => ({
    ...DEFAULT_HERO,
    ...d,
    headline: d?.headline || DEFAULT_HERO.headline,
    headlineBn: d?.headlineBn || DEFAULT_HERO.headlineBn,
    sub: d?.sub || DEFAULT_HERO.sub,
    subBn: d?.subBn || DEFAULT_HERO.subBn,
    bannerSlides: d?.bannerSlides?.length
      ? d.bannerSlides.map((s, i) => ({
          image: s.image || DEFAULT_HERO.bannerSlides[i]?.image || "/images/main-hero.jpeg",
          altText: s.altText || DEFAULT_HERO.bannerSlides[i]?.altText || "Hero Banner",
        }))
      : DEFAULT_HERO.bannerSlides,
    courses: (d?.courses?.length ? d.courses : DEFAULT_HERO.courses).map((c, i) => ({
      name: c.name || DEFAULT_COURSES[i]?.name || "",
      nameBn: c.nameBn || DEFAULT_COURSES[i]?.nameBn || "",
      sub: c.sub || DEFAULT_COURSES[i]?.sub || "",
      subBn: c.subBn || DEFAULT_COURSES[i]?.subBn || "",
      iconKey: c.iconKey || DEFAULT_COURSES[i]?.iconKey || "FaCheckCircle",
    })),
  });

  const [local, setLocal] = useState(() => buildSafeData(data));
  useEffect(() => setLocal(buildSafeData(data)), [data]);

  const fillDefaults = () => {
    setLocal(buildSafeData(undefined));
    toast.success("Loaded default values into Hero fields!");
  };

  const updateSlide = (i: number, key: keyof IHeroSlide, val: string) => {
    const slides = [...local.bannerSlides];
    slides[i] = { ...slides[i], [key]: val };
    setLocal((p) => ({ ...p, bannerSlides: slides }));
  };

  const updateCourse = (i: number, key: string, val: string) => {
    const courses = [...local.courses];
    courses[i] = { ...courses[i], [key]: val };
    setLocal((p) => ({ ...p, courses }));
  };

  const ICON_OPTIONS = [
    // Immigrant Jobs theme
    { value: "FaBriefcase", label: "Briefcase (JOBS)" },
    { value: "FaPassport", label: "Passport (Visa)" },
    { value: "FaPlane", label: "Plane (Relocation)" },
    { value: "FaUserCheck", label: "User Check (Verification)" },
    { value: "FaLanguage", label: "Language (Training)" },
    { value: "FaCheckCircle", label: "Check Circle (Interview)" },
    // General purpose
    { value: "FaHandshake", label: "Handshake" },
    { value: "FaTasks", label: "Tasks" },
    { value: "FaChalkboardTeacher", label: "Chalkboard Teacher" },
    { value: "FaGlobe", label: "Globe" },
    { value: "FaBullseye", label: "Bullseye" },
  ];

  const DEFAULT_COURSES = [
    { name: "JOBS", sub: "Find Opportunities", iconKey: "FaBriefcase", nameBn: "চাকরি", subBn: "সুযোগ খুঁজুন" },
    { name: "TECHNICAL TRAINING", sub: "Build Skills", iconKey: "FaChalkboardTeacher", nameBn: "টেকনিক্যাল ট্রেনিং", subBn: "দক্ষতা অর্জন" },
    { name: "CV CREATION", sub: "Professional Resume", iconKey: "FaCheckCircle", nameBn: "সিভি তৈরি", subBn: "প্রফেশনাল রিজিউম" },
    { name: "VISA VERIFICATION", sub: "Check Status Safely", iconKey: "FaPassport", nameBn: "ভিসা যাচাইকরণ", subBn: "নিরাপদে যাচাই করুন" },
    { name: "LANGUAGE LEARNING", sub: "Learn New Languages", iconKey: "FaLanguage", nameBn: "ভাষা শিক্ষা", subBn: "নতুন ভাষা শিখুন" },
    { name: "CONSULTANCY", sub: "Expert Guidance", iconKey: "FaHandshake", nameBn: "পরামর্শ", subBn: "বিশেষজ্ঞ গাইডেন্স" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        step={1}
        title="Hero Banner & Features"
        subLabel="Top Banner Section"
        locationHint="1st Section (Top of Landing Page)"
        description="Controls the main hero background slider images, primary headline & sub-headline, and the 6 quick feature buttons (JOBS dropdown, Technical Training, CV Creation, Visa Verification, Language Learning, Consultancy)."
        icon={Layout}
        onLoadDefaults={fillDefaults}
      />
      <SectionCard title="Banner Slides" icon={ImageIcon}>
        <div className="space-y-4">
          {local.bannerSlides.map((slide, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <CmsImageUpload label="Banner Image" value={slide.image} onChange={(v) => updateSlide(i, "image", v)} />
                </div>
                {local.bannerSlides.length > 1 && (
                  <RemoveBtn onClick={() => setLocal((p) => ({ ...p, bannerSlides: p.bannerSlides.filter((_, j) => j !== i) }))} />
                )}
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input value={slide.altText || ""} onChange={(v) => updateSlide(i, "altText", v)} placeholder="Banner description" />
              </div>
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, bannerSlides: [...p.bannerSlides, { image: "", altText: "" }] }))} label="Add Slide" />
        </div>
      </SectionCard>

      <SectionCard title="Headline & Subtitle" icon={Layout}>
        <div className="space-y-4">
          <BilingualField
            label="Headline"
            enValue={local.headline} onEnChange={(v) => setLocal((p) => ({ ...p, headline: v }))} enPlaceholder="Elevate Your Skills..."
            bnValue={local.headlineBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headlineBn: v }))} bnPlaceholder="নিজের স্কিলকে প্রফেশনাল লেভেলে..."
          />
          <BilingualField
            label="Subtitle"
            enValue={local.sub} onEnChange={(v) => setLocal((p) => ({ ...p, sub: v }))} enPlaceholder="Be skilled, move forward..."
            bnValue={local.subBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, subBn: v }))} bnPlaceholder="দক্ষ হোন, এগিয়ে যান..."
          />
        </div>
      </SectionCard>

      <SectionCard title="Feature Buttons (6 items shown on hero)" icon={Settings}>
        <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
          <Briefcase size={14} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Item 1</strong> is always the <strong>JOBS</strong> dropdown button (country selector). Items 2–6 are decorative feature buttons.
            The icon key must match exactly (e.g. <code className="bg-blue-100 px-1 rounded">FaBriefcase</code>).
          </p>
        </div>

        {local.courses.length === 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setLocal((p) => ({ ...p, courses: DEFAULT_COURSES }))}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1a4da1] hover:bg-[#133a7a] px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={13} /> Initialize with Defaults
            </button>
            <p className="text-xs text-slate-400 mt-1">Populate all 6 slots with the immigrant-jobs theme defaults.</p>
          </div>
        )}

        <div className="space-y-4">
          {local.courses.map((course, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              {/* Row header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {i === 0 ? "🎯 Button 1 — JOBS Dropdown" : `Button ${i + 1}`}
                </span>
                {local.courses.length > 1 && (
                  <RemoveBtn onClick={() => setLocal((p) => ({ ...p, courses: p.courses.filter((_, j) => j !== i) }))} />
                )}
              </div>

              {/* EN + BN side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* English */}
                <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">EN</span>
                    <span className="text-[10px] text-slate-400">English</span>
                  </div>
                  <div>
                    <Label>Button Label (EN)</Label>
                    <Input value={course.name} onChange={(v) => updateCourse(i, "name", v)} placeholder="e.g. JOBS" />
                  </div>
                  <div>
                    <Label>Sub Text (EN)</Label>
                    <Input value={course.sub} onChange={(v) => updateCourse(i, "sub", v)} placeholder="e.g. Browse by Country" />
                  </div>
                </div>

                {/* Bengali */}
                <div className="space-y-2 p-3 rounded-lg border border-green-100 bg-green-50/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-extrabold text-green-700 uppercase tracking-widest bg-green-100 px-2 py-0.5 rounded">BN</span>
                    <span className="text-[10px] text-slate-400">বাংলা</span>
                  </div>
                  <div>
                    <Label>Button Label (BN)</Label>
                    <Input value={course.nameBn || ""} onChange={(v) => updateCourse(i, "nameBn", v)} placeholder="e.g. চাকরি" />
                  </div>
                  <div>
                    <Label>Sub Text (BN)</Label>
                    <Input value={course.subBn || ""} onChange={(v) => updateCourse(i, "subBn", v)} placeholder="e.g. দেশ অনুযায়ী খুঁজুন" />
                  </div>
                </div>
              </div>

              {/* Icon row */}
              <div className="max-w-md">
                <CmsImageUpload
                  label="Icon (SVG or Transparent PNG Image)"
                  value={course.iconKey || ""}
                  onChange={(v) => updateCourse(i, "iconKey", v)}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Upload a clean SVG or transparent PNG. Or enter a react-icon key name (e.g. <code className="bg-slate-100 px-1 rounded">FaBriefcase</code>).
                </p>
              </div>
            </div>
          ))}
        </div>
        {local.courses.length < 6 && (
          <AddRowBtn
            onClick={() => setLocal((p) => ({
              ...p,
              courses: [...p.courses, { name: "", sub: "", iconKey: "FaCheckCircle" }],
            }))}
            label={`Add Button (${local.courses.length}/6)`}
          />
        )}
      </SectionCard>

      <div className="flex justify-end pt-2">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}


const DEFAULT_SERVICES: ILandingPageCMS["services"] = {
  badge: "Our Services",
  badgeBn: "আমাদের সেবাসমূহ",
  heading1: "Complete Recruitment Solutions",
  heading1Bn: "বিদেশে আপনার ক্যারিয়ার গড়ার জন্য",
  heading2: "to Build Your Career Abroad",
  heading2Bn: "সম্পূর্ণ নিয়োগ সমাধান",
  items: [
    { title: "Overseas Job Placement", titleBn: "বিদেশে চাকরির সুযোগ", description: "We connect you with top companies worldwide and match opportunities to your skills and experience.", descriptionBn: "বিভিন্ন দেশের বড় বড় কোম্পানিতে আপনার দক্ষতা অনুযায়ী চাকরির ব্যবস্থা করা।" },
    { title: "Professional CV Writing", titleBn: "প্রফেশনাল সিভি তৈরি", description: "We craft internationally standard CVs and profiles that make employers notice and shortlist you quickly.", descriptionBn: "আন্তর্জাতিক মানের সিভি এবং প্রোফাইল বানিয়ে দেওয়া, যাতে কোম্পানি আপনাকে সহজেই পছন্দ করে।" },
    { title: "Interview Preparation", titleBn: "ইন্টারভিউ প্রস্তুতি", description: "We fully prepare you for employer interactions and interviews so you walk in with confidence.", descriptionBn: "নিয়োগকর্তার সাথে কথা বলা বা ইন্টারভিউ দেওয়ার জন্য আপনাকে পুরোপুরি তৈরি করা।" },
    { title: "Documentation & Guidance", titleBn: "কাগজপত্রের সমাধান", description: "We provide accurate advice and assistance for visas and all other required documents.", descriptionBn: "ভিসা বা অন্যান্য প্রয়োজনীয় ডকুমেন্টের ব্যাপারে সঠিক পরামর্শ ও সাহায্য দেওয়া।" },
    { title: "Ongoing Support", titleBn: "সব সময়ের পাশে থাকা", description: "From the moment you get the job until you arrive abroad, we are with you every step of the way.", descriptionBn: "চাকরি পাওয়ার পর থেকে শুরু করে বিদেশে পৌঁছানো পর্যন্ত আমরা সব সময় আপনার সাথে আছি।" },
    { title: "Employer Coordination", titleBn: "নিয়োগকর্তার সাথে যোগাযোগ", description: "We ensure smooth and transparent communication between employers and candidates at all times.", descriptionBn: "নিয়োগকর্তা এবং প্রার্থীদের মধ্যে সুষ্ঠু যোগাযোগ ব্যবস্থা নিশ্চিত করা।" },
  ],
};

function ServicesEditor({ data, onSave, saving }: { data: ILandingPageCMS["services"]; onSave: (d: ILandingPageCMS["services"]) => void; saving: boolean }) {
  const buildSafeData = (d?: ILandingPageCMS["services"]): ILandingPageCMS["services"] => ({
    ...DEFAULT_SERVICES,
    ...d,
    badge: d?.badge || DEFAULT_SERVICES.badge,
    badgeBn: (d as any)?.badgeBn || DEFAULT_SERVICES.badgeBn,
    heading1: d?.heading1 || DEFAULT_SERVICES.heading1,
    heading1Bn: (d as any)?.heading1Bn || DEFAULT_SERVICES.heading1Bn,
    heading2: d?.heading2 || DEFAULT_SERVICES.heading2,
    heading2Bn: (d as any)?.heading2Bn || DEFAULT_SERVICES.heading2Bn,
    items: (d?.items?.length ? d.items : DEFAULT_SERVICES.items).map((item, i) => ({
      title: item.title || DEFAULT_SERVICES.items[i]?.title || "",
      titleBn: (item as any).titleBn || DEFAULT_SERVICES.items[i]?.titleBn || "",
      description: item.description || DEFAULT_SERVICES.items[i]?.description || "",
      descriptionBn: (item as any).descriptionBn || DEFAULT_SERVICES.items[i]?.descriptionBn || "",
    })),
  });

  const [local, setLocal] = useState(() => buildSafeData(data));
  useEffect(() => setLocal(buildSafeData(data)), [data]);

  const update = (i: number, key: keyof IServiceItem, val: string) => {
    const items = [...local.items];
    items[i] = { ...items[i], [key]: val };
    setLocal((p) => ({ ...p, items }));
  };

  const fillDefaults = () => {
    setLocal(buildSafeData(undefined));
    toast.success("Loaded default values into Recruitment Services!");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={3}
        title="Recruitment Solutions"
        subLabel="Overseas Career Services"
        locationHint="3rd Section on Landing Page"
        description="Controls the recruitment solutions badge, main headline ('Complete Recruitment Solutions to Build Your Career Abroad'), and the 6 recruitment service cards (Job Placement, CV Writing, Interview Prep, Visa Guidance, etc.)."
        icon={Globe}
        onLoadDefaults={fillDefaults}
      />
      <SectionCard title="Section Heading" icon={Globe}>
        <div className="space-y-4">
          <BilingualField
            label="Badge"
            enValue={local.badge} onEnChange={(v) => setLocal((p) => ({ ...p, badge: v }))} enPlaceholder="Our Services"
            bnValue={(local as any).badgeBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, badgeBn: v } as any))} bnPlaceholder="আমাদের সেবাসমূহ"
          />
          <BilingualField
            label="Heading Line 1"
            enValue={local.heading1} onEnChange={(v) => setLocal((p) => ({ ...p, heading1: v }))} enPlaceholder="Complete Recruitment Solutions"
            bnValue={(local as any).heading1Bn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, heading1Bn: v } as any))} bnPlaceholder="বিদেশে আপনার ক্যারিয়ার গড়ার জন্য"
          />
          <BilingualField
            label="Heading Line 2 (highlighted)"
            enValue={local.heading2} onEnChange={(v) => setLocal((p) => ({ ...p, heading2: v }))} enPlaceholder="to Build Your Career Abroad"
            bnValue={(local as any).heading2Bn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, heading2Bn: v } as any))} bnPlaceholder="সম্পূর্ণ নিয়োগ সমাধান"
          />
        </div>
      </SectionCard>

      <SectionCard title="Service Cards" icon={Settings}>
        <div className="space-y-3">
          {local.items.map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Item {i + 1}</span>
                {local.items.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} />}
              </div>
              <BilingualField
                label="Title"
                enValue={item.title} onEnChange={(v) => update(i, "title", v)} enPlaceholder="Overseas Job Placement"
                bnValue={(item as any).titleBn || ""} onBnChange={(v) => update(i, "titleBn" as any, v)} bnPlaceholder="বিদেশে চাকরির সুযোগ"
              />
              <BilingualField
                label="Description"
                enValue={item.description} onEnChange={(v) => update(i, "description", v)} enPlaceholder="We connect you..."
                bnValue={(item as any).descriptionBn || ""} onBnChange={(v) => update(i, "descriptionBn" as any, v)} bnPlaceholder="বিভিন্ন দেশের বড় বড় কোম্পানিতে..."
                multiline
              />
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, items: [...p.items, { title: "", description: "" }] }))} label="Add Service" />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

const DEFAULT_OUR_SERVICES: ILandingPageCMS["ourServices"] = {
  headingPrefix: "Our",
  headingPrefixBn: "আমাদের",
  headingHighlight: "Services",
  headingHighlightBn: "সেবা সমূহ",
  items: [
    { title: "24/7 Support", titleBn: "২৪/৭ সাপোর্ট", desc: "Round-the-clock support and assistance so your questions are answered quickly at any time.", descBn: "২৪ ঘণ্টা ৭ দিন সার্বক্ষণিক সাপোর্ট ও সহযোগিতা, যাতে আপনার যেকোনো প্রশ্নের দ্রুত সমাধান পাওয়া যায়।" },
    { title: "Online Digital Library", titleBn: "অনলাইন ডিজিটাল লাইব্রেরি", desc: "A digital library with course materials, resources, e-books, and more.", descBn: "ডিজিটাল লাইব্রেরি যেখানে কোর্স ম্যাটেরিয়াল, রিসোর্স, ইবুক ইত্যাদি রয়েছে।" },
    { title: "Job Placement", titleBn: "জব প্লেসমেন্ট", desc: "Job opportunities or internship recommendations upon completing your training.", descBn: "প্রশিক্ষণ শেষে চাকরির সুযোগ বা ইন্টার্নশিপের সুপারিশ প্রদান।" },
    { title: "All Classroom Resources", titleBn: "শ্রেণীকক্ষের সকল রিসোর্স", desc: "Video lectures, slides, notes, and online support — all in one place!", descBn: "ভিডিও লেকচার, স্লাইড, নোট এবং অনলাইন সাপোর্ট—সব এক জায়গায়!" },
    { title: "On-Job Training", titleBn: "অন-জব ট্রেনিং", desc: "Apply for on-job training after completing 70% of your main course.", descBn: "মূল কোর্সের ৭০% সম্পন্ন করার পর অন-জব ট্রেনিংয়ের জন্য আবেদন করতে পারবেন।" },
    { title: "Certificate (National & International)", titleBn: "সার্টিফিকেট (জাতীয় ও আন্তর্জাতিক)", desc: "National and international certificates to recognize and validate your achievements.", descBn: "আপনার সাফল্যকে স্বীকৃতি দিতে জাতীয় ও আন্তর্জাতিক সার্টিফিকেট প্রদান।" },
  ],
};

function OurServicesEditor({ data, onSave, saving }: { data: ILandingPageCMS["ourServices"]; onSave: (d: ILandingPageCMS["ourServices"]) => void; saving: boolean }) {
  const buildSafeData = (d?: ILandingPageCMS["ourServices"]): ILandingPageCMS["ourServices"] => ({
    ...DEFAULT_OUR_SERVICES,
    ...d,
    headingPrefix: d?.headingPrefix || DEFAULT_OUR_SERVICES.headingPrefix,
    headingPrefixBn: (d as any)?.headingPrefixBn || DEFAULT_OUR_SERVICES.headingPrefixBn,
    headingHighlight: d?.headingHighlight || DEFAULT_OUR_SERVICES.headingHighlight,
    headingHighlightBn: (d as any)?.headingHighlightBn || DEFAULT_OUR_SERVICES.headingHighlightBn,
    items: (d?.items?.length ? d.items : DEFAULT_OUR_SERVICES.items).map((item, i) => ({
      title: item.title || DEFAULT_OUR_SERVICES.items[i]?.title || "",
      titleBn: (item as any).titleBn || DEFAULT_OUR_SERVICES.items[i]?.titleBn || "",
      desc: item.desc || DEFAULT_OUR_SERVICES.items[i]?.desc || "",
      descBn: (item as any).descBn || DEFAULT_OUR_SERVICES.items[i]?.descBn || "",
    })),
  });

  const [local, setLocal] = useState(() => buildSafeData(data));
  useEffect(() => setLocal(buildSafeData(data)), [data]);

  const update = (i: number, key: keyof IOurServiceItem, val: string) => {
    const items = [...local.items];
    items[i] = { ...items[i], [key]: val };
    setLocal((p) => ({ ...p, items }));
  };

  const fillDefaults = () => {
    setLocal(buildSafeData(undefined));
    toast.success("Loaded default values into Key Services!");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={5}
        title="Key Services & Support"
        subLabel="Student Support & Resources"
        locationHint="5th Section on Landing Page"
        description="Controls the key services grid featuring 24/7 Support, Digital Library, Job Placement, Classroom Resources, On-Job Training, and National/International Certificates."
        icon={Settings}
        onLoadDefaults={fillDefaults}
      />
      <SectionCard title="Section Heading" icon={Settings}>
        <div className="space-y-4">
          <BilingualField
            label="Prefix"
            enValue={local.headingPrefix} onEnChange={(v) => setLocal((p) => ({ ...p, headingPrefix: v }))} enPlaceholder="Our"
            bnValue={(local as any).headingPrefixBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headingPrefixBn: v } as any))} bnPlaceholder="আমাদের"
          />
          <BilingualField
            label="Highlight"
            enValue={local.headingHighlight} onEnChange={(v) => setLocal((p) => ({ ...p, headingHighlight: v }))} enPlaceholder="Services"
            bnValue={(local as any).headingHighlightBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headingHighlightBn: v } as any))} bnPlaceholder="সেবা সমূহ"
          />
        </div>
      </SectionCard>

      <SectionCard title="Service Items" icon={Settings}>
        <div className="space-y-3">
          {local.items.map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Item {i + 1}</span>
                {local.items.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} />}
              </div>
              <BilingualField
                label="Title"
                enValue={item.title} onEnChange={(v) => update(i, "title", v)} enPlaceholder="24/7 Support"
                bnValue={(item as any).titleBn || ""} onBnChange={(v) => update(i, "titleBn" as any, v)} bnPlaceholder="২৪/৭ সাপোর্ট"
              />
              <BilingualField
                label="Description"
                enValue={item.desc} onEnChange={(v) => update(i, "desc", v)} enPlaceholder="Round-the-clock support..."
                bnValue={(item as any).descBn || ""} onBnChange={(v) => update(i, "descBn" as any, v)} bnPlaceholder="২৪ ঘণ্টা সার্বক্ষণিক সাপোর্ট..."
                multiline
              />
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, items: [...p.items, { title: "", desc: "" }] }))} label="Add Item" />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

const DEFAULT_TRAINING: ILandingPageCMS["trainingSection"] = {
  badge: "Training Program",
  badgeBn: "ট্রেনিং বা প্রশিক্ষণ",
  heading1: "Build Your Skills,",
  heading1Bn: "দক্ষতা অর্জন করুন,",
  heading2: "Shape a Bright Future",
  heading2Bn: "গড়ুন উজ্জ্বল ভবিষ্যৎ",
  subheading: "At our own training center, every candidate is made competent through modern methods.",
  subheadingBn: "আমাদের নিজস্ব ট্রেনিং সেন্টারে আধুনিক পদ্ধতিতে প্রতিটি প্রার্থীকে দক্ষ করে তোলা হয়।",
  points: [
    { title: "Work Skills", titleBn: "কাজের দক্ষতা", description: "Hands-on practical training aligned with international workplace standards.", descriptionBn: "বিদেশের কর্মক্ষেত্রের সাথে সামঞ্জস্যপূর্ণ হাতে-কলমে প্র্যাকটিক্যাল ট্রেনিং।" },
    { title: "Language Learning", titleBn: "ভাষা শেখা", description: "Essential daily language skills to overcome communication barriers abroad.", descriptionBn: "যোগাযোগের ভয় কাটিয়ে উঠতে প্রাত্যহিক জীবনের প্রয়োজনীয় ভাষা শিক্ষা।" },
    { title: "Cultural Awareness", titleBn: "নতুন পরিবেশের জ্ঞান", description: "Full preparation and knowledge about the culture and rules of the destination country.", descriptionBn: "গন্তব্য দেশের সংস্কৃতি ও নিয়ম সম্পর্কে পূর্ণাঙ্গ ধারণা ও প্রস্তুতি।" },
  ],
  mainCard: { title: "Certified Training Center", titleBn: "সার্টিফাইড ট্রেনিং সেন্টার", description: "Your skills are ensured through modern facilities and industry expert trainers.", descriptionBn: "আধুনিক সুবিধা ও ইন্ডাস্ট্রি বিশেষজ্ঞদের মাধ্যমে আপনার দক্ষতা নিশ্চিত করা হয়।", button: "Enrollment Open", buttonBn: "ভর্তি চলছে" },
  cards: [
    { title: "Flexible Schedule", titleBn: "নমনীয় সময়সূচী", description: "Full-time and part-time batches available day or night at your convenience.", descriptionBn: "আপনার সুবিধা অনুযায়ী দিন বা রাতে পূর্ণ ও খণ্ডকালীন ব্যাচ।" },
    { title: "Expert Trainers", titleBn: "বিশেষজ্ঞ ট্রেইনার", description: "Internationally experienced trainers with deep industry expertise.", descriptionBn: "শিল্পে দীর্ঘ অভিজ্ঞতাসম্পন্ন আন্তর্জাতিক মানের প্রশিক্ষকবৃন্দ।" },
  ],
};

function TrainingEditor({ data, onSave, saving }: { data: ILandingPageCMS["trainingSection"]; onSave: (d: ILandingPageCMS["trainingSection"]) => void; saving: boolean }) {
  const buildSafeData = (d?: ILandingPageCMS["trainingSection"]): ILandingPageCMS["trainingSection"] => ({
    ...DEFAULT_TRAINING,
    ...d,
    badge: d?.badge || DEFAULT_TRAINING.badge,
    badgeBn: (d as any)?.badgeBn || DEFAULT_TRAINING.badgeBn,
    heading1: d?.heading1 || DEFAULT_TRAINING.heading1,
    heading1Bn: (d as any)?.heading1Bn || DEFAULT_TRAINING.heading1Bn,
    heading2: d?.heading2 || DEFAULT_TRAINING.heading2,
    heading2Bn: (d as any)?.heading2Bn || DEFAULT_TRAINING.heading2Bn,
    subheading: d?.subheading || DEFAULT_TRAINING.subheading,
    subheadingBn: (d as any)?.subheadingBn || DEFAULT_TRAINING.subheadingBn,
    points: (d?.points?.length ? d.points : DEFAULT_TRAINING.points).map((pt, i) => ({
      title: pt.title || DEFAULT_TRAINING.points[i]?.title || "",
      titleBn: (pt as any).titleBn || DEFAULT_TRAINING.points[i]?.titleBn || "",
      description: pt.description || DEFAULT_TRAINING.points[i]?.description || "",
      descriptionBn: (pt as any).descriptionBn || DEFAULT_TRAINING.points[i]?.descriptionBn || "",
    })),
    mainCard: {
      title: d?.mainCard?.title || DEFAULT_TRAINING.mainCard.title,
      titleBn: (d?.mainCard as any)?.titleBn || DEFAULT_TRAINING.mainCard.titleBn,
      description: d?.mainCard?.description || DEFAULT_TRAINING.mainCard.description,
      descriptionBn: (d?.mainCard as any)?.descriptionBn || DEFAULT_TRAINING.mainCard.descriptionBn,
      button: d?.mainCard?.button || DEFAULT_TRAINING.mainCard.button,
      buttonBn: (d?.mainCard as any)?.buttonBn || DEFAULT_TRAINING.mainCard.buttonBn,
    },
    cards: (d?.cards?.length ? d.cards : DEFAULT_TRAINING.cards).map((c, i) => ({
      title: c.title || DEFAULT_TRAINING.cards[i]?.title || "",
      titleBn: (c as any).titleBn || DEFAULT_TRAINING.cards[i]?.titleBn || "",
      description: c.description || DEFAULT_TRAINING.cards[i]?.description || "",
      descriptionBn: (c as any).descriptionBn || DEFAULT_TRAINING.cards[i]?.descriptionBn || "",
    })),
  });

  const [local, setLocal] = useState(() => buildSafeData(data));
  useEffect(() => setLocal(buildSafeData(data)), [data]);

  const updatePoint = (i: number, key: keyof ITrainingPoint, val: string) => {
    const points = [...local.points];
    points[i] = { ...points[i], [key]: val };
    setLocal((p) => ({ ...p, points }));
  };

  const updateCard = (i: number, key: string, val: string) => {
    const cards = [...local.cards];
    cards[i] = { ...cards[i], [key]: val };
    setLocal((p) => ({ ...p, cards }));
  };

  const fillDefaults = () => {
    setLocal(buildSafeData(undefined));
    toast.success("Loaded default values into Training Center fields!");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={6}
        title="Training Center & Program"
        subLabel="Practical Skill Training"
        locationHint="6th Section on Landing Page"
        description="Controls the Training Program badge, main title, subheading, left column feature points (Work Skills, Language, Culture), main blue certified center card, and schedule cards."
        icon={BookOpen}
        onLoadDefaults={fillDefaults}
      />
      <SectionCard title="Section Labels" icon={BookOpen}>
        <div className="space-y-4">
          <BilingualField
            label="Badge"
            enValue={local.badge} onEnChange={(v) => setLocal((p) => ({ ...p, badge: v }))} enPlaceholder="Training Program"
            bnValue={(local as any).badgeBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, badgeBn: v } as any))} bnPlaceholder="ট্রেনিং বা প্রশিক্ষণ"
          />
          <BilingualField
            label="Heading Line 1"
            enValue={local.heading1} onEnChange={(v) => setLocal((p) => ({ ...p, heading1: v }))} enPlaceholder="Build Your Skills,"
            bnValue={(local as any).heading1Bn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, heading1Bn: v } as any))} bnPlaceholder="দক্ষতা অর্জন করুন,"
          />
          <BilingualField
            label="Heading Line 2 (blue)"
            enValue={local.heading2} onEnChange={(v) => setLocal((p) => ({ ...p, heading2: v }))} enPlaceholder="Shape a Bright Future"
            bnValue={(local as any).heading2Bn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, heading2Bn: v } as any))} bnPlaceholder="গড়ুন উজ্জ্বল ভবিষ্যৎ"
          />
          <BilingualField
            label="Subheading"
            enValue={local.subheading} onEnChange={(v) => setLocal((p) => ({ ...p, subheading: v }))} enPlaceholder="At our own training center..."
            bnValue={(local as any).subheadingBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, subheadingBn: v } as any))} bnPlaceholder="আমাদের নিজস্ব ট্রেনিং সেন্টারে..."
            multiline
          />
        </div>
      </SectionCard>

      <SectionCard title="Feature Points (left column)" icon={Settings}>
        <div className="space-y-3">
          {local.points.map((pt, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Point {i + 1}</span>
                {local.points.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, points: p.points.filter((_, j) => j !== i) }))} />}
              </div>
              <BilingualField
                label="Title"
                enValue={pt.title} onEnChange={(v) => updatePoint(i, "title", v)} enPlaceholder="Work Skills"
                bnValue={(pt as any).titleBn || ""} onBnChange={(v) => updatePoint(i, "titleBn" as any, v)} bnPlaceholder="কাজের দক্ষতা"
              />
              <BilingualField
                label="Description"
                enValue={pt.description} onEnChange={(v) => updatePoint(i, "description", v)} enPlaceholder="Hands-on practical training..."
                bnValue={(pt as any).descriptionBn || ""} onBnChange={(v) => updatePoint(i, "descriptionBn" as any, v)} bnPlaceholder="বিদেশের কর্মক্ষেত্রের সাথে..."
                multiline
              />
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, points: [...p.points, { title: "", description: "" }] }))} label="Add Point" />
        </div>
      </SectionCard>

      <SectionCard title="Main Card (blue)" icon={BookOpen}>
        <div className="space-y-4">
          <BilingualField
            label="Title"
            enValue={local.mainCard.title} onEnChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, title: v } }))} enPlaceholder="Certified Training Center"
            bnValue={(local.mainCard as any).titleBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, titleBn: v } } as any))} bnPlaceholder="সার্টিফাইড ট্রেনিং সেন্টার"
          />
          <BilingualField
            label="Description"
            enValue={local.mainCard.description} onEnChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, description: v } }))} enPlaceholder="Your skills are ensured..."
            bnValue={(local.mainCard as any).descriptionBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, descriptionBn: v } } as any))} bnPlaceholder="আধুনিক সুবিধা ও ইন্ডাস্ট্রি বিশেষজ্ঞদের মাধ্যমে..."
            multiline
          />
          <BilingualField
            label="Button Text"
            enValue={local.mainCard.button} onEnChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, button: v } }))} enPlaceholder="Enrollment Open"
            bnValue={(local.mainCard as any).buttonBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, buttonBn: v } } as any))} bnPlaceholder="ভর্তি চলছে"
          />
        </div>
      </SectionCard>

      <SectionCard title="Small Cards (bottom right)" icon={Settings}>
        <div className="space-y-3">
          {local.cards.map((card, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Card {i + 1}</span>
                {local.cards.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, cards: p.cards.filter((_, j) => j !== i) }))} />}
              </div>
              <BilingualField
                label="Title"
                enValue={card.title} onEnChange={(v) => updateCard(i, "title", v)} enPlaceholder="Flexible Schedule"
                bnValue={(card as any).titleBn || ""} onBnChange={(v) => updateCard(i, "titleBn", v)} bnPlaceholder="নমনীয় সময়সূচী"
              />
              <BilingualField
                label="Description"
                enValue={card.description} onEnChange={(v) => updateCard(i, "description", v)} enPlaceholder="Full-time and part-time batches..."
                bnValue={(card as any).descriptionBn || ""} onBnChange={(v) => updateCard(i, "descriptionBn", v)} bnPlaceholder="আপনার সুবিধা অনুযায়ী দিন বা রাতে..."
                multiline
              />
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, cards: [...p.cards, { title: "", description: "" }] }))} label="Add Card" />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

// ─── LogoRowEditor must live OUTSIDE PartnersEditor so React never
//     unmounts/remounts it on every local-state change (which would
//     cause inputs to lose focus after every keystroke).
function LogoRowEditor({
  label,
  logos,
  onUpdateLogo,
  onRemoveLogo,
  onAddLogo,
}: {
  label: string;
  logos: IPartnerLogo[];
  onUpdateLogo: (i: number, key: keyof IPartnerLogo, val: string) => void;
  onRemoveLogo: (i: number) => void;
  onAddLogo: () => void;
}) {
  return (
    <SectionCard title={label} icon={Users}>
      <div className="space-y-3">
        {logos.map((logo, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1">
                <Label>Partner Name</Label>
                <Input value={logo.name} onChange={(v) => onUpdateLogo(i, "name", v)} placeholder="Partner Name" />
              </div>
              {logos.length > 1 && (
                <RemoveBtn onClick={() => onRemoveLogo(i)} />
              )}
            </div>
            <CmsImageUpload label="Logo Image" value={logo.img} onChange={(v) => onUpdateLogo(i, "img", v)} />
          </div>
        ))}
        <AddRowBtn onClick={onAddLogo} label="Add Logo" />
      </div>
    </SectionCard>
  );
}

const DEFAULT_JOURNEY: ILandingPageCMS["ourJourney"] = {
  title: "Our Journey",
  titleBn: "আমাদের জার্নি",
  subtitle: "Our Clients & Partners",
  subtitleBn: "আমাদের ক্লায়েন্ট ও পার্টনার",
  row1: [], row2: [], row3: [],
};

function PartnersEditor({ data, onSave, saving }: { data: ILandingPageCMS["ourJourney"]; onSave: (d: ILandingPageCMS["ourJourney"]) => void; saving: boolean }) {
  const safeData: ILandingPageCMS["ourJourney"] = {
    ...DEFAULT_JOURNEY,
    ...data,
    title: data?.title || DEFAULT_JOURNEY.title,
    titleBn: (data as any)?.titleBn || DEFAULT_JOURNEY.titleBn,
    subtitle: data?.subtitle || DEFAULT_JOURNEY.subtitle,
    subtitleBn: (data as any)?.subtitleBn || DEFAULT_JOURNEY.subtitleBn,
    row1: data?.row1 ?? [], row2: data?.row2 ?? [], row3: data?.row3 ?? [],
  };
  const [local, setLocal] = useState(safeData);
  useEffect(() => setLocal({
    ...DEFAULT_JOURNEY, ...data,
    row1: data?.row1 ?? [], row2: data?.row2 ?? [], row3: data?.row3 ?? [],
  }), [data]);

  const updateLogo = (row: "row1" | "row2" | "row3", i: number, key: keyof IPartnerLogo, val: string) => {
    const logos = [...local[row]];
    logos[i] = { ...logos[i], [key]: val };
    setLocal((p) => ({ ...p, [row]: logos }));
  };

  const removeLogo = (row: "row1" | "row2" | "row3", i: number) =>
    setLocal((p) => ({ ...p, [row]: p[row].filter((_, j) => j !== i) }));

  const addLogo = (row: "row1" | "row2" | "row3") =>
    setLocal((p) => ({ ...p, [row]: [...p[row], { name: "", img: "" }] }));

  return (
    <div className="space-y-6">
      <SectionHeader
        step={7}
        title="Partners & Clients Journey"
        subLabel="Scrolling Logo Marquees"
        locationHint="7th Section on Landing Page"
        description="Controls the partner marquee section title, subtitle, and logo items across 3 continuous scrolling marquee rows."
        icon={Users}
      />
      <SectionCard title="Section Title" icon={Users}>
        <div className="space-y-4">
          <BilingualField
            label="Title"
            enValue={local.title} onEnChange={(v) => setLocal((p) => ({ ...p, title: v }))} enPlaceholder="Our Journey"
            bnValue={(local as any).titleBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, titleBn: v } as any))} bnPlaceholder="আমাদের জার্নি"
          />
          <BilingualField
            label="Subtitle"
            enValue={local.subtitle} onEnChange={(v) => setLocal((p) => ({ ...p, subtitle: v }))} enPlaceholder="Our Clients & Partners"
            bnValue={(local as any).subtitleBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, subtitleBn: v } as any))} bnPlaceholder="আমাদের ক্লায়েন্ট ও পার্টনার"
          />
        </div>
      </SectionCard>
      <LogoRowEditor
        label="Row 1 — Scrolls Left"
        logos={local.row1}
        onUpdateLogo={(i, key, val) => updateLogo("row1", i, key, val)}
        onRemoveLogo={(i) => removeLogo("row1", i)}
        onAddLogo={() => addLogo("row1")}
      />
      <LogoRowEditor
        label="Row 2 — Scrolls Right"
        logos={local.row2}
        onUpdateLogo={(i, key, val) => updateLogo("row2", i, key, val)}
        onRemoveLogo={(i) => removeLogo("row2", i)}
        onAddLogo={() => addLogo("row2")}
      />
      <LogoRowEditor
        label="Row 3 — Scrolls Left"
        logos={local.row3}
        onUpdateLogo={(i, key, val) => updateLogo("row3", i, key, val)}
        onRemoveLogo={(i) => removeLogo("row3", i)}
        onAddLogo={() => addLogo("row3")}
      />
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}


const DEFAULT_APPLY: ILandingPageCMS["applySection"] = {
  badge: "Apply Directly",
  badgeBn: "সরাসরি আবেদন করুন",
  heading: "Start a New Life",
  headingBn: "নতুন জীবন শুরু করুন",
  headingHighlight: "Abroad.",
  headingHighlightBn: "বিদেশে।",
  subheading: "Fill out the secure form. Our recruitment experts will match your profile with verified international employers.",
  subheadingBn: "নিরাপদ ফর্মটি পূরণ করুন। আমাদের নিয়োগ বিশেষজ্ঞরা আপনার প্রোফাইলকে যাচাইকৃত আন্তর্জাতিক নিয়োগকর্তাদের সাথে মেলাবেন।",
  features: [
    { title: "Global Network", titleBn: "বৈশ্বিক নেটওয়ার্ক", desc: "Connected with 6+ countries and 100+ employers.", descBn: "৬টিরও বেশি দেশ এবং ১০০টিরও বেশি নিয়োগকর্তার সাথে সংযুক্ত।" },
    { title: "Data Security", titleBn: "ডেটা সুরক্ষা", desc: "Your documents are encrypted and completely safe.", descBn: "আপনার নথিপত্র এনক্রিপ্টেড এবং সম্পূর্ণ নিরাপদ।" },
    { title: "Fast Response", titleBn: "দ্রুত সাড়া", desc: "Get feedback within 24 working hours.", descBn: "২৪ কার্যঘণ্টার মধ্যে প্রতিক্রিয়া পান।" },
  ],
};

function ApplyEditor({ data, onSave, saving }: { data: ILandingPageCMS["applySection"]; onSave: (d: ILandingPageCMS["applySection"]) => void; saving: boolean }) {
  const buildSafeData = (d?: ILandingPageCMS["applySection"]): ILandingPageCMS["applySection"] => ({
    ...DEFAULT_APPLY,
    ...d,
    badge: d?.badge || DEFAULT_APPLY.badge,
    badgeBn: (d as any)?.badgeBn || DEFAULT_APPLY.badgeBn,
    heading: d?.heading || DEFAULT_APPLY.heading,
    headingBn: (d as any)?.headingBn || DEFAULT_APPLY.headingBn,
    headingHighlight: d?.headingHighlight || DEFAULT_APPLY.headingHighlight,
    headingHighlightBn: (d as any)?.headingHighlightBn || DEFAULT_APPLY.headingHighlightBn,
    subheading: d?.subheading || DEFAULT_APPLY.subheading,
    subheadingBn: (d as any)?.subheadingBn || DEFAULT_APPLY.subheadingBn,
    features: (d?.features?.length ? d.features : DEFAULT_APPLY.features).map((feat, i) => ({
      title: feat.title || DEFAULT_APPLY.features[i]?.title || "",
      titleBn: (feat as any).titleBn || DEFAULT_APPLY.features[i]?.titleBn || "",
      desc: feat.desc || DEFAULT_APPLY.features[i]?.desc || "",
      descBn: (feat as any).descBn || DEFAULT_APPLY.features[i]?.descBn || "",
    })),
  });

  const [local, setLocal] = useState(() => buildSafeData(data));
  useEffect(() => setLocal(buildSafeData(data)), [data]);

  const fillDefaults = () => {
    setLocal(buildSafeData(undefined));
    toast.success("Loaded default values into Apply Form!");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={8}
        title="Direct Lead Application Form"
        subLabel="Candidate Lead Form & Map"
        locationHint="8th Section on Landing Page"
        description="Controls the 'Apply Directly' headline, subtitle, global network feature highlights (Global Network, Data Security, Fast Response), and map header text."
        icon={Star}
        onLoadDefaults={fillDefaults}
      />
      <SectionCard title="Section Labels" icon={Star}>
        <div className="space-y-4">
          <BilingualField
            label="Badge"
            enValue={local.badge} onEnChange={(v) => setLocal((p) => ({ ...p, badge: v }))} enPlaceholder="Apply Directly"
            bnValue={(local as any).badgeBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, badgeBn: v } as any))} bnPlaceholder="সরাসরি আবেদন করুন"
          />
          <BilingualField
            label="Heading"
            enValue={local.heading} onEnChange={(v) => setLocal((p) => ({ ...p, heading: v }))} enPlaceholder="Start a New Life"
            bnValue={(local as any).headingBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headingBn: v } as any))} bnPlaceholder="নতুন জীবন শুরু করুন"
          />
          <BilingualField
            label="Heading Highlight (blue)"
            enValue={local.headingHighlight} onEnChange={(v) => setLocal((p) => ({ ...p, headingHighlight: v }))} enPlaceholder="Abroad."
            bnValue={(local as any).headingHighlightBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headingHighlightBn: v } as any))} bnPlaceholder="বিদেশে।"
          />
          <BilingualField
            label="Subheading"
            enValue={local.subheading} onEnChange={(v) => setLocal((p) => ({ ...p, subheading: v }))} enPlaceholder="Fill out the secure form..."
            bnValue={(local as any).subheadingBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, subheadingBn: v } as any))} bnPlaceholder="নিরাপদ ফর্মটি পূরণ করুন..."
            multiline
          />
        </div>
      </SectionCard>

      <SectionCard title="Feature Points" icon={Settings}>
        <div className="space-y-3">
          {local.features.map((feat, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Feature {i + 1}</span>
                {local.features.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} />}
              </div>
              <BilingualField
                label="Title"
                enValue={feat.title} onEnChange={(v) => { const f = [...local.features]; f[i] = { ...f[i], title: v }; setLocal((p) => ({ ...p, features: f })); }} enPlaceholder="Global Network"
                bnValue={(feat as any).titleBn || ""} onBnChange={(v) => { const f = [...local.features]; f[i] = { ...f[i], titleBn: v } as any; setLocal((p) => ({ ...p, features: f })); }} bnPlaceholder="বৈশ্বিক নেটওয়ার্ক"
              />
              <BilingualField
                label="Description"
                enValue={feat.desc} onEnChange={(v) => { const f = [...local.features]; f[i] = { ...f[i], desc: v }; setLocal((p) => ({ ...p, features: f })); }} enPlaceholder="Connected with 6+ countries..."
                bnValue={(feat as any).descBn || ""} onBnChange={(v) => { const f = [...local.features]; f[i] = { ...f[i], descBn: v } as any; setLocal((p) => ({ ...p, features: f })); }} bnPlaceholder="৬টিরও বেশি দেশ..."
                multiline
              />
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, features: [...p.features, { title: "", desc: "" }] }))} label="Add Feature" />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

const DEFAULT_SUCCESS: ILandingPageCMS["successStories"] = {
  heading: "Our Students'",
  headingBn: "আমাদের শিক্ষার্থীদের",
  headingHighlight: "Success Stories",
  headingHighlightBn: "সাফল্যের গল্প",
  subheading: "Real projects, remarkable achievements — inspiring journeys",
  subheadingBn: "বাস্তব প্রকল্প, অসাধারণ অর্জন — অনুপ্রেরণামূলক যাত্রা",
  shareHeading: "Share Your Success Story Abroad",
  shareHeadingBn: "বিদেশে আপনার সাফল্যের গল্প শেয়ার করুন",
  shareSubheading: "Inspire other job seekers by sharing your experience and success story",
  shareSubheadingBn: "আপনার অভিজ্ঞতা এবং সাফল্যের গল্প শেয়ার করে অন্য চাকরিপ্রার্থীদের অনুপ্রাণিত করুন",
  shareSubmitBtn: "Submit Your Success Story",
  shareSubmitBtnBn: "আপনার সাফল্যের গল্প জমা দিন",
  shareNominateBtn: "Nominate a Candidate",
  shareNominateBtnBn: "একজন প্রার্থী মনোনীত করুন",
  shareProcessBtn: "View Application Process",
  shareProcessBtnBn: "আবেদন প্রক্রিয়া দেখুন",
};

function SuccessStoriesEditor({ data, onSave, saving }: { data: ILandingPageCMS["successStories"]; onSave: (d: ILandingPageCMS["successStories"]) => void; saving: boolean }) {
  const safeData: ILandingPageCMS["successStories"] = {
    ...DEFAULT_SUCCESS,
    ...data,
    heading: data?.heading || DEFAULT_SUCCESS.heading,
    headingBn: (data as any)?.headingBn || DEFAULT_SUCCESS.headingBn,
    headingHighlight: data?.headingHighlight || DEFAULT_SUCCESS.headingHighlight,
    headingHighlightBn: (data as any)?.headingHighlightBn || DEFAULT_SUCCESS.headingHighlightBn,
    subheading: data?.subheading || DEFAULT_SUCCESS.subheading,
    subheadingBn: (data as any)?.subheadingBn || DEFAULT_SUCCESS.subheadingBn,
    shareHeading: data?.shareHeading || DEFAULT_SUCCESS.shareHeading,
    shareHeadingBn: (data as any)?.shareHeadingBn || DEFAULT_SUCCESS.shareHeadingBn,
    shareSubheading: data?.shareSubheading || DEFAULT_SUCCESS.shareSubheading,
    shareSubheadingBn: (data as any)?.shareSubheadingBn || DEFAULT_SUCCESS.shareSubheadingBn,
    shareSubmitBtn: data?.shareSubmitBtn || DEFAULT_SUCCESS.shareSubmitBtn,
    shareSubmitBtnBn: (data as any)?.shareSubmitBtnBn || DEFAULT_SUCCESS.shareSubmitBtnBn,
    shareNominateBtn: data?.shareNominateBtn || DEFAULT_SUCCESS.shareNominateBtn,
    shareNominateBtnBn: (data as any)?.shareNominateBtnBn || DEFAULT_SUCCESS.shareNominateBtnBn,
    shareProcessBtn: data?.shareProcessBtn || DEFAULT_SUCCESS.shareProcessBtn,
    shareProcessBtnBn: (data as any)?.shareProcessBtnBn || DEFAULT_SUCCESS.shareProcessBtnBn,
  };
  const [local, setLocal] = useState(safeData);
  useEffect(() => setLocal({ ...DEFAULT_SUCCESS, ...data }), [data]);
  const set = (key: string, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <SectionHeader
        step={9}
        title="Student Success Stories"
        subLabel="Testimonials & Share Story"
        locationHint="9th Section on Landing Page"
        description="Controls the Success Stories heading, subheading, and the bottom 'Share Your Success Story Abroad' callout box with submit, nominate, and process buttons."
        icon={Star}
      />
      <SectionCard title="Section Labels" icon={Star}>
        <div className="space-y-4">
          <BilingualField
            label="Heading"
            enValue={local.heading} onEnChange={(v) => set("heading", v)} enPlaceholder="Our Students'"
            bnValue={(local as any).headingBn || ""} onBnChange={(v) => set("headingBn", v)} bnPlaceholder="আমাদের শিক্ষার্থীদের"
          />
          <BilingualField
            label="Heading Highlight (blue)"
            enValue={local.headingHighlight} onEnChange={(v) => set("headingHighlight", v)} enPlaceholder="Success Stories"
            bnValue={(local as any).headingHighlightBn || ""} onBnChange={(v) => set("headingHighlightBn", v)} bnPlaceholder="সাফল্যের গল্প"
          />
          <BilingualField
            label="Subheading"
            enValue={local.subheading} onEnChange={(v) => set("subheading", v)} enPlaceholder="Real projects..."
            bnValue={(local as any).subheadingBn || ""} onBnChange={(v) => set("subheadingBn", v)} bnPlaceholder="বাস্তব প্রকল্প..."
            multiline
          />
        </div>
      </SectionCard>
      <SectionCard title="Share Success Section Labels" icon={Star}>
        <div className="space-y-4">
          <BilingualField
            label="Share Heading"
            enValue={local.shareHeading || ""} onEnChange={(v) => set("shareHeading", v)} enPlaceholder="Share Your Success Story Abroad"
            bnValue={(local as any).shareHeadingBn || ""} onBnChange={(v) => set("shareHeadingBn", v)} bnPlaceholder="বিদেশে আপনার সাফল্যের গল্প শেয়ার করুন"
          />
          <BilingualField
            label="Share Subheading"
            enValue={local.shareSubheading || ""} onEnChange={(v) => set("shareSubheading", v)} enPlaceholder="Inspire other job seekers..."
            bnValue={(local as any).shareSubheadingBn || ""} onBnChange={(v) => set("shareSubheadingBn", v)} bnPlaceholder="আপনার অভিজ্ঞতা এবং সাফল্যের গল্প শেয়ার করে..."
            multiline
          />
          <BilingualField
            label="Submit button text"
            enValue={local.shareSubmitBtn || ""} onEnChange={(v) => set("shareSubmitBtn", v)} enPlaceholder="Submit Your Success Story"
            bnValue={(local as any).shareSubmitBtnBn || ""} onBnChange={(v) => set("shareSubmitBtnBn", v)} bnPlaceholder="আপনার সাফল্যের গল্প জমা দিন"
          />
          <BilingualField
            label="Nominate button text"
            enValue={local.shareNominateBtn || ""} onEnChange={(v) => set("shareNominateBtn", v)} enPlaceholder="Nominate a Candidate"
            bnValue={(local as any).shareNominateBtnBn || ""} onBnChange={(v) => set("shareNominateBtnBn", v)} bnPlaceholder="একজন প্রার্থী মনোনীত করুন"
          />
          <BilingualField
            label="Process button text"
            enValue={local.shareProcessBtn || ""} onEnChange={(v) => set("shareProcessBtn", v)} enPlaceholder="View Application Process"
            bnValue={(local as any).shareProcessBtnBn || ""} onBnChange={(v) => set("shareProcessBtnBn", v)} bnPlaceholder="আবেদন প্রক্রিয়া দেখুন"
          />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

const DEFAULT_POPULAR_COURSES: ILandingPageCMS["popularCourses"] = {
  headingPrefix: "Our",
  headingPrefixBn: "আমাদের",
  headingHighlight: "Popular Courses",
  headingHighlightBn: "জনপ্রিয় কোর্স সমূহ",
  seeAllText: "See All Courses",
  seeAllTextBn: "সকল কোর্স দেখুন",
};

function PopularCoursesEditor({ data, onSave, saving }: { data: ILandingPageCMS["popularCourses"]; onSave: (d: ILandingPageCMS["popularCourses"]) => void; saving: boolean }) {
  const buildSafeData = (d?: ILandingPageCMS["popularCourses"]): ILandingPageCMS["popularCourses"] => ({
    ...DEFAULT_POPULAR_COURSES,
    ...d,
    headingPrefix: d?.headingPrefix || DEFAULT_POPULAR_COURSES.headingPrefix,
    headingPrefixBn: (d as any)?.headingPrefixBn || DEFAULT_POPULAR_COURSES.headingPrefixBn,
    headingHighlight: d?.headingHighlight || DEFAULT_POPULAR_COURSES.headingHighlight,
    headingHighlightBn: (d as any)?.headingHighlightBn || DEFAULT_POPULAR_COURSES.headingHighlightBn,
    seeAllText: d?.seeAllText || DEFAULT_POPULAR_COURSES.seeAllText,
    seeAllTextBn: (d as any)?.seeAllTextBn || DEFAULT_POPULAR_COURSES.seeAllTextBn,
  });

  const [local, setLocal] = useState(() => buildSafeData(data));
  useEffect(() => setLocal(buildSafeData(data)), [data]);

  const fillDefaults = () => {
    setLocal(buildSafeData(undefined));
    toast.success("Loaded default values into Popular Courses!");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={10}
        title="Popular Courses Slider"
        subLabel="Featured Courses Slider Block"
        locationHint="Optional Course Slider Block"
        description="Controls the section title prefix ('Our'), highlighted title ('Popular Courses'), and 'See All Courses' button for the course slider block."
        icon={BookOpen}
        onLoadDefaults={fillDefaults}
      />
      <SectionCard title="Popular Courses Titles" icon={BookOpen}>
        <div className="space-y-4">
          <BilingualField
            label="Heading Prefix"
            enValue={local.headingPrefix || ""} onEnChange={(v) => setLocal((p) => ({ ...p, headingPrefix: v }))} enPlaceholder="Our"
            bnValue={(local as any).headingPrefixBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headingPrefixBn: v } as any))} bnPlaceholder="আমাদের"
          />
          <BilingualField
            label="Heading Highlight"
            enValue={local.headingHighlight || ""} onEnChange={(v) => setLocal((p) => ({ ...p, headingHighlight: v }))} enPlaceholder="Popular Courses"
            bnValue={(local as any).headingHighlightBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, headingHighlightBn: v } as any))} bnPlaceholder="জনপ্রিয় কোর্স সমূহ"
          />
          <BilingualField
            label="See All button text"
            enValue={local.seeAllText || ""} onEnChange={(v) => setLocal((p) => ({ ...p, seeAllText: v }))} enPlaceholder="See All Courses"
            bnValue={(local as any).seeAllTextBn || ""} onBnChange={(v) => setLocal((p) => ({ ...p, seeAllTextBn: v } as any))} bnPlaceholder="সকল কোর্স দেখুন"
          />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

const DEFAULT_IMMIGRANT_JOBS: ILandingPageCMS["immigrantJobsSection"] = {
  badge: "Immigrant Jobs World",
  badgeBn: "ইমিগ্র্যান্ট জবস ওয়ার্ল্ড",
  heading: "Access 10,000+ Aviation Jobs Worldwide",
  headingBn: "বিশ্বজুড়ে ১০,০০০+ চাকরির সুযোগ",
  subheading: "Match with roles that fit your skills and ambitions. We connect immigrant talent with verified global employers across every major industry sector.",
  subheadingBn: "আপনার দক্ষতা ও উচ্চাকাঙ্ক্ষার সাথে মানানসই পদে সংযুক্ত হন। আমরা প্রতিটি প্রধান শিল্প খাতে যাচাইকৃত বৈশ্বিক নিয়োগকর্তাদের সাথে অভিবাসী প্রতিভাদের সংযুক্ত করি।",
  whyChooseTitle: "Why Job Seekers Choose Us",
  whyChooseTitleBn: "কেন চাকরিপ্রার্থীরা আমাদের বেছে নেয়",
  features: [
    { title: "Worldwide Opportunities", titleBn: "বিশ্বব্যাপী সুযোগ", description: "Discover aviation and skilled jobs across 50+ countries, matched to your background and ambitions.", descriptionBn: "৫০টিরও বেশি দেশে বিমান ও দক্ষ চাকরি আবিষ্কার করুন, আপনার পটভূমি ও উচ্চাকাঙ্ক্ষার সাথে মানানসই।" },
    { title: "Smart Job Search", titleBn: "স্মার্ট চাকরি অনুসন্ধান", description: "Filter by category, job type, and location to instantly find roles that align with your expertise.", descriptionBn: "বিভাগ, কাজের ধরন ও অবস্থান দিয়ে ফিল্টার করে আপনার দক্ষতার সাথে সঙ্গতিপূর্ণ পদ তাৎক্ষণিকভাবে খুঁজুন।" },
    { title: "Save & Track Jobs", titleBn: "চাকরি সংরক্ষণ করুন", description: "Bookmark your favorite listings and revisit them anytime to apply when you are ready.", descriptionBn: "আপনার পছন্দের তালিকা বুকমার্ক করুন এবং প্রস্তুত হলে যেকোনো সময় আবেদন করতে ফিরে আসুন।" },
    { title: "Verified Employers", titleBn: "যাচাইকৃত নিয়োগকর্তা", description: "Every company on our platform is vetted for authenticity, so you apply with complete confidence.", descriptionBn: "আমাদের প্ল্যাটফর্মের প্রতিটি কোম্পানি সত্যতার জন্য যাচাই করা হয়েছে, তাই আপনি সম্পূর্ণ আস্থার সাথে আবেদন করুন।" },
  ],
  featuredTitle: "Featured Job Openings",
  featuredTitleBn: "বিশেষ চাকরির সুযোগ",
  liveBadge: "Live Listings",
  liveBadgeBn: "লাইভ তালিকা",
  listingsSubtext: "Hand-picked openings matched to your background. New roles added daily.",
  listingsSubtextBn: "আপনার পটভূমির সাথে মানানসই বাছাইকৃত সুযোগ। প্রতিদিন নতুন পদ যোগ হচ্ছে।",
  whyUsBadge: "Why Us",
  whyUsBadgeBn: "কেন আমরা",
  whyUsSubtext: "Everything you need to land your next global opportunity — all in one platform.",
  whyUsSubtextBn: "আপনার পরবর্তী বৈশ্বিক সুযোগ পেতে যা দরকার — সব এক প্ল্যাটফর্মে।",
  browseAllText: "Browse all opportunities",
  browseAllTextBn: "সব সুযোগ ব্রাউজ করুন",
  viewAllJobs: "View All Jobs",
  viewAllJobsBn: "সব চাকরি দেখুন",
  moreListings: "+ thousands more listings waiting for you",
  moreListingsBn: "+ হাজার হাজার আরও তালিকা আপনার জন্য অপেক্ষা করছে",
  employmentTitle: "Explore by Employment Type",
  employmentTitleBn: "কর্মসংস্থানের ধরন অনুযায়ী দেখুন",
  jobTypes: [
    { type: "Full-time", typeBn: "পূর্ণকালীন", count: "6,000+", description: "Permanent positions with full benefits and career growth.", descriptionBn: "পূর্ণ সুবিধা ও ক্যারিয়ার বিকাশের সাথে স্থায়ী পদসমূহ।" },
    { type: "Part-time", typeBn: "খণ্ডকালীন", count: "2,500+", description: "Flexible roles designed to fit your schedule and lifestyle.", descriptionBn: "আপনার সময়সূচী ও জীবনধারার সাথে মানানসই নমনীয় পদসমূহ।" },
    { type: "Internship", typeBn: "ইন্টার্নশিপ", count: "1,500+", description: "Kickstart your international career with hands-on experience.", descriptionBn: "হাতে-কলমে অভিজ্ঞতার মাধ্যমে আপনার আন্তর্জাতিক ক্যারিয়ার শুরু করুন।" },
  ],
  ctaBadge: "Your Global Career Starts Here",
  ctaBadgeBn: "আপনার বৈশ্বিক ক্যারিয়ার এখানে শুরু হয়",
  ctaHeading: "Ready to Find Your Dream Job Abroad?",
  ctaHeadingBn: "বিদেশে আপনার স্বপ্নের চাকরি খুঁজে পেতে প্রস্তুত?",
  ctaSubheading: "Browse thousands of verified international job listings, filter by your preferred role, location, and employment type — all in one place.",
  ctaSubheadingBn: "হাজার হাজার যাচাইকৃত আন্তর্জাতিক চাকরির তালিকা ব্রাউজ করুন, আপনার পছন্দের পদ, অবস্থান ও কর্মসংস্থানের ধরন দিয়ে ফিল্টার করুন — সব এক জায়গায়।",
  ctaButton: "Browse All Jobs",
  ctaButtonBn: "সব চাকরি ব্রাউজ করুন",
};

function ImmigrantJobsEditor({ data, onSave, saving }: { data: ILandingPageCMS["immigrantJobsSection"]; onSave: (d: ILandingPageCMS["immigrantJobsSection"]) => void; saving: boolean }) {
  const safeData: ILandingPageCMS["immigrantJobsSection"] = {
    ...DEFAULT_IMMIGRANT_JOBS,
    ...data,
    badge: data?.badge || DEFAULT_IMMIGRANT_JOBS.badge,
    badgeBn: (data as any)?.badgeBn || DEFAULT_IMMIGRANT_JOBS.badgeBn,
    heading: data?.heading || DEFAULT_IMMIGRANT_JOBS.heading,
    headingBn: (data as any)?.headingBn || DEFAULT_IMMIGRANT_JOBS.headingBn,
    subheading: data?.subheading || DEFAULT_IMMIGRANT_JOBS.subheading,
    subheadingBn: (data as any)?.subheadingBn || DEFAULT_IMMIGRANT_JOBS.subheadingBn,
    whyChooseTitle: data?.whyChooseTitle || DEFAULT_IMMIGRANT_JOBS.whyChooseTitle,
    whyChooseTitleBn: (data as any)?.whyChooseTitleBn || DEFAULT_IMMIGRANT_JOBS.whyChooseTitleBn,
    featuredTitle: data?.featuredTitle || DEFAULT_IMMIGRANT_JOBS.featuredTitle,
    featuredTitleBn: (data as any)?.featuredTitleBn || DEFAULT_IMMIGRANT_JOBS.featuredTitleBn,
    liveBadge: data?.liveBadge || DEFAULT_IMMIGRANT_JOBS.liveBadge,
    liveBadgeBn: (data as any)?.liveBadgeBn || DEFAULT_IMMIGRANT_JOBS.liveBadgeBn,
    listingsSubtext: data?.listingsSubtext || DEFAULT_IMMIGRANT_JOBS.listingsSubtext,
    listingsSubtextBn: (data as any)?.listingsSubtextBn || DEFAULT_IMMIGRANT_JOBS.listingsSubtextBn,
    whyUsBadge: data?.whyUsBadge || DEFAULT_IMMIGRANT_JOBS.whyUsBadge,
    whyUsBadgeBn: (data as any)?.whyUsBadgeBn || DEFAULT_IMMIGRANT_JOBS.whyUsBadgeBn,
    whyUsSubtext: data?.whyUsSubtext || DEFAULT_IMMIGRANT_JOBS.whyUsSubtext,
    whyUsSubtextBn: (data as any)?.whyUsSubtextBn || DEFAULT_IMMIGRANT_JOBS.whyUsSubtextBn,
    browseAllText: data?.browseAllText || DEFAULT_IMMIGRANT_JOBS.browseAllText,
    browseAllTextBn: (data as any)?.browseAllTextBn || DEFAULT_IMMIGRANT_JOBS.browseAllTextBn,
    viewAllJobs: data?.viewAllJobs || DEFAULT_IMMIGRANT_JOBS.viewAllJobs,
    viewAllJobsBn: (data as any)?.viewAllJobsBn || DEFAULT_IMMIGRANT_JOBS.viewAllJobsBn,
    moreListings: data?.moreListings || DEFAULT_IMMIGRANT_JOBS.moreListings,
    moreListingsBn: (data as any)?.moreListingsBn || DEFAULT_IMMIGRANT_JOBS.moreListingsBn,
    employmentTitle: data?.employmentTitle || DEFAULT_IMMIGRANT_JOBS.employmentTitle,
    employmentTitleBn: (data as any)?.employmentTitleBn || DEFAULT_IMMIGRANT_JOBS.employmentTitleBn,
    ctaBadge: data?.ctaBadge || DEFAULT_IMMIGRANT_JOBS.ctaBadge,
    ctaBadgeBn: (data as any)?.ctaBadgeBn || DEFAULT_IMMIGRANT_JOBS.ctaBadgeBn,
    ctaHeading: data?.ctaHeading || DEFAULT_IMMIGRANT_JOBS.ctaHeading,
    ctaHeadingBn: (data as any)?.ctaHeadingBn || DEFAULT_IMMIGRANT_JOBS.ctaHeadingBn,
    ctaSubheading: data?.ctaSubheading || DEFAULT_IMMIGRANT_JOBS.ctaSubheading,
    ctaSubheadingBn: (data as any)?.ctaSubheadingBn || DEFAULT_IMMIGRANT_JOBS.ctaSubheadingBn,
    ctaButton: data?.ctaButton || DEFAULT_IMMIGRANT_JOBS.ctaButton,
    ctaButtonBn: (data as any)?.ctaButtonBn || DEFAULT_IMMIGRANT_JOBS.ctaButtonBn,
    features: data?.features?.length ? data.features : DEFAULT_IMMIGRANT_JOBS.features,
    jobTypes: data?.jobTypes?.length ? data.jobTypes : DEFAULT_IMMIGRANT_JOBS.jobTypes,
  };
  const [local, setLocal] = useState(safeData);
  useEffect(() => setLocal({ ...DEFAULT_IMMIGRANT_JOBS, ...data, features: data?.features ?? [], jobTypes: data?.jobTypes ?? [] }), [data]);
  const set = (key: string, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  const updateFeature = (i: number, key: keyof IImmigrantJobFeature, val: string) => {
    const features = [...(local.features || [])];
    features[i] = { ...features[i], [key]: val };
    setLocal((p) => ({ ...p, features }));
  };

  const updateJobType = (i: number, key: keyof IImmigrantJobType, val: string) => {
    const jobTypes = [...(local.jobTypes || [])];
    jobTypes[i] = { ...jobTypes[i], [key]: val };
    setLocal((p) => ({ ...p, jobTypes }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={2}
        title="Immigrant Jobs World"
        subLabel="Global Job Search & Listings"
        locationHint="2nd Section (Directly under Hero)"
        description="Controls the Aviation & Overseas Jobs section header, featured jobs badges, 'Why Job Seekers Choose Us' 4 feature cards, Employment Types (Full-time/Part-time/Internship), and bottom CTA banner."
        icon={Briefcase}
      />
      <SectionCard title="Section Labels" icon={Briefcase}>
        <div className="space-y-4">
          <BilingualField label="Badge" enValue={local.badge || ""} onEnChange={(v) => set("badge", v)} bnValue={(local as any).badgeBn || ""} onBnChange={(v) => set("badgeBn", v)} />
          <BilingualField label="Heading" enValue={local.heading || ""} onEnChange={(v) => set("heading", v)} bnValue={(local as any).headingBn || ""} onBnChange={(v) => set("headingBn", v)} />
          <BilingualField label="Subheading" enValue={local.subheading || ""} onEnChange={(v) => set("subheading", v)} bnValue={(local as any).subheadingBn || ""} onBnChange={(v) => set("subheadingBn", v)} multiline />
          <BilingualField label="Why Choose Title" enValue={local.whyChooseTitle || ""} onEnChange={(v) => set("whyChooseTitle", v)} bnValue={(local as any).whyChooseTitleBn || ""} onBnChange={(v) => set("whyChooseTitleBn", v)} />
          <BilingualField label="Featured Positions Title" enValue={local.featuredTitle || ""} onEnChange={(v) => set("featuredTitle", v)} bnValue={(local as any).featuredTitleBn || ""} onBnChange={(v) => set("featuredTitleBn", v)} />
          <BilingualField label="More Listings Label" enValue={local.moreListings || ""} onEnChange={(v) => set("moreListings", v)} bnValue={(local as any).moreListingsBn || ""} onBnChange={(v) => set("moreListingsBn", v)} />
          <BilingualField label="Employment Title" enValue={local.employmentTitle || ""} onEnChange={(v) => set("employmentTitle", v)} bnValue={(local as any).employmentTitleBn || ""} onBnChange={(v) => set("employmentTitleBn", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Featured Jobs Sub-Section Labels" icon={Briefcase}>
        <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700 leading-relaxed">
            These labels appear inside the <strong>Featured Job Openings</strong> block (the job cards grid area).
          </p>
        </div>
        <div className="space-y-4">
          <BilingualField label='"Live Listings" Badge Text' enValue={local.liveBadge || ""} onEnChange={(v) => set("liveBadge", v)} bnValue={(local as any).liveBadgeBn || ""} onBnChange={(v) => set("liveBadgeBn", v)} />
          <BilingualField label="Browse All Link Text" enValue={local.browseAllText || ""} onEnChange={(v) => set("browseAllText", v)} bnValue={(local as any).browseAllTextBn || ""} onBnChange={(v) => set("browseAllTextBn", v)} />
          <BilingualField label='Top "View All" Button Text' enValue={local.viewAllJobs || ""} onEnChange={(v) => set("viewAllJobs", v)} bnValue={(local as any).viewAllJobsBn || ""} onBnChange={(v) => set("viewAllJobsBn", v)} />
          <BilingualField label="Listings Sub-text (under featured title)" enValue={local.listingsSubtext || ""} onEnChange={(v) => set("listingsSubtext", v)} bnValue={(local as any).listingsSubtextBn || ""} onBnChange={(v) => set("listingsSubtextBn", v)} multiline />
        </div>
      </SectionCard>

      <SectionCard title="Why Choose Us Sub-Section Labels" icon={Settings}>
        <div className="space-y-4">
          <BilingualField label='"Why Us" Badge Text' enValue={local.whyUsBadge || ""} onEnChange={(v) => set("whyUsBadge", v)} bnValue={(local as any).whyUsBadgeBn || ""} onBnChange={(v) => set("whyUsBadgeBn", v)} />
          <BilingualField label="Why Us Sub-text (under why choose title)" enValue={local.whyUsSubtext || ""} onEnChange={(v) => set("whyUsSubtext", v)} bnValue={(local as any).whyUsSubtextBn || ""} onBnChange={(v) => set("whyUsSubtextBn", v)} multiline />
        </div>
      </SectionCard>

      <SectionCard title="Why Choose Features (4 items)" icon={Settings}>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => {
            const feat = (local.features || [])[i] || { title: "", description: "" };
            return (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <BilingualField
                  label={`Feature ${i + 1} Title`}
                  enValue={feat.title} onEnChange={(v) => updateFeature(i, "title", v)}
                  bnValue={(feat as any).titleBn || ""} onBnChange={(v) => updateFeature(i, "titleBn" as any, v)}
                />
                <BilingualField
                  label={`Feature ${i + 1} Description`}
                  enValue={feat.description} onEnChange={(v) => updateFeature(i, "description", v)}
                  bnValue={(feat as any).descriptionBn || ""} onBnChange={(v) => updateFeature(i, "descriptionBn" as any, v)}
                  multiline
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Employment Types (3 items)" icon={Settings}>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => {
            const jt = (local.jobTypes || [])[i] || { type: "", count: "", description: "" };
            return (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <BilingualField
                  label={`Type ${i + 1} Name`}
                  enValue={jt.type} onEnChange={(v) => updateJobType(i, "type", v)}
                  bnValue={(jt as any).typeBn || ""} onBnChange={(v) => updateJobType(i, "typeBn" as any, v)}
                />
                <div>
                  <Label>{`Type ${i + 1} Count`}</Label>
                  <Input value={jt.count} onChange={(v) => updateJobType(i, "count", v)} />
                </div>
                <BilingualField
                  label={`Type ${i + 1} Description`}
                  enValue={jt.description} onEnChange={(v) => updateJobType(i, "description", v)}
                  bnValue={(jt as any).descriptionBn || ""} onBnChange={(v) => updateJobType(i, "descriptionBn" as any, v)}
                  multiline
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="CTA Banner" icon={Star}>
        <div className="space-y-4">
          <BilingualField label="CTA Badge" enValue={local.ctaBadge || ""} onEnChange={(v) => set("ctaBadge", v)} bnValue={(local as any).ctaBadgeBn || ""} onBnChange={(v) => set("ctaBadgeBn", v)} />
          <BilingualField label="CTA Heading" enValue={local.ctaHeading || ""} onEnChange={(v) => set("ctaHeading", v)} bnValue={(local as any).ctaHeadingBn || ""} onBnChange={(v) => set("ctaHeadingBn", v)} />
          <BilingualField label="CTA Subheading" enValue={local.ctaSubheading || ""} onEnChange={(v) => set("ctaSubheading", v)} bnValue={(local as any).ctaSubheadingBn || ""} onBnChange={(v) => set("ctaSubheadingBn", v)} multiline />
          <BilingualField label="CTA Button Text" enValue={local.ctaButton || ""} onEnChange={(v) => set("ctaButton", v)} bnValue={(local as any).ctaButtonBn || ""} onBnChange={(v) => set("ctaButtonBn", v)} />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

const DEFAULT_COURSE_MODULES: ILandingPageCMS["courseModules"] = {
  titlePrefix: "Explore Our",
  titlePrefixBn: "আমাদের",
  titleHighlight: "Course Programs",
  titleHighlightBn: "কোর্স প্রোগ্রাম সমূহ",
  subtitle: "Choose between online flexible learning and offline in-person classroom training at our branches.",
  subtitleBn: "আমাদের শাখায় অফলাইন ইন-পার্সন ক্লাসরুম ট্রেনিং এবং অনলাইন নমনীয় শিক্ষার মধ্যে বেছে নিন।",
  technicalTab: "Online Courses",
  technicalTabBn: "টেকনিক্যাল কোর্স",
  languageTab: "Offline Courses",
  languageTabBn: "ল্যাঙ্গুয়েজ কোর্স",
  detailsLink: "View Details",
  detailsLinkBn: "বিস্তারিত দেখুন",
  offlineCourses: [],
};

function CourseModulesEditor({ data, onSave, saving }: { data: ILandingPageCMS["courseModules"]; onSave: (d: ILandingPageCMS["courseModules"]) => void; saving: boolean }) {
  const safeData: ILandingPageCMS["courseModules"] = {
    ...DEFAULT_COURSE_MODULES,
    ...data,
    titlePrefix: data?.titlePrefix || DEFAULT_COURSE_MODULES.titlePrefix,
    titlePrefixBn: (data as any)?.titlePrefixBn || DEFAULT_COURSE_MODULES.titlePrefixBn,
    titleHighlight: data?.titleHighlight || DEFAULT_COURSE_MODULES.titleHighlight,
    titleHighlightBn: (data as any)?.titleHighlightBn || DEFAULT_COURSE_MODULES.titleHighlightBn,
    subtitle: data?.subtitle || DEFAULT_COURSE_MODULES.subtitle,
    subtitleBn: (data as any)?.subtitleBn || DEFAULT_COURSE_MODULES.subtitleBn,
    technicalTab: data?.technicalTab || DEFAULT_COURSE_MODULES.technicalTab,
    technicalTabBn: (data as any)?.technicalTabBn || DEFAULT_COURSE_MODULES.technicalTabBn,
    languageTab: data?.languageTab || DEFAULT_COURSE_MODULES.languageTab,
    languageTabBn: (data as any)?.languageTabBn || DEFAULT_COURSE_MODULES.languageTabBn,
    detailsLink: data?.detailsLink || DEFAULT_COURSE_MODULES.detailsLink,
    detailsLinkBn: (data as any)?.detailsLinkBn || DEFAULT_COURSE_MODULES.detailsLinkBn,
    offlineCourses: data?.offlineCourses ?? [],
  };
  const [local, setLocal] = useState(safeData);
  useEffect(() => setLocal({ ...DEFAULT_COURSE_MODULES, ...data, offlineCourses: data?.offlineCourses ?? [] }), [data]);
  const set = (key: string, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  const updateCourse = (i: number, key: keyof IOfflineCourse, val: any) => {
    const offlineCourses = [...(local.offlineCourses || [])];
    offlineCourses[i] = { ...offlineCourses[i], [key]: val };
    setLocal((p) => ({ ...p, offlineCourses }));
  };

  const removeCourse = (i: number) => {
    const offlineCourses = (local.offlineCourses || []).filter((_, j) => j !== i);
    setLocal((p) => ({ ...p, offlineCourses }));
  };

  const addCourse = () => {
    const newCourse: IOfflineCourse = {
      _id: "off-" + Date.now(),
      title: "",
      slug: "",
      shortDescription: "",
      bannerImage: "",
      duration: "",
      level: "beginner",
      tags: [],
      price: 0,
      discountedPrice: 0,
      location: "Purana Paltan Branch, Dhaka",
      timing: "",
      startDate: "",
      tools: []
    };
    setLocal((p) => ({ ...p, offlineCourses: [...(p.offlineCourses || []), newCourse] }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        step={4}
        title="Course Programs & Masterclasses"
        subLabel="Online & Offline Courses"
        locationHint="4th Section on Landing Page"
        description="Controls the course section titles, category tab labels (Online vs. Offline Courses), and the list of offline classroom masterclasses (duration, pricing, locations, timings)."
        icon={BookOpen}
      />
      <SectionCard title="Section Headings & Tabs" icon={BookOpen}>
        <div className="space-y-4">
          <BilingualField label="Title Prefix" enValue={local.titlePrefix || ""} onEnChange={(v) => set("titlePrefix", v)} bnValue={(local as any).titlePrefixBn || ""} onBnChange={(v) => set("titlePrefixBn", v)} />
          <BilingualField label="Title Highlight" enValue={local.titleHighlight || ""} onEnChange={(v) => set("titleHighlight", v)} bnValue={(local as any).titleHighlightBn || ""} onBnChange={(v) => set("titleHighlightBn", v)} />
          <BilingualField label="Subtitle" enValue={local.subtitle || ""} onEnChange={(v) => set("subtitle", v)} bnValue={(local as any).subtitleBn || ""} onBnChange={(v) => set("subtitleBn", v)} multiline />
          <BilingualField label="Technical Tab Label" enValue={local.technicalTab || ""} onEnChange={(v) => set("technicalTab", v)} bnValue={(local as any).technicalTabBn || ""} onBnChange={(v) => set("technicalTabBn", v)} />
          <BilingualField label="Language Tab Label" enValue={local.languageTab || ""} onEnChange={(v) => set("languageTab", v)} bnValue={(local as any).languageTabBn || ""} onBnChange={(v) => set("languageTabBn", v)} />
          <BilingualField label="Details Link text" enValue={local.detailsLink || ""} onEnChange={(v) => set("detailsLink", v)} bnValue={(local as any).detailsLinkBn || ""} onBnChange={(v) => set("detailsLinkBn", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Offline Course Masterclass List" icon={BookOpen}>
        <div className="space-y-4">
          {(local.offlineCourses || []).map((course, i) => (
            <div key={course._id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
              <div className="absolute top-4 right-4">
                <RemoveBtn onClick={() => removeCourse(i)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Course Title</Label>
                  <Input value={course.title} onChange={(v) => updateCourse(i, "title", v)} />
                </div>
                <div>
                  <Label>Course Slug (URL path)</Label>
                  <Input value={course.slug} onChange={(v) => updateCourse(i, "slug", v)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Short Description</Label>
                  <Textarea value={course.shortDescription} onChange={(v) => updateCourse(i, "shortDescription", v)} rows={2} />
                </div>
                <div>
                  <CmsImageUpload label="Banner Image" value={course.bannerImage} onChange={(v) => updateCourse(i, "bannerImage", v)} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={course.duration} onChange={(v) => updateCourse(i, "duration", v)} placeholder="e.g. 3 Months (60 Hours)" />
                </div>
                <div>
                  <Label>Level</Label>
                  <select
                    value={course.level}
                    onChange={(e) => updateCourse(i, "level", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a4da1] bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input value={course.tags ? course.tags.join(", ") : ""} onChange={(v) => updateCourse(i, "tags", v.split(",").map(x => x.trim()))} placeholder="AutoCAD, Drafting" />
                </div>
                <div>
                  <Label>Regular Price</Label>
                  <Input type="number" value={String(course.price)} onChange={(v) => updateCourse(i, "price", Number(v))} />
                </div>
                <div>
                  <Label>Discounted Price</Label>
                  <Input type="number" value={String(course.discountedPrice)} onChange={(v) => updateCourse(i, "discountedPrice", Number(v))} />
                </div>
                <div>
                  <Label>Branch Location</Label>
                  <Input value={course.location} onChange={(v) => updateCourse(i, "location", v)} />
                </div>
                <div>
                  <Label>Class Timing</Label>
                  <Input value={course.timing} onChange={(v) => updateCourse(i, "timing", v)} placeholder="Fri & Sat (3:00 - 5:30 PM)" />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input value={course.startDate} onChange={(v) => updateCourse(i, "startDate", v)} placeholder="June 12, 2026" />
                </div>
              </div>
            </div>
          ))}
          <AddRowBtn onClick={addCourse} label="Add Offline Course" />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function LandingPageCMSPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const { data: cmsResponse, isLoading, isError } = useGetLandingPageCmsQuery();
  const [updateSection, { isLoading: saving }] = useUpdateLandingPageCmsSectionMutation();
  const cms = cmsResponse?.data;

  const handleSave = async (section: string, data: Record<string, unknown>) => {
    try {
      await updateSection({ section, data }).unwrap();
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section saved!`);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#1a4da1]" />
          <p className="text-slate-600 font-medium">Loading CMS data...</p>
        </div>
      </div>
    );
  }

  if (isError || !cms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Failed to load CMS data.</p>
          <p className="text-slate-500 text-sm">Please check your API connection and try again.</p>
        </div>
      </div>
    );
  }

  const renderEditor = () => {
    switch (activeTab) {
      case "hero":
        return <HeroEditor data={cms.hero ?? DEFAULT_HERO} saving={saving} onSave={(d) => handleSave("hero", d as any)} />;
      case "services":
        return <ServicesEditor data={cms.services ?? DEFAULT_SERVICES} saving={saving} onSave={(d) => handleSave("services", d as any)} />;
      case "ourServices":
        return <OurServicesEditor data={cms.ourServices ?? DEFAULT_OUR_SERVICES} saving={saving} onSave={(d) => handleSave("ourServices", d as any)} />;
      case "trainingSection":
        return <TrainingEditor data={cms.trainingSection ?? DEFAULT_TRAINING} saving={saving} onSave={(d) => handleSave("trainingSection", d as any)} />;
      case "ourJourney":
        return <PartnersEditor data={cms.ourJourney ?? DEFAULT_JOURNEY} saving={saving} onSave={(d) => handleSave("ourJourney", d as any)} />;
      case "applySection":
        return <ApplyEditor data={cms.applySection ?? DEFAULT_APPLY} saving={saving} onSave={(d) => handleSave("applySection", d as any)} />;
      case "successStories":
        return <SuccessStoriesEditor data={cms.successStories ?? DEFAULT_SUCCESS} saving={saving} onSave={(d) => handleSave("successStories", d as any)} />;
      case "immigrantJobsSection":
        return <ImmigrantJobsEditor data={cms.immigrantJobsSection ?? DEFAULT_IMMIGRANT_JOBS} saving={saving} onSave={(d) => handleSave("immigrantJobsSection", d as any)} />;
      case "popularCourses":
        return <PopularCoursesEditor data={cms.popularCourses ?? DEFAULT_POPULAR_COURSES} saving={saving} onSave={(d) => handleSave("popularCourses", d as any)} />;
      case "courseModules":
        return <CourseModulesEditor data={cms.courseModules ?? DEFAULT_COURSE_MODULES} saving={saving} onSave={(d) => handleSave("courseModules", d as any)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#1a4da1]/10 text-[#1a4da1] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Full Page CMS Editor
              </span>
              <span className="text-xs text-slate-400">
                Sorted by Homepage Render Order (Top → Bottom)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Landing Page CMS Manager</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Select a section below to edit content and translations in real-time.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1a4da1] hover:bg-[#133a7a] px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Globe size={15} />
            Preview Live Landing Page ↗
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Page Sections Order
                </p>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  10 Sections
                </span>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[calc(100vh-140px)] overflow-y-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-start gap-3 p-3 text-left transition-all relative ${
                          isActive
                            ? "bg-blue-50/80 text-[#1a4da1] font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a4da1] rounded-r-full" />
                        )}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black ${
                            isActive
                              ? "bg-[#1a4da1] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          #{tab.step}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs truncate font-bold ${isActive ? "text-[#1a4da1]" : "text-slate-800"}`}>
                              {tab.label.replace(/^\d+\.\s*/, "")}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {tab.subLabel}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Editor Content Area */}
          <main className="flex-1 min-w-0">
            {/* Top Quick Step Selector Tabs for Tablet / Laptop */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 mb-5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#1a4da1] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.step}
                    </span>
                    <span>{tab.label.replace(/^\d+\.\s*/, "")}</span>
                  </button>
                );
              })}
            </div>

            {renderEditor()}
          </main>
        </div>
      </div>
    </div>
  );
}
