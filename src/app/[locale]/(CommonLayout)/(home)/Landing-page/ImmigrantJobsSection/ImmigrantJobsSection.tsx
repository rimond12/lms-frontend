"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useGetAllJobsQuery } from "@/app/redux/api/jobsApi/jobsApi";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { getImageUrl } from "@/utils/imageUtils";
import {
  Briefcase,
  Globe,
  MapPin,
  ArrowRight,
  Bookmark,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Building2,
  Award,
  Flame,
  BadgeCheck,
  Sparkles,
  Search,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────
const FEATURE_ICONS = [Globe, Search, Bookmark, Building2];
const STAT_ICONS = [Briefcase, Globe, Users, TrendingUp];
const JOB_TYPE_ICONS = [Briefcase, Clock, Award];
const JOB_TYPE_COLORS = [
  { bg: "#EFF6FF", border: "#BFDBFE", color: "#1a4da1" },
  { bg: "#EEF2FF", border: "#C7D2FE", color: "#2B59C3" },
  { bg: "#EFF6FF", border: "#BFDBFE", color: "#1a4da1" },
];

// Color palette for job cards — unchanged brand colors
const CARD_COLORS = [
  { from: "#1a4da1", to: "#2B59C3", light: "#EFF6FF", border: "#BFDBFE", glow: "#1a4da133" },
  { from: "#0d9488", to: "#14b8a6", light: "#F0FDFA", border: "#99F6E4", glow: "#0d948833" },
  { from: "#7c3aed", to: "#9333ea", light: "#F5F3FF", border: "#DDD6FE", glow: "#7c3aed33" },
  { from: "#ea580c", to: "#f97316", light: "#FFF7ED", border: "#FED7AA", glow: "#ea580c33" },
  { from: "#0891b2", to: "#06b6d4", light: "#ECFEFF", border: "#A5F3FC", glow: "#0891b233" },
  { from: "#059669", to: "#10b981", light: "#ECFDF5", border: "#6EE7B7", glow: "#05966933" },
];

const BADGE_STYLES: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Hot:      { bg: "#fef2f2",  color: "#dc2626", icon: Flame },
  New:      { bg: "#f0fdf4",  color: "#16a34a", icon: BadgeCheck },
  Flexible: { bg: "#f5f3ff",  color: "#7c3aed", icon: Star },
};

function getCardColor(i: number) {
  return CARD_COLORS[i % CARD_COLORS.length];
}

function deriveBadge(type: string, index: number): string {
  if (type === "Part time") return "Flexible";
  if (index === 0) return "Hot";
  if (index === 1 || index === 3) return "New";
  return "";
}

// ─── Country & Flag Helpers ────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  "usa": "🇺🇸", "united states": "🇺🇸", "america": "🇺🇸",
  "uk": "🇬🇧", "united kingdom": "🇬🇧", "england": "🇬🇧", "britain": "🇬🇧",
  "canada": "🇨🇦",
  "australia": "🇦🇺",
  "germany": "🇩🇪",
  "france": "🇫🇷",
  "uae": "🇦🇪", "dubai": "🇦🇪", "abu dhabi": "🇦🇪",
  "qatar": "🇶🇦", "doha": "🇶🇦",
  "saudi": "🇸🇦", "saudi arabia": "🇸🇦", "riyadh": "🇸🇦",
  "bangladesh": "🇧🇩", "dhaka": "🇧🇩",
  "india": "🇮🇳", "delhi": "🇮🇳", "mumbai": "🇮🇳",
  "singapore": "🇸🇬",
  "malaysia": "🇲🇾", "kuala lumpur": "🇲🇾",
  "oman": "🇴🇲", "muscat": "🇴🇲",
  "kuwait": "🇰🇼",
  "bahrain": "🇧🇭",
  "remote": "🌐", "worldwide": "🌐", "global": "🌐",
};

function getCountryFlag(location: string | undefined, country?: string): string {
  const src = country || location;
  if (!src) return "🌍";
  const lower = src.toLowerCase();
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (lower.includes(key)) return flag;
  }
  return "🌍";
}

function getCountryFromLocation(location: string | undefined, country?: string): string {
  if (country) return country;
  if (!location) return "Worldwide";
  const parts = location.split(",");
  return parts[parts.length - 1].trim() || location;
}

// ─── Premium Job Card (homepage) ──────────────────────────────────
function MiniJobCard({ job, index }: { job: any; index: number }) {
  const locale = useLocale();
  const color = getCardColor(index);
  const country = getCountryFromLocation(job.location, job.country);
  const flag = getCountryFlag(job.location, job.country);

  const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
  const displayCompanyName = locale === "bn" ? (job.companyNameBn || job.companyName) : job.companyName;
  const displayCountry = locale === "bn" ? (job.country || country) : country;
  const description = (locale === "bn" ? (job.aboutBn || job.about || job.desc || "") : (job.about || job.desc || "")).trim();

  const initial = displayTitle?.charAt(0)?.toUpperCase() ?? "J";
  const badge = deriveBadge(job.type, index);
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;
  const BadgeIcon = badgeStyle?.icon;
  const hasImage = !!job.image;

  return (
    <Link href={`/jobs/${job.slug}`} className="h-full block">
      <div
        className="group relative bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-400 cursor-pointer h-full flex flex-col"
        style={{
          borderRadius: "20px",
          boxShadow: "0 2px 16px 0 rgba(26,77,161,0.06)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px 0 ${color.glow}, 0 2px 8px rgba(0,0,0,0.07)`;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
          (e.currentTarget as HTMLDivElement).style.borderColor = color.border;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px 0 rgba(26,77,161,0.06)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "";
        }}
      >
        {/* ── Card Header / Banner ── */}
        <div className="relative h-40 flex items-center justify-center overflow-hidden shrink-0">
          {/* Soft gradient header */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${color.from}ee 0%, ${color.to} 60%, ${color.to}bb 100%)`,
            }}
          />
          {/* Decorative abstract circles */}
          <div
            className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-20"
            style={{ background: "rgba(255,255,255,0.6)" }}
          />
          <div
            className="absolute -bottom-8 -left-5 w-28 h-28 rounded-full opacity-15"
            style={{ background: "rgba(255,255,255,0.4)" }}
          />
          <div
            className="absolute top-4 left-10 w-8 h-8 rounded-full opacity-10"
            style={{ background: "rgba(255,255,255,0.8)" }}
          />

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
            /* Elevated logo / initial badge fallback */
            <div className="relative z-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <div className="w-20 h-20 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center shadow-xl shadow-black/10 p-1">
                {job.logo && job.logo.startsWith("http") ? (
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden p-1 shadow-inner">
                    <img
                      src={job.logo}
                      alt={displayTitle}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-inner">
                    {initial === "S" || initial === "C" ? (
                      <svg className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.5 5.5C15.2 4.5 13.7 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C13.7 20 15.2 19.5 16.5 18.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5" stroke="currentColor" strokeWidth="2.5" />
                      </svg>
                    ) : (
                      <span className="font-black text-3xl text-white select-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                        {initial}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Country Badge — top right */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-white/96 dark:bg-slate-900/96 backdrop-blur-md rounded-full px-2.5 py-1 shadow-md border border-white/60">
            <span className="text-sm leading-none">{flag}</span>
            <span className="text-[10px] font-extrabold text-slate-800 dark:text-white max-w-[72px] truncate tracking-tight">
              {displayCountry}
            </span>
          </div>

          {/* Hot/New badge — bottom left */}
          {badgeStyle && BadgeIcon && (
            <div className="absolute bottom-2.5 left-2.5 z-20">
              <span
                className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: "rgba(255,255,255,0.95)", color: badgeStyle.color }}
              >
                <BadgeIcon className="w-2.5 h-2.5" />
                {badge}
              </span>
            </div>
          )}

          {/* Job type — bottom right */}
          <div className="absolute bottom-2.5 right-2.5 z-20">
            <span className="text-[9.5px] font-bold bg-black/25 text-white border border-white/25 rounded-full px-2.5 py-1 backdrop-blur-sm">
              {job.type}
            </span>
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="flex flex-col flex-1 p-4 gap-3">

          {/* Title + company */}
          <div>
            <h3
              className="font-extrabold text-[14px] text-slate-900 dark:text-white leading-snug line-clamp-2 transition-colors duration-200"
              style={{ letterSpacing: "-0.1px" }}
            >
              {displayTitle}
            </h3>
            {displayCompanyName && (
              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {displayCompanyName}
              </p>
            )}
            {(job.company || job.category) && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 size={10} className="text-slate-400 shrink-0" />
                <span className="text-[10.5px] text-slate-400 truncate font-semibold">
                  {job.company || job.category}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
              {description}
            </p>
          )}

          {/* Divider */}
          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #e2e8f0, transparent)" }} />

          {/* Location row */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border"
            style={{ background: color.light, borderColor: color.border }}
          >
            <MapPin size={11} style={{ color: color.from }} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-0.5">
                {job.country ? "Country" : "Location"}
              </p>
              <p className="text-[11px] font-extrabold truncate leading-tight" style={{ color: color.from }}>
                {flag} {job.country ?? job.location ?? "Worldwide"}
              </p>
            </div>
          </div>

          {/* Apply button */}
          <button
            className="w-full py-2.5 rounded-2xl text-white text-[12px] font-extrabold tracking-wide transition-all duration-200 group-hover:opacity-95 group-hover:shadow-lg active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              boxShadow: `0 4px 16px ${color.glow}`,
              letterSpacing: "0.3px",
            }}
          >
            Apply Now →
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Section Label / Badge ─────────────────────────────────────────
function SectionBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-extrabold tracking-widest uppercase mb-5"
      style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1a4da1" }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}

// ─── Smooth Transition Divider ─────────────────────────────────────
function TransitionDivider() {
  return (
    <div className="relative py-14 md:py-20 flex flex-col items-center">
      {/* Fading rule */}
      <div
        className="w-full max-w-3xl h-px mx-auto"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, #BFDBFE 25%, #1a4da1 50%, #BFDBFE 75%, transparent 100%)",
        }}
      />
      {/* Central ornament */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="w-2 h-2 rotate-45 rounded-sm" style={{ background: "#BFDBFE" }} />
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md border"
          style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "#1a4da1" }} />
        </div>
        <div className="w-2 h-2 rotate-45 rounded-sm" style={{ background: "#BFDBFE" }} />
      </div>
    </div>
  );
}

// ─── Feature Card (Why Choose Us) ─────────────────────────────────
function FeatureCard({ title, description, index }: { title: string; description: string; index: number }) {
  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
  const accents = [
    { iconBg: "#EFF6FF", iconBorder: "#BFDBFE", iconColor: "#1a4da1", line: "linear-gradient(90deg,#1a4da1,#2B59C3)" },
    { iconBg: "#F0FDFA", iconBorder: "#99F6E4", iconColor: "#0d9488", line: "linear-gradient(90deg,#0d9488,#14b8a6)" },
    { iconBg: "#F5F3FF", iconBorder: "#DDD6FE", iconColor: "#7c3aed", line: "linear-gradient(90deg,#7c3aed,#9333ea)" },
    { iconBg: "#FFF7ED", iconBorder: "#FED7AA", iconColor: "#ea580c", line: "linear-gradient(90deg,#ea580c,#f97316)" },
  ];
  const a = accents[index % accents.length];

  return (
    <div
      className="group relative flex items-start gap-5 p-6 md:p-7 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 overflow-hidden cursor-default transition-all duration-300"
      style={{ borderRadius: "20px", boxShadow: "0 2px 16px rgba(26,77,161,0.05)" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(26,77,161,0.13)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = a.iconBorder;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(26,77,161,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
      }}
    >
      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${a.iconBg}88 0%, transparent 65%)`, borderRadius: "20px" }}
      />

      {/* Icon container */}
      <div
        className="w-12 h-12 shrink-0 flex items-center justify-center border transition-all duration-300 group-hover:scale-110 relative z-10"
        style={{ background: a.iconBg, borderColor: a.iconBorder, borderRadius: "14px" }}
      >
        <Icon className="w-5 h-5" style={{ color: a.iconColor }} />
      </div>

      {/* Text */}
      <div className="relative z-10 min-w-0">
        <h4
          className="font-bold text-[15px] text-slate-900 dark:text-white mb-1.5 leading-snug transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-400"
        >
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500"
        style={{ background: a.line, borderRadius: "0 0 20px 20px" }}
      />
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────
export default function ImmigrantJobsSection() {
  const t = useTranslations("immigrantJobs");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.immigrantJobsSection;
  const locale = useLocale();
  const isBn = locale === "bn";

  const stats = t.raw("stats") as { value: string; label: string }[];

  // ─── All scalar fields use isBn guard: prefer CMS Bn → CMS En → i18n fallback ───
  const badge         = (isBn ? cms?.badgeBn         : cms?.badge)         || t("badge");
  const heading       = (isBn ? cms?.headingBn        : cms?.heading)       || t("heading");
  const subheading    = (isBn ? cms?.subheadingBn     : cms?.subheading)    || t("subheading");
  const whyChooseTitle = (isBn ? cms?.whyChooseTitleBn : cms?.whyChooseTitle) || t("whyChooseTitle");

  const rawFeatures = t.raw("features") as { title: string; description: string }[];
  // For arrays: use CMS (with Bn field priority) if available; else fall back to i18n
  const features = (cms?.features && cms.features.length > 0)
    ? cms.features.map(f => ({
        title: (isBn ? f.titleBn : undefined) || f.title,
        description: (isBn ? f.descriptionBn : undefined) || f.description,
      }))
    : rawFeatures;

  const featuredTitle   = (isBn ? cms?.featuredTitleBn   : cms?.featuredTitle)   || t("featuredTitle");
  const liveBadge       = (isBn ? cms?.liveBadgeBn       : cms?.liveBadge)       || t("liveBadge");
  const listingsSubtext = (isBn ? cms?.listingsSubtextBn : cms?.listingsSubtext) || t("listingsSubtext");
  const whyUsBadge      = (isBn ? cms?.whyUsBadgeBn      : cms?.whyUsBadge)      || t("whyUsBadge");
  const whyUsSubtext    = (isBn ? cms?.whyUsSubtextBn    : cms?.whyUsSubtext)    || t("whyUsSubtext");
  const browseAllText   = (isBn ? cms?.browseAllTextBn   : cms?.browseAllText)   || t("browseAllText");
  const viewAllJobs     = (isBn ? cms?.viewAllJobsBn     : cms?.viewAllJobs)     || t("viewAllJobs");
  const moreListings    = (isBn ? cms?.moreListingsBn    : cms?.moreListings)    || t("moreListings");
  const employmentTitle = (isBn ? cms?.employmentTitleBn : cms?.employmentTitle) || t("employmentTitle");

  const rawJobTypes = t.raw("jobTypes") as { type: string; count: string; description: string }[];
  const jobTypes = (cms?.jobTypes && cms.jobTypes.length > 0)
    ? cms.jobTypes.map(jt => ({
        type: (isBn ? jt.typeBn : undefined) || jt.type,
        count: jt.count,
        description: (isBn ? jt.descriptionBn : undefined) || jt.description,
      }))
    : rawJobTypes;

  const ctaBadge      = (isBn ? cms?.ctaBadgeBn      : cms?.ctaBadge)      || t("ctaBadge");
  const ctaHeading    = (isBn ? cms?.ctaHeadingBn    : cms?.ctaHeading)    || t("ctaHeading");
  const ctaSubheading = (isBn ? cms?.ctaSubheadingBn : cms?.ctaSubheading) || t("ctaSubheading");
  const ctaButton     = (isBn ? cms?.ctaButtonBn     : cms?.ctaButton)     || t("ctaButton");

  const { data: apiJobs = [], isLoading: jobsLoading } = useGetAllJobsQuery({
    status: "published",
  });
  const previewJobs = apiJobs.slice(0, 6);

  return (
    <section className="relative py-16 md:py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* ── Ambient decorative blurs ── */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{ background: "#dbeafe", filter: "blur(120px)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none opacity-25"
        style={{ background: "#e0e7ff", filter: "blur(90px)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-[0.07]"
        style={{ background: "#dbeafe", filter: "blur(140px)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* ════════════════════════════════════════════════════════
            SECTION HEADER
        ════════════════════════════════════════════════════════ */}
        <div className="text-center mb-16 md:mb-22 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-extrabold tracking-widest uppercase mb-5"
            style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1a4da1" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-5"
            style={{ letterSpacing: "-1px" }}
          >
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #1a4da1 0%, #2B59C3 60%, #3b6fd4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {heading}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {subheading}
          </p>
          <div
            className="h-1 w-20 mx-auto mt-6 rounded-full"
            style={{ background: "linear-gradient(to right, #1a4da1, #2B59C3, #3b6fd4)" }}
          />
        </div>

        {/* ════════════════════════════════════════════════════════
            BLOCK 1 — FEATURED JOB OPENINGS (primary focus)
        ════════════════════════════════════════════════════════ */}
        <div className="mb-6">

          {/* Sub-header row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12">
            <div>
              <SectionBadge icon={Briefcase} text={liveBadge} />
              <h3
                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 leading-tight"
                style={{ letterSpacing: "-0.5px" }}
              >
                {featuredTitle}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-sm leading-relaxed">
                {listingsSubtext}
              </p>
            </div>

            {/* View All CTA */}
            <Link href="/jobs" className="shrink-0">
              <span
                className="group inline-flex items-center gap-2.5 text-sm font-extrabold px-6 py-3 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  color: "#1a4da1",
                  borderColor: "#1a4da1",
                  background: "linear-gradient(135deg, #EFF6FF 0%, #dbeafe 100%)",
                }}
              >
                <Briefcase className="w-4 h-4" />
                {viewAllJobs}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>
          </div>

          {/* Loading skeletons */}
          {jobsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 animate-pulse"
                  style={{ borderRadius: "20px" }}
                >
                  <div className="h-32 bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-xl w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-xl w-5/6" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Job cards grid */}
          {!jobsLoading && previewJobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {previewJobs.map((job: any, i: number) => (
                <MiniJobCard key={job._id} job={job} index={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!jobsLoading && previewJobs.length === 0 && (
            <div
              className="text-center py-20 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700"
              style={{ borderRadius: "24px" }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#EFF6FF", borderRadius: "16px" }}
              >
                <Globe className="w-7 h-7" style={{ color: "#1a4da1" }} />
              </div>
              <p className="text-sm text-slate-400 font-medium">No job listings available right now.</p>
            </div>
          )}

          {/* More listings text */}
          {!jobsLoading && previewJobs.length > 0 && (
            <div className="text-center pt-8">
              <p className="text-xs text-slate-400 font-medium tracking-wide">{moreListings}</p>
              <Link href="/jobs">
                <span
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-extrabold transition-all duration-200 hover:underline"
                  style={{ color: "#1a4da1" }}
                >
                  {browseAllText}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Smooth transition divider ── */}
        <TransitionDivider />

        {/* ════════════════════════════════════════════════════════
            BLOCK 2 — WHY JOB SEEKERS CHOOSE US
        ════════════════════════════════════════════════════════ */}
        <div className="mb-14 md:mb-20">

          {/* Section header */}
          <div className="text-center mb-12">
            <SectionBadge icon={CheckCircle} text={whyUsBadge} />
            <h3
              className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight"
              style={{ letterSpacing: "-0.5px" }}
            >
              {whyChooseTitle}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              {whyUsSubtext}
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {features.map(({ title, description }: { title: string; description: string }, i: number) => (
              <FeatureCard key={i} title={title} description={description} index={i} />
            ))}
          </div>
        </div>

        {/* ── Employment Type Cards ──────────────────────────── */}
        <div className="mb-14 md:mb-20">
          <h3
            className="text-xl md:text-2xl font-black text-slate-900 dark:text-white text-center mb-10"
            style={{ letterSpacing: "-0.3px" }}
          >
            {employmentTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7">
            {jobTypes.map(({ type, count, description }: { type: string; count: string; description: string }, i: number) => {
              const Icon = JOB_TYPE_ICONS[i % JOB_TYPE_ICONS.length];
              const style = JOB_TYPE_COLORS[i % JOB_TYPE_COLORS.length];
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden p-7 md:p-9 border transition-all duration-400 cursor-pointer"
                  style={{
                    background: style.bg,
                    borderColor: style.border,
                    borderRadius: "24px",
                    boxShadow: "0 2px 12px rgba(26,77,161,0.05)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(26,77,161,0.13)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(26,77,161,0.05)";
                  }}
                >
                  <div
                    className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: style.color }}
                  />
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-all duration-400 group-hover:scale-110"
                    style={{
                      width: "52px",
                      height: "52px",
                      background: style.color + "18",
                      border: `2px solid ${style.color}30`,
                      borderRadius: "14px",
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: style.color }} />
                  </div>
                  <p className="text-2xl md:text-3xl font-black mb-1" style={{ color: style.color }}>
                    {count}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mb-2">{type}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
                  <div
                    className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-600"
                    style={{
                      background: `linear-gradient(to right, ${style.color}, ${style.color}80)`,
                      borderRadius: "0 0 24px 24px",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA Banner ──────────────────────────────────────── */}
        <div
          className="relative overflow-hidden p-8 sm:p-12 md:p-16 text-center"
          style={{
            background: "linear-gradient(135deg, #0f1e45 0%, #1a4da1 55%, #2B59C3 100%)",
            borderRadius: "28px",
            boxShadow: "0 24px 64px rgba(26,77,161,0.35)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-10"
            style={{ background: "rgba(255,255,255,1)" }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-[0.07]"
            style={{ background: "rgba(255,255,255,1)" }}
          />
          <div
            className="absolute top-8 right-1/3 w-16 h-16 rounded-full pointer-events-none opacity-10"
            style={{ background: "rgba(255,255,255,1)" }}
          />

          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-white text-xs font-extrabold tracking-widest uppercase mb-6"
              style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.22)" }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{ctaBadge}</span>
            </div>
            <h3
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight"
              style={{ letterSpacing: "-1px" }}
            >
              {ctaHeading}
            </h3>
            <p className="text-blue-200 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {ctaSubheading}
            </p>
            <Link href="/jobs">
              <button
                className="group inline-flex items-center gap-3 bg-white font-black text-sm md:text-base px-8 md:px-10 py-3.5 md:py-4 rounded-2xl shadow-2xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ color: "#1a4da1", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
              >
                {ctaButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
