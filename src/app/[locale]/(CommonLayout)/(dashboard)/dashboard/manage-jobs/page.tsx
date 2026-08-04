"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  Plus,
  Trash2,
  Eye,
  Pencil,
  Copy,
  Globe,
  EyeOff,
  Lock,
  Loader2,
  X,
  Search,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Tag,
  Building2,
  Upload,
  ImageIcon,
  Flag,
} from "lucide-react";
import { useLocale } from "next-intl";
import {
  useGetAllJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useUpdateJobStatusMutation,
  useDuplicateJobMutation,
  useDeleteJobMutation,
  useUploadJobImageMutation,
} from "@/app/redux/api/jobsApi/jobsApi";
import { useGetJobCategoriesQuery } from "@/app/redux/api/jobsApi/JobCategoryApi";
import { useGetCountriesQuery } from "@/app/redux/api/jobsApi/CountryApi";
import { getImageUrl } from "@/utils/imageUtils";
import type {
  IJob,
  ICreateJobPayload,
  TJobType,
  TJobStatus,
} from "@/types/job";

// ─── Color Palette ───────────────────────────────────────────────────
const CARD_COLORS = [
  { from: "#1a4da1", to: "#2B59C3", light: "#EFF6FF", border: "#BFDBFE" },
  { from: "#0d9488", to: "#14b8a6", light: "#F0FDFA", border: "#99F6E4" },
  { from: "#7c3aed", to: "#9333ea", light: "#F5F3FF", border: "#DDD6FE" },
  { from: "#ea580c", to: "#f97316", light: "#FFF7ED", border: "#FED7AA" },
  { from: "#0891b2", to: "#06b6d4", light: "#ECFEFF", border: "#A5F3FC" },
  { from: "#059669", to: "#10b981", light: "#ECFDF5", border: "#6EE7B7" },
];
function getCardColor(index: number) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

// ─── Country List ────────────────────────────────────────────────────
const COUNTRIES = [
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "UAE", flag: "🇦🇪" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Kuwait", flag: "🇰🇼" },
  { name: "Oman", flag: "🇴🇲" },
  { name: "Bahrain", flag: "🇧🇭" },
  { name: "USA", flag: "🇺🇸" },
  { name: "UK", flag: "🇬🇧" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "India", flag: "🇮🇳" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "China", flag: "🇨🇳" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Jordan", flag: "🇯🇴" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Remote / Worldwide", flag: "🌐" },
];

function getCountryFlag(country?: string, location?: string): string {
  const src = country || location;
  if (!src) return "🌍";
  const found = COUNTRIES.find(
    (c) => c.name.toLowerCase() === src.toLowerCase(),
  );
  if (found) return found.flag;
  const lower = src.toLowerCase();
  const FLAG_MAP: Record<string, string> = {
    usa: "🇺🇸", "united states": "🇺🇸", america: "🇺🇸",
    uk: "🇬🇧", "united kingdom": "🇬🇧", england: "🇬🇧", britain: "🇬🇧",
    canada: "🇨🇦", australia: "🇦🇺", germany: "🇩🇪", france: "🇫🇷",
    uae: "🇦🇪", dubai: "🇦🇪", "abu dhabi": "🇦🇪",
    qatar: "🇶🇦", doha: "🇶🇦",
    saudi: "🇸🇦", "saudi arabia": "🇸🇦", riyadh: "🇸🇦",
    bangladesh: "🇧🇩", dhaka: "🇧🇩",
    india: "🇮🇳", delhi: "🇮🇳", mumbai: "🇮🇳",
    singapore: "🇸🇬", malaysia: "🇲🇾", "kuala lumpur": "🇲🇾",
    oman: "🇴🇲", muscat: "🇴🇲", kuwait: "🇰🇼", bahrain: "🇧🇭",
    remote: "🌐", worldwide: "🌐", global: "🌐",
  };
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (lower.includes(key)) return flag;
  }
  return "🌍";
}

function getDisplayCountry(country?: string, location?: string): string {
  if (country) return country;
  if (!location) return "Worldwide";
  const parts = location.split(",");
  return parts[parts.length - 1].trim() || location;
}

// ─── Status Badge ────────────────────────────────────────────────────
const JobStatusBadge = ({ status }: { status: TJobStatus }) => {
  const config: Record<TJobStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-600", icon: <EyeOff size={11} /> },
    published: { label: "Published", bg: "bg-green-100", text: "text-green-700", icon: <Globe size={11} /> },
    closed: { label: "Closed", bg: "bg-red-100", text: "text-red-600", icon: <Lock size={11} /> },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── Simple Field ────────────────────────────────────────────────────
const Field = ({
  label, name, type = "text", placeholder = "", span = false, form, onChange,
}: {
  label: string; name: keyof ICreateJobPayload; type?: string; placeholder?: string;
  span?: boolean; form: ICreateJobPayload; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className={span ? "sm:col-span-2" : ""}>
    <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">{label}</label>
    <input
      type={type} name={name as string} value={(form[name] as string) || ""}
      onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] focus:ring-1 focus:ring-[#1a4da1] transition-all"
    />
  </div>
);

// ─── List Field ──────────────────────────────────────────────────────
const ListField = ({
  label, value, setValue, field, color, form, onAdd, onRemove,
}: {
  label: string; value: string; setValue: (v: string) => void;
  field: "qualifications" | "responsibilities" | "benefits" | "qualificationsBn" | "responsibilitiesBn" | "benefitsBn"; color: string;
  form: ICreateJobPayload;
  onAdd: (field: "qualifications" | "responsibilities" | "benefits" | "qualificationsBn" | "responsibilitiesBn" | "benefitsBn", value: string, clear: () => void) => void;
  onRemove: (field: "qualifications" | "responsibilities" | "benefits" | "qualificationsBn" | "responsibilitiesBn" | "benefitsBn", idx: number) => void;
}) => (
  <div className="sm:col-span-2">
    <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">{label}</label>
    <div className="flex gap-2 mb-2">
      <input
        value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd(field, value, () => setValue("")))}
        placeholder="লিখুন এবং Enter চাপুন..."
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1]"
      />
      <button type="button" onClick={(e) => { e.preventDefault(); onAdd(field, value, () => setValue("")); }}
        className="px-3 py-2 bg-[#1a4da1] text-white rounded-lg text-sm hover:bg-[#133a7a] transition-colors">
        <Plus size={14} />
      </button>
    </div>
    <div className="flex flex-wrap gap-2">
      {form[field]?.map((item, i) => (
        <span key={i} className={`inline-flex items-center gap-1.5 ${color} text-xs px-3 py-1 rounded-full font-medium`}>
          {item}
          <button type="button" onClick={() => onRemove(field, i)}><X size={10} /></button>
        </span>
      ))}
    </div>
  </div>
);

// ─── Job Details Modal ───────────────────────────────────────────────
const JobDetailsModal = ({
  job, onClose, onStatusChange, isUpdating,
}: {
  job: IJob; onClose: () => void; onStatusChange: (status: TJobStatus) => void; isUpdating: boolean;
}) => {
  const flag = getCountryFlag(job.country, job.location);
  const displayCountry = getDisplayCountry(job.country, job.location);
  const locale = useLocale();

  const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
  const displayCompanyName = locale === "bn" ? (job.companyNameBn || job.companyName) : job.companyName;
  const displayAbout = locale === "bn" ? (job.aboutBn || job.about) : job.about;
  const displayLocation = locale === "bn" ? (job.locationBn || job.location) : job.location;
  const displaySalary = locale === "bn" ? (job.salaryBn || job.salary) : job.salary;
  const displayExperience = locale === "bn" ? (job.experienceBn || job.experience) : job.experience;
  const displayDutyTime = locale === "bn" ? (job.dutyTimeBn || job.dutyTime) : job.dutyTime;

  const displayQualifications = locale === "bn" ? (job.qualificationsBn || job.qualifications) : job.qualifications;
  const displayResponsibilities = locale === "bn" ? (job.responsibilitiesBn || job.responsibilities) : job.responsibilities;
  const displayBenefits = locale === "bn" ? (job.benefitsBn || job.benefits) : job.benefits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        {/* Header with image or gradient */}
        <div className="relative h-36 sm:h-44 overflow-hidden rounded-t-2xl shrink-0">
          {job.image ? (
            <>
              <img src={getImageUrl(job.image)} alt={displayTitle}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f1e45 0%, #1a4da1 55%, #2B59C3 100%)" }} />
          )}
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-black text-white truncate leading-tight">{displayTitle}</h2>
                {displayCompanyName && (
                  <p className="text-blue-100 text-xs font-semibold mt-0.5">{displayCompanyName}</p>
                )}
                <p className="text-blue-200 text-sm mt-0.5">{job.category} · {job.type}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <JobStatusBadge status={job.status} />
                <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
          {/* Country badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg">
            <span className="text-base leading-none">{flag}</span>
            <span className="text-[11px] font-extrabold text-gray-800 max-w-[90px] truncate">{displayCountry}</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <MapPin size={14} />, label: "Location", value: displayLocation || "—" },
              { icon: <Flag size={14} />, label: "Country", value: `${flag} ${displayCountry}` },
              { icon: <Users size={14} />, label: "Vacancy", value: job.vacancy || "—" },
              { icon: <Clock size={14} />, label: "Experience", value: displayExperience || "—" },
              { icon: <TrendingUp size={14} />, label: "Salary", value: displaySalary || "—" },
              { icon: <Clock size={14} />, label: "Duty Time", value: displayDutyTime || "—" },
              { icon: <Calendar size={14} />, label: "Deadline", value: job.deadline || "—" },
              { icon: <Eye size={14} />, label: "Views", value: String(job.viewCount ?? 0) },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">{item.icon} {item.label}</div>
                <p className="text-sm font-semibold text-slate-700 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {displayAbout && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{displayAbout}</p>
            </div>
          )}

          {displayQualifications?.length ? (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Qualifications</p>
              <ul className="space-y-1.5">
                {displayQualifications.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /> {q}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {displayResponsibilities?.length ? (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Responsibilities</p>
              <ul className="space-y-1.5">
                {displayResponsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {displayBenefits?.length ? (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Benefits</p>
              <div className="flex flex-wrap gap-2">
                {displayBenefits.map((b, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">{b}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 rounded-b-2xl">
          <p className="text-xs text-gray-400 font-semibold mb-3">Status পরিবর্তন:</p>
          <div className="flex flex-wrap gap-2">
            {(["draft", "published", "closed"] as TJobStatus[]).map((s) => (
              <button key={s} onClick={() => onStatusChange(s)} disabled={isUpdating || job.status === s}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                  ${s === "published" ? "bg-green-600 hover:bg-green-700 text-white"
                  : s === "draft" ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-red-500 hover:bg-red-600 text-white"}`}>
                {s === "published" ? "Publish" : s === "draft" ? "Draft করুন" : "Close করুন"}
              </button>
            ))}
            {isUpdating && <Loader2 size={18} className="animate-spin text-gray-400 my-auto" />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Empty Form ──────────────────────────────────────────────────────
const EMPTY_FORM: ICreateJobPayload = {
  title: "", slug: "", type: "Full time", status: "draft",
  category: "", location: "", country: "", image: "",
  salary: "", duration: "", dutyTime: "", vacancy: "", experience: "",
  about: "", deadline: "", date: new Date().toISOString().split("T")[0],
  qualifications: [], responsibilities: [], benefits: [],
  titleBn: "", locationBn: "", salaryBn: "", durationBn: "", dutyTimeBn: "",
  experienceBn: "", aboutBn: "", qualificationsBn: [],
  responsibilitiesBn: [], benefitsBn: [],
  companyName: "", companyNameBn: "",
};

// ─── Job Form ────────────────────────────────────────────────────────
const JobForm = ({
  initial, onClose, onSave, isLoading,
}: {
  initial?: Partial<ICreateJobPayload>; onClose: () => void;
  onSave: (data: ICreateJobPayload) => void; isLoading: boolean;
}) => {
  const [form, setForm] = useState<ICreateJobPayload>({ ...EMPTY_FORM, ...initial });
  const [qualInput, setQualInput] = useState("");
  const [respInput, setRespInput] = useState("");
  const [benInput, setBenInput] = useState("");

  const [activeTab, setActiveTab] = useState<"en" | "bn">("en");
  const [qualInputBn, setQualInputBn] = useState("");
  const [respInputBn, setRespInputBn] = useState("");
  const [benInputBn, setBenInputBn] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.image ? getImageUrl(initial.image) : null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useGetJobCategoriesQuery({ active: true });
  const { data: countries = [] } = useGetCountriesQuery();
  const [uploadJobImage] = useUploadJobImageMutation();

  const selectedCountryFlag = getCountryFlag(form.country);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addItem = (
    field: "qualifications" | "responsibilities" | "benefits" | "qualificationsBn" | "responsibilitiesBn" | "benefitsBn",
    value: string, clear: () => void,
  ) => {
    if (!value.trim()) return;
    setForm((p) => ({ ...p, [field]: [...(p[field] || []), value.trim()] }));
    clear();
  };

  const removeItem = (
    field: "qualifications" | "responsibilities" | "benefits" | "qualificationsBn" | "responsibilitiesBn" | "benefitsBn", idx: number,
  ) => setForm((p) => ({ ...p, [field]: p[field]?.filter((_, i) => i !== idx) }));

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const serverUrl = await uploadJobImage(fd).unwrap();
      setForm((p) => ({ ...p, image: serverUrl }));
      toast.success("Image uploaded successfully!");
    } catch {
      toast.error("Upload failed — paste an image URL instead.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleUrlInput = (url: string) => {
    setForm((p) => ({ ...p, image: url }));
    setImagePreview(url || null);
  };

  const clearImage = () => {
    setForm((p) => ({ ...p, image: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!form.title || !form.slug || !form.category) {
      toast.error("Title, Slug এবং Category আবশ্যক!");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={18} className="text-[#1a4da1]" />
            {initial ? "Job Edit করুন" : "নতুন Job Post করুন"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* ── Image Upload Section ─────────────────────────────── */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1a4da1] mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <ImageIcon size={12} /> Company Logo
            </label>

            {/* Preview */}
            {imagePreview && (
              <div className="relative mb-3 rounded-xl overflow-hidden h-36 w-full border border-gray-200 shadow-sm">
                <img src={imagePreview} alt="Logo preview" className="w-full h-full object-contain bg-slate-50 p-2" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button type="button" onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors">
                  <X size={12} />
                </button>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-xl">
                      <Loader2 size={15} className="animate-spin text-[#1a4da1]" />
                      <span className="text-sm font-bold text-[#1a4da1]">Uploading…</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Drop Zone */}
            {!imagePreview && (
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-[#1a4da1] bg-blue-50 scale-[1.01]"
                    : "border-gray-200 hover:border-[#1a4da1] hover:bg-blue-50/40"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleFileSelect} />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Loader2 size={18} className="animate-spin text-[#1a4da1]" />
                    <span className="text-sm text-[#1a4da1] font-semibold">Uploading…</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                      <Upload size={20} className="text-[#1a4da1]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      Drag & drop or{" "}
                      <span className="text-[#1a4da1] font-bold">browse to upload</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — Max 5 MB</p>
                  </>
                )}
              </div>
            )}

            {/* URL fallback */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-bold tracking-wider">OR PASTE IMAGE URL</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <input
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={form.image || ""}
              onChange={(e) => handleUrlInput(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] focus:ring-1 focus:ring-[#1a4da1]/30 transition-all"
            />
          </div>

          {/* ── Shared Fields ─────────────────────────────────────── */}
          <Field label="Slug *" name="slug" placeholder="software-engineer" form={form} onChange={handleInput} />

          <div>
            <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">Job Type *</label>
            <select name="type" value={form.type} onChange={handle}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white">
              <option>Full time</option>
              <option>Part time</option>
              <option>Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">Category *</label>
            <select name="category" value={form.category} onChange={handle}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white">
              <option value="">— Select Category —</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* ── Country Selector ─────────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <Flag size={11} /> Country / Flag
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none pointer-events-none select-none">
                {selectedCountryFlag}
              </span>
              <select name="country" value={form.country || ""} onChange={handle}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white">
                <option value="">— Select Country —</option>
                {countries.map((c: any) => (
                  <option key={c.name} value={c.name}>{getCountryFlag(c.name)} {c.name}</option>
                ))}
              </select>
            </div>
            {form.country && (
              <p className="mt-1.5 text-xs text-[#1a4da1] font-semibold flex items-center gap-1">
                <span>{selectedCountryFlag}</span> {form.country} selected
              </p>
            )}
          </div>

          <Field label="Vacancy" name="vacancy" placeholder="3" form={form} onChange={handleInput} />
          <Field label="Date" name="date" type="date" form={form} onChange={handleInput} />
          <Field label="Deadline" name="deadline" type="date" form={form} onChange={handleInput} />

          {/* ── Tab Selector ─────────────────────────────────────── */}
          <div className="sm:col-span-2 flex border border-gray-100 my-2 bg-gray-50/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === "en"
                  ? "bg-white text-[#1a4da1] shadow-sm border border-gray-100"
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              🇬🇧 English Content (Required)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bn")}
              className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === "bn"
                  ? "bg-white text-[#1a4da1] shadow-sm border border-gray-100"
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              🇧🇩 Bengali Content (Optional)
            </button>
          </div>

          {/* ── Tab Content ──────────────────────────────────────── */}
          {activeTab === "en" ? (
            <>
              <Field label="Job Title *" name="title" placeholder="Software Engineer" form={form} onChange={handleInput} />
              <Field label="Company Name" name="companyName" placeholder="Emaar Engineering LLC" form={form} onChange={handleInput} />
              <Field label="Location" name="location" placeholder="Dhaka, Bangladesh" form={form} onChange={handleInput} />
              <Field label="Salary" name="salary" placeholder="৳ 30,000 - 50,000" form={form} onChange={handleInput} />
              <Field label="Duration" name="duration" placeholder="6 months" form={form} onChange={handleInput} />
              <Field label="Duty Time" name="dutyTime" placeholder="8 hours / day" form={form} onChange={handleInput} />
              <Field label="Experience" name="experience" placeholder="1-2 years" form={form} onChange={handleInput} />
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">About the Job</label>
                <textarea name="about" value={form.about || ""} onChange={handle} rows={3}
                  placeholder="Describe the job role..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] resize-none" />
              </div>

              <ListField label="Qualifications" value={qualInput} setValue={setQualInput} field="qualifications"
                color="bg-green-50 text-green-700" form={form} onAdd={addItem} onRemove={removeItem} />
              <ListField label="Responsibilities" value={respInput} setValue={setRespInput} field="responsibilities"
                color="bg-blue-50 text-blue-700" form={form} onAdd={addItem} onRemove={removeItem} />
              <ListField label="Benefits" value={benInput} setValue={setBenInput} field="benefits"
                color="bg-purple-50 text-purple-700" form={form} onAdd={addItem} onRemove={removeItem} />
            </>
          ) : (
            <>
              <Field label="Job Title (Bengali)" name="titleBn" placeholder="সফটওয়্যার ইঞ্জিনিয়ার" form={form} onChange={handleInput} />
              <Field label="Company Name (Bengali)" name="companyNameBn" placeholder="ইমার ইঞ্জিনিয়ারিং এলএলসি" form={form} onChange={handleInput} />
              <Field label="Location (Bengali)" name="locationBn" placeholder="ঢাকা, বাংলাদেশ" form={form} onChange={handleInput} />
              <Field label="Salary (Bengali)" name="salaryBn" placeholder="৳ ৩০,০০০ - ৫০,০০০" form={form} onChange={handleInput} />
              <Field label="Duration (Bengali)" name="durationBn" placeholder="৬ মাস" form={form} onChange={handleInput} />
              <Field label="Duty Time (Bengali)" name="dutyTimeBn" placeholder="৮ ঘণ্টা / দিন" form={form} onChange={handleInput} />
              <Field label="Experience (Bengali)" name="experienceBn" placeholder="১-২ বছর" form={form} onChange={handleInput} />
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">About the Job (Bengali)</label>
                <textarea name="aboutBn" value={form.aboutBn || ""} onChange={handle} rows={3}
                  placeholder="জব সম্পর্কে বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] resize-none" />
              </div>

              <ListField label="Qualifications (Bengali)" value={qualInputBn} setValue={setQualInputBn} field="qualificationsBn"
                color="bg-green-50 text-green-700" form={form} onAdd={addItem} onRemove={removeItem} />
              <ListField label="Responsibilities (Bengali)" value={respInputBn} setValue={setRespInputBn} field="responsibilitiesBn"
                color="bg-blue-50 text-blue-700" form={form} onAdd={addItem} onRemove={removeItem} />
              <ListField label="Benefits (Bengali)" value={benInputBn} setValue={setBenInputBn} field="benefitsBn"
                color="bg-purple-50 text-purple-700" form={form} onAdd={addItem} onRemove={removeItem} />
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose}
            className="px-4 sm:px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            বাতিল
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="px-4 sm:px-6 py-2.5 rounded-lg bg-[#1a4da1] text-white text-sm font-bold hover:bg-[#133a7a] flex items-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {initial ? "Save করুন" : "Post করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Job Card ──────────────────────────────────────────────────
const AdminJobCard = ({
  job, index, categories, onView, onEdit, onDuplicate, onDelete,
}: {
  job: IJob; index: number;
  categories: { _id: string; name: string; icon?: string; color?: string }[];
  onView: (job: IJob) => void; onEdit: (job: IJob) => void;
  onDuplicate: (id: string) => void; onDelete: (id: string) => void;
}) => {
  const color = getCardColor(index);
  const flag = getCountryFlag(job.country, job.location);
  const displayCountry = getDisplayCountry(job.country, job.location);
  const locale = useLocale();

  const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
  const displayAbout = locale === "bn" ? (job.aboutBn || job.about) : job.about;
  const displayLocation = locale === "bn" ? (job.locationBn || job.location) : job.location;
  const displaySalary = locale === "bn" ? (job.salaryBn || job.salary) : job.salary;
  const displayExperience = locale === "bn" ? (job.experienceBn || job.experience) : job.experience;
  const displayDutyTime = locale === "bn" ? (job.dutyTimeBn || job.dutyTime) : job.dutyTime;
  const displayCompanyName = locale === "bn" ? (job.companyNameBn || job.companyName) : job.companyName;

  const initial = displayTitle?.charAt(0)?.toUpperCase() ?? "J";
  const description = (displayAbout ?? "").trim();
  const cat = categories.find((c) => c.name === job.category);
  const hasImage = !!job.image;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col">

      {/* ── Banner ────────────────────────────────────────────── */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden shrink-0">

        {/* Soft layered gradient backdrop (always present) */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)` }} />
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border-[12px] border-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-6 w-32 h-32 rounded-full border-[10px] border-white/10 pointer-events-none" />

        {hasImage ? (
          <>
            {/* Dynamic Image Background (Full Banner) */}
            <img
              src={getImageUrl(job.image!)}
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Subtle dark overlay for badge readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
          </>
        ) : (
          /* Centered fallback initial */
          <div className="relative z-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center shadow-xl shadow-black/10 p-1">
              <div className="w-full h-full rounded-[12px] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-inner">
                {initial === "S" || initial === "C" ? (
                  <svg className="w-9 h-9 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 5.5C15.2 4.5 13.7 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C13.7 20 15.2 19.5 16.5 18.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                ) : (
                  <span className="font-black text-2xl text-white select-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                    {initial}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Country badge — top right */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg border border-white/60">
          <span className="text-base leading-none">{flag}</span>
          <span className="text-[11px] font-extrabold text-gray-800 max-w-[80px] truncate">{displayCountry}</span>
        </div>

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3 z-20">
          <JobStatusBadge status={job.status} />
        </div>

        {/* Job type — bottom left */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-1 backdrop-blur-sm">
            <Briefcase size={10} /> {job.type}
          </span>
        </div>

        {/* View count — bottom right */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-1 backdrop-blur-sm">
            <Eye size={10} /> {job.viewCount ?? 0}
          </span>
        </div>
      </div>

      {/* ── Card Body ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title & Category */}
        <div>
          <h3 className="font-extrabold text-[14px] text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
            {displayTitle}
          </h3>
          {displayCompanyName && (
            <p className="text-[12px] font-semibold text-gray-500 mt-1">
              {displayCompanyName}
            </p>
          )}
          {job.category && (
            <div className="flex items-center gap-1 mt-1">
              <Building2 size={11} className="text-gray-400 shrink-0" />
              <span className="text-[11px] font-semibold truncate px-2 py-0.5 rounded-full"
                style={{ backgroundColor: (cat?.color || "#1a4da1") + "18", color: cat?.color || "#1a4da1" }}>
                {cat?.icon} {job.category}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {description ? (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 flex-1 min-h-0">{description}</p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Location / Country highlight row */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
          style={{ background: color.light, borderColor: color.border }}>
          <Globe size={14} style={{ color: color.from }} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Location</p>
            <p className="text-[12px] font-extrabold truncate leading-tight" style={{ color: color.from }}>
              {flag} {displayLocation ?? displayCountry}
            </p>
          </div>
          {job.deadline && (
            <div className="text-right shrink-0">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Deadline</p>
              <p className="text-[10.5px] font-bold text-gray-600">{job.deadline}</p>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap text-[10.5px] text-gray-500">
          {displaySalary && (
            <span className="font-bold px-2 py-0.5 rounded-full"
              style={{ background: color.from + "18", color: color.from }}>
              {displaySalary}
            </span>
          )}
          {job.vacancy && (
            <span className="flex items-center gap-0.5"><Users size={10} /> {job.vacancy} vacancy</span>
          )}
          {displayExperience && (
            <span className="flex items-center gap-0.5"><Clock size={10} /> {displayExperience}</span>
          )}
          {displayDutyTime && (
            <span className="flex items-center gap-0.5"><Clock size={10} /> {displayDutyTime}</span>
          )}
          {hasImage && (
            <span className="flex items-center gap-0.5 text-[#1a4da1]">
              <ImageIcon size={10} /> Photo
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
          <button onClick={() => onView(job)} title="View Details"
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-[#1a4da1] bg-blue-50 hover:bg-blue-100 transition-colors">
            <Eye size={13} /> Details
          </button>
          <button onClick={() => onEdit(job)} title="Edit"
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors">
            <Pencil size={13} /> Edit
          </button>
          <button onClick={() => onDuplicate(job._id)} title="Duplicate"
            className="p-2 rounded-xl text-purple-500 bg-purple-50 hover:bg-purple-100 transition-colors">
            <Copy size={14} />
          </button>
          <button onClick={() => onDelete(job._id)} title="Delete"
            className="p-2 rounded-xl text-red-400 bg-red-50 hover:bg-red-100 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Card ───────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    <div className="h-36 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4" />
      <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-1/2" />
      <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-full" />
      <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-9 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  </div>
);

// ─── MAIN PAGE ───────────────────────────────────────────────────────
export default function ManageJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TJobStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: jobs = [], isLoading } = useGetAllJobsQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  const { data: categories = [] } = useGetJobCategoriesQuery({ active: true });

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateJobStatusMutation();
  const [duplicateJob] = useDuplicateJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.titleBn || "").toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase()) ||
      (j.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.locationBn || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.country || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || j.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const counts = {
    all: jobs.length,
    draft: jobs.filter((j) => j.status === "draft").length,
    published: jobs.filter((j) => j.status === "published").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  const handleCreate = async (data: ICreateJobPayload) => {
    try {
      await createJob(data).unwrap();
      toast.success("Job created! Draft হিসেবে save হয়েছে ✅");
      setShowCreateForm(false);
    } catch {
      toast.error("Job create করতে সমস্যা হয়েছে");
    }
  };

  const handleUpdate = async (data: ICreateJobPayload) => {
    if (!editingJob) return;
    try {
      await updateJob({ id: editingJob._id, ...data }).unwrap();
      toast.success("Job updated ✅");
      setEditingJob(null);
    } catch {
      toast.error("Update করতে সমস্যা হয়েছে");
    }
  };

  const handleStatusChange = async (status: TJobStatus) => {
    if (!selectedJob) return;
    try {
      await updateStatus({ id: selectedJob._id, status }).unwrap();
      toast.success(`Job "${status}" করা হয়েছে ✅`);
      setSelectedJob((p) => (p ? { ...p, status } : null));
    } catch {
      toast.error("Status update করতে সমস্যা হয়েছে");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateJob(id).unwrap();
      toast.success("Job duplicate হয়েছে ✅");
    } catch {
      toast.error("Duplicate করতে সমস্যা হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই Job টি delete করবেন?")) return;
    try {
      await deleteJob(id).unwrap();
      toast.success("Job deleted ✅");
      if (selectedJob?._id === id) setSelectedJob(null);
    } catch {
      toast.error("Delete করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO HEADER ──────────────────────────────────────────── */}
      <div className="relative px-4 sm:px-6 py-10 sm:py-14 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1e45 0%, #1a4da1 55%, #2B59C3 100%)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-3">
                <Globe size={13} className="text-blue-200" />
                <span className="text-blue-100 text-xs font-bold tracking-wider uppercase">Admin Panel</span>
              </div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight flex items-center gap-3">
                <Briefcase size={28} className="text-blue-300" /> Manage Jobs
              </h1>
              <p className="text-blue-300 text-sm mt-1">
                Jobs post, edit এবং publish করুন — ছবি ও দেশ সহ
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/dashboard/manage-countries"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all border border-white/20"
              >
                <Globe size={16} /> দেশ ব্যবস্থাপনা (Manage Countries)
              </Link>
              <button onClick={() => setShowCreateForm(true)}
                className="flex items-center justify-center gap-2 bg-white text-[#1a4da1] hover:bg-blue-50 px-5 py-3 rounded-xl font-extrabold text-sm shadow-xl transition-all active:scale-95 border border-white/20">
                <Plus size={16} /> নতুন Job Post করুন
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
            {[
              { label: "Total Jobs", value: counts.all, icon: <Briefcase size={16} className="text-white" />, bg: "bg-white/10 border-white/20" },
              { label: "Published", value: counts.published, icon: <Globe size={16} className="text-green-300" />, bg: "bg-green-500/20 border-green-400/30" },
              { label: "Draft", value: counts.draft, icon: <EyeOff size={16} className="text-yellow-300" />, bg: "bg-yellow-500/20 border-yellow-400/30" },
              { label: "Closed", value: counts.closed, icon: <Lock size={16} className="text-red-300" />, bg: "bg-red-500/20 border-red-400/30" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 border backdrop-blur-sm ${s.bg}`}>
                <div className="flex items-center justify-between mb-1.5">
                  {s.icon}
                  <span className="text-2xl font-black text-white">{s.value}</span>
                </div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-16">

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-7 flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, category, country বা location দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a4da1] focus:ring-1 focus:ring-[#1a4da1]/30 transition-all" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              {(["all", "published", "draft", "closed"] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
                    ${statusFilter === s
                      ? s === "published" ? "bg-green-100 text-green-700 border-green-200"
                        : s === "draft" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : s === "closed" ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-[#1a4da1] text-white border-transparent shadow-md"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                  {s === "all" ? `সব (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s as keyof typeof counts]})`}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                  <Tag size={12} /> Category:
                </span>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a4da1] bg-white">
                  <option value="all">সব Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        {!isLoading && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-extrabold text-[#1a4da1]">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "job" : "jobs"}
              {search || categoryFilter !== "all" || statusFilter !== "all" ? " (filtered)" : ""}
            </span>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-700 text-base mb-1">কোনো Job পাওয়া যায়নি</p>
            <p className="text-gray-400 text-sm mb-5">Search বা filter পরিবর্তন করুন, অথবা নতুন job post করুন</p>
            <button onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 bg-[#1a4da1] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#133a7a] transition-colors shadow-lg">
              <Plus size={15} /> প্রথম Job Post করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((job, i) => (
              <AdminJobCard key={job._id} job={job} index={i} categories={categories}
                onView={setSelectedJob} onEdit={setEditingJob}
                onDuplicate={handleDuplicate} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────────── */}
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange} isUpdating={isStatusUpdating} />
      )}
      {showCreateForm && (
        <JobForm onClose={() => setShowCreateForm(false)} onSave={handleCreate} isLoading={isCreating} />
      )}
      {editingJob && (
        <JobForm initial={editingJob} onClose={() => setEditingJob(null)}
          onSave={handleUpdate} isLoading={isUpdating} />
      )}
    </div>
  );
}
