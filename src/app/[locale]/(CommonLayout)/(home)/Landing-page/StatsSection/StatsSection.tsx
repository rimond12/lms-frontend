"use client";

import React from "react";
import CountUp from "react-countup";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations } from "next-intl";

const DEFAULT_STAT_META = [
  { end: 12000, suffix: "+", icon: "🎓" },
  { end: 15,    suffix: "",  icon: "👨‍🏫" },
  { end: 10,    suffix: "",  icon: "💻" },
  { end: 100,   suffix: "%", icon: "👨‍💻" },
];
const STAT_LABEL_KEYS = ["graduates", "instructors", "courses", "practical"] as const;

const BORDER_COLORS = ["border-slate-800", "border-blue-700", "border-blue-700", "border-slate-800"];

const StatsSection: React.FC = () => {
  const t = useTranslations("stats");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cmsStats = cmsResponse?.data?.stats?.items;

  const stats = cmsStats?.length
    ? cmsStats
    : DEFAULT_STAT_META.map((meta, i) => ({ ...meta, label: t(STAT_LABEL_KEYS[i]) }));

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`relative bg-white p-8 rounded-2xl border-2 ${BORDER_COLORS[idx % BORDER_COLORS.length]}
              shadow-lg flex flex-col items-center text-center
              transition-all duration-300 ease-in-out
              hover:-translate-y-3 hover:shadow-2xl cursor-default group`}
            >
              <div className="mb-4 text-5xl transition-all">{stat.icon}</div>
              <h3 className="text-3xl font-extrabold text-blue-700 mb-2">
                <CountUp
                  end={stat.end}
                  duration={3}
                  suffix={stat.suffix}
                  separator=","
                  enableScrollSpy
                  scrollSpyDelay={200}
                />
              </h3>
              <p className="text-gray-700 font-bold text-lg leading-tight">{stat.label}</p>
              <div
                className={`mt-4 w-12 h-1 rounded-full transition-all duration-300 ${
                  idx % 2 === 0 ? "bg-slate-800" : "bg-blue-700"
                } group-hover:w-20`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
