"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FaHandshake, FaCheckCircle, FaTasks,
  FaChalkboardTeacher, FaGlobe, FaBullseye,
  FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations } from "next-intl";

const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL || "";

function resolveImg(src: string): string {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `${FILE_URL}/${src}`;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  FaHandshake: <FaHandshake />,
  FaCheckCircle: <FaCheckCircle />,
  FaTasks: <FaTasks />,
  FaChalkboardTeacher: <FaChalkboardTeacher />,
  FaGlobe: <FaGlobe />,
  FaBullseye: <FaBullseye />,
};

const DEFAULT_SLIDES = [{ image: "/images/main-hero.jpeg", altText: "Hero Banner" }];
const ITEM_KEYS = ["honest", "verified", "organized", "training", "language", "preparation"] as const;
const ITEM_ICON_KEYS = ["FaHandshake", "FaCheckCircle", "FaTasks", "FaChalkboardTeacher", "FaGlobe", "FaBullseye"];

const SLIDE_DURATION = 5000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tHero = useTranslations("hero");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data;

  const slides = cms?.hero?.bannerSlides?.length ? cms.hero.bannerSlides : DEFAULT_SLIDES;
  const headline = cms?.hero?.headline || tHero("headline");
  const sub = cms?.hero?.sub || tHero("sub");
  const translatedCourses = ITEM_KEYS.map((key, i) => ({
    name: tHero(`items.${key}.name`),
    sub: tHero(`items.${key}.sub`),
    iconKey: ITEM_ICON_KEYS[i],
  }));
  const courses = cms?.hero?.courses?.length ? cms.hero.courses : translatedCourses;
  const isMulti = slides.length > 1;

  const advance = useCallback((dir: "next" | "prev") => {
    if (fading || !isMulti) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(p =>
        dir === "next"
          ? (p + 1) % slides.length
          : (p - 1 + slides.length) % slides.length
      );
      setFading(false);
    }, 400);
  }, [fading, isMulti, slides.length]);

  useEffect(() => {
    if (!isMulti) return;
    timerRef.current = setTimeout(() => advance("next"), SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, advance, isMulti]);

  const goTo = (i: number) => {
    if (i === current || fading) return;
    setFading(true);
    setTimeout(() => { setCurrent(i); setFading(false); }, 400);
  };

  return (
    <section className="w-full bg-white overflow-hidden">
      
      {/* ── Banner Section ──────────────────────────────────────── */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] shadow-xl shadow-blue-900/5 bg-white">
          
          <div className="relative h-[40vh] sm:h-[50vh] md:h-[65vh] lg:h-[75vh]">
            <img
              key={current}
              src={resolveImg(slides[current].image)}
              alt={slides[current].altText || "Hero Banner"}
              draggable={false}
              className="w-full h-full object-cover select-none"
              style={{
                opacity: fading ? 0.4 : 1,
                transform: fading ? "scale(1.02)" : "scale(1)",
                transition: "opacity 500ms ease, transform 1200ms ease",
              }}
            />

            {/* Subtle Gradient for readability */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" /> */}

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
      <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Soft Background Accent */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 left-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {headline}
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {sub}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {courses.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white
                              shadow-md
                              flex items-center justify-center text-blue-700 text-2xl
                              group-hover:bg-blue-700 group-hover:text-white
                              group-hover:shadow-blue-200 group-hover:-translate-y-2
                              transition-all duration-500 ease-out border border-gray-50">
                {ICON_MAP[item.iconKey] || <FaHandshake />}
              </div>

              <div className="text-center mt-5">
                <p className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-widest">
                  {item.name}
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 font-medium italic">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}