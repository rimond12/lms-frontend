"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  Search,
  Eye,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  FileText,
  Edit,
  X,
  UploadCloud,
} from "lucide-react";
import {
  useGetAllVisaVerificationsQuery,
  useUpdateVisaVerificationMutation,
  useDeleteVisaVerificationMutation,
  type IVisaVerification,
} from "@/app/redux/api/visaVerificationApi/visaVerificationApi";

// ─── Status Config ────────────────────────────────────────────────
const STATUS_MAP = {
  Pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: <Clock size={11} />,
  },
  Approved: {
    label: "Approved",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: <CheckCircle2 size={11} />,
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: <XCircle size={11} />,
  },
};

const STATUSES = ["all", "Pending", "Approved", "Rejected"] as const;

// ─── Edit Modal Component ─────────────────────────────────────────
interface EditModalProps {
  item: IVisaVerification;
  onClose: () => void;
  onSave: (id: string, formData: FormData) => Promise<void>;
}

function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [mobileNumber, setMobileNumber] = useState(item.mobileNumber);
  const [passportNumber, setPassportNumber] = useState(item.passportNumber);
  const [status, setStatus] = useState(item.status);
  const [adminFeedback, setAdminFeedback] = useState(item.adminFeedback || "");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() || !passportNumber.trim()) {
      toast.error("Mobile and Passport numbers are required");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("mobileNumber", mobileNumber);
      fd.append("passportNumber", passportNumber);
      fd.append("status", status);
      fd.append("adminFeedback", adminFeedback);
      if (files.length > 0) {
        files.forEach((f) => {
          fd.append("visaDocument", f);
        });
      }

      await onSave(item._id, fd);
      toast.success("Updated successfully ✅");
      onClose();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b pb-4">
          <Edit size={18} className="text-blue-700" /> Edit Visa Request
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Passport Number</label>
            <input
              type="text"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Replace Documents</label>
              <label className="cursor-pointer flex items-center justify-center gap-1.5 border border-dashed border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-600 transition-colors">
                <UploadCloud size={14} className="text-slate-400" />
                <span className="truncate">
                  {files.length > 0 ? `${files.length} file(s)` : "Choose Files"}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Current Documents list */}
          {item.visaDocument && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Current Documents</label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {Array.isArray(item.visaDocument) ? (
                  item.visaDocument.map((docUrl, dIdx) => (
                    <a
                      key={dIdx}
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:underline font-bold text-xs px-2.5 py-1.5 rounded-lg border border-blue-100"
                    >
                      <Eye size={12} /> Doc {dIdx + 1}
                    </a>
                  ))
                ) : (
                  <a
                    href={item.visaDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:underline font-bold text-xs px-2.5 py-1.5 rounded-lg border border-blue-100"
                  >
                    <Eye size={12} /> View Document
                  </a>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Admin Feedback / Notes</label>
            <textarea
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              rows={3}
              placeholder="Provide visa approval details or rejection reason..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#1a4da1] hover:bg-[#133a7a] text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function VisaVerificationDashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "Pending" | "Approved" | "Rejected">("all");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<IVisaVerification | null>(null);
  const LIMIT = 15;

  const { data, isLoading } = useGetAllVisaVerificationsQuery({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit: LIMIT,
  });

  const [updateVisa] = useUpdateVisaVerificationMutation();
  const [deleteVisa] = useDeleteVisaVerificationMutation();

  const verifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = async (id: string, passport: string) => {
    if (!confirm(`Are you sure you want to delete visa request for passport "${passport}"?`)) return;
    try {
      await deleteVisa(id).unwrap();
      toast.success("Deleted successfully ✅");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Pending" | "Approved" | "Rejected") => {
    try {
      const fd = new FormData();
      fd.append("status", newStatus);
      await updateVisa({ id, formData: fd }).unwrap();
      toast.success(`Status updated to ${newStatus} ✅`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveModal = async (id: string, formData: FormData) => {
    await updateVisa({ id, formData }).unwrap();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Edit Modal */}
      {selectedItem && (
        <EditModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={handleSaveModal}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-blue-700" size={24} /> Visa Verifications
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage visa verification submissions — Total {total} request(s)
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STATUSES.map((s) => {
            const isSelected = status === s;
            const cfg =
              s === "all"
                ? {
                    label: "All Requests",
                    color: "text-slate-800",
                    bg: "bg-white",
                    icon: <ShieldCheck size={16} />,
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
                  isSelected
                    ? `${cfg.bg} border-current ${cfg.color}`
                    : "bg-white border-transparent hover:border-gray-200"
                }`}
              >
                <div className={`text-2xl font-extrabold ${isSelected ? cfg.color : "text-slate-800"}`}>
                  {s === "all"
                    ? total
                    : verifications.filter((v) => v.status === s).length}
                </div>
                <div className={`text-xs font-bold uppercase tracking-wide mt-1 ${isSelected ? cfg.color : "text-gray-400"}`}>
                  {s === "all" ? "Total" : STATUS_MAP[s].label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by mobile number or passport..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-700" />
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No visa verifications found</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Passport Number</th>
                      <th className="px-4 py-3 text-left font-semibold">Mobile Number</th>
                      <th className="px-4 py-3 text-left font-semibold">Document</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Feedback / Note</th>
                      <th className="px-4 py-3 text-left font-semibold">Submitted Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {verifications.map((item, idx) => {
                      const s = STATUS_MAP[item.status];
                      return (
                        <tr key={item._id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-4 py-4 text-gray-400 text-xs">
                            {(page - 1) * LIMIT + idx + 1}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <FileText size={13} className="text-slate-400" />
                              {item.passportNumber}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <a
                              href={`tel:${item.mobileNumber}`}
                              className="flex items-center gap-1 text-blue-700 hover:underline text-xs font-semibold"
                            >
                              <PhoneCall size={11} /> {item.mobileNumber}
                            </a>
                          </td>
                          <td className="px-4 py-4">
                            {Array.isArray(item.visaDocument) && item.visaDocument.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                {item.visaDocument.map((docUrl, dIdx) => (
                                  <a
                                    key={dIdx}
                                    href={docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:underline font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-100 w-fit"
                                  >
                                    <Eye size={11} /> Doc {dIdx + 1}
                                  </a>
                                ))}
                              </div>
                            ) : typeof item.visaDocument === "string" && item.visaDocument ? (
                              <a
                                href={item.visaDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:underline font-bold text-xs px-2.5 py-1.5 rounded-lg border border-blue-100"
                              >
                                <Eye size={12} /> View File
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">No file</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item._id, e.target.value as any)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer ${s.bg} ${s.color} focus:outline-none`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 max-w-[200px] truncate">
                            {item.adminFeedback || <span className="italic text-gray-300">No comments</span>}
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-700"
                                title="Edit & Feedback"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id, item.passportNumber)}
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

              {/* Mobile Card view */}
              <div className="sm:hidden divide-y divide-gray-100">
                {verifications.map((item) => {
                  const s = STATUS_MAP[item.status];
                  return (
                    <div key={item._id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.passportNumber}</p>
                          <a
                            href={`tel:${item.mobileNumber}`}
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline text-xs font-semibold mt-0.5"
                          >
                            <PhoneCall size={10} /> {item.mobileNumber}
                          </a>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div>
                          {Array.isArray(item.visaDocument) && item.visaDocument.length > 0 ? (
                            <div className="flex gap-1.5 flex-wrap">
                              {item.visaDocument.map((docUrl, dIdx) => (
                                <a
                                  key={dIdx}
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:underline font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-100"
                                >
                                  <Eye size={11} /> Doc {dIdx + 1}
                                </a>
                              ))}
                            </div>
                          ) : typeof item.visaDocument === "string" && item.visaDocument ? (
                            <a
                              href={item.visaDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:underline font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-100"
                            >
                              <Eye size={11} /> View Document
                            </a>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg border hover:bg-blue-50 text-blue-700"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.passportNumber)}
                            className="p-1.5 rounded-lg border hover:bg-red-50 text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between bg-white">
                  <span className="text-xs text-gray-500 font-medium">
                    Showing Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
