"use client";

import React from "react";
import {
  Globe, Clock, Brain, BriefcaseBusiness,
  School, Sparkles, FileText, ArrowRight,
} from "lucide-react";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations, useLocale } from "next-intl";

const TRAINING_ICONS = [BriefcaseBusiness, Globe, Brain];
const CARD_ICONS = [Clock, FileText];

const TrainingSection = () => {
  const tr = useTranslations("trainingSection");
  const locale = useLocale();
  const isBn = locale === "bn";
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.trainingSection;

  const badge      = (isBn ? cms?.badgeBn      : cms?.badge)      || tr("badge");
  const heading1   = (isBn ? cms?.heading1Bn   : cms?.heading1)   || tr("heading1");
  const heading2   = (isBn ? cms?.heading2Bn   : cms?.heading2)   || tr("heading2");
  const subheading = (isBn ? cms?.subheadingBn : cms?.subheading) || tr("subheading");
  const rawPoints  = tr.raw("points") as { title: string; description: string }[];
  const points     = (cms?.points?.length)
    ? cms.points.map(p => ({
        title: (isBn ? p.titleBn : undefined) || p.title,
        description: (isBn ? p.descriptionBn : undefined) || p.description,
      }))
    : rawPoints;
  const mainCard   = cms?.mainCard
    ? {
        title: (isBn ? cms.mainCard.titleBn : undefined) || cms.mainCard.title || tr("mainCard.title"),
        description: (isBn ? cms.mainCard.descriptionBn : undefined) || cms.mainCard.description || tr("mainCard.description"),
        button: (isBn ? cms.mainCard.buttonBn : undefined) || cms.mainCard.button || tr("mainCard.button"),
      }
    : { title: tr("mainCard.title"), description: tr("mainCard.description"), button: tr("mainCard.button") };
  const rawCards   = tr.raw("cards") as { title: string; description: string }[];
  const cards      = (cms?.cards?.length)
    ? cms.cards.map(c => ({
        title: (isBn ? c.titleBn : undefined) || c.title,
        description: (isBn ? c.descriptionBn : undefined) || c.description,
      }))
    : rawCards;

  return (
    <section className="relative py-12 md:py-20 lg:py-28 bg-white overflow-hidden text-slate-900">
      {/* decorative blurs — inline styles to avoid PostCSS crash */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-60 pointer-events-none"
        style={{ background: "#eff6ff", filter: "blur(80px)", zIndex: -1 }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-60 pointer-events-none"
        style={{ background: "#eef2ff", filter: "blur(70px)", zIndex: -1 }}
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-2 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs md:text-sm font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{badge}</span>
              </div>
              <h2 className="text-3xl px-3 sm:text-4xl md:text-5xl font-black leading-tight text-slate-900">
                {heading1} <br />
                <span className="text-blue-600">{heading2}</span>
              </h2>
              <p className="text-slate-600 px-3 text-base md:text-lg leading-relaxed max-w-xl">{subheading}</p>
            </div>

            <div className="grid gap-4 md:gap-6 px-3">
              {points.map((point, index) => {
                const Icon = TRAINING_ICONS[index % TRAINING_ICONS.length];
                return (
                  <div
                    key={index}
                    className="group flex items-start gap-4 md:gap-5 p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {point.title}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-0.5">{point.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-7 relative">
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 p-4 sm:p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-xl">
              <div className="sm:col-span-2 relative group overflow-hidden p-7 sm:p-8 md:p-10 rounded-[2rem] bg-blue-600 shadow-2xl shadow-blue-200 border border-blue-400">
                <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <School size={100} className="text-white md:hidden" />
                  <School size={150} className="text-white hidden md:block" />
                </div>
                <div className="relative flex flex-col items-center text-center space-y-4 md:space-y-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <School className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <h3 className="text-2xl md:text-3xl font-black text-white">{mainCard.title}</h3>
                    <p className="text-blue-100 text-base md:text-lg">{mainCard.description}</p>
                  </div>
                  <button className="group/btn flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-blue-600 font-black text-sm shadow-xl hover:bg-blue-50 transition-all">
                    {mainCard.button}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {cards.map((card, index) => {
                const Icon = CARD_ICONS[index % CARD_ICONS.length];
                return (
                  <div
                    key={index}
                    className="group p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 md:mb-6 border border-blue-100 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-lg md:text-xl text-slate-900 mb-2 md:mb-3">{card.title}</h4>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{card.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Dot pattern — inline style to avoid PostCSS crash */}
            <div
              className="hidden sm:block absolute -bottom-10 -right-10 w-40 h-40 pointer-events-none"
              style={{
                background: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                zIndex: -1,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSection;
