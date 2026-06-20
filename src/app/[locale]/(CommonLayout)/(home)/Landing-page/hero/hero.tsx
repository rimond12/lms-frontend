"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FaHandshake, FaCheckCircle, FaTasks,
  FaChalkboardTeacher, FaGlobe, FaBullseye,
  FaChevronLeft, FaChevronRight, FaBriefcase,
  FaPassport, FaPlane, FaLanguage, FaUserCheck,
  FaChevronDown,
} from "react-icons/fa";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useGetCountriesQuery } from "@/app/redux/api/jobsApi/CountryApi";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";

const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL || "";

function resolveImg(src: string): string {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `${FILE_URL}/${src}`;
}

function FeatureIcon({
  iconKey,
  hovered,
  className,
}: {
  iconKey: string;
  hovered?: boolean;
  className?: string;
}) {
  const isImg =
    iconKey.startsWith("uploads/") ||
    iconKey.startsWith("http") ||
    iconKey.startsWith("/");

  if (isImg) {
    return (
      <img
        src={resolveImg(iconKey)}
        alt="icon"
        className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain transition-all duration-300"
        style={{
          filter: hovered ? "brightness(0) invert(1)" : "none",
        }}
      />
    );
  }

  const IconComp = ICON_MAP[iconKey] ?? FaCheckCircle;
  return <IconComp className={className} />;
}

// ─── Custom Vector Icons (matching the requested Flaticon designs) ──
const CustomJobsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: "1.1em", height: "1.1em" }}>
    <rect x="2" y="7" width="20" height="14" rx="2.5" ry="2.5" />
    <path d="M16 21V5a2.5 2.5 0 0 0-2-2.5h-4A2.5 2.5 0 0 0 8 5v16" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const CustomTechnicalTrainingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: "1.1em", height: "1.1em" }}>
    <rect x="2" y="3" width="20" height="13" rx="2.5" ry="2.5" />
    <line x1="12" y1="16" x2="12" y2="21" />
    <line x1="7" y1="21" x2="17" y2="21" />
    <path d="M12 6.5l4.5 2.25-4.5 2.25-4.5-2.25z" fill="currentColor" fillOpacity="0.15" />
    <path d="M8.5 9.5v2.5a3.5 3.5 0 0 0 7 0v-2.5" />
  </svg>
);

const CustomCvCreationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: "1.1em", height: "1.1em" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.15" />
    <polyline points="8.5 11.5 10.5 13.5 15.5 8.5" />
  </svg>
);

const CustomVisaVerificationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: "1.1em", height: "1.1em" }}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12.5" cy="9.5" r="3.5" />
    <path d="M9 9.5h7" />
    <path d="M12.5 6v7" />
  </svg>
);

const CustomLanguageLearningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: "1.1em", height: "1.1em" }}>
    <path d="M5 8h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M17 14h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
    <path d="M7 17.5l2.5-5.5 2.5 5.5" />
    <path d="M8 15h3" />
  </svg>
);

const CustomConsultancyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: "1.1em", height: "1.1em" }}>
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" fill="currentColor" fillOpacity="0.15" />
    <path d="M7.5 12a1.5 1.5 0 0 1 2.5-1.25L13 14m-3-3.25l3.25 3.25 4.75-4.75a1.5 1.5 0 0 1 2 2l-6.75 6.75a1.5 1.5 0 0 1-2 0L7.5 15a1.5 1.5 0 0 1 0-3z" />
  </svg>
);

// ─── Full icon map — all options the admin can pick ─────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  // Legacy / original
  FaHandshake: CustomConsultancyIcon,
  FaCheckCircle: CustomCvCreationIcon,
  FaTasks: CustomCvCreationIcon,
  FaChalkboardTeacher: CustomTechnicalTrainingIcon,
  FaGlobe: CustomLanguageLearningIcon,
  FaBullseye: CustomConsultancyIcon,
  // New immigrant-jobs themed icons
  FaBriefcase: CustomJobsIcon,
  FaPassport: CustomVisaVerificationIcon,
  FaPlane: CustomVisaVerificationIcon,
  FaLanguage: CustomLanguageLearningIcon,
  FaUserCheck: CustomVisaVerificationIcon,
};

// ─── Default i18n fallback items (used when CMS courses array is empty) ─
const DEFAULT_ITEM_KEYS = ["jobs", "verified", "organized", "training", "language", "preparation"] as const;
const DEFAULT_ICON_KEYS  = ["FaBriefcase", "FaChalkboardTeacher", "FaCheckCircle", "FaPassport", "FaLanguage", "FaHandshake"];

const SLIDE_DURATION = 5000;

// ─── Flag country map (fallback if API unavailable) ──────────────────
const FALLBACK_COUNTRIES = [
  { name: "USA",          nameBn: "আমেরিকা",          flag: "🇺🇸" },
  { name: "UK",           nameBn: "যুক্তরাজ্য",         flag: "🇬🇧" },
  { name: "Canada",       nameBn: "কানাডা",             flag: "🇨🇦" },
  { name: "Australia",    nameBn: "অস্ট্রেলিয়া",        flag: "🇦🇺" },
  { name: "UAE",          nameBn: "সংযুক্ত আরব আমিরাত", flag: "🇦🇪" },
  { name: "Saudi Arabia", nameBn: "সৌদি আরব",           flag: "🇸🇦" },
  { name: "Qatar",        nameBn: "কাতার",               flag: "🇶🇦" },
  { name: "Germany",      nameBn: "জার্মানি",            flag: "🇩🇪" },
  { name: "Singapore",    nameBn: "সিঙ্গাপুর",           flag: "🇸🇬" },
  { name: "Malaysia",     nameBn: "মালয়েশিয়া",          flag: "🇲🇾" },
];

// ─── Jobs Dropdown Button ────────────────────────────────────────────
function JobsDropdownButton({
  label,
  subLabel,
  iconKey,
}: {
  label: string;
  subLabel: string;
  iconKey: string;
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();
  const { data: countries = [], isLoading } = useGetCountriesQuery();

  // Track mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const handleCountryClick = (countryName: string) => {
    setOpen(false);
    router.push(`/jobs?country=${encodeURIComponent(countryName)}`);
  };

  const handleAllJobs = () => {
    setOpen(false);
    router.push("/jobs");
  };

  // Use real countries from API if available, else fallback
  const displayCountries =
    countries.length > 0
      ? countries.map((c: any) => ({
          name: c.name,
          nameBn: c.nameBn || c.name,
          flagIcon: c.flagIcon,
          _id: c._id,
        }))
      : FALLBACK_COUNTRIES;

  // Dropdown positioning: fixed+centered on mobile, absolute on desktop
  const dropdownStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: open
          ? "translate(-50%, -50%) scale(1)"
          : "translate(-50%, -50%) scale(0.92)",
        pointerEvents: open ? "auto" : "none",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transition: "opacity 0.22s ease, transform 0.22s ease, visibility 0.22s",
        transformOrigin: "center center",
        zIndex: 99999,
        width: "calc(100vw - 32px)",
        maxWidth: "340px",
      }
    : {
        position: "absolute",
        top: "calc(100% + 16px)",
        left: "50%",
        pointerEvents: open ? "auto" : "none",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transition: "opacity 0.22s ease, transform 0.22s ease, visibility 0.22s",
        transformOrigin: "top center",
        transform: open
          ? "translateX(-50%) scaleY(1) translateY(0)"
          : "translateX(-50%) scaleY(0.92) translateY(-8px)",
        zIndex: 9999,
      };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
          onClick={() => setOpen(false)}
        />
      )}

      <div ref={ref} className="relative flex flex-col items-center group" style={{ zIndex: open && !isMobile ? 9999 : "auto", overflow: "visible" }}>
      {/* Main JOBS button */}
      <button
        id="hero-jobs-btn"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex flex-col items-center focus:outline-none"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        {/* Icon circle */}
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl border border-gray-50 shadow-md transition-all duration-500 ease-out"
          style={{
            background: open
              ? "linear-gradient(135deg, #1a4da1, #2B59C3)"
              : "white",
            color: open ? "white" : "#1a4da1",
            transform: open ? "translateY(-6px)" : "translateY(0)",
            boxShadow: open
              ? "0 12px 32px rgba(26,77,161,0.3)"
              : "0 2px 8px rgba(26,77,161,0.08)",
          }}
        >
          <FeatureIcon iconKey={iconKey} hovered={open} className="text-[1em]" />
        </div>

        {/* Label */}
        <div className="text-center mt-3 sm:mt-5">
          <p
            className="text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-widest flex items-center gap-1 justify-center transition-colors duration-300"
            style={{ color: open ? "#1a4da1" : "#0f172a" }}
          >
            {label}
            <FaChevronDown
              className="transition-transform duration-300"
              style={{
                fontSize: "7px",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </p>
          <p className="text-[9px] sm:text-[10px] lg:text-[11px] text-gray-400 mt-0.5 sm:mt-1 font-medium italic">
            {subLabel}
          </p>
        </div>
      </button>

      {/* Dropdown panel */}
      <div style={dropdownStyle}>
        {/* Arrow pointer — only on desktop */}
        {!isMobile && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 shadow-sm"
            style={{ zIndex: 1 }}
          />
        )}

        <div
          className="relative bg-white border border-gray-100 overflow-hidden"
          style={{
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(26,77,161,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            width: "100%",
            zIndex: 2,
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #1a4da1 0%, #2B59C3 100%)",
            }}
          >
            <FaGlobe className="text-blue-200 text-sm" />
            <span className="text-white text-xs font-extrabold tracking-widest uppercase">
              {locale === "bn" ? "দেশ অনুযায়ী চাকরি" : "Jobs by Country"}
            </span>
          </div>

          {/* Country list */}
          <div className="py-2 max-h-72 overflow-y-auto">
            {/* All Jobs */}
            <button
              onClick={handleAllJobs}
              id="hero-jobs-all-countries"
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors duration-150 group/item"
            >
              <span className="text-xl leading-none">🌍</span>
              <div className="text-left">
                <p className="text-[12px] font-extrabold text-slate-800 group-hover/item:text-blue-700 transition-colors">
                  {locale === "bn" ? "সব দেশ" : "All Countries"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {locale === "bn" ? "সব চাকরি দেখুন" : "View all jobs"}
                </p>
              </div>
            </button>

            {/* Divider */}
            <div className="h-px mx-4 my-1" style={{ background: "linear-gradient(to right, transparent, #e2e8f0, transparent)" }} />

            {/* Countries */}
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-2 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                ))
              : displayCountries.map((country: any, i: number) => (
                  <button
                    key={country._id || i}
                    id={`hero-jobs-country-${country.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => handleCountryClick(country.name)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors duration-150 group/item"
                  >
                    {country.flagIcon ? (
                      <img
                        src={country.flagIcon}
                        alt={country.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100"
                      />
                    ) : (
                      <span className="text-xl leading-none shrink-0">{country.flag}</span>
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-[12px] font-extrabold text-slate-800 group-hover/item:text-blue-700 transition-colors truncate">
                        {locale === "bn" ? country.nameBn : country.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium truncate">
                        {locale === "bn" ? country.name : country.nameBn}
                      </p>
                    </div>
                    <span className="ml-auto text-blue-300 text-xs opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
          </div>

          {/* Footer link */}
          <div className="px-4 py-2.5 border-t border-gray-100">
            <button
              onClick={handleAllJobs}
              className="w-full text-center text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors tracking-wide"
            >
              {locale === "bn" ? "সব চাকরি ব্রাউজ করুন →" : "Browse All Jobs →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

// ─── Static Feature Button (no action) ──────────────────────────────
function FeatureButton({
  label,
  subLabel,
  iconKey,
  index,
}: {
  label: string;
  subLabel: string;
  iconKey: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const ACCENT_COLORS = [
    { from: "#0d9488", to: "#14b8a6" },
    { from: "#7c3aed", to: "#9333ea" },
    { from: "#ea580c", to: "#f97316" },
    { from: "#0891b2", to: "#06b6d4" },
    { from: "#059669", to: "#10b981" },
  ];
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const routesMap = [
    "/all-courses?category=technical-courses",       // 0: TECHNICAL TRAINING
    "/contact",                                      // 1: CV CREATION
    "/visa-verification",                            // 2: VISA VERIFICATION
    "/all-courses?category=language-courses",        // 3: LANGUAGE LEARNING
    "/contact",                                      // 4: CONSULTANCY
  ];
  const targetRoute = routesMap[index] || "/";

  const handleClick = () => {
    router.push(targetRoute);
  };

  return (
    <div className="flex flex-col items-center group">
      <button
        id={`hero-feature-btn-${index}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl border border-gray-50 transition-all duration-500 ease-out focus:outline-none"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${color.from}, ${color.to})`
            : "white",
          color: hovered ? "white" : color.from,
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          boxShadow: hovered
            ? `0 12px 32px ${color.from}44`
            : "0 2px 8px rgba(26,77,161,0.08)",
        }}
        aria-label={label}
      >
        <FeatureIcon iconKey={iconKey} hovered={hovered} className="text-[1em]" />
      </button>

      <div className="text-center mt-3 sm:mt-5">
        <p
          className="text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-widest transition-colors duration-300"
          style={{ color: hovered ? color.from : "#0f172a" }}
        >
          {label}
        </p>
        <p className="text-[9px] sm:text-[10px] lg:text-[11px] text-gray-400 mt-0.5 sm:mt-1 font-medium italic">
          {subLabel}
        </p>
      </div>
    </div>
  );
}

// ─── Main Hero Component ──────────────────────────────────────────────
export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tHero = useTranslations("hero");
  const locale = useLocale();
  const isBn = locale === "bn";
  const { data: cmsResponse, isLoading: cmsLoading } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data;

  const slides = cms?.hero?.bannerSlides?.length ? cms.hero.bannerSlides : [{ image: "/images/main-hero.jpeg", altText: "Hero Banner" }];
  const headline = (isBn ? null : cms?.hero?.headline) || tHero("headline");
  const sub      = (isBn ? null : cms?.hero?.sub)      || tHero("sub");

  // ── Build feature items: prefer CMS courses array, fall back to i18n ──
  // CMS stores each item as { name, sub, iconKey, nameBn?, subBn? }.
  // The first item (index 0) is always the JOBS dropdown button.
  const cmsItems = cms?.hero?.courses;
  const featureItems = (cmsItems && cmsItems.length > 0)
    ? cmsItems.map((c, i) => ({
        key: i === 0 ? "jobs" : `item-${i}`,
        // Use Bengali fields when locale is bn; fall back to English if BN not set
        name: isBn ? (c.nameBn || c.name) : c.name,
        sub:  isBn ? (c.subBn  || c.sub)  : c.sub,
        iconKey: c.iconKey || DEFAULT_ICON_KEYS[i] || "FaBriefcase",
        isJobs: i === 0,
      }))
    : DEFAULT_ITEM_KEYS.map((key, i) => ({
        key,
        name: tHero(`items.${key}.name`),
        sub:  tHero(`items.${key}.sub`),
        iconKey: DEFAULT_ICON_KEYS[i],
        isJobs: i === 0,
      }));

  const isMulti = slides.length > 1;

  const advance = useCallback(
    (dir: "next" | "prev") => {
      if (fading || !isMulti) return;
      setFading(true);
      setTimeout(() => {
        setCurrent((p) =>
          dir === "next"
            ? (p + 1) % slides.length
            : (p - 1 + slides.length) % slides.length
        );
        setFading(false);
      }, 400);
    },
    [fading, isMulti, slides.length]
  );

  useEffect(() => {
    if (!isMulti) return;
    timerRef.current = setTimeout(() => advance("next"), SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, advance, isMulti]);

  const goTo = (i: number) => {
    if (i === current || fading) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(i);
      setFading(false);
    }, 400);
  };

  return (
    <section className="w-full bg-white">
      {/* ── Banner Section ──────────────────────────────────────── */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] shadow-xl shadow-blue-900/5 bg-white">
          {/*
            Mobile  : fixed aspect-ratio box (16/9) — height is always width-driven,
                      so slide transitions never cause layout shift / button jumping.
            md+     : restored original fixed vh heights (65vh / 75vh).
          */}
          <div className="relative aspect-[16/9] md:aspect-auto md:h-[65vh] lg:h-[75vh]">
            {/* ── Skeleton loader ── */}
            {cmsLoading ? (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-[2rem] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse" />
              </div>
            ) : (
              <img
                key={current}
                src={resolveImg(slides[current].image)}
                alt={slides[current].altText || "Hero Banner"}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover object-top select-none"
                style={{
                  opacity: fading ? 0.4 : 1,
                  transform: fading ? "scale(1.02)" : "scale(1)",
                  transition: "opacity 500ms ease, transform 1200ms ease",
                }}
              />
            )}

            {/* Modern Navigation Arrows */}
            {isMulti && (
              <>
                <button
                  onClick={() => advance("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full
                             bg-white/70 hover:bg-white text-blue-700 flex items-center justify-center
                             backdrop-blur-md shadow-lg border border-white transition-all duration-300"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button
                  onClick={() => advance("next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full
                             bg-white/70 hover:bg-white text-blue-700 flex items-center justify-center
                             backdrop-blur-md shadow-lg border border-white transition-all duration-300"
                >
                  <FaChevronRight size={16} />
                </button>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 px-4 py-2 bg-black/10 backdrop-blur-md rounded-full">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === current ? "w-8 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content & Features ──────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20 pb-16 sm:pb-24 lg:pb-48" style={{ overflow: "visible" }}>
        {/* Soft Background Accent */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 left-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Heading */}
        <div className="relative z-10 text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-5 lg:mb-6">
            {headline}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed px-2">
            {sub}
          </p>
        </div>

        {/* ── Interactive Feature Buttons Grid ── */}
        <div className="relative z-10 grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 lg:gap-8 max-w-6xl mx-auto" style={{ overflow: "visible" }}>
          {featureItems.map((item, i) => {
            if (item.isJobs) {
              return (
                <JobsDropdownButton
                  key="jobs"
                  label={item.name}
                  subLabel={item.sub}
                  iconKey={item.iconKey}
                />
              );
            }
            return (
              <FeatureButton
                key={item.key}
                label={item.name}
                subLabel={item.sub}
                iconKey={item.iconKey}
                index={i - 1}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}