"use client";

import React from "react";
import { Globe, FileText, CheckCircle, Users, ClipboardList, LifeBuoy } from "lucide-react";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations } from "next-intl";

const ICONS = [Globe, FileText, CheckCircle, ClipboardList, LifeBuoy, Users];

const ModernRecruitment = () => {
  const t = useTranslations("services");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.services;

  const badge    = cms?.badge    || t("badge");
  const heading1 = cms?.heading1 || t("heading1");
  const heading2 = cms?.heading2 || t("heading2");
  const tItems   = t.raw("items") as { title: string; description: string }[];
  const items    = cms?.items?.length ? cms.items : tItems;

  return (
    <section className="py-12 md:py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-20 max-w-2xl mx-auto">
          <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase text-blue-600 mb-3 md:mb-4">
            {badge}
          </h2>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-snug">
            {heading1}{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #1d4ed8, #3b82f6)" }}>
              {heading2}
            </span>
          </h1>
          <div className="h-1.5 w-16 md:w-20 bg-blue-600 mx-auto mt-4 md:mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 lg:gap-10">
          {items.map(({ title, description }, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <div
                key={index}
                className="group relative bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-3 overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-28 md:w-32 h-28 md:h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500" />
                <div className="relative w-12 h-12 md:w-16 md:h-16 mb-5 md:mb-8 flex items-center justify-center rounded-xl md:rounded-2xl bg-blue-50 group-hover:bg-blue-600 shadow-inner group-hover:rotate-6 transition-all duration-500">
                  <Icon className="w-5 h-5 md:w-7 md:h-7 text-blue-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="relative">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-4 group-hover:text-blue-700 transition-colors">
                    {title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">{description}</p>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-1.5 group-hover:w-full transition-all duration-700 rounded-b-[2rem]" style={{ backgroundImage: "linear-gradient(to right, #1d4ed8, #60a5fa)" }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModernRecruitment;
