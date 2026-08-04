"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations, useLocale } from "next-intl";

interface Logo { name: string; img: string; }

const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL || "";

function resolveImg(value: string): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return `${FILE_URL}/${value}`;
}

const DEFAULT_ROW1: Logo[] = [
  { name: "Bangladesh Education Board", img: "https://placehold.co/150x80/e2e8f0/475569?text=BD+Edu+Board" },
  { name: "NSDA", img: "https://placehold.co/150x80/e2e8f0/475569?text=NSDA" },
  { name: "SAIC", img: "https://placehold.co/150x80/e2e8f0/475569?text=SAIC" },
  { name: "Banglamark", img: "https://placehold.co/150x80/e2e8f0/475569?text=Banglamark" },
  { name: "Sincos", img: "https://placehold.co/150x80/e2e8f0/475569?text=Sincos" },
];
const DEFAULT_ROW2: Logo[] = [
  { name: "Certify Bangladesh", img: "https://placehold.co/150x80/e2e8f0/475569?text=Certify+BD" },
  { name: "BEC", img: "https://placehold.co/150x80/e2e8f0/475569?text=BEC" },
  { name: "Creative", img: "https://placehold.co/150x80/e2e8f0/475569?text=Creative" },
  { name: "Autodesk", img: "https://placehold.co/150x80/e2e8f0/475569?text=Autodesk" },
  { name: "BASIS", img: "https://placehold.co/150x80/e2e8f0/475569?text=BASIS" },
];
const DEFAULT_ROW3: Logo[] = [
  { name: "Archstone", img: "https://placehold.co/150x80/e2e8f0/475569?text=Archstone" },
  { name: "SB Consultant", img: "https://placehold.co/150x80/e2e8f0/475569?text=SB+Consultant" },
  { name: "Onestop", img: "https://placehold.co/150x80/e2e8f0/475569?text=Onestop" },
  { name: "DDS", img: "https://placehold.co/150x80/e2e8f0/475569?text=DDS" },
  { name: "Compliance BD", img: "https://placehold.co/150x80/e2e8f0/475569?text=Compliance+BD" },
];

const LogoCard = ({ logo, getLogoName }: { logo: Logo; getLogoName: (name: string) => string }) => (
  <div className="flex flex-col items-center mx-12">
    <img
      src={resolveImg(logo.img)}
      alt={getLogoName(logo.name)}
      className="h-14 md:h-16 object-contain"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = `https://placehold.co/150x80/e2e8f0/475569?text=${encodeURIComponent(logo.name || "Partner")}`;
      }}
    />
    <p className="text-[11px] text-gray-500 mt-4 font-semibold uppercase text-center">{getLogoName(logo.name)}</p>
  </div>
);

const OurJourney: React.FC = () => {
  const t = useTranslations("ourJourney");
  const locale = useLocale();
  const isBn = locale === "bn";
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const j = cmsResponse?.data?.ourJourney;

  const title    = (isBn ? j?.titleBn    : j?.title)    || t("title");
  const subtitle = (isBn ? j?.subtitleBn : j?.subtitle) || t("subtitle");
  const row1 = j?.row1?.length ? j.row1 : DEFAULT_ROW1;
  const row2 = j?.row2?.length ? j.row2 : DEFAULT_ROW2;
  const row3 = j?.row3?.length ? j.row3 : DEFAULT_ROW3;

  const getLogoName = (name: string) => {
    if (!isBn) return name;
    switch (name) {
      case "Bangladesh Education Board": return t("logos.educationBoard");
      case "NSDA": return t("logos.nsda");
      case "SAIC": return t("logos.saic");
      case "Banglamark": return t("logos.banglamark");
      case "Sincos": return t("logos.sincos");
      case "Certify Bangladesh": return t("logos.certifyBangladesh");
      case "BEC": return t("logos.bec");
      case "Creative": return t("logos.creative");
      case "Autodesk": return t("logos.autodesk");
      case "BASIS": return t("logos.basis");
      case "Archstone": return t("logos.archstone");
      case "SB Consultant": return t("logos.sbConsultant");
      case "Onestop": return t("logos.onestop");
      case "DDS": return t("logos.dds");
      case "Compliance BD": return t("logos.complianceBd");
      default: return name;
    }
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">{title}</h2>
          <div className="w-16 h-1.5 bg-blue-700 mx-auto mt-2 rounded-full" />
          <p className="text-gray-500 font-semibold mt-4 uppercase tracking-[0.2em] text-sm">{subtitle}</p>
        </div>

        <div className="flex flex-col">
          <div className="border-t border-b border-gray-200 mb-8 py-10">
            <Marquee direction="left" speed={40} pauseOnHover gradient={false}>
              {[...row1, ...row1].map((logo, i) => <LogoCard key={i} logo={logo} getLogoName={getLogoName} />)}
            </Marquee>
          </div>
          <div className="border-t border-b border-gray-200 py-10 mb-8">
            <Marquee direction="right" speed={45} pauseOnHover gradient={false}>
              {[...row2, ...row2].map((logo, i) => <LogoCard key={i} logo={logo} getLogoName={getLogoName} />)}
            </Marquee>
          </div>
          <div className="border-t border-b border-gray-200 py-10">
            <Marquee direction="left" speed={35} pauseOnHover gradient={false}>
              {[...row3, ...row3].map((logo, i) => <LogoCard key={i} logo={logo} getLogoName={getLogoName} />)}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurJourney;
