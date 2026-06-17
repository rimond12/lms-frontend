"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Search,
  MapPin,
  X,
  Globe,
  Bookmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { toast } from "react-hot-toast";

// API Hooks
import { useGetAllJobsQuery } from "@/app/redux/api/jobsApi/jobsApi";
import {
  useToggleSaveJobMutation,
  useGetSavedJobsQuery,
} from "@/app/redux/api/jobsApi/SavedJobsApi";
import { useGetJobCategoriesQuery } from "@/app/redux/api/jobsApi/JobCategoryApi";
import { useGetCountriesQuery } from "@/app/redux/api/jobsApi/CountryApi";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 9;

// ─── Brand Color Palette ──────────────────────────────────────────
const CARD_COLORS = [
  { from: "#1a4da1", to: "#2B59C3", light: "#EFF6FF", border: "#BFDBFE", glow: "rgba(26,77,161,0.22)" },
  { from: "#0d9488", to: "#14b8a6", light: "#F0FDFA", border: "#99F6E4", glow: "rgba(13,148,136,0.22)" },
  { from: "#7c3aed", to: "#9333ea", light: "#F5F3FF", border: "#DDD6FE", glow: "rgba(124,58,237,0.22)" },
  { from: "#ea580c", to: "#f97316", light: "#FFF7ED", border: "#FED7AA", glow: "rgba(234,88,12,0.22)" },
  { from: "#0891b2", to: "#06b6d4", light: "#ECFEFF", border: "#A5F3FC", glow: "rgba(8,145,178,0.22)" },
  { from: "#059669", to: "#10b981", light: "#ECFDF5", border: "#6EE7B7", glow: "rgba(5,150,105,0.22)" },
];

function getCardColor(index: number) {
  return CARD_COLORS[index % CARD_COLORS.length];
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
  "japan": "🇯🇵",
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

// ─── Bookmark Button ──────────────────────────────────────────────
function BookmarkButton({ jobId, savedJobIds }: { jobId: string; savedJobIds: string[] }) {
  const { user } = useUser();
  const [toggleSave, { isLoading }] = useToggleSaveJobMutation();
  const isSaved = savedJobIds.includes(jobId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save jobs");
      return;
    }
    try {
      await toggleSave(jobId).unwrap();
      toast.success(isSaved ? "Job removed" : "Job saved!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 border ${
        isSaved
          ? "bg-blue-600 border-blue-500 text-white shadow-lg"
          : "bg-white/20 border-white/30 text-white hover:bg-white/35 backdrop-blur-sm"
      }`}
    >
      {isLoading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Bookmark size={13} fill={isSaved ? "white" : "none"} />
      )}
    </button>
  );
}

// ─── Premium Job Card ──────────────────────────────────────────────
function JobCard({ job, savedJobIds, index }: { job: any; savedJobIds: string[]; index: number }) {
  const locale = useLocale();
  const t = useTranslations("jobsPage");
  const color = getCardColor(index);
  const country = getCountryFromLocation(job.location, job.country);
  const flag = getCountryFlag(job.location, job.country);
  
  const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
  const displayLocation = locale === "bn" ? (job.locationBn || job.location || "Worldwide") : (job.location || "Worldwide");
  const displayCountry = locale === "bn" ? (job.country || country) : country;
  const displaySalary = locale === "bn" ? (job.salaryBn || job.salary) : job.salary;
  const description = (locale === "bn" ? (job.aboutBn || job.about || job.desc || "") : (job.about || job.desc || "")).trim();
  const displayCompanyName = locale === "bn" ? (job.companyNameBn || job.companyName) : job.companyName;

  const initial = displayTitle?.charAt(0)?.toUpperCase() ?? "J";
  const hasImage = !!job.image;

  return (
    <Link href={`/jobs/${job.slug}`} className="h-full block">
      <div
        className="group relative bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 cursor-pointer h-full flex flex-col"
        style={{
          borderRadius: "20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = `0 16px 48px ${color.glow}, 0 2px 8px rgba(0,0,0,0.06)`;
          el.style.transform = "translateY(-6px)";
          el.style.borderColor = color.border;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
          el.style.transform = "translateY(0)";
          el.style.borderColor = "";
        }}
      >

        {/* ── Banner / Image Area ── */}
        <div className="relative h-44 flex items-center justify-center overflow-hidden shrink-0">

          {/* Soft layered gradient header (always present as fallback/backdrop) */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${color.from}f0 0%, ${color.to} 60%, ${color.to}bb 100%)`,
            }}
          />
          {/* Decorative abstract circles */}
          <div
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
            style={{ background: "rgba(255,255,255,0.7)" }}
          />
          <div
            className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full opacity-15"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />
          <div
            className="absolute top-1/2 right-14 w-12 h-12 rounded-full opacity-10"
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
                  // Hide image if it fails to load
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Subtle dark overlay for readability */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
            </>
          ) : (
            /* Elevated company logo fallback/initial */
            <div className="relative z-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <div className="w-20 h-20 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center shadow-xl shadow-black/10 p-1">
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
              </div>
            </div>
          )}

          {/* Country Badge — top right */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/96 dark:bg-gray-900/96 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/60">
            <span className="text-base leading-none">{flag}</span>
            <span className="text-[11px] font-extrabold text-gray-800 dark:text-white max-w-[90px] truncate tracking-tight">
              {displayCountry}
            </span>
          </div>

          {/* Bookmark — top left */}
          <div className="absolute top-3 left-3 z-20">
            <BookmarkButton jobId={job._id} savedJobIds={savedJobIds} />
          </div>

          {/* Job Type chip — bottom left */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold bg-black/25 text-white border border-white/25 rounded-full px-3 py-1 backdrop-blur-sm">
              <Briefcase size={9} />
              {t(`types.${job.type}`, job.type)}
            </span>
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="flex flex-col flex-1 p-5 gap-3">

          {/* Title & Company */}
          <div>
            <h3
              className="font-extrabold text-[15px] text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200"
              style={{ letterSpacing: "-0.1px" }}
            >
              {displayTitle}
            </h3>
            {displayCompanyName && (
              <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {displayCompanyName}
              </p>
            )}
            {(job.company || job.category) && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 size={11} className="text-gray-400 shrink-0" />
                <span className="text-[11.5px] text-gray-400 truncate font-semibold">
                  {job.company || job.category}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {description ? (
            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1 min-h-0">
              {description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          {/* Thin divider */}
          <div
            className="h-px w-full"
            style={{ background: "linear-gradient(to right, transparent, #e2e8f0, transparent)" }}
          />

          {/* Location row */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-3 border"
            style={{ background: color.light, borderColor: color.border, borderRadius: "14px" }}
          >
            <MapPin size={13} style={{ color: color.from }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-0.5">
                {job.country ? t("card.country") : t("card.location")}
              </p>
              <p
                className="text-[12.5px] font-extrabold truncate leading-tight"
                style={{ color: color.from }}
              >
                {flag} {job.country ? displayCountry : displayLocation}
              </p>
            </div>
            {displaySalary && (
              <span
                className="text-[11px] font-bold shrink-0 px-2.5 py-1 rounded-full"
                style={{ background: color.from + "18", color: color.from }}
              >
                {displaySalary}
              </span>
            )}
          </div>

          {/* Apply CTA */}
          <button
            className="w-full py-3 rounded-2xl text-white text-[13px] font-extrabold tracking-wide transition-all duration-200 group-hover:opacity-95 group-hover:shadow-xl active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              boxShadow: `0 4px 18px ${color.glow}`,
              letterSpacing: "0.3px",
            }}
          >
            {t("card.applyNow")}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse"
      style={{ borderRadius: "20px" }}
    >
      <div className="h-44 bg-gray-200 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-xl w-5/6" />
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user } = useUser();
  const locale = useLocale();
  const t = useTranslations("jobsPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Read active country from URL query parameter ?country=...
  const selectedCountry = searchParams.get("country") || "";

  // Fetch countries list
  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      
      const timer = setTimeout(checkScroll, 500);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
      };
    }
  }, [countries, countriesLoading]);

  const handleScrollClick = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = 300;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el || !isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleCountrySelect = (countryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (countryName) {
      params.set("country", countryName);
    } else {
      params.delete("country");
    }
    setCurrentPage(1);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: categories = [] } = useGetJobCategoriesQuery();
  const {
    data: allJobs = [],
    isLoading: jobsLoading,
    isError,
  } = useGetAllJobsQuery({ status: "published" });
  const { data: savedJobs = [] } = useGetSavedJobsQuery(undefined, { skip: !user });
  const savedJobIds = savedJobs.map((j: any) => j._id);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job: any) => {
      const displayTitle = locale === "bn" ? (job.titleBn || job.title) : job.title;
      const displayLocation = locale === "bn" ? (job.locationBn || job.location) : job.location;
      
      const matchesSearch =
        displayTitle?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        displayLocation?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "" || job.category === selectedCategory;
      const matchesType = selectedType === "" || job.type === selectedType;
      const matchesCountry = selectedCountry === "" || job.country === selectedCountry;
      return matchesSearch && matchesCategory && matchesType && matchesCountry;
    });
  }, [allJobs, search, selectedCategory, selectedType, selectedCountry, locale]);

  const jobTypes = Array.from(new Set(allJobs.map((j: any) => j.type).filter(Boolean)));
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters = !!(selectedCategory || selectedType || search || selectedCountry);

  const goToPage = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors">

      {/* ══════════════════════════════════════════════════════════
          PREMIUM HERO
      ══════════════════════════════════════════════════════════ */}
      <div
        className="relative px-4 sm:px-6 py-14 sm:py-20 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f1e45 0%, #1a4da1 55%, #2B59C3 100%)",
        }}
      >
        {/* Ambient orbs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-5"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Top badge */}
          <div
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles size={13} className="text-blue-200" />
            <span className="text-blue-100 text-xs font-extrabold tracking-widest uppercase">
              {locale === "bn" ? "বৈশ্বিক সুযোগ" : "Global Opportunities"}
            </span>
          </div>

          <h1
            className="text-white text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight"
            style={{ letterSpacing: "-1px" }}
          >
            {t("title")}{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #93c5fd, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("titleWorldwide")}
            </span>
          </h1>
          <p className="text-blue-300 text-sm sm:text-base mb-10 max-w-xl leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Search bar */}
          <div
            className="flex items-center bg-white dark:bg-gray-900 overflow-hidden shadow-2xl max-w-2xl border border-white/10"
            style={{ borderRadius: "16px" }}
          >
            <div className="pl-4 pr-2 flex items-center shrink-0">
              <Search size={17} className="text-gray-400" />
            </div>
            <input
              id="jobs-search-input"
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 border-none outline-none text-sm text-gray-700 dark:text-gray-200 py-4 px-2 bg-transparent"
            />
            <button
              id="jobs-search-btn"
              className="font-extrabold text-sm px-6 py-4 transition-all shrink-0 text-white hover:opacity-90 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #1a4da1, #2B59C3)" }}
            >
              <Search size={14} />
              {t("searchButton")}
            </button>
          </div>

          {/* Quick stats strip */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: t("stats.liveJobs"), value: allJobs.length || "—" },
              { label: t("stats.countries"), value: "40+" },
              { label: t("stats.industries"), value: categories.length || "—" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-lg font-black text-white"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {s.value}
                </span>
                <span className="text-blue-300 text-xs font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Country Flag Bar (IMG_2472.JPG Style) */}
        <div className="mb-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 sm:p-6" style={{ borderRadius: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Globe size={16} className="text-[#1a4da1]" />
              {t("countryBar.title")}
            </h2>
            {selectedCountry && (
              <button
                onClick={() => handleCountrySelect("")}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-all hover:underline"
              >
                {t("countryBar.showAll")}
              </button>
            )}
          </div>
          
          <div className="relative group/bar">
            {/* Left Nav Button */}
            <button
              onClick={() => handleScrollClick("left")}
              className={`absolute left-0 top-8 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all hover:scale-110 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 ${
                canScrollLeft ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
              }`}
              style={{ left: "-10px" }}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Right Nav Button */}
            <button
              onClick={() => handleScrollClick("right")}
              className={`absolute right-0 top-8 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all hover:scale-110 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 ${
                canScrollRight ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
              }`}
              style={{ right: "-10px" }}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>

            <style dangerouslySetInnerHTML={{ __html: `
              .custom-flag-scroll::-webkit-scrollbar {
                display: block !important;
                height: 4px !important;
              }
              .custom-flag-scroll::-webkit-scrollbar-track {
                background: transparent !important;
              }
              .custom-flag-scroll::-webkit-scrollbar-thumb {
                background: #cbd5e1 !important;
                border-radius: 9999px !important;
              }
              .dark .custom-flag-scroll::-webkit-scrollbar-thumb {
                background: #475569 !important;
              }
              .custom-flag-scroll::-webkit-scrollbar-thumb:hover {
                background: #94a3b8 !important;
              }
              .dark .custom-flag-scroll::-webkit-scrollbar-thumb:hover {
                background: #64748b !important;
              }
            `}} />

            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`custom-flag-scroll flex gap-6 overflow-x-auto pb-3 pt-1 px-1 select-none scroll-smooth ${
                isDown ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              {/* "All Jobs" Button */}
              <button
                onClick={() => handleCountrySelect("")}
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer focus:outline-none group transition-transform active:scale-95"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    selectedCountry === ""
                      ? "border-[#1a4da1] bg-blue-50 dark:bg-blue-950/40 ring-4 ring-blue-100 dark:ring-blue-900/30 scale-105 shadow-md"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group-hover:scale-105 group-hover:border-blue-400 group-hover:shadow-sm"
                  }`}
                >
                  <Globe size={24} className={selectedCountry === "" ? "text-[#1a4da1]" : "text-gray-400 group-hover:text-[#1a4da1] transition-colors"} />
                </div>
                <div className="text-center min-w-[70px]">
                  <p className={`text-[11px] font-extrabold leading-tight ${selectedCountry === "" ? "text-[#1a4da1]" : "text-gray-700 dark:text-gray-300"}`}>
                    {t("countryBar.allCountries")}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    {t("countryBar.allJobs")}
                  </p>
                </div>
              </button>

              {/* Skeleton Loading State */}
              {countriesLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-12 mx-auto" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-8 mx-auto" />
                    </div>
                  ))
                : countries.map((country) => {
                    const isActive = selectedCountry === country.name;
                    return (
                      <button
                        key={country._id}
                        onClick={() => handleCountrySelect(isActive ? "" : country.name)}
                        className="flex flex-col items-center gap-2 shrink-0 cursor-pointer focus:outline-none group transition-transform active:scale-95"
                      >
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 p-0.5 bg-white dark:bg-gray-950 ${
                            isActive
                              ? "border-[#1a4da1] ring-4 ring-blue-100 dark:ring-blue-900/30 scale-105 shadow-md"
                              : "border-gray-200 dark:border-gray-800 group-hover:scale-105 group-hover:border-blue-400 group-hover:shadow-sm"
                          }`}
                        >
                          <img
                            src={country.flagIcon}
                            alt={country.name}
                            className="w-full h-full object-cover rounded-full"
                            loading="lazy"
                          />
                        </div>
                        <div className="text-center min-w-[70px]">
                          <p className={`text-[11px] font-extrabold leading-tight ${isActive ? "text-[#1a4da1] dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                            {locale === "bn" ? country.nameBn : country.name}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">
                            {locale === "bn" ? country.name : country.nameBn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 px-5 py-4 border border-gray-100 dark:border-gray-800"
          style={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {t("filterBar.showing")}{" "}
              <span className="font-extrabold" style={{ color: "#1a4da1" }}>
                {filteredJobs.length}
              </span>{" "}
              {filteredJobs.length === 1 ? t("filterBar.job") : t("filterBar.jobs")}{" "}{t("filterBar.available")}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              id="jobs-category-filter"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
              style={{ borderRadius: "10px" }}
            >
              <option value="">{t("filterBar.allCategories")}</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            <select
              id="jobs-type-filter"
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
              style={{ borderRadius: "10px" }}
            >
              <option value="">{t("filterBar.allTypes")}</option>
              {jobTypes.map((type: any) => (
                <option key={type} value={type}>{t(`types.${type}`, type)}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                id="jobs-clear-filters-btn"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedType("");
                  setSearch("");
                  handleCountrySelect("");
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 font-bold px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30 transition-all"
                style={{ borderRadius: "10px" }}
              >
                <X size={12} />
                {t("filterBar.clearFilters")}
              </button>
            )}
          </div>
        </div>

        {/* Job Grid */}
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <div
            className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            style={{ borderRadius: "20px" }}
          >
            <p className="text-red-400 font-semibold">{t("errorState")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentJobs.map((job: any, i: number) => (
                <JobCard
                  key={job._id}
                  job={job}
                  savedJobIds={savedJobIds}
                  index={(currentPage - 1) * ITEMS_PER_PAGE + i}
                />
              ))}
            </div>

            {/* Empty State */}
            {currentJobs.length === 0 && (
              <div
                className="text-center py-24 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700"
                style={{ borderRadius: "24px" }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "#EFF6FF", borderRadius: "16px" }}
                >
                  <Search size={28} style={{ color: "#1a4da1", opacity: 0.5 }} />
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-bold text-base mb-1.5">
                  {t("emptyState.noJobs")}
                </p>
                <p className="text-gray-400 text-sm">
                  {t("emptyState.adjustFilters")}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedType("");
                      setSearch("");
                      handleCountrySelect("");
                    }}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                    style={{ color: "#1a4da1", borderColor: "#BFDBFE", background: "#EFF6FF" }}
                  >
                    <X size={13} />
                    {t("emptyState.clearAll")}
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  id="jobs-prev-btn"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-blue-400 hover:text-blue-700 transition-all"
                  style={{ borderRadius: "12px" }}
                >
                  <ChevronLeft size={15} /> {t("pagination.prev")}
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    id={`jobs-page-btn-${i + 1}`}
                    onClick={() => goToPage(i + 1)}
                    className={`w-10 h-10 text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? "text-white shadow-lg"
                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-400 hover:text-blue-700"
                    }`}
                    style={{
                      borderRadius: "12px",
                      ...(currentPage === i + 1
                        ? { background: "linear-gradient(135deg, #1a4da1, #2B59C3)", boxShadow: "0 4px 16px rgba(26,77,161,0.35)" }
                        : {}),
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  id="jobs-next-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-blue-400 hover:text-blue-700 transition-all"
                  style={{ borderRadius: "12px" }}
                >
                  {t("pagination.next")} <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
