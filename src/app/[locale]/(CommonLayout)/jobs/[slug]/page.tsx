"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/utils/imageUtils";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetJobBySlugQuery } from "@/app/redux/api/jobsApi/jobsApi";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useLocale, useTranslations } from "next-intl";

const FLAG_MAP: Record<string, string> = {
  "usa": "🇺🇸", "united states": "🇺🇸", "america": "🇺🇸",
  "uk": "🇬🇧", "united kingdom": "🇬🇧", "england": "🇬🇧", "britain": "🇬🇧",
  "canada": "🇨🇦", "australia": "🇦🇺", "germany": "🇩🇪", "france": "🇫🇷",
  "uae": "🇦🇪", "dubai": "🇦🇪", "abu dhabi": "🇦🇪",
  "qatar": "🇶🇦", "doha": "🇶🇦",
  "saudi": "🇸🇦", "saudi arabia": "🇸🇦", "riyadh": "🇸🇦",
  "bangladesh": "🇧🇩", "dhaka": "🇧🇩",
  "india": "🇮🇳", "delhi": "🇮🇳", "mumbai": "🇮🇳",
  "singapore": "🇸🇬", "malaysia": "🇲🇾", "kuala lumpur": "🇲🇾",
  "oman": "🇴🇲", "muscat": "🇴🇲", "kuwait": "🇰🇼", "bahrain": "🇧🇭",
  "remote": "🌐", "worldwide": "🌐", "global": "🌐",
};

function getCountryFlag(country?: string, location?: string): string {
  const src = country || location;
  if (!src) return "🌍";
  const lower = src.toLowerCase();
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (lower.includes(key)) return flag;
  }
  return "🌍";
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useUser();
  const locale = useLocale();
  const t = useTranslations("jobsPage");

  const {
    data: job,
    isLoading,
    isError,
  } = useGetJobBySlugQuery(slug, {
    skip: !slug,
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <Loader2 size={36} className="animate-spin text-blue-700" />
      </div>
    );
  }

  // ── Error / Not found ──
  if (isError || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <div className="text-center text-gray-400">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600 dark:text-gray-300">
            {t("details.notFound")}
          </p>
          <Link href="/jobs">
            <button className="mt-4 text-sm text-blue-700 hover:underline">
              ← {t("details.backToJobs")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Localized Helpers ──
  const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
  const displayAbout = locale === "bn" ? (job.aboutBn || job.about) : job.about;
  const displayLocation = locale === "bn" ? (job.locationBn || job.location) : job.location;
  const displaySalary = locale === "bn" ? (job.salaryBn || job.salary) : job.salary;
  const displayExperience = locale === "bn" ? (job.experienceBn || job.experience) : job.experience;
  const displayDuration = locale === "bn" ? (job.durationBn || job.duration) : job.duration;
  const displayDutyTime = locale === "bn" ? (job.dutyTimeBn || job.dutyTime) : job.dutyTime;
  
  const displayQualifications = locale === "bn" ? (job.qualificationsBn || job.qualifications) : job.qualifications;
  const displayResponsibilities = locale === "bn" ? (job.responsibilitiesBn || job.responsibilities) : job.responsibilities;
  const displayBenefits = locale === "bn" ? (job.benefitsBn || job.benefits) : job.benefits;

  const initial = displayTitle?.charAt(0)?.toUpperCase() ?? "J";
  const heroBannerUrl = job.image ? getImageUrl(job.image) : "/images/details-banner.png";
  const countryFlag = getCountryFlag(job.country, job.location);
  const displayCountry = job.country || (job.location ? job.location.split(",").pop()?.trim() : null);

  const handleApply = () => {
    if (!user) {
      toast.error(t("details.loginRequired"));
      router.push("/login");
      return;
    }
    router.push(`/jobs/${job.slug}/apply`);
  };

  return (
    <div className="min-h-screen dark:bg-gray-950 font-sans transition-colors">
      {/* ── HERO BANNER ── */}
      <div className="relative max-w-7xl mx-auto rounded-xl w-full h-85 mt-5 overflow-hidden">
        <Image
          src={heroBannerUrl}
          alt={displayTitle ?? "Job Banner"}
          fill
          className="object-cover object-center"
          unoptimized={!!job.image}
        />
      </div>

      {/* ── COMPANY STRIP ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 pt-0 pb-3 -mt-12">
            <div className="w-25 h-25 rounded-full bg-blue-700 dark:bg-blue-600 border-[3px] border-white dark:border-gray-900 shadow-md flex items-center justify-center text-white font-black text-2xl shrink-0 relative z-10 overflow-hidden">
              {job.image ? (
                <img src={getImageUrl(job.image)} alt={displayTitle} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="flex gap-5 flex-wrap pt-10">
              {["Website", "LinkedIn", "Instagram", "Glassdoor", "Kununu"].map(
                (s) => (
                  <button
                    key={s}
                    className="text-[13px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-2.5 py-0.5 font-medium hover:bg-blue-700 hover:text-white hover:border-blue-700 dark:hover:bg-blue-600 dark:hover:border-blue-600 transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
          <Link
            href="/jobs"
            className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            {t("details.backToJobs")}
          </Link>
          <span>›</span>
          <span className="text-gray-500 dark:text-gray-300">
            {job.category ?? displayTitle}
          </span>
        </div>

        {/* Title + Apply */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">
              {displayTitle}
            </h1>
            <div className="flex gap-2 flex-wrap">
              {job.status && (
                <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-full px-2.5 py-0.5 capitalize">
                  {job.status}
                </span>
              )}
              {job.type && (
                <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-2.5 py-0.5">
                  {t.has(`types.${job.type}`) ? t(`types.${job.type}`) : job.type}
                </span>
              )}
              {displayCountry && (
                <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-2.5 py-0.5">
                  {countryFlag} {displayCountry}
                </span>
              )}
              {displayLocation && (
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-2.5 py-0.5">
                  📍 {displayLocation}
                </span>
              )}
              {displaySalary && (
                <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full px-2.5 py-0.5">
                  💰 {displaySalary}
                </span>
              )}
              {displayDutyTime && (
                <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-full px-2.5 py-0.5">
                  ⏰ {displayDutyTime}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleApply}
            className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            {t("details.applyNow")}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* About the Role */}
          {displayAbout && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 transition-colors">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
                {t("details.about")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {displayAbout}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {Array.isArray(displayResponsibilities) &&
            displayResponsibilities.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 transition-colors">
                <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
                  {t("details.responsibilities")}
                </h2>
                <ul className="list-disc pl-4 flex flex-col gap-1.5">
                  {(displayResponsibilities as string[]).map(
                    (item: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                      >
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {/* Qualifications / Requirements */}
          {Array.isArray(displayQualifications) &&
            displayQualifications.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 transition-colors">
                <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
                  {t("details.requirements")}
                </h2>
                <ul className="list-disc pl-4 flex flex-col gap-1.5">
                  {(displayQualifications as string[]).map(
                    (item: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                      >
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {/* Deadline */}
          {job.deadline && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
                  {t("details.deadline")}
                </p>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                  {job.deadline}
                </p>
              </div>
            </div>
          )}

          {/* Apply Now (middle) */}
          <div className="text-center py-2">
            <button
              onClick={handleApply}
              className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              {t("details.applyNow")}
            </button>
          </div>

          {/* Benefits */}
          {Array.isArray(displayBenefits) && displayBenefits.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 transition-colors">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-4">
                {t("details.benefits")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(displayBenefits as string[]).map((b: string, i: number) => (
                  <div
                    key={i}
                    className="text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <div className="text-2xl mb-1.5">✅</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-1">
                      {b}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media placeholder */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 transition-colors">
            <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-4">
              {t("details.media")}
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                "from-blue-300 to-blue-400",
                "from-blue-400 to-blue-500",
                "from-blue-200 to-blue-300",
                "from-blue-500 to-blue-600",
              ].map((g, i) => (
                <div
                  key={i}
                  className={`h-20 rounded-lg bg-gradient-to-br ${g} cursor-pointer hover:opacity-90 transition-opacity`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 py-4 px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-700 dark:bg-blue-600 rounded flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-none">
                Immigrant Jobs World
              </div>
              <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                powered by aeroselect
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            {["Imprint", "Privacy", "Explore AeroHire"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors no-underline"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
