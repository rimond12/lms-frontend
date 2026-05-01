"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Calendar,
  Loader2,
  Trash2,
  FileText,
  Image as ImageIcon,
  CreditCard,
  CheckCheck,
  Eye,
  Clock,
  Send,
  User,
  ChevronDown,
  Pencil,
  StickyNote,
  ExternalLink,
  Download,
  UploadCloud,
} from "lucide-react";
import {
  useGetLeadByIdQuery,
  useDeleteLeadMutation,
  useUpdateLeadMutation,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  type TLeadStatus,
  type ILead,
} from "@/app/redux/api/LeadApi/LeadApi";

// ─── Leaflet (SSR off) ───────────────────────────────────────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

// ─── Status config ───────────────────────────────────────────────
const STATUS_CFG: Record<
  TLeadStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  new: {
    label: "New",
    color: "text-sky-700",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
  },
  reviewed: {
    label: "Reviewed",
    color: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  contacted: {
    label: "Contacted",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
};

const COUNTRIES = [
  "Saudi Arabia",
  "Dubai",
  "Qatar",
  "Singapore",
  "Laos",
  "Maldives",
];

// ─── Leaflet icon fix ────────────────────────────────────────────
function useLeafletFix() {
  useEffect(() => {
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    });
  }, []);
}

// ─── Section Card ────────────────────────────────────────────────
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-sm text-slate-700 font-medium break-words leading-snug">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Map ─────────────────────────────────────────────────────────
function LeadMap({
  lat,
  lng,
  address,
}: {
  lat: number;
  lng: number;
  address: string;
}) {
  useLeafletFix();
  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-100"
      style={{ height: 420 }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <p className="font-semibold text-xs">{address}</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────
function FileUploadBox({
  label,
  accept,
  file,
  existingUrl,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  existingUrl?: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-3 transition-all ${
        file
          ? "border-green-400 bg-green-50/40"
          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
      }`}
    >
      <label className="cursor-pointer block">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              file ? "bg-green-500" : "bg-gray-100"
            }`}
          >
            {file ? (
              <CheckCheck size={16} className="text-white" />
            ) : (
              <UploadCloud size={16} className="text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-600">{label}</p>
            {file ? (
              <p className="text-[10px] text-green-600 truncate">{file.name}</p>
            ) : existingUrl ? (
              <p className="text-[10px] text-blue-500 truncate">
                Already uploaded — click to replace
              </p>
            ) : (
              <p className="text-[10px] text-gray-400">Click to upload</p>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}

function EditModal({
  lead,
  onClose,
  onSave,
  isSaving,
}: {
  lead: ILead;
  onClose: () => void;
  onSave: (d: FormData) => void;
  isSaving: boolean;
}) {
  const cls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all";
  const [form, setForm] = useState({
    fullname: lead.fullname ?? "",
    phone: lead.phone ?? "",
    dob: lead.dob ?? "",
    address: lead.address ?? "",
    country: lead.country ?? "",
    experience: lead.experience ?? "",
    job_type: lead.job_type ?? "",
    education: lead.education ?? "",
  });
  const [newFiles, setNewFiles] = useState<Record<string, File | null>>({
    passport_copy: null,
    photo: null,
    nid_copy: null,
    cv_file: null,
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setFile = (k: string, f: File | null) =>
    setNewFiles((p) => ({ ...p, [k]: f }));

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    Object.entries(newFiles).forEach(([k, f]) => {
      if (f) fd.append(k, f);
    });
    onSave(fd);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Pencil size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Edit Lead</h2>
              <p className="text-xs text-gray-400">{lead.fullname}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">
              👤 Personal Info
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "fullname", type: "text" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Date of Birth", key: "dob", type: "date" },
                { label: "Address", key: "address", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={cls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Job Preferences */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">
              🌍 Job Preferences
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className={cls}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {[
                { label: "Job Type", key: "job_type" },
                { label: "Education", key: "education" },
                { label: "Experience", key: "experience" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    {label}
                  </label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={cls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Document Upload */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">
              📄 Documents
            </p>
            <p className="text-[10px] text-gray-400 mb-4">
              নতুন file select করলে replace হবে, না করলে আগেরটা থাকবে
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FileUploadBox
                label="Passport Copy"
                accept=".pdf,.jpg,.jpeg,.png"
                file={newFiles.passport_copy}
                existingUrl={lead.passport_copy}
                onChange={(f) => setFile("passport_copy", f)}
              />
              <FileUploadBox
                label="Photo"
                accept=".jpg,.jpeg,.png"
                file={newFiles.photo}
                existingUrl={lead.photo}
                onChange={(f) => setFile("photo", f)}
              />
              <FileUploadBox
                label="National ID (NID)"
                accept=".pdf,.jpg,.jpeg,.png"
                file={newFiles.nid_copy}
                existingUrl={lead.nid_copy}
                onChange={(f) => setFile("nid_copy", f)}
              />
              <FileUploadBox
                label="CV / Resume"
                accept=".pdf,.doc,.docx"
                file={newFiles.cv_file}
                existingUrl={lead.cv_file}
                onChange={(f) => setFile("cv_file", f)}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: lead, isLoading } = useGetLeadByIdQuery(id, { skip: !id });
  const [deleteLead] = useDeleteLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [updateStatus] = useUpdateLeadStatusMutation();
  const [addNote] = useAddLeadNoteMutation();

  const [noteText, setNoteText] = useState("");
  const [isSendingNote, setSending] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleEdit = async (data: FormData) => {
    try {
      await updateLead({ id, formData: data }).unwrap();
      toast.success("Updated ✅");
      setShowEdit(false);
    } catch {
      toast.error("Update সমস্যা");
    }
  };

  // ✅ Download — Bearer token সহ (cookie থেকে নেওয়া হচ্ছে)
  const handleDownload = async (url: string, label: string) => {
    try {
      // cookie থেকে accessToken নাও
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      // baseApi এর same URL use করো
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "https://api.caddcore.cloud/api";
      const downloadUrl = `${apiBase}/leads/file/download?url=${encodeURIComponent(url)}`;

      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || "Download failed");
        return;
      }

      const blob = await res.blob();
      const ext = url.substring(url.lastIndexOf("."));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${label}-${Date.now()}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      toast.success(`${label} downloaded ✅`);
    } catch {
      toast.error("Download failed");
    }
  };
  const handleDelete = async () => {
    if (!confirm(`"${lead?.fullname}" delete করবেন?`)) return;
    try {
      await deleteLead(id).unwrap();
      toast.success("Deleted ✅");
      router.push("/dashboard/leads");
    } catch {
      toast.error("Delete সমস্যা");
    }
  };
  const handleStatus = async (s: TLeadStatus) => {
    try {
      await updateStatus({ id, status: s }).unwrap();
      toast.success(`Status → "${s}" ✅`);
    } catch {
      toast.error("Update সমস্যা");
    }
  };
  const handleNote = async () => {
    if (!noteText.trim()) return;
    setSending(true);
    try {
      await addNote({ id, text: noteText.trim() }).unwrap();
      setNoteText("");
      toast.success("Note added ✅");
    } catch {
      toast.error("Note সমস্যা");
    } finally {
      setSending(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );

  if (!lead)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="font-bold text-slate-600 mb-3">Lead পাওয়া যায়নি</p>
          <Link href="/dashboard/leads">
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              ← Back to List
            </button>
          </Link>
        </div>
      </div>
    );

  const s = STATUS_CFG[lead.status];

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 sm:p-6">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="max-w-6xl mx-auto">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/leads">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                <ArrowLeft size={16} />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800">
                {lead.fullname}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Submitted{" "}
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status */}
            <div
              className={`relative flex items-center rounded-xl ring-1 ${s.ring} ${s.bg}`}
            >
              <select
                value={lead.status}
                onChange={(e) => handleStatus(e.target.value as TLeadStatus)}
                className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-bold bg-transparent border-0 cursor-pointer focus:outline-none ${s.color}`}
              >
                {(["new", "reviewed", "contacted"] as TLeadStatus[]).map(
                  (st) => (
                    <option key={st} value={st}>
                      {STATUS_CFG[st].label}
                    </option>
                  ),
                )}
              </select>
              <ChevronDown
                size={11}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${s.color}`}
              />
            </div>
            {/* Edit */}
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Pencil size={13} /> Edit
            </button>
            {/* Delete */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left col — 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal + Job side by side on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Card title="👤 Personal Info">
                <div className="divide-y divide-gray-50">
                  <InfoRow
                    icon={<User size={13} />}
                    label="Full Name"
                    value={lead.fullname}
                  />
                  <InfoRow
                    icon={<Phone size={13} />}
                    label="Phone"
                    value={lead.phone}
                  />
                  <InfoRow
                    icon={<Calendar size={13} />}
                    label="Date of Birth"
                    value={lead.dob}
                  />
                  <InfoRow
                    icon={<MapPin size={13} />}
                    label="Address"
                    value={lead.address}
                  />
                </div>
              </Card>
              <Card title="🌍 Job Preferences">
                <div className="divide-y divide-gray-50">
                  <InfoRow
                    icon={<Globe size={13} />}
                    label="Destination"
                    value={lead.country}
                  />
                  <InfoRow
                    icon={<Briefcase size={13} />}
                    label="Job Type"
                    value={lead.job_type}
                  />
                  <InfoRow
                    icon={<GraduationCap size={13} />}
                    label="Education"
                    value={lead.education}
                  />
                  <InfoRow
                    icon={<CheckCheck size={13} />}
                    label="Experience"
                    value={lead.experience}
                  />
                </div>
              </Card>
            </div>

            {/* Documents */}
            {(lead.passport_copy ||
              lead.photo ||
              lead.nid_copy ||
              lead.cv_file) && (
              <Card title="📄 Documents">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Passport",
                      url: lead.passport_copy,
                      icon: <FileText size={20} />,
                    },
                    {
                      label: "Photo",
                      url: lead.photo,
                      icon: <ImageIcon size={20} />,
                    },
                    {
                      label: "NID",
                      url: lead.nid_copy,
                      icon: <CreditCard size={20} />,
                    },
                    {
                      label: "CV",
                      url: lead.cv_file,
                      icon: <FileText size={20} />,
                    },
                  ].map((doc) =>
                    doc.url ? (
                      <div
                        key={doc.label}
                        className="flex flex-col items-center gap-2.5 p-4 bg-gradient-to-b from-blue-50 to-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <span className="text-blue-500">{doc.icon}</span>
                        <span className="text-xs font-bold text-blue-700">
                          {doc.label}
                        </span>
                        {/* ✅ View + Download buttons */}
                        <div className="flex gap-1.5 w-full mt-1">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            <ExternalLink size={10} /> View
                          </a>
                          <button
                            onClick={() => handleDownload(doc.url!, doc.label)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                          >
                            <Download size={10} /> Save
                          </button>
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              </Card>
            )}

            {/* Map — bigger */}
            {lead.lat && lead.lng && (
              <Card title="📍 Location">
                <LeadMap lat={lead.lat} lng={lead.lng} address={lead.address} />
              </Card>
            )}
          </div>

          {/* Right col — 1/3 */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  📝 Admin Notes
                </p>
                <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                  {lead.notes?.length ?? 0}
                </span>
              </div>

              {/* Notes list */}
              <div className="p-4 space-y-2.5 max-h-[360px] overflow-y-auto">
                {!lead.notes?.length && (
                  <div className="text-center py-8">
                    <StickyNote
                      size={28}
                      className="text-gray-200 mx-auto mb-2"
                    />
                    <p className="text-xs text-gray-400">No notes yet</p>
                  </div>
                )}
                {lead.notes?.map((note, i) => (
                  <div
                    key={i}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-3"
                  >
                    <p className="text-sm text-amber-900 leading-relaxed">
                      {note.text}
                    </p>
                    <p className="text-[10px] text-amber-400 mt-1.5 font-medium">
                      {new Date(note.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add note */}
              <div className="p-4 border-t border-gray-50 space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Write a note..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) handleNote();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={handleNote}
                  disabled={!noteText.trim() || isSendingNote}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSendingNote ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  Save Note
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  Ctrl+Enter to save quickly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Edit Modal — z-[9999] দিয়ে map conflict fix */}
      {showEdit && (
        <EditModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSave={handleEdit}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
}
