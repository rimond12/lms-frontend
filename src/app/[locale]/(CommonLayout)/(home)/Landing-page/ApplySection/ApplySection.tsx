"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import {
  User,
  MapPin,
  Globe,
  Briefcase,
  CheckCircle,
  Loader2,
  AlertCircle,
  Send,
  UploadCloud,
  Calendar,
  PhoneCall,
  GraduationCap,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useSubmitLeadMutation } from "@/app/redux/api/LeadApi/LeadApi";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";

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
const MapClickHandler = dynamic(() => import("./MapClickHandler"), {
  ssr: false,
});

interface LeadFormData {
  fullname: string;
  dob: string;
  phone: string;
  address: string;
  country: string;
  experience: string;
  job_type: string;
  education: string;
}
interface UploadedFiles {
  passport_copy: File | null;
  photo: File | null;
  nid_copy: File | null;
  cv_file: File | null;
}
interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

const INITIAL: LeadFormData = {
  fullname: "",
  dob: "",
  phone: "",
  address: "",
  country: "",
  experience: "",
  job_type: "",
  education: "",
};
const INITIAL_FILES: UploadedFiles = {
  passport_copy: null,
  photo: null,
  nid_copy: null,
  cv_file: null,
};
const COUNTRIES = [
  "Saudi Arabia",
  "Dubai",
  "Qatar",
  "Singapore",
  "Laos",
  "Maldives",
];

// ─── Success Modal ────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("applySection");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 sm:p-10 text-center animate-in zoom-in-95 duration-300 border border-blue-50">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5 sm:mb-6 ring-8 ring-green-50/50">
          <CheckCircle size={40} className="text-green-500 sm:w-12 sm:h-12" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-950 mb-3">
          {t("success.title")}
        </h2>
        <p className="text-slate-500 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
          <strong>{t("success.messageBold")}</strong> {t("success.message1")}{" "}
          {t("success.message2")}
        </p>
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 sm:py-4 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition-all active:scale-[0.98] shadow-xl shadow-blue-900/20 text-sm sm:text-base"
          >
            {t("success.back")}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-400 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {t("success.applyAnother")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── File Upload Box ──────────────────────────────────────────────
function FileBox({
  label,
  accept,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div
      className={`relative group border-2 border-dashed rounded-2xl p-3 sm:p-5 transition-all duration-300 ${
        file
          ? "border-green-400 bg-green-50/30"
          : "border-slate-200 hover:border-blue-500 hover:bg-blue-50/30"
      }`}
    >
      <label className="cursor-pointer block">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          {file ? (
            <>
              <div className="p-1.5 sm:p-2 bg-green-500 rounded-full text-white">
                <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-green-700 truncate w-full text-center">
                {file.name}
              </p>
            </>
          ) : (
            <>
              <UploadCloud
                size={20}
                className="text-slate-300 group-hover:text-blue-500 transition-colors sm:w-6 sm:h-6"
              />
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-blue-600 text-center leading-tight">
                {label}
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}

// ─── Field Component ──────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-600 ml-1">
        <Icon size={13} className="text-blue-600 sm:w-3.5 sm:h-3.5" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-slate-200 rounded-2xl text-[13px] sm:text-[14px] text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 placeholder:text-slate-400";

// ─── Map Component ────────────────────────────────────────────────
function AddressMap({
  point,
  onMapClick,
}: {
  point: MapPoint;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const t = useTranslations("applySection");
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-4xl h-[75vh] sm:h-[80vh] rounded-2xl overflow-hidden relative shadow-2xl">
            <MapContainer
              center={[point.lat, point.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <Marker position={[point.lat, point.lng]}>
                <Popup>{point.label}</Popup>
              </Marker>
              <MapClickHandler onMapClick={onMapClick} />
            </MapContainer>
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-3 right-3 z-[400] bg-white shadow-lg rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Minimize2 size={13} /> {t("map.closeFullscreen")}
            </button>
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-slate-600 font-medium shadow whitespace-nowrap">
              {t("map.clickToUpdateFullscreen")}
            </p>
          </div>
        </div>
      )}

      <div
        className="mt-3 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative"
        style={{ height: 280 }}
      >
        <MapContainer
          center={[point.lat, point.lng]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <Marker position={[point.lat, point.lng]}>
            <Popup>{point.label}</Popup>
          </Marker>
          <MapClickHandler onMapClick={onMapClick} />
        </MapContainer>
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-[400] bg-white shadow-md rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-slate-100"
        >
          <Maximize2 size={12} className="sm:w-3.5 sm:h-3.5" />{" "}
          {t("map.fullscreen")}
        </button>
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium shadow whitespace-nowrap">
          {t("map.clickToUpdate")}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function ApplySection() {
  const t = useTranslations("applySection");
  const locale = useLocale();
  const isBn = locale === "bn";
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.applySection;

  const badge = (isBn ? cms?.badgeBn : cms?.badge) || t("badge");
  const heading = (isBn ? cms?.headingBn : cms?.heading) || t("heading");
  const headingHighlight = (isBn ? cms?.headingHighlightBn : cms?.headingHighlight) || t("headingHighlight");
  const subheading = (isBn ? cms?.subheadingBn : cms?.subheading) || t("subheading");
  const features = (cms?.features?.length)
    ? cms.features.map(f => ({
        title: (isBn ? f.titleBn : undefined) || f.title,
        desc:  (isBn ? f.descBn  : undefined) || f.desc,
      }))
    : [
        { title: t("features.globalNetwork.title"), desc: t("features.globalNetwork.desc") },
        { title: t("features.dataSecurity.title"), desc: t("features.dataSecurity.desc") },
        { title: t("features.fastResponse.title"), desc: t("features.fastResponse.desc") },
      ];

  const [form, setForm] = useState<LeadFormData>(INITIAL);
  const [files, setFiles] = useState<UploadedFiles>(INITIAL_FILES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapPoint, setMapPoint] = useState<MapPoint | null>(null);
  const [mapStatus, setMapStatus] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [submitLead] = useSubmitLeadMutation();

  const set = (k: keyof LeadFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));
  const setFile = (k: keyof UploadedFiles, f: File | null) =>
    setFiles((p) => ({ ...p, [k]: f }));

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      setMapStatus(t("map.searchingReverse"));
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        if (data?.display_name) {
          const short = data.display_name.split(",").slice(0, 4).join(", ");
          setMapPoint({ lat, lng, label: data.display_name });
          set("address", short);
          setMapStatus(`📍 ${short}`);
        }
      } catch {
        setMapStatus(t("map.reverseNotFound"));
      } finally {
        setIsGeocoding(false);
      }
    },
    [t],
  );

  const geocode = useCallback(
    async (address: string) => {
      if (address.trim().length < 5) {
        setMapPoint(null);
        setMapStatus("");
        return;
      }
      setIsGeocoding(true);
      setMapStatus(t("map.searching"));
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        if (data?.length) {
          const { lat, lon, display_name } = data[0];
          setMapPoint({
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            label: display_name,
          });
          setMapStatus(`📍 ${display_name.split(",").slice(0, 3).join(", ")}`);
        } else {
          setMapPoint(null);
          setMapStatus(t("map.notFound"));
        }
      } catch {
        setMapStatus(t("map.error"));
      } finally {
        setIsGeocoding(false);
      }
    },
    [t],
  );

  const handleAddressChange = (v: string) => {
    set("address", v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocode(v), 900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullname.trim() || !form.phone.trim() || !form.country) {
      toast.error(t("toast.required"));
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      if (mapPoint?.lat) fd.append("lat", String(mapPoint.lat));
      if (mapPoint?.lng) fd.append("lng", String(mapPoint.lng));
      if (files.passport_copy) fd.append("passport_copy", files.passport_copy);
      if (files.photo) fd.append("photo", files.photo);
      if (files.nid_copy) fd.append("nid_copy", files.nid_copy);
      if (files.cv_file) fd.append("cv_file", files.cv_file);

      await submitLead(fd).unwrap();

      setShowSuccess(true);
      setForm(INITIAL);
      setFiles(INITIAL_FILES);
      setMapPoint(null);
      setMapStatus("");
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const featureIcons = [Globe, ShieldCheck, CheckCircle];

  return (
    <section
      id="apply"
      className="py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e3a8a 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* ── Left Side ── */}
          <div className="lg:w-1/3 lg:self-start">
            <div className="lg:sticky lg:top-24">
              {/* Badge */}
              <span className="inline-block bg-blue-100 text-blue-700 text-[10px] sm:text-[11px] font-black px-3 sm:px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 sm:mb-6">
                {badge}
              </span>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-950 mb-4 sm:mb-6 leading-[1.1]">
                {heading}{" "}
                <span className="text-blue-600">{headingHighlight}</span>
              </h2>

              {/* Subheading */}
              <p className="text-slate-500 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
                {subheading}
              </p>

              {/* Features — horizontally scrollable on mobile */}
              <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible snap-x snap-mandatory lg:snap-none">
                {features.map((item, idx) => {
                  const FeatureIcon = featureIcons[idx % featureIcons.length];
                  return (
                    <div
                      key={idx}
                      className="flex gap-3 sm:gap-4 min-w-[220px] sm:min-w-[260px] lg:min-w-0 snap-start bg-slate-50/60 lg:bg-transparent rounded-2xl lg:rounded-none p-3 lg:p-0 border border-slate-100 lg:border-none"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                        <FeatureIcon size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-950 text-sm sm:text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Side: Form ── */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-5 sm:p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-10">
                {/* ── Personal Info ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                  <Field label={t("form.fullname")} icon={User} required>
                    <input
                      value={form.fullname}
                      onChange={(e) => set("fullname", e.target.value)}
                      placeholder={t("form.fullnamePlaceholder")}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label={t("form.phone")} icon={PhoneCall} required>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder={t("form.phonePlaceholder")}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label={t("form.dob")} icon={Calendar} required>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => set("dob", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </Field>

                  {/* Address + Map */}
                  <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-600 ml-1">
                      <MapPin
                        size={13}
                        className="text-blue-600 sm:w-3.5 sm:h-3.5"
                      />
                      {t("form.address")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder={t("form.addressPlaceholder")}
                      className={inputCls}
                      required
                    />
                    {(mapStatus || isGeocoding) && (
                      <div
                        className={`flex items-center gap-2 text-xs font-medium px-1 ${
                          mapStatus.startsWith("⚠️")
                            ? "text-orange-500"
                            : "text-slate-400"
                        }`}
                      >
                        {isGeocoding && (
                          <Loader2
                            size={11}
                            className="animate-spin flex-shrink-0"
                          />
                        )}
                        <span className="truncate">{mapStatus}</span>
                      </div>
                    )}
                    {mapPoint && (
                      <AddressMap
                        point={mapPoint}
                        onMapClick={handleMapClick}
                      />
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* ── Job Preferences ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                  <Field label={t("form.country")} icon={Globe} required>
                    <select
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                      className={inputCls}
                      required
                    >
                      <option value="" disabled>
                        {t("form.countryDefault")}
                      </option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("form.jobType")} icon={Briefcase}>
                    <input
                      value={form.job_type}
                      onChange={(e) => set("job_type", e.target.value)}
                      placeholder={t("form.jobTypePlaceholder")}
                      className={inputCls}
                    />
                  </Field>

                  <Field label={t("form.education")} icon={GraduationCap}>
                    <input
                      value={form.education}
                      onChange={(e) => set("education", e.target.value)}
                      placeholder={t("form.educationPlaceholder")}
                      className={inputCls}
                    />
                  </Field>

                  <Field label={t("form.experience")} icon={CheckCircle}>
                    <input
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      placeholder={t("form.experiencePlaceholder")}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* ── Document Upload ── */}
                <div>
                  <label className="text-[12px] sm:text-[13px] font-bold text-slate-600 mb-3 sm:mb-4 block ml-1">
                    {t("form.documentsLabel")}{" "}
                    <span className="text-slate-400 font-normal">
                      {t("form.documentsOptional")}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-4">
                    <FileBox
                      label={t("form.passport")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      file={files.passport_copy}
                      onChange={(f) => setFile("passport_copy", f)}
                    />
                    <FileBox
                      label={t("form.photo")}
                      accept=".jpg,.jpeg,.png"
                      file={files.photo}
                      onChange={(f) => setFile("photo", f)}
                    />
                    <FileBox
                      label={t("form.nid")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      file={files.nid_copy}
                      onChange={(f) => setFile("nid_copy", f)}
                    />
                    <FileBox
                      label={t("form.cv")}
                      accept=".pdf,.doc,.docx"
                      file={files.cv_file}
                      onChange={(f) => setFile("cv_file", f)}
                    />
                  </div>
                </div>

                {/* ── Privacy Notice ── */}
                <div className="bg-blue-50/50 rounded-2xl p-4 sm:p-5 border border-blue-100 flex gap-3 sm:gap-4">
                  <AlertCircle
                    size={18}
                    className="text-blue-600 shrink-0 mt-0.5 sm:w-5 sm:h-5"
                  />
                  <p className="text-[11px] sm:text-xs text-blue-800 leading-relaxed">
                    {t("form.privacyNotice1")}{" "}
                    <strong>{t("form.privacyNoticeBold")}</strong>{" "}
                    {t("form.privacyNotice2")}
                  </p>
                </div>

                {/* ── Submit Button ── */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 bg-blue-900 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2.5 sm:gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                      {t("form.submitting")}
                    </>
                  ) : (
                    <>
                      <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                      {t("form.submit")}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </section>
  );
}
