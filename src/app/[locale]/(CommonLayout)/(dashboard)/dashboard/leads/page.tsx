"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Users,
  Search,
  Eye,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  CheckCheck,
  PhoneCall,
} from "lucide-react";
import {
  useGetAllLeadsQuery,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
  type TLeadStatus,
  type ILead,
} from "@/app/redux/api/LeadApi/LeadApi";

// ─── Status config ────────────────────────────────────────────────
const STATUS_MAP: Record<
  TLeadStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  new: {
    label: "New",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: <Clock size={11} />,
  },
  reviewed: {
    label: "Reviewed",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: <Eye size={11} />,
  },
  contacted: {
    label: "Contacted",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: <CheckCheck size={11} />,
  },
};

const COUNTRIES = [
  "All",
  "Saudi Arabia",
  "Dubai",
  "Qatar",
  "Singapore",
  "Laos",
  "Maldives",
];
const STATUSES: (TLeadStatus | "all")[] = [
  "all",
  "new",
  "reviewed",
  "contacted",
];

// ─── CSV Export ───────────────────────────────────────────────────
const exportCSV = (leads: ILead[]) => {
  const headers = [
    "Name",
    "Phone",
    "DOB",
    "Address",
    "Country",
    "Experience",
    "Job Type",
    "Education",
    "Status",
    "Submitted",
  ];
  const rows = leads.map((l) => [
    l.fullname,
    l.phone,
    l.dob || "—",
    l.address,
    l.country,
    l.experience || "—",
    l.job_type || "—",
    l.education || "—",
    l.status,
    l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported ✅");
};

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TLeadStatus | "all">("all");
  const [country, setCountry] = useState("All");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data, isLoading } = useGetAllLeadsQuery({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    country: country === "All" ? undefined : country,
    page,
    limit: LIMIT,
  });

  const [deleteLead] = useDeleteLeadMutation();
  const [updateStatus] = useUpdateLeadStatusMutation();

  const leads = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" কে delete করবেন?`)) return;
    try {
      await deleteLead(id).unwrap();
      toast.success("Deleted ✅");
    } catch {
      toast.error("Delete করতে সমস্যা হয়েছে");
    }
  };

  const handleStatus = async (id: string, s: TLeadStatus) => {
    try {
      await updateStatus({ id, status: s }).unwrap();
      toast.success(`Status → "${s}" ✅`);
    } catch {
      toast.error("Update সমস্যা হয়েছে");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="text-blue-700" size={24} /> Submitted Forms
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Immigration lead forms — মোট {total} টি submission
            </p>
          </div>
          <button
            onClick={() => exportCSV(leads)}
            className="flex items-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Download size={15} /> CSV Export
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(["all", "new", "reviewed", "contacted"] as const).map((s) => {
            const count =
              s === "all" ? total : leads.filter((l) => l.status === s).length;
            const cfg =
              s === "all"
                ? {
                    label: "Total",
                    color: "text-slate-800",
                    bg: "bg-white",
                    icon: <Users size={16} />,
                  }
                : { ...STATUS_MAP[s], icon: STATUS_MAP[s].icon };
            return (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`rounded-2xl p-4 text-left shadow-sm border-2 transition-all ${
                  status === s
                    ? `${cfg.bg} border-current ${cfg.color}`
                    : "bg-white border-transparent hover:border-gray-200"
                }`}
              >
                <div
                  className={`text-2xl font-extrabold ${status === s ? cfg.color : "text-slate-800"}`}
                >
                  {s === "all"
                    ? total
                    : ((data?.data ?? []).filter((l) => l.status === s)
                        .length ?? 0)}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wide mt-1 ${status === s ? cfg.color : "text-gray-400"}`}
                >
                  {s === "all" ? "Total" : STATUS_MAP[s as TLeadStatus].label}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Table Container ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="নাম, phone বা address..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {/* Country filter */}
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-700" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">কোনো submission পাওয়া যায়নি</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leads.map((lead, idx) => {
                      const s = STATUS_MAP[lead.status];
                      return (
                        <tr
                          key={lead._id}
                          className="hover:bg-blue-50/20 transition-colors group"
                        >
                          <td className="px-4 py-4 text-gray-400 text-xs">
                            {(page - 1) * LIMIT + idx + 1}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-700/10 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                                {lead.fullname.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {lead.fullname}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {lead.education || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 text-blue-700 hover:underline text-xs font-medium"
                            >
                              <PhoneCall size={11} /> {lead.phone}
                            </a>
                          </td>
                          <td className="px-4 py-4">
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <Globe size={11} /> {lead.country}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 max-w-[160px] truncate">
                            {lead.address}
                          </td>
                          <td className="px-4 py-4">
                            {/* Status dropdown */}
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatus(
                                  lead._id,
                                  e.target.value as TLeadStatus,
                                )
                              }
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer ${s.bg} ${s.color} focus:outline-none`}
                            >
                              {(
                                [
                                  "new",
                                  "reviewed",
                                  "contacted",
                                ] as TLeadStatus[]
                              ).map((st) => (
                                <option key={st} value={st}>
                                  {STATUS_MAP[st].label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs">
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString(
                                  "bn-BD",
                                )
                              : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/dashboard/leads/${lead._id}`}>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-700"
                                  title="Details"
                                >
                                  <Eye size={15} />
                                </button>
                              </Link>
                              <button
                                onClick={() =>
                                  handleDelete(lead._id, lead.fullname)
                                }
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                                title="Delete"
                              >
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

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {leads.map((lead) => {
                  const s = STATUS_MAP[lead.status];
                  return (
                    <div key={lead._id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-700/10 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                            {lead.fullname.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {lead.fullname}
                            </p>
                            <p className="text-xs text-gray-400">
                              {lead.phone}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.color}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe size={11} /> {lead.country}
                        <span className="text-gray-300">·</span>
                        <span className="truncate">{lead.address}</span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Link
                          href={`/dashboard/leads/${lead._id}`}
                          className="flex-1"
                        >
                          <button className="w-full py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1">
                            <Eye size={13} /> Details
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(lead._id, lead.fullname)}
                          className="p-1.5 border border-gray-200 rounded-lg text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer + Pagination */}
          {total > 0 && (
            <div className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                মোট <span className="font-semibold text-gray-600">{total}</span>{" "}
                টি submission
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-700 disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="text-gray-400 text-xs px-1">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                            page === p
                              ? "bg-blue-700 text-white"
                              : "border border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-700"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-700 disabled:opacity-40 transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
