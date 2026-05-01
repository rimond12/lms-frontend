"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsSectionMutation,
  useUploadLandingPageCmsImageMutation,
  ILandingPageCMS,
  IHeroSlide,
  IStatItem,
  IServiceItem,
  IOurServiceItem,
  ITrainingPoint,
  IPartnerLogo,
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

const TABS = [
  { id: "hero", label: "Hero", icon: Layout },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "services", label: "Recruitment", icon: Globe },
  { id: "ourServices", label: "Our Services", icon: Settings },
  { id: "trainingSection", label: "Training", icon: BookOpen },
  { id: "ourJourney", label: "Partners", icon: Users },
  { id: "joinInstructor", label: "Join Instructor", icon: Briefcase },
  { id: "applySection", label: "Apply Section", icon: Star },
  { id: "successStories", label: "Success Stories", icon: Star },
];

// ─── Section Editors ──────────────────────────────────────────────

function HeroEditor({ data, onSave, saving }: { data: ILandingPageCMS["hero"]; onSave: (d: ILandingPageCMS["hero"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

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

  const ICON_OPTIONS = ["FaHandshake", "FaCheckCircle", "FaTasks", "FaChalkboardTeacher", "FaGlobe", "FaBullseye"];

  return (
    <div className="space-y-6">
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
          <div>
            <Label>Headline</Label>
            <Input value={local.headline} onChange={(v) => setLocal((p) => ({ ...p, headline: v }))} placeholder="Elevate Your Skills..." />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={local.sub} onChange={(v) => setLocal((p) => ({ ...p, sub: v }))} placeholder="Be skilled, move forward..." />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Feature Icons (6 items)" icon={Settings}>
        <div className="space-y-3">
          {local.courses.map((course, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label>Name</Label>
                <Input value={course.name} onChange={(v) => updateCourse(i, "name", v)} />
              </div>
              <div>
                <Label>Sub Text</Label>
                <Input value={course.sub} onChange={(v) => updateCourse(i, "sub", v)} />
              </div>
              <div>
                <Label>Icon</Label>
                <select
                  value={course.iconKey}
                  onChange={(e) => updateCourse(i, "iconKey", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a4da1] bg-white"
                >
                  {ICON_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end pt-2">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

function StatsEditor({ data, onSave, saving }: { data: ILandingPageCMS["stats"]; onSave: (d: ILandingPageCMS["stats"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

  const update = (i: number, key: keyof IStatItem, val: string | number) => {
    const items = [...local.items];
    items[i] = { ...items[i], [key]: val };
    setLocal({ items });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Stat Cards" icon={BarChart3}>
        <div className="space-y-3">
          {local.items.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label>Icon (emoji)</Label>
                <Input value={stat.icon} onChange={(v) => update(i, "icon", v)} placeholder="🎓" />
              </div>
              <div>
                <Label>Count</Label>
                <Input type="number" value={String(stat.end)} onChange={(v) => update(i, "end", Number(v))} placeholder="12000" />
              </div>
              <div>
                <Label>Suffix</Label>
                <Input value={stat.suffix} onChange={(v) => update(i, "suffix", v)} placeholder="+ or %" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Label</Label>
                  <Input value={stat.label} onChange={(v) => update(i, "label", v)} placeholder="Graduated Students" />
                </div>
                {local.items.length > 1 && (
                  <RemoveBtn onClick={() => setLocal({ items: local.items.filter((_, j) => j !== i) })} />
                )}
              </div>
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal({ items: [...local.items, { end: 0, suffix: "", label: "", icon: "⭐" }] })} label="Add Stat" />
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

function ServicesEditor({ data, onSave, saving }: { data: ILandingPageCMS["services"]; onSave: (d: ILandingPageCMS["services"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

  const update = (i: number, key: keyof IServiceItem, val: string) => {
    const items = [...local.items];
    items[i] = { ...items[i], [key]: val };
    setLocal((p) => ({ ...p, items }));
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Section Heading" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Badge</Label>
            <Input value={local.badge} onChange={(v) => setLocal((p) => ({ ...p, badge: v }))} />
          </div>
          <div>
            <Label>Heading Line 1</Label>
            <Input value={local.heading1} onChange={(v) => setLocal((p) => ({ ...p, heading1: v }))} />
          </div>
          <div>
            <Label>Heading Line 2 (highlighted)</Label>
            <Input value={local.heading2} onChange={(v) => setLocal((p) => ({ ...p, heading2: v }))} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Service Cards" icon={Settings}>
        <div className="space-y-3">
          {local.items.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label>Title</Label>
                <Input value={item.title} onChange={(v) => update(i, "title", v)} />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input value={item.description} onChange={(v) => update(i, "description", v)} />
                </div>
                {local.items.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} />}
              </div>
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

function OurServicesEditor({ data, onSave, saving }: { data: ILandingPageCMS["ourServices"]; onSave: (d: ILandingPageCMS["ourServices"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

  const update = (i: number, key: keyof IOurServiceItem, val: string) => {
    const items = [...local.items];
    items[i] = { ...items[i], [key]: val };
    setLocal((p) => ({ ...p, items }));
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Section Heading" icon={Settings}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prefix ("Our")</Label>
            <Input value={local.headingPrefix} onChange={(v) => setLocal((p) => ({ ...p, headingPrefix: v }))} />
          </div>
          <div>
            <Label>Highlight ("Services")</Label>
            <Input value={local.headingHighlight} onChange={(v) => setLocal((p) => ({ ...p, headingHighlight: v }))} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Service Items" icon={Settings}>
        <div className="space-y-3">
          {local.items.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label>Title</Label>
                <Input value={item.title} onChange={(v) => update(i, "title", v)} />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input value={item.desc} onChange={(v) => update(i, "desc", v)} />
                </div>
                {local.items.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} />}
              </div>
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

function TrainingEditor({ data, onSave, saving }: { data: ILandingPageCMS["trainingSection"]; onSave: (d: ILandingPageCMS["trainingSection"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

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

  return (
    <div className="space-y-6">
      <SectionCard title="Section Labels" icon={BookOpen}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Badge</Label>
            <Input value={local.badge} onChange={(v) => setLocal((p) => ({ ...p, badge: v }))} />
          </div>
          <div>
            <Label>Heading Line 1</Label>
            <Input value={local.heading1} onChange={(v) => setLocal((p) => ({ ...p, heading1: v }))} />
          </div>
          <div>
            <Label>Heading Line 2 (blue)</Label>
            <Input value={local.heading2} onChange={(v) => setLocal((p) => ({ ...p, heading2: v }))} />
          </div>
          <div>
            <Label>Subheading</Label>
            <Input value={local.subheading} onChange={(v) => setLocal((p) => ({ ...p, subheading: v }))} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Feature Points (left column)" icon={Settings}>
        <div className="space-y-3">
          {local.points.map((pt, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label>Title</Label>
                <Input value={pt.title} onChange={(v) => updatePoint(i, "title", v)} />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input value={pt.description} onChange={(v) => updatePoint(i, "description", v)} />
                </div>
                {local.points.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, points: p.points.filter((_, j) => j !== i) }))} />}
              </div>
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, points: [...p.points, { title: "", description: "" }] }))} label="Add Point" />
        </div>
      </SectionCard>

      <SectionCard title="Main Card (blue)" icon={BookOpen}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={local.mainCard.title} onChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, title: v } }))} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={local.mainCard.description} onChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, description: v } }))} />
          </div>
          <div>
            <Label>Button Text</Label>
            <Input value={local.mainCard.button} onChange={(v) => setLocal((p) => ({ ...p, mainCard: { ...p.mainCard, button: v } }))} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Small Cards (bottom right)" icon={Settings}>
        <div className="space-y-3">
          {local.cards.map((card, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label>Title</Label>
                <Input value={card.title} onChange={(v) => updateCard(i, "title", v)} />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input value={card.description} onChange={(v) => updateCard(i, "description", v)} />
                </div>
                {local.cards.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, cards: p.cards.filter((_, j) => j !== i) }))} />}
              </div>
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

function PartnersEditor({ data, onSave, saving }: { data: ILandingPageCMS["ourJourney"]; onSave: (d: ILandingPageCMS["ourJourney"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

  const updateLogo = (row: "row1" | "row2" | "row3", i: number, key: keyof IPartnerLogo, val: string) => {
    const logos = [...local[row]];
    logos[i] = { ...logos[i], [key]: val };
    setLocal((p) => ({ ...p, [row]: logos }));
  };

  const LogoRowEditor = ({ rowKey, label }: { rowKey: "row1" | "row2" | "row3"; label: string }) => (
    <SectionCard title={label} icon={Users}>
      <div className="space-y-3">
        {local[rowKey].map((logo, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1">
                <Label>Partner Name</Label>
                <Input value={logo.name} onChange={(v) => updateLogo(rowKey, i, "name", v)} placeholder="Partner Name" />
              </div>
              {local[rowKey].length > 1 && (
                <RemoveBtn onClick={() => setLocal((p) => ({ ...p, [rowKey]: p[rowKey].filter((_, j) => j !== i) }))} />
              )}
            </div>
            <CmsImageUpload label="Logo Image" value={logo.img} onChange={(v) => updateLogo(rowKey, i, "img", v)} />
          </div>
        ))}
        <AddRowBtn onClick={() => setLocal((p) => ({ ...p, [rowKey]: [...p[rowKey], { name: "", img: "" }] }))} label="Add Logo" />
      </div>
    </SectionCard>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Section Title" icon={Users}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={local.title} onChange={(v) => setLocal((p) => ({ ...p, title: v }))} />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={local.subtitle} onChange={(v) => setLocal((p) => ({ ...p, subtitle: v }))} />
          </div>
        </div>
      </SectionCard>
      <LogoRowEditor rowKey="row1" label="Row 1 — Scrolls Left" />
      <LogoRowEditor rowKey="row2" label="Row 2 — Scrolls Right" />
      <LogoRowEditor rowKey="row3" label="Row 3 — Scrolls Left" />
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

function JoinInstructorEditor({ data, onSave, saving }: { data: ILandingPageCMS["joinInstructor"]; onSave: (d: ILandingPageCMS["joinInstructor"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);
  const set = (key: string, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <SectionCard title="Section Header" icon={Briefcase}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Title</Label><Input value={local.title} onChange={(v) => set("title", v)} /></div>
          <div><Label>Brand Name</Label><Input value={local.brand} onChange={(v) => set("brand", v)} /></div>
          <div><Label>Subtitle</Label><Input value={local.subtitle} onChange={(v) => set("subtitle", v)} /></div>
        </div>
      </SectionCard>

      <SectionCard title="Banner Image" icon={ImageIcon}>
        <div className="space-y-3">
          <CmsImageUpload label="Banner Image" value={local.bannerImage} onChange={(v) => set("bannerImage", v)} />
          <div>
            <Label>Banner Title (supports \n for new line)</Label>
            <Textarea value={local.bannerTitle} onChange={(v) => set("bannerTitle", v)} rows={2} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Looking For (checklist)" icon={Settings}>
        <div className="space-y-2">
          {local.lookingFor.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="flex-1">
                <Input value={item} onChange={(v) => {
                  const arr = [...local.lookingFor];
                  arr[i] = v;
                  setLocal((p) => ({ ...p, lookingFor: arr }));
                }} placeholder="Checklist item" />
              </div>
              {local.lookingFor.length > 1 && (
                <RemoveBtn onClick={() => setLocal((p) => ({ ...p, lookingFor: p.lookingFor.filter((_, j) => j !== i) }))} />
              )}
            </div>
          ))}
          <AddRowBtn onClick={() => setLocal((p) => ({ ...p, lookingFor: [...p.lookingFor, ""] }))} label="Add Item" />
        </div>
      </SectionCard>

      <SectionCard title="Info Box & Contact" icon={Settings}>
        <div className="space-y-4">
          <div><Label>Info Box Title</Label><Input value={local.infoTitle} onChange={(v) => set("infoTitle", v)} /></div>
          <div><Label>Info Box Description</Label><Textarea value={local.infoDesc} onChange={(v) => set("infoDesc", v)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input value={local.email} onChange={(v) => set("email", v)} /></div>
            <div><Label>Phone</Label><Input value={local.phone} onChange={(v) => set("phone", v)} /></div>
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={() => onSave(local)} />
      </div>
    </div>
  );
}

function ApplyEditor({ data, onSave, saving }: { data: ILandingPageCMS["applySection"]; onSave: (d: ILandingPageCMS["applySection"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

  return (
    <div className="space-y-6">
      <SectionCard title="Section Labels" icon={Star}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Badge</Label><Input value={local.badge} onChange={(v) => setLocal((p) => ({ ...p, badge: v }))} /></div>
          <div><Label>Heading</Label><Input value={local.heading} onChange={(v) => setLocal((p) => ({ ...p, heading: v }))} /></div>
          <div><Label>Heading Highlight (blue)</Label><Input value={local.headingHighlight} onChange={(v) => setLocal((p) => ({ ...p, headingHighlight: v }))} /></div>
          <div><Label>Subheading</Label><Input value={local.subheading} onChange={(v) => setLocal((p) => ({ ...p, subheading: v }))} /></div>
        </div>
      </SectionCard>

      <SectionCard title="Feature Points" icon={Settings}>
        <div className="space-y-3">
          {local.features.map((feat, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div><Label>Title</Label><Input value={feat.title} onChange={(v) => { const f = [...local.features]; f[i] = { ...f[i], title: v }; setLocal((p) => ({ ...p, features: f })); }} /></div>
              <div className="flex gap-2 items-end">
                <div className="flex-1"><Label>Description</Label><Input value={feat.desc} onChange={(v) => { const f = [...local.features]; f[i] = { ...f[i], desc: v }; setLocal((p) => ({ ...p, features: f })); }} /></div>
                {local.features.length > 1 && <RemoveBtn onClick={() => setLocal((p) => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} />}
              </div>
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

function SuccessStoriesEditor({ data, onSave, saving }: { data: ILandingPageCMS["successStories"]; onSave: (d: ILandingPageCMS["successStories"]) => void; saving: boolean }) {
  const [local, setLocal] = useState(data);
  useEffect(() => setLocal(data), [data]);

  return (
    <div className="space-y-6">
      <SectionCard title="Section Labels" icon={Star}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Heading</Label><Input value={local.heading} onChange={(v) => setLocal((p) => ({ ...p, heading: v }))} /></div>
          <div><Label>Heading Highlight (blue)</Label><Input value={local.headingHighlight} onChange={(v) => setLocal((p) => ({ ...p, headingHighlight: v }))} /></div>
          <div><Label>Subheading</Label><Input value={local.subheading} onChange={(v) => setLocal((p) => ({ ...p, subheading: v }))} /></div>
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
        return <HeroEditor data={cms.hero} saving={saving} onSave={(d) => handleSave("hero", d as any)} />;
      case "stats":
        return <StatsEditor data={cms.stats} saving={saving} onSave={(d) => handleSave("stats", d as any)} />;
      case "services":
        return <ServicesEditor data={cms.services} saving={saving} onSave={(d) => handleSave("services", d as any)} />;
      case "ourServices":
        return <OurServicesEditor data={cms.ourServices} saving={saving} onSave={(d) => handleSave("ourServices", d as any)} />;
      case "trainingSection":
        return <TrainingEditor data={cms.trainingSection} saving={saving} onSave={(d) => handleSave("trainingSection", d as any)} />;
      case "ourJourney":
        return <PartnersEditor data={cms.ourJourney} saving={saving} onSave={(d) => handleSave("ourJourney", d as any)} />;
      case "joinInstructor":
        return <JoinInstructorEditor data={cms.joinInstructor} saving={saving} onSave={(d) => handleSave("joinInstructor", d as any)} />;
      case "applySection":
        return <ApplyEditor data={cms.applySection} saving={saving} onSave={(d) => handleSave("applySection", d as any)} />;
      case "successStories":
        return <SuccessStoriesEditor data={cms.successStories} saving={saving} onSave={(d) => handleSave("successStories", d as any)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Landing Page CMS</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage all content on the public landing page
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-[#1a4da1] hover:text-[#133a7a] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
          >
            <Globe size={14} />
            Preview Landing Page
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <aside className="w-52 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sections</p>
              </div>
              <ul className="py-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-blue-50 text-[#1a4da1] border-r-2 border-[#1a4da1]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={15} className={isActive ? "text-[#1a4da1]" : "text-slate-400"} />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Editor Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 mb-4 flex items-center gap-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-[#1a4da1] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={12} />
                    <span className="hidden lg:inline">{tab.label}</span>
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
