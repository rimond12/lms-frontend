"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Globe,
  Search,
  MapPin,
  ArrowRight,
  Bookmark,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Building2,
  Award,
} from "lucide-react";

const FEATURE_ICONS = [Globe, Search, Bookmark, Building2];
const STAT_ICONS    = [Briefcase, Globe, Users, TrendingUp];
const JOB_TYPE_ICONS = [Briefcase, Clock, Award];
const JOB_TYPE_COLORS = [
  { bg: "#EFF6FF", border: "#BFDBFE", color: "#1a4da1" },
  { bg: "#EEF2FF", border: "#C7D2FE", color: "#2B59C3" },
  { bg: "#EFF6FF", border: "#BFDBFE", color: "#1a4da1" },
];
const ROLE_COLORS = ["#1a4da1", "#2B59C3", "#1a4da1", "#2B59C3", "#1a4da1", "#2B59C3"];

export default function ImmigrantJobsSection() {
  const t = useTranslations("immigrantJobs");

  const stats    = t.raw("stats")    as { value: string; label: string }[];
  const features = t.raw("features") as { title: string; description: string }[];
  const roles    = t.raw("roles")    as { title: string; location: string; type: string }[];
  const jobTypes = t.raw("jobTypes") as { type: string; count: string; description: string }[];

  return (
    <section className="relative py-16 md:py-24 bg-slate-50 overflow-hidden">

      {/* decorative blurs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-50"
        style={{ background: "#dbeafe", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-40"
        style={{ background: "#e0e7ff", filter: "blur(80px)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14 md:mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5">
            <span
              style={{
                backgroundImage: "linear-gradient(to right, #1a4da1, #2B59C3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("heading")}
            </span>
          </h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {t("subheading")}
          </p>
          <div
            className="h-1.5 w-20 mx-auto mt-6 rounded-full"
            style={{ background: "linear-gradient(to right, #1a4da1, #2B59C3)" }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-14 md:mb-20">
          {stats.map(({ value, label }, i) => {
            const Icon = STAT_ICONS[i];
            return (
              <div
                key={i}
                className="group bg-white border border-slate-100 rounded-2xl p-5 md:p-7 text-center shadow-sm hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-700 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-blue-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-blue-700 mb-1">{value}</p>
                <p className="text-xs md:text-sm text-slate-500 font-semibold">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Features + Sample Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14 md:mb-20">

          {/* Left: Features */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6">
              {t("whyChooseTitle")}
            </h3>
            {features.map(({ title, description }, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-700 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-blue-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                      {title}
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Sample Roles */}
          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6">
              {t("featuredTitle")}
            </h3>
            {roles.map(({ title, location, type }, i) => {
              const color = ROLE_COLORS[i];
              return (
                <div
                  key={i}
                  className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs"
                    style={{ background: color + "18", border: `1.5px solid ${color}40`, color }}
                  >
                    {title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-400">{location}</span>
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: color + "15", color, border: `1px solid ${color}30` }}
                  >
                    {type}
                  </span>
                </div>
              );
            })}
            <p className="text-center text-xs text-slate-400 pt-2 font-medium">
              {t("moreListings")}
            </p>
          </div>
        </div>

        {/* Employment Type Cards */}
        <div className="mb-14 md:mb-20">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 text-center mb-8">
            {t("employmentTitle")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {jobTypes.map(({ type, count, description }, i) => {
              const Icon  = JOB_TYPE_ICONS[i];
              const style = JOB_TYPE_COLORS[i];
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
                    style={{ background: style.color + "18", border: `2px solid ${style.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: style.color }} />
                  </div>
                  <p className="text-2xl md:text-3xl font-black mb-1" style={{ color: style.color }}>
                    {count}
                  </p>
                  <p className="text-base font-bold text-slate-900 mb-2">{type}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 rounded-b-[2rem]"
                    style={{ background: `linear-gradient(to right, ${style.color}, ${style.color}88)` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center shadow-2xl"
          style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1a4da1 55%, #2B59C3 100%)" }}
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
              style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t("ctaBadge")}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {t("ctaHeading")}
            </h3>
            <p className="text-blue-200 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {t("ctaSubheading")}
            </p>
            <Link href="/jobs">
              <button
                className="group inline-flex items-center gap-3 bg-white font-black text-sm md:text-base px-8 md:px-10 py-3.5 md:py-4 rounded-full shadow-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ color: "#1a4da1" }}
              >
                {t("ctaButton")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
