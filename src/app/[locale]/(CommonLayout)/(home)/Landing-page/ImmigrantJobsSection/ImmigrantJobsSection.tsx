"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

// Color palette for job cards
const CARD_COLORS = [
  { from: "#1a4da1", to: "#2B59C3", light: "#EFF6FF", border: "#BFDBFE" },
  { from: "#0d9488", to: "#14b8a6", light: "#F0FDFA", border: "#99F6E4" },
  { from: "#7c3aed", to: "#9333ea", light: "#F5F3FF", border: "#DDD6FE" },
  { from: "#ea580c", to: "#f97316", light: "#FFF7ED", border: "#FED7AA" },
  { from: "#0891b2", to: "#06b6d4", light: "#ECFEFF", border: "#A5F3FC" },
  { from: "#059669", to: "#10b981", light: "#ECFDF5", border: "#6EE7B7" },
];

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  Hot: { bg: "#fef2f2", color: "#dc2626" },
  New: { bg: "#f0fdf4", color: "#16a34a" },
  Flexible: { bg: "#f5f3ff", color: "#7c3aed" },
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

// ─── Mini Job Card (for homepage grid) ────────────────────────────
function MiniJobCard({ job, index }: { job: any; index: number }) {
  const color = getCardColor(index);
  const country = getCountryFromLocation(job.location, job.country);
  const flag = getCountryFlag(job.location, job.country);
  const initial = job.title?.charAt(0)?.toUpperCase() ?? "J";
  const badge = deriveBadge(job.type, index);
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;
  const description = (job.about ?? job.desc ?? "").trim();
  const hasImage = !!job.image;

  return (
    <Link href={`/jobs/${job.slug}`}>
      <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">

        {/* Card Banner */}
        <div className="relative h-28 flex items-center justify-center overflow-hidden shrink-0">

          {/* Background: image or gradient */}
          {hasImage ? (
            <>
              <img src={getImageUrl(job.image)} alt={job.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5" />
            </>
          ) : (
            <>
              <div className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)` }} />
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full border-[8px] border-white/10" />
              <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full border-[8px] border-white/10" />
              {/* Logo / Initial only when no image */}
              {job.logo && job.logo.startsWith("http") ? (
                <img src={job.logo} alt={job.title}
                  className="w-12 h-12 rounded-xl object-cover shadow-lg border-2 border-white/30 relative z-10" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center font-black text-2xl text-white shadow-lg relative z-10">
                  {initial}
                </div>
              )}
            </>
          )}

          {/* Country Badge – TOP RIGHT */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-md">
            <span className="text-sm leading-none">{flag}</span>
            <span className="text-[10.5px] font-extrabold text-gray-800 dark:text-white max-w-[70px] truncate">
              {country}
            </span>
          </div>

          {/* Badge chip – BOTTOM LEFT */}
          {badgeStyle && (
            <div className="absolute bottom-2 left-2 z-20">
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.9)", color: badgeStyle.color }}>
                {badge === "Hot" && <Flame className="w-2.5 h-2.5" />}
                {badge === "New" && <BadgeCheck className="w-2.5 h-2.5" />}
                {badge}
              </span>
            </div>
          )}

          {/* Job type – BOTTOM RIGHT */}
          <div className="absolute bottom-2 right-2 z-20">
            <span className="text-[9.5px] font-bold bg-white/20 text-white border border-white/30 rounded-full px-2 py-0.5">
              {job.type}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-3 gap-2">
          {/* Title */}
          <div>
            <p className="font-extrabold text-[13px] text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </p>
            {(job.company || job.category) && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 size={10} className="text-slate-400 shrink-0" />
                <span className="text-[10.5px] text-slate-400 truncate">
                  {job.company || job.category}
                </span>
              </div>
            )}
          </div>

          {/* Short description */}
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
              {description}
            </p>
          )}

          {/* Country / Location highlight */}
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border"
            style={{ background: color.light, borderColor: color.border }}>
            <Globe size={12} style={{ color: color.from }} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">
                {job.country ? "Country" : "Location"}
              </p>
              <p className="text-[11px] font-extrabold truncate leading-tight" style={{ color: color.from }}>
                {flag} {job.country ?? job.location ?? "Worldwide"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Section ─────────────────────────────────────────────────
export default function ImmigrantJobsSection() {
  const t = useTranslations("immigrantJobs");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.immigrantJobsSection;

  const stats = t.raw("stats") as { value: string; label: string }[];
  
  const badge = cms?.badge || t("badge");
  const heading = cms?.heading || t("heading");
  const subheading = cms?.subheading || t("subheading");
  const whyChooseTitle = cms?.whyChooseTitle || t("whyChooseTitle");

  const rawFeatures = t.raw("features") as { title: string; description: string }[];
  const features = cms?.features && cms.features.length > 0 ? cms.features : rawFeatures;

  const featuredTitle = cms?.featuredTitle || t("featuredTitle");
  const moreListings = cms?.moreListings || t("moreListings");
  const employmentTitle = cms?.employmentTitle || t("employmentTitle");

  const rawJobTypes = t.raw("jobTypes") as { type: string; count: string; description: string }[];
  const jobTypes = cms?.jobTypes && cms.jobTypes.length > 0 ? cms.jobTypes : rawJobTypes;

  const ctaBadge = cms?.ctaBadge || t("ctaBadge");
  const ctaHeading = cms?.ctaHeading || t("ctaHeading");
  const ctaSubheading = cms?.ctaSubheading || t("ctaSubheading");
  const ctaButton = cms?.ctaButton || t("ctaButton");

  const { data: apiJobs = [], isLoading: jobsLoading } = useGetAllJobsQuery({
    status: "published",
  });
  const previewJobs = apiJobs.slice(0, 6);

  return (
    <section className="relative py-16 md:py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* Decorative blurs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-40"
        style={{ background: "#dbeafe", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-30"
        style={{ background: "#e0e7ff", filter: "blur(80px)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Section Header ─────────────────────────────────── */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-widest uppercase mb-5"
            style={{
              background: "#EFF6FF",
              borderColor: "#BFDBFE",
              color: "#1a4da1",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
            <span
              style={{
                backgroundImage: "linear-gradient(to right, #1a4da1, #2B59C3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {heading}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            {subheading}
          </p>
          <div
            className="h-1 w-16 mx-auto mt-5 rounded-full"
            style={{ background: "linear-gradient(to right, #1a4da1, #2B59C3)" }}
          />
        </div>

        {/* ── Features + Job Cards Grid ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start mb-14 md:mb-20">

          {/* Left: Why Choose (2 cols wide on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6">
              {whyChooseTitle}
            </h3>
            {features.map(({ title, description }, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-700 transition-colors duration-300"
                  >
                    <Icon className="w-4.5 h-4.5 text-blue-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-700 transition-colors">
                      {title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Job Cards (3 cols wide on lg) */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {featuredTitle}
              </h3>
              <Link href="/jobs">
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-80"
                  style={{ color: "#1a4da1" }}
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            {/* Loading skeletons */}
            {jobsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                  >
                    <div className="h-28 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live job cards grid */}
            {!jobsLoading && previewJobs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previewJobs.map((job: any, i: number) => (
                  <MiniJobCard key={job._id} job={job} index={i} />
                ))}
              </div>
            )}

            {/* No jobs fallback */}
            {!jobsLoading && previewJobs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  No job listings available right now.
                </p>
              </div>
            )}

            {!jobsLoading && previewJobs.length > 0 && (
              <p className="text-center text-xs text-slate-400 pt-3 font-medium">
                {moreListings}
              </p>
            )}
          </div>
        </div>

        {/* ── Employment Type Cards ──────────────────────────── */}
        <div className="mb-14 md:mb-20">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white text-center mb-8">
            {employmentTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {jobTypes.map(({ type, count, description }, i) => {
              const Icon = JOB_TYPE_ICONS[i % JOB_TYPE_ICONS.length];
              const style = JOB_TYPE_COLORS[i % JOB_TYPE_COLORS.length];
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden p-7 md:p-9 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  style={{ background: style.bg, borderColor: style.border }}
                >
                  <div
                    className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: style.color }}
                  />
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: style.color + "18",
                      border: `2px solid ${style.color}30`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: style.color }} />
                  </div>
                  <p
                    className="text-2xl md:text-3xl font-black mb-1"
                    style={{ color: style.color }}
                  >
                    {count}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {type}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 rounded-b-[2rem]"
                    style={{
                      background: `linear-gradient(to right, ${style.color}, ${style.color}88)`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA Banner ──────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #1a2e5a 0%, #1a4da1 55%, #2B59C3 100%)",
          }}
        >
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-white text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                background: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{ctaBadge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {ctaHeading}
            </h3>
            <p className="text-blue-200 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {ctaSubheading}
            </p>
            <Link href="/jobs">
              <button className="group inline-flex items-center gap-3 bg-white font-black text-sm md:text-base px-8 md:px-10 py-3.5 md:py-4 rounded-full shadow-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ color: "#1a4da1" }}
              >
                {ctaButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
