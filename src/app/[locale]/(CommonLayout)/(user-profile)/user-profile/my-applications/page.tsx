"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Eye,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useGetMyApplicationsQuery } from "@/app/redux/api/jobsApi/JobApplicationApi";
import type { IApplication, IJob, TApplicationStatus } from "@/types/job";

// ─── Pipeline ───────────────────────────────────────────────────
const PIPELINE: {
  status: TApplicationStatus;
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}[] = [
  {
    status: "pending",
    label: "Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    icon: <Clock size={13} />,
  },
  {
    status: "reviewed",
    label: "Reviewed",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: <Eye size={13} />,
  },
  {
    status: "shortlisted",
    label: "Shortlisted",
    color: "text-purple-600",
    bg: "bg-purple-100",
    icon: <Star size={13} />,
  },
  {
    status: "interview",
    label: "Interview",
    color: "text-orange-600",
    bg: "bg-orange-100",
    icon: <Calendar size={13} />,
  },
  {
    status: "accepted",
    label: "Accepted",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: <CheckCircle size={13} />,
  },
  {
    status: "rejected",
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: <XCircle size={13} />,
  },
];

const StatusBadge = ({ status }: { status: TApplicationStatus }) => {
  const c = PIPELINE.find((p) => p.status === status) ?? PIPELINE[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.color}`}
    >
      {c.icon} {c.label}
    </span>
  );
};

// ─── Pipeline Progress ──────────────────────────────────────────
const PipelineProgress = ({ current }: { current: TApplicationStatus }) => {
  const steps = PIPELINE.filter((p) => p.status !== "rejected");
  const currentIdx = steps.findIndex((p) => p.status === current);
  const isRejected = current === "rejected";

  if (isRejected)
    return (
      <div className="flex items-center gap-2 text-red-500 text-xs font-semibold py-2">
        <XCircle size={14} /> Application Rejected
      </div>
    );

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <React.Fragment key={step.status}>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0 transition-all
            ${i <= currentIdx ? `${step.bg} ${step.color}` : "bg-gray-100 text-gray-400"}`}
          >
            {step.icon}
            <span>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight
              size={11}
              className={`flex-shrink-0 ${i < currentIdx ? "text-gray-400" : "text-gray-200"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Application Card ───────────────────────────────────────────
const ApplicationCard = ({ app }: { app: IApplication }) => {
  const [expanded, setExpanded] = useState(false);
  const job = app.jobId as IJob;
  const jobTitle = typeof job === "object" ? job?.title : "Job";
  const jobType = typeof job === "object" ? job?.type : "";
  const jobSlug = typeof job === "object" ? job?.slug : "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Job Initial */}
          <div className="w-10 h-10 rounded-xl bg-[#1a4da1]/10 flex items-center justify-center font-black text-[#1a4da1] text-sm flex-shrink-0">
            {jobTitle.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{jobTitle}</p>
                {jobType && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                    {jobType}
                  </span>
                )}
              </div>
              <StatusBadge status={app.status} />
            </div>

            {/* Applied date */}
            <p className="text-xs text-gray-400 mt-1.5">
              Applied:{" "}
              {app.createdAt
                ? new Date(app.createdAt).toLocaleDateString("bn-BD")
                : "—"}
            </p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mt-4">
          <PipelineProgress current={app.status} />
        </div>

        {/* Interview date badge */}
        {app.status === "interview" && app.interviewDate && (
          <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
            <Calendar size={14} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-orange-600">
                Interview Scheduled
              </p>
              <p className="text-xs text-orange-500">{app.interviewDate}</p>
            </div>
          </div>
        )}

        {/* Admin Notes — multiple */}
        {(app.adminNotes?.length || app.adminNote) && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-bold text-yellow-700">Admin Notes</p>
            {/* পুরনো single note */}
            {app.adminNote && !app.adminNotes?.length && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                <p className="text-xs text-yellow-600 italic">
                  {app.adminNote}
                </p>
              </div>
            )}
            {/* নতুন multiple notes */}
            {app.adminNotes?.map((note, i) => (
              <div
                key={i}
                className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2"
              >
                <p className="text-xs text-yellow-700 leading-relaxed">
                  {note.text}
                </p>
                <p className="text-[10px] text-yellow-400 mt-1">
                  {new Date(note.createdAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2.5 border-t border-gray-50 text-xs text-gray-400 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <span>{expanded ? "কম দেখুন" : "বিস্তারিত দেখুন"}</span>
        <ChevronRight
          size={14}
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-50 space-y-3">
          <DetailRow label="Email" value={app.email} />
          <DetailRow label="Phone" value={app.phone} />
          <DetailRow label="Address" value={app.presentAddress} />
          <DetailRow label="Experience" value={app.exprience || "—"} />
          <DetailRow label="Qualification" value={app.academicQualifications} />

          {app.resumeLink && (
            <a
              href={app.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#1a4da1] text-xs font-semibold hover:underline"
            >
              <FileText size={13} /> Resume / CV দেখুন{" "}
              <ExternalLink size={11} />
            </a>
          )}

          {app.hardSkills?.length ? (
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">
                Hard Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {app.hardSkills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {app.softSkills?.length ? (
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">
                Soft Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {app.softSkills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {jobSlug && (
            <Link href={`/jobs/${jobSlug}`}>
              <button className="w-full mt-2 py-2 border border-[#1a4da1] text-[#1a4da1] rounded-xl text-xs font-bold hover:bg-[#1a4da1] hover:text-white transition-colors">
                Job Details দেখুন
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <p className="text-[11px] text-gray-400 w-24 flex-shrink-0 font-medium pt-0.5">
      {label}
    </p>
    <p className="text-xs text-slate-700 font-medium flex-1">{value || "—"}</p>
  </div>
);

// ─── MAIN PAGE ──────────────────────────────────────────────────
export default function MyApplicationsPage() {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<TApplicationStatus | "all">(
    "all",
  );

  const { data: applications = [], isLoading } = useGetMyApplicationsQuery(
    user?.email || "",
    { skip: !user?.email },
  );

  const filtered =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  const counts = PIPELINE.reduce(
    (acc, p) => {
      acc[p.status] = applications.filter((a) => a.status === p.status).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-[#1a4da1]" size={24} /> My Applications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            আপনার সব job applications এর status দেখুন
          </p>
        </div>

        {/* Not logged in */}
        {!user && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-slate-700 mb-2">Login করা নেই</p>
            <p className="text-sm text-gray-400 mb-5">
              Applications দেখতে login করুন
            </p>
            <Link href="/login">
              <button className="bg-[#1a4da1] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#133a7a] transition-colors">
                Login করুন
              </button>
            </Link>
          </div>
        )}

        {user && (
          <>
            {/* Pipeline Stats - scrollable */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-shrink-0 rounded-xl px-4 py-3 text-center transition-all border-2 min-w-[70px]
                  ${
                    statusFilter === "all"
                      ? "bg-[#1a4da1] text-white border-transparent shadow-sm"
                      : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                  }`}
              >
                <p
                  className={`text-lg font-extrabold ${statusFilter === "all" ? "text-white" : "text-slate-800"}`}
                >
                  {applications.length}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${statusFilter === "all" ? "text-blue-100" : "text-gray-400"}`}
                >
                  সব
                </p>
              </button>

              {PIPELINE.map((p) => (
                <button
                  key={p.status}
                  onClick={() => setStatusFilter(p.status)}
                  className={`flex-shrink-0 rounded-xl px-3 py-3 text-center transition-all border-2 min-w-[80px]
                    ${
                      statusFilter === p.status
                        ? `${p.bg} border-current ${p.color} shadow-sm`
                        : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                    }`}
                >
                  <p
                    className={`text-lg font-extrabold ${statusFilter === p.status ? p.color : "text-slate-800"}`}
                  >
                    {counts[p.status] ?? 0}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${statusFilter === p.status ? p.color : "text-gray-400"}`}
                  >
                    {p.label}
                  </p>
                </button>
              ))}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#1a4da1]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Briefcase size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="font-bold text-slate-600 mb-2">
                  {statusFilter === "all"
                    ? "এখনো কোনো application নেই"
                    : `${statusFilter} কোনো application নেই`}
                </p>
                <p className="text-sm text-gray-400 mb-5">
                  Jobs দেখুন এবং apply করুন
                </p>
                <Link href="/jobs">
                  <button className="bg-[#1a4da1] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#133a7a] transition-colors">
                    Jobs দেখুন
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((app) => (
                  <ApplicationCard key={app._id} app={app} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
