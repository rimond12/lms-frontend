"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Users, Search, Loader2, X, Eye, Trash2,
  CheckCircle, XCircle, Clock, FileText,
  Mail, Phone, MapPin, Building2, Download,
  ChevronRight, Star, Calendar, AlertCircle,
  Filter, StickyNote, Pencil, Plus,
} from "lucide-react";
import {
  useGetAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useBulkUpdateStatusMutation,
  useDeleteApplicationMutation,
  useEditApplicationMutation,
  useAddAdminNoteMutation,
} from "@/app/redux/api/jobsApi/JobApplicationApi";
import type { IApplication, IJob, TApplicationStatus } from "@/types/job";

// ─── Yes/No Questions (apply page এর মতো same) ──────────────────
const QUESTIONS = [
  "Are you interested in fixed-term positions at CX Airlines?",
  "Are you willing to relocate for this position?",
  "Are you available to start within 30 days?",
];

// ─── Pipeline Config ──────────────────────────────────────────────
const PIPELINE: { status: TApplicationStatus; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { status: "pending",     label: "Pending",     color: "text-yellow-600", bg: "bg-yellow-100", icon: <Clock size={12} /> },
  { status: "reviewed",    label: "Reviewed",    color: "text-blue-600",   bg: "bg-blue-100",   icon: <Eye size={12} /> },
  { status: "shortlisted", label: "Shortlisted", color: "text-purple-600", bg: "bg-purple-100", icon: <Star size={12} /> },
  { status: "interview",   label: "Interview",   color: "text-orange-600", bg: "bg-orange-100", icon: <Calendar size={12} /> },
  { status: "accepted",    label: "Accepted",    color: "text-green-600",  bg: "bg-green-100",  icon: <CheckCircle size={12} /> },
  { status: "rejected",    label: "Rejected",    color: "text-red-600",    bg: "bg-red-100",    icon: <XCircle size={12} /> },
];

const StatusBadge = ({ status }: { status: TApplicationStatus }) => {
  const c = PIPELINE.find((p) => p.status === status) ?? PIPELINE[0];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}>
      {c.icon} {c.label}
    </span>
  );
};

const PipelineBar = ({ current }: { current: TApplicationStatus }) => {
  const steps = PIPELINE.filter((p) => p.status !== "rejected");
  const currentIdx = steps.findIndex((p) => p.status === current);
  if (current === "rejected") return (
    <div className="flex items-center gap-2 text-red-500 text-xs font-semibold">
      <XCircle size={14} /> Application Rejected
    </div>
  );
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <React.Fragment key={step.status}>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all
            ${i <= currentIdx ? `${step.bg} ${step.color}` : "bg-gray-100 text-gray-400"}`}>
            {step.icon}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={12} className={i < currentIdx ? "text-gray-400" : "text-gray-200"} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] bg-white";
const sectionCls = "text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-100";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
    {children}
  </div>
);

// vacancy string serialize/deserialize করা
// format: "q0:Yes|q1:No|q2:Yes"
const parseAnswers = (str?: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!str) return result;
  str.split("|").forEach((part) => { const [k, v] = part.split(":"); if (k && v) result[k] = v; });
  return result;
};
const serializeAnswers = (answers: Record<string, string>) =>
  Object.entries(answers).map(([k, v]) => `${k}:${v}`).join("|");

// ─── Tag Input ────────────────────────────────────────────────────
function TagInput({ label, tags, onChange, color = "blue", placeholder }: {
  label: string; tags: string[]; onChange: (t: string[]) => void;
  color?: "blue" | "purple" | "green"; placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const colorMap = { blue: "bg-blue-50 text-blue-700", purple: "bg-purple-50 text-purple-700", green: "bg-green-50 text-green-700" };
  const add = () => { const v = input.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setInput(""); };
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {tags.map((t, i) => (
          <span key={i} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${colorMap[color]}`}>
            {t}
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:opacity-60 ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? `${label} লিখুন, Enter দিন`}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a4da1]" />
        <button onClick={add} className="p-2 bg-[#1a4da1] text-white rounded-lg hover:bg-[#133a7a]">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────
const EditModal = ({ app, onClose, onSave, isSaving }: {
  app: IApplication; onClose: () => void;
  onSave: (data: Partial<IApplication>) => void; isSaving: boolean;
}) => {
  const job = app.jobId as IJob;

  const [form, setForm] = useState({
    name:                   app.name ?? "",
    phone:                  app.phone ?? "",
    presentAddress:         app.presentAddress ?? "",
    linkedin:               app.linkedin ?? "",
    portfolio:              app.portfolio ?? "",
    resumeLink:             app.resumeLink ?? "",
    academicQualifications: app.academicQualifications ?? "",
    exprience:              app.exprience ?? "",
    whyHireYou:             app.whyHireYou ?? "",
    hardSkills:             [...(app.hardSkills ?? [])],
    softSkills:             [...(app.softSkills ?? [])],
    certifications:         [...(app.certifications ?? [])],
    vacancy:                app.vacancy ?? "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Yes/No answers state
  const [answers, setAnswers] = useState<Record<string, string>>(parseAnswers(form.vacancy));

  const setAnswer = (idx: number, val: string) => {
    const updated = { ...answers, [`q${idx}`]: val };
    setAnswers(updated);
    set("vacancy", serializeAnswers(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Pencil size={16} className="text-[#1a4da1]" /> Edit Application
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {app.name} — {typeof job === "object" ? job?.title : "Job"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* ── Personal Info ── */}
          <section>
            <p className={sectionCls}>👤 Personal Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Present Address">
                <input value={form.presentAddress} onChange={(e) => set("presentAddress", e.target.value)} className={inputCls} />
              </Field>
              <Field label="LinkedIn">
                <input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..." className={inputCls} />
              </Field>
              <Field label="Portfolio">
                <input value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)}
                  placeholder="https://..." className={inputCls} />
              </Field>
            </div>
          </section>

          {/* ── CV ── */}
          <section>
            <p className={sectionCls}>📄 CV / Resume</p>
            <Field label="Resume Link (Google Drive / URL)">
              <input value={form.resumeLink} onChange={(e) => set("resumeLink", e.target.value)}
                placeholder="https://drive.google.com/..." className={inputCls} />
            </Field>
          </section>

          {/* ── Academic + Experience ── */}
          <section>
            <p className={sectionCls}>🎓 Academic & Experience</p>
            <div className="space-y-3">
              <Field label="Academic Qualification">
                <input value={form.academicQualifications}
                  onChange={(e) => set("academicQualifications", e.target.value)}
                  placeholder="যেমন: BSc in Civil Engineering" className={inputCls} />
              </Field>
              <Field label="Experience">
                <input value={form.exprience} onChange={(e) => set("exprience", e.target.value)}
                  placeholder="যেমন: 2 years in aviation" className={inputCls} />
              </Field>
            </div>
          </section>

          {/* ── Yes/No Questions ── */}
          <section>
            <p className={sectionCls}>✅ Questionnaire (Yes/No)</p>
            <div className="space-y-3">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3">{q}</p>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`edit-q${i}`} value={opt}
                          checked={answers[`q${i}`] === opt}
                          onChange={() => setAnswer(i, opt)}
                          className="accent-[#1a4da1] w-3.5 h-3.5" />
                        <span className="text-xs text-gray-600 font-medium">{opt}</span>
                      </label>
                    ))}
                    {!answers[`q${i}`] && (
                      <span className="text-[10px] text-gray-400 italic">উত্তর দেওয়া হয়নি</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Why Hire You ── */}
          <section>
            <p className={sectionCls}>💬 Written Answer</p>
            <Field label="Why should we hire you?">
              <textarea value={form.whyHireYou} onChange={(e) => set("whyHireYou", e.target.value)}
                rows={4} placeholder="Applicant এর উত্তর..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] resize-none" />
            </Field>
          </section>

          {/* ── Skills ── */}
          <section>
            <p className={sectionCls}>🛠️ Skills & Certifications</p>
            <div className="space-y-4">
              <TagInput label="Hard Skills" tags={form.hardSkills} onChange={(v) => set("hardSkills", v)}
                color="blue" placeholder="যেমন: AutoCAD, MS Office (Enter দিন)" />
              <TagInput label="Soft Skills" tags={form.softSkills} onChange={(v) => set("softSkills", v)}
                color="purple" placeholder="যেমন: Leadership, Communication (Enter দিন)" />
              <TagInput label="Certifications" tags={form.certifications} onChange={(v) => set("certifications", v)}
                color="green" placeholder="যেমন: First Aid, Safety Training (Enter দিন)" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a4da1] text-white rounded-xl text-sm font-bold hover:bg-[#133a7a] transition-colors disabled:opacity-60">
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Save করুন
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DETAIL MODAL ─────────────────────────────────────────────────
const ApplicationModal = ({ app, onClose, onStatusChange, isUpdating, onAddNote }: {
  app: IApplication; onClose: () => void;
  onStatusChange: (s: TApplicationStatus, note?: string, date?: string) => void;
  isUpdating: boolean;
  onAddNote: (id: string, text: string) => Promise<void>;
}) => {
  const job = app.jobId as IJob;
  const [adminNote, setAdminNote] = useState("");
  const [interviewDate, setInterviewDate] = useState(app.interviewDate || "");
  const [isSendingNote, setIsSendingNote] = useState(false);
  const answers = parseAnswers(app.vacancy);

  const handleSendNote = async () => {
    if (!adminNote.trim()) return;
    setIsSendingNote(true);
    try {
      await onAddNote(app._id, adminNote.trim());
      setAdminNote(""); // ✅ send এর পর input clear
      toast.success("Note পাঠানো হয়েছে ✅");
    } catch {
      toast.error("Note পাঠাতে সমস্যা হয়েছে");
    } finally {
      setIsSendingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">{app.name}</h2>
            <p className="text-sm text-gray-500 truncate">{typeof job === "object" ? job?.title : "Job Application"}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={app.status} />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Pipeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Application Pipeline</p>
            <PipelineBar current={app.status} />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Mail size={14} />,      label: "Email",      value: app.email },
              { icon: <Phone size={14} />,     label: "Phone",      value: app.phone },
              { icon: <MapPin size={14} />,    label: "Address",    value: app.presentAddress },
              { icon: <Building2 size={14} />, label: "Experience", value: app.exprience || "—" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#1a4da1] mt-0.5 flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm text-gray-800 break-words">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Academic */}
          <InfoRow title="Academic Qualification">
            <p className="text-sm text-gray-700">{app.academicQualifications || "—"}</p>
          </InfoRow>

          {/* Yes/No Answers */}
          {QUESTIONS.length > 0 && (
            <InfoRow title="Questionnaire (Yes/No)">
              <div className="space-y-2">
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-600 flex-1">{q}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      answers[`q${i}`] === "Yes" ? "bg-green-50 text-green-700" :
                      answers[`q${i}`] === "No"  ? "bg-red-50 text-red-600" :
                                                    "bg-gray-100 text-gray-400"
                    }`}>
                      {answers[`q${i}`] || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </InfoRow>
          )}

          {/* Why Hire */}
          {app.whyHireYou && (
            <InfoRow title="Why Hire Me">
              <p className="text-sm text-gray-700 leading-relaxed">{app.whyHireYou}</p>
            </InfoRow>
          )}

          {/* Skills */}
          {(app.hardSkills?.length || app.softSkills?.length || app.certifications?.length) ? (
            <div className="space-y-3">
              {app.hardSkills?.length ? (
                <InfoRow title="Hard Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {app.hardSkills.map((s, i) => <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>)}
                  </div>
                </InfoRow>
              ) : null}
              {app.softSkills?.length ? (
                <InfoRow title="Soft Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {app.softSkills.map((s, i) => <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>)}
                  </div>
                </InfoRow>
              ) : null}
              {app.certifications?.length ? (
                <InfoRow title="Certifications">
                  <div className="flex flex-wrap gap-1.5">
                    {app.certifications.map((s, i) => <span key={i} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>)}
                  </div>
                </InfoRow>
              ) : null}
            </div>
          ) : null}

          {/* Resume + Links */}
          <div className="flex flex-wrap gap-4">
            {app.resumeLink && (
              <a href={app.resumeLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#1a4da1] hover:underline text-sm font-medium">
                <FileText size={15} /> Resume / CV দেখুন
              </a>
            )}
            {app.linkedin && (
              <a href={app.linkedin} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#1a4da1] hover:underline font-medium">🔗 LinkedIn</a>
            )}
            {app.portfolio && (
              <a href={app.portfolio} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#1a4da1] hover:underline font-medium">🌐 Portfolio</a>
            )}
          </div>

          {/* Interview Date */}
          {app.status === "interview" && (
            <InfoRow title="Interview Date">
              <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] w-full sm:w-auto" />
            </InfoRow>
          )}

          {/* ✅ Admin Notes — multiple */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Admin Notes
            </p>

            {/* Notes list */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {/* পুরনো single note (backward compat) */}
              {app.adminNote && !app.adminNotes?.length && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-yellow-600 italic">{app.adminNote}</p>
                </div>
              )}
              {/* নতুন multiple notes */}
              {app.adminNotes?.length ? (
                app.adminNotes.map((note, i) => (
                  <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                    <p className="text-xs text-yellow-700 leading-relaxed">{note.text}</p>
                    <p className="text-[10px] text-yellow-400 mt-1">
                      {new Date(note.createdAt).toLocaleString("bn-BD")}
                    </p>
                  </div>
                ))
              ) : !app.adminNote ? (
                <p className="text-xs text-gray-400 italic">এখনো কোনো note নেই</p>
              ) : null}
            </div>

            {/* ✅ নতুন note লেখার input */}
            <div className="flex gap-2">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="নতুন note লিখুন — applicant এর My Applications এ দেখাবে..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleSendNote();
                }}
              />
              <button
                onClick={handleSendNote}
                disabled={!adminNote.trim() || isSendingNote}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-[#1a4da1] hover:bg-[#133a7a] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px]"
                title="Ctrl+Enter"
              >
                {isSendingNote
                  ? <Loader2 size={14} className="animate-spin" />
                  : <StickyNote size={14} />
                }
                <span>Send</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Ctrl+Enter দিয়েও পাঠানো যাবে</p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 rounded-b-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pipeline Action</p>
          <div className="flex flex-wrap gap-2">
            {PIPELINE.map((p) => (
              <button key={p.status}
                onClick={() => onStatusChange(p.status, adminNote, interviewDate)}
                disabled={isUpdating || app.status === p.status}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${app.status === p.status ? `${p.bg} ${p.color} ring-2 ring-offset-1 ring-current` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {p.icon} {p.label}
              </button>
            ))}
            {isUpdating && <Loader2 size={16} className="animate-spin text-gray-400 my-auto" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
    {children}
  </div>
);

// ─── CSV Export ───────────────────────────────────────────────────
const exportToCSV = (applications: IApplication[]) => {
  const headers = ["Name", "Email", "Phone", "Job", "Status", "Experience", "Applied Date"];
  const rows = applications.map((app) => {
    const job = app.jobId as IJob;
    return [app.name, app.email, app.phone, typeof job === "object" ? job?.title : "—",
      app.status, app.exprience || "—",
      app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"];
  });
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `applications-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV export হয়েছে ✅");
};

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function JobApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<TApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<IApplication | null>(null);
  const [editApp, setEditApp] = useState<IApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<TApplicationStatus>("reviewed");
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  const { data: applications = [], isLoading } = useGetAllApplicationsQuery(
    statusFilter === "all" ? undefined : { status: statusFilter }
  );
  const [updateStatus,    { isLoading: isUpdating }]    = useUpdateApplicationStatusMutation();
  const [editApplication, { isLoading: isEditSaving }]  = useEditApplicationMutation();
  const [addAdminNote]                                   = useAddAdminNoteMutation();
  const [bulkUpdate,      { isLoading: isBulkUpdating }] = useBulkUpdateStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();

  const filtered = applications.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.email.toLowerCase().includes(search.toLowerCase()) ||
    app.phone.includes(search)
  );

  const counts = PIPELINE.reduce((acc, p) => {
    acc[p.status] = applications.filter((a) => a.status === p.status).length;
    return acc;
  }, {} as Record<string, number>);

  const toggleSelect = (id: string) =>
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((a) => a._id));

  const handleStatusChange = async (status: TApplicationStatus, adminNote?: string, interviewDate?: string) => {
    if (!selectedApp) return;
    try {
      await updateStatus({ id: selectedApp._id, status, adminNote, interviewDate }).unwrap();
      toast.success(`"${status}" করা হয়েছে ✅`);
      setSelectedApp((p) => p ? { ...p, status } : null);
    } catch { toast.error("Update করতে সমস্যা হয়েছে"); }
  };

  const handleEditSave = async (data: Partial<IApplication>) => {
    if (!editApp) return;
    try {
      await editApplication({ id: editApp._id, ...data }).unwrap();
      toast.success("Application update হয়েছে ✅");
      setEditApp(null);
    } catch { toast.error("Update করতে সমস্যা হয়েছে"); }
  };

  const handleAddNote = async (id: string, text: string) => {
    await addAdminNote({ id, text }).unwrap();
  };

  const handleBulkUpdate = async () => {
    if (!selectedIds.length) { toast.error("কোনো application select করা হয়নি"); return; }
    try {
      const result = await bulkUpdate({ ids: selectedIds, status: bulkStatus }).unwrap();
      toast.success(`${result.modifiedCount} টি "${bulkStatus}" করা হয়েছে ✅`);
      setSelectedIds([]); setShowBulkPanel(false);
    } catch { toast.error("Bulk update করতে সমস্যা হয়েছে"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই Application টি delete করবেন?")) return;
    try {
      await deleteApplication(id).unwrap();
      toast.success("Deleted ✅");
      if (selectedApp?._id === id) setSelectedApp(null);
      setSelectedIds((p) => p.filter((x) => x !== id));
    } catch { toast.error("Delete করতে সমস্যা হয়েছে"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="text-[#1a4da1]" size={24} /> Job Applications
            </h1>
            <p className="text-gray-500 text-sm mt-1">সব applications দেখুন এবং manage করুন</p>
          </div>
          <button onClick={() => exportToCSV(filtered)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-[#1a4da1] text-[#1a4da1] hover:bg-[#1a4da1] hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all">
            <Download size={15} /> CSV Export
          </button>
        </div>

        {/* Pipeline Stats */}
        <div className="flex sm:grid sm:grid-cols-6 gap-3 mb-6 overflow-x-auto pb-1">
          {PIPELINE.map((p) => (
            <button key={p.status} onClick={() => setStatusFilter(p.status)}
              className={`flex-shrink-0 rounded-xl p-3 text-center transition-all border-2 min-w-[90px] sm:min-w-0
                ${statusFilter === p.status ? `${p.bg} border-current ${p.color} shadow-sm` : "bg-white border-transparent hover:border-gray-200 shadow-sm"}`}>
              <p className={`text-xl font-extrabold ${statusFilter === p.status ? p.color : "text-slate-800"}`}>{counts[p.status] ?? 0}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${statusFilter === p.status ? p.color : "text-gray-400"}`}>{p.label}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, email বা phone..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a4da1]" />
              </div>
              <button onClick={() => setStatusFilter("all")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex-shrink-0 ${statusFilter === "all" ? "bg-[#1a4da1] text-white border-transparent" : "bg-white text-gray-500 border-gray-200"}`}>
                সব
              </button>
            </div>
            {selectedIds.length > 0 && (
              <button onClick={() => setShowBulkPanel(!showBulkPanel)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a4da1] text-white text-xs font-bold w-fit">
                <Filter size={12} /> {selectedIds.length} Selected — Bulk Action
              </button>
            )}
          </div>

          {/* Bulk Panel */}
          {showBulkPanel && selectedIds.length > 0 && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold text-[#1a4da1]">{selectedIds.length} টি selected:</p>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as TApplicationStatus)}
                className="px-3 py-1.5 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none">
                {PIPELINE.map((p) => <option key={p.status} value={p.status}>{p.label}</option>)}
              </select>
              <button onClick={handleBulkUpdate} disabled={isBulkUpdating}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1a4da1] text-white text-sm font-bold disabled:opacity-60">
                {isBulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Apply করুন
              </button>
              <button onClick={() => { setSelectedIds([]); setShowBulkPanel(false); }}>
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#1a4da1]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">কোনো application পাওয়া যায়নি</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">
                        <input type="checkbox"
                          checked={selectedIds.length === filtered.length && filtered.length > 0}
                          onChange={toggleAll} className="rounded border-gray-300 text-[#1a4da1]" />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Applicant</th>
                      <th className="px-4 py-3 text-left font-semibold">Job</th>
                      <th className="px-4 py-3 text-left font-semibold">Contact</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Applied</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((app) => {
                      const job = app.jobId as IJob;
                      const isSelected = selectedIds.includes(app._id);
                      return (
                        <tr key={app._id}
                          className={`transition-colors group ${isSelected ? "bg-blue-50/50" : "hover:bg-blue-50/20"}`}>
                          <td className="px-4 py-4">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(app._id)}
                              className="rounded border-gray-300 text-[#1a4da1]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#1a4da1]/10 flex items-center justify-center flex-shrink-0 font-bold text-[#1a4da1] text-sm">
                                {app.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{app.name}</p>
                                <p className="text-xs text-gray-400 max-w-[140px] truncate">{app.academicQualifications}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-slate-700 font-medium line-clamp-1 max-w-[150px]">{typeof job === "object" ? job?.title : "—"}</p>
                            <p className="text-xs text-gray-400">{typeof job === "object" ? job?.type : ""}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-gray-600 text-xs">{app.email}</p>
                            <p className="text-xs text-gray-400">{app.phone}</p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={app.status} />
                            {app.interviewDate && (
                              <p className="text-[10px] text-orange-500 font-semibold mt-1 flex items-center gap-1">
                                <Calendar size={10} /> {app.interviewDate}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString("bn-BD") : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setSelectedApp(app)}
                                className="p-1.5 rounded-lg hover:bg-[#1a4da1]/10 text-[#1a4da1]" title="Details">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => setEditApp(app)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500" title="Edit">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => handleDelete(app._id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filtered.map((app) => {
                  const job = app.jobId as IJob;
                  const isSelected = selectedIds.includes(app._id);
                  return (
                    <div key={app._id} className={`p-4 space-y-3 ${isSelected ? "bg-blue-50/50" : ""}`}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(app._id)}
                          className="rounded border-gray-300 text-[#1a4da1] mt-1 flex-shrink-0" />
                        <div className="w-9 h-9 rounded-full bg-[#1a4da1]/10 flex items-center justify-center flex-shrink-0 font-bold text-[#1a4da1] text-sm">
                          {app.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-800 truncate">{app.name}</p>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-xs text-gray-500 truncate">{typeof job === "object" ? job?.title : "—"}</p>
                          <p className="text-xs text-gray-400">{app.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-12">
                        <button onClick={() => setSelectedApp(app)}
                          className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#1a4da1] hover:bg-blue-50 flex items-center justify-center gap-1">
                          <Eye size={13} /> Details
                        </button>
                        <button onClick={() => setEditApp(app)}
                          className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-amber-500 hover:bg-amber-50 flex items-center justify-center gap-1">
                          <Pencil size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(app._id)}
                          className="p-1.5 rounded-lg border border-gray-200 text-red-400 hover:bg-red-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {filtered.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-t text-xs text-gray-400 flex items-center justify-between">
              <span>মোট {filtered.length} টি application</span>
              {selectedIds.length > 0 && <span className="text-[#1a4da1] font-semibold">{selectedIds.length} টি selected</span>}
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <ApplicationModal app={selectedApp} onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange} isUpdating={isUpdating}
          onAddNote={handleAddNote}
        />
      )}

      {editApp && (
        <EditModal app={editApp} onClose={() => setEditApp(null)}
          onSave={handleEditSave} isSaving={isEditSaving} />
      )}
    </div>
  );
}