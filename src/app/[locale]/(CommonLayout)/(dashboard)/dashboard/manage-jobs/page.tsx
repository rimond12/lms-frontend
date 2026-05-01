"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  useGetAllJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useUpdateJobStatusMutation,
  useDuplicateJobMutation,
  useDeleteJobMutation,
} from "@/app/redux/api/jobsApi/jobsApi";
import { useGetJobCategoriesQuery } from "@/app/redux/api/jobsApi/JobCategoryApi";
import type {
  IJob,
  ICreateJobPayload,
  TJobType,
  TJobStatus,
} from "@/types/job";

// ─── Status Badge ───────────────────────────────────────────────
const JobStatusBadge = ({ status }: { status: TJobStatus }) => {
  const config: Record<
    TJobStatus,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    draft: {
      label: "Draft",
      bg: "bg-gray-100",
      text: "text-gray-600",
      icon: <EyeOff size={11} />,
    },
    published: {
      label: "Published",
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <Globe size={11} />,
    },
    closed: {
      label: "Closed",
      bg: "bg-red-100",
      text: "text-red-600",
      icon: <Lock size={11} />,
    },
  };
  const c = config[status] ?? config.draft;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
    >
      {c.icon} {c.label}
    </span>
  );
};

// ─── Field Component ────────────────────────────────────────────
const Field = ({
  label,
  name,
  type = "text",
  placeholder = "",
  span = false,
  form,
  onChange,
}: {
  label: string;
  name: keyof ICreateJobPayload;
  type?: string;
  placeholder?: string;
  span?: boolean;
  form: ICreateJobPayload;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className={span ? "sm:col-span-2" : ""}>
    <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <input
      type={type}
      name={name as string}
      value={(form[name] as string) || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] focus:ring-1 focus:ring-[#1a4da1] transition-all"
    />
  </div>
);

// ─── ListField Component ────────────────────────────────────────
const ListField = ({
  label,
  value,
  setValue,
  field,
  color,
  form,
  onAdd,
  onRemove,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  field: "qualifications" | "responsibilities" | "benefits";
  color: string;
  form: ICreateJobPayload;
  onAdd: (
    field: "qualifications" | "responsibilities" | "benefits",
    value: string,
    clear: () => void,
  ) => void;
  onRemove: (
    field: "qualifications" | "responsibilities" | "benefits",
    idx: number,
  ) => void;
}) => (
  <div className="sm:col-span-2">
    <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex gap-2 mb-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && onAdd(field, value, () => setValue(""))
        }
        placeholder="লিখুন এবং Enter চাপুন..."
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1]"
      />
      <button
        type="button"
        onClick={() => onAdd(field, value, () => setValue(""))}
        className="px-3 py-2 bg-[#1a4da1] text-white rounded-lg text-sm hover:bg-[#133a7a] transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
    <div className="flex flex-wrap gap-2">
      {form[field]?.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 ${color} text-xs px-3 py-1 rounded-full font-medium`}
        >
          {item}
          <button type="button" onClick={() => onRemove(field, i)}>
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  </div>
);

// ─── Job Details Modal ──────────────────────────────────────────
const JobDetailsModal = ({
  job,
  onClose,
  onStatusChange,
  isUpdating,
}: {
  job: IJob;
  onClose: () => void;
  onStatusChange: (status: TJobStatus) => void;
  isUpdating: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <div className="min-w-0 flex-1 mr-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">
            {job.title}
          </h2>
          <p className="text-sm text-gray-500">
            {job.category} · {job.type}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <JobStatusBadge status={job.status} />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              icon: <MapPin size={14} />,
              label: "Location",
              value: job.location || "—",
            },
            {
              icon: <Users size={14} />,
              label: "Vacancy",
              value: job.vacancy || "—",
            },
            {
              icon: <Clock size={14} />,
              label: "Experience",
              value: job.experience || "—",
            },
            {
              icon: <TrendingUp size={14} />,
              label: "Salary",
              value: job.salary || "—",
            },
            {
              icon: <Calendar size={14} />,
              label: "Deadline",
              value: job.deadline || "—",
            },
            {
              icon: <Eye size={14} />,
              label: "Views",
              value: String(job.viewCount ?? 0),
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                {item.icon} {item.label}
              </div>
              <p className="text-sm font-semibold text-slate-700 truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {job.about && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              About
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{job.about}</p>
          </div>
        )}

        {job.qualifications?.length ? (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Qualifications
            </p>
            <ul className="space-y-1.5">
              {job.qualifications.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle
                    size={14}
                    className="text-green-500 mt-0.5 flex-shrink-0"
                  />{" "}
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {job.responsibilities?.length ? (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Responsibilities
            </p>
            <ul className="space-y-1.5">
              {job.responsibilities.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle
                    size={14}
                    className="text-blue-500 mt-0.5 flex-shrink-0"
                  />{" "}
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {job.benefits?.length ? (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Benefits
            </p>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((b, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 rounded-b-2xl">
        <p className="text-xs text-gray-400 font-semibold mb-3">
          Status পরিবর্তন:
        </p>
        <div className="flex flex-wrap gap-2">
          {(["draft", "published", "closed"] as TJobStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              disabled={isUpdating || job.status === s}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  s === "published"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : s === "draft"
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      : "bg-red-500 hover:bg-red-600 text-white"
                }`}
            >
              {s === "published"
                ? "Publish"
                : s === "draft"
                  ? "Draft করুন"
                  : "Close করুন"}
            </button>
          ))}
          {isUpdating && (
            <Loader2 size={18} className="animate-spin text-gray-400 my-auto" />
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── Job Form (Create / Edit) ───────────────────────────────────
const EMPTY_FORM: ICreateJobPayload = {
  title: "",
  slug: "",
  type: "Full time",
  status: "draft",
  category: "",
  location: "",
  salary: "",
  duration: "",
  vacancy: "",
  experience: "",
  about: "",
  deadline: "",
  date: new Date().toISOString().split("T")[0],
  qualifications: [],
  responsibilities: [],
  benefits: [],
};

const JobForm = ({
  initial,
  onClose,
  onSave,
  isLoading,
}: {
  initial?: Partial<ICreateJobPayload>;
  onClose: () => void;
  onSave: (data: ICreateJobPayload) => void;
  isLoading: boolean;
}) => {
  const [form, setForm] = useState<ICreateJobPayload>({
    ...EMPTY_FORM,
    ...initial,
  });
  const [qualInput, setQualInput] = useState("");
  const [respInput, setRespInput] = useState("");
  const [benInput, setBenInput] = useState("");

  // ✅ Category API
  const { data: categories = [] } = useGetJobCategoriesQuery({ active: true });

  const handle = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addItem = (
    field: "qualifications" | "responsibilities" | "benefits",
    value: string,
    clear: () => void,
  ) => {
    if (!value.trim()) return;
    setForm((p) => ({ ...p, [field]: [...(p[field] || []), value.trim()] }));
    clear();
  };

  const removeItem = (
    field: "qualifications" | "responsibilities" | "benefits",
    idx: number,
  ) =>
    setForm((p) => ({ ...p, [field]: p[field]?.filter((_, i) => i !== idx) }));

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
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={18} className="text-[#1a4da1]" />
            {initial ? "Job Edit করুন" : "নতুন Job Post করুন"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Job Title *"
            name="title"
            placeholder="Junior CAD Designer"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Slug *"
            name="slug"
            placeholder="junior-cad-designer"
            form={form}
            onChange={handleInput}
          />

          <div>
            <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">
              Job Type *
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handle}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white"
            >
              <option>Full time</option>
              <option>Part time</option>
              <option>Internship</option>
            </select>
          </div>

          {/* ✅ Category Dropdown — API থেকে */}
          <div>
            <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handle}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white"
            >
              <option value="">— Select Category —</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Location"
            name="location"
            placeholder="Dhaka, Bangladesh"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Salary"
            name="salary"
            placeholder="৳ 30,000 - 50,000"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Duration"
            name="duration"
            placeholder="6 months"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Vacancy"
            name="vacancy"
            placeholder="3"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Experience"
            name="experience"
            placeholder="1-2 years"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Date"
            name="date"
            type="date"
            form={form}
            onChange={handleInput}
          />
          <Field
            label="Deadline"
            name="deadline"
            type="date"
            form={form}
            onChange={handleInput}
          />

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1a4da1] mb-1.5 uppercase tracking-wide">
              About the Job
            </label>
            <textarea
              name="about"
              value={form.about || ""}
              onChange={handle}
              rows={3}
              placeholder="Job সম্পর্কে সংক্ষেপে লিখুন..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] resize-none"
            />
          </div>

          <ListField
            label="Qualifications"
            value={qualInput}
            setValue={setQualInput}
            field="qualifications"
            color="bg-green-50 text-green-700"
            form={form}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <ListField
            label="Responsibilities"
            value={respInput}
            setValue={setRespInput}
            field="responsibilities"
            color="bg-blue-50 text-blue-700"
            form={form}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <ListField
            label="Benefits"
            value={benInput}
            setValue={setBenInput}
            field="benefits"
            color="bg-purple-50 text-purple-700"
            form={form}
            onAdd={addItem}
            onRemove={removeItem}
          />
        </div>

        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            বাতিল
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 sm:px-6 py-2.5 rounded-lg bg-[#1a4da1] text-white text-sm font-bold hover:bg-[#133a7a] flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {initial ? "Save করুন" : "Post করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ──────────────────────────────────────────────────
export default function ManageJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TJobStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all"); // ✅ নতুন
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: jobs = [], isLoading } = useGetAllJobsQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  // ✅ Category list
  const { data: categories = [] } = useGetJobCategoriesQuery({ active: true });

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateJobStatusMutation();
  const [duplicateJob] = useDuplicateJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  // ✅ Search + status + category filter
  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || j.category === categoryFilter;
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Briefcase className="text-[#1a4da1]" size={24} /> Manage Jobs
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Jobs post, edit এবং publish করুন
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a4da1] hover:bg-[#133a7a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Plus size={16} /> নতুন Job Post করুন
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            {
              label: "Total Jobs",
              value: counts.all,
              color: "border-[#1a4da1]",
              icon: <Briefcase size={18} className="text-[#1a4da1]" />,
            },
            {
              label: "Published",
              value: counts.published,
              color: "border-green-400",
              icon: <Globe size={18} className="text-green-500" />,
            },
            {
              label: "Draft",
              value: counts.draft,
              color: "border-yellow-400",
              icon: <EyeOff size={18} className="text-yellow-500" />,
            },
            {
              label: "Closed",
              value: counts.closed,
              color: "border-red-400",
              icon: <Lock size={18} className="text-red-500" />,
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl p-4 border-l-4 ${s.color} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-1">
                {s.icon}
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                  {s.value}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filter + Search Bar */}
          <div className="p-4 border-b flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title বা category দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1]"
              />
            </div>
            {/* Status Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              {(["all", "published", "draft", "closed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                    ${
                      statusFilter === s
                        ? s === "published"
                          ? "bg-green-100 text-green-700 border-transparent"
                          : s === "draft"
                            ? "bg-yellow-100 text-yellow-700 border-transparent"
                            : s === "closed"
                              ? "bg-red-100 text-red-700 border-transparent"
                              : "bg-[#1a4da1] text-white border-transparent"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                >
                  {s === "all" ? "সব" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {/* ✅ Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 flex-shrink-0">
                  <Tag size={12} /> Category:
                </span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white"
                >
                  <option value="all">সব Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#1a4da1]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold mb-3">কোনো Job পাওয়া যায়নি</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#1a4da1] text-white px-5 py-2.5 rounded-xl text-sm font-bold"
              >
                প্রথম Job Post করুন
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 text-left font-semibold">
                        Title
                      </th>
                      <th className="px-5 py-3 text-left font-semibold">
                        Type
                      </th>
                      <th className="px-5 py-3 text-left font-semibold">
                        Category
                      </th>
                      <th className="px-5 py-3 text-left font-semibold">
                        Deadline
                      </th>
                      <th className="px-5 py-3 text-left font-semibold">
                        Views
                      </th>
                      <th className="px-5 py-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((job) => (
                      <tr
                        key={job._id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {job.location || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {/* ✅ Category badge with color */}
                          {(() => {
                            const cat = categories.find(
                              (c) => c.name === job.category,
                            );
                            return (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{
                                  backgroundColor:
                                    (cat?.color || "#1a4da1") + "15",
                                  color: cat?.color || "#1a4da1",
                                }}
                              >
                                {cat?.icon} {job.category}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">
                          {job.deadline || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <Eye size={13} /> {job.viewCount ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <JobStatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1a4da1]"
                              title="Details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setEditingJob(job)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDuplicate(job._id)}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500"
                              title="Duplicate"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filtered.map((job) => (
                  <div key={job._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {job.location || "—"} · {job.category}
                        </p>
                      </div>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {job.viewCount ?? 0}
                      </span>
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {job.deadline}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#1a4da1] hover:bg-blue-50 flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> Details
                      </button>
                      <button
                        onClick={() => setEditingJob(job)}
                        className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-yellow-600 hover:bg-yellow-50 flex items-center justify-center gap-1"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(job._id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-purple-500 hover:bg-purple-50"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filtered.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-t text-xs text-gray-400">
              মোট {filtered.length} টি job দেখাচ্ছে
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
          isUpdating={isStatusUpdating}
        />
      )}
      {showCreateForm && (
        <JobForm
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreate}
          isLoading={isCreating}
        />
      )}
      {editingJob && (
        <JobForm
          initial={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleUpdate}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
