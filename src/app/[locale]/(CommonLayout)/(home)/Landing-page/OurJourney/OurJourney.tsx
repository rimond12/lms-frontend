"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations } from "next-intl";

interface Logo { name: string; img: string; }

const DEFAULT_ROW1: Logo[] = [
  { name: "Bangladesh Education Board", img: "https://res.cloudinary.com/dalpf8iip/image/upload/bangla-mark-150x150_fkgguz.png" },
  { name: "NSDA", img: "https://res.cloudinary.com/dalpf8iip/image/upload/bangla-mark-150x150_fkgguz.png" },
  { name: "SAIC", img: "https://res.cloudinary.com/dalpf8iip/image/upload/bangla-mark-150x150_fkgguz.png" },
  { name: "Banglamark", img: "https://res.cloudinary.com/dalpf8iip/image/upload/bangla-mark-150x150_fkgguz.png" },
  { name: "Sincos", img: "https://res.cloudinary.com/dalpf8iip/image/upload/sincos-300x169_l6btck.png" },
];
const DEFAULT_ROW2: Logo[] = [
  { name: "Certify Bangladesh", img: "https://res.cloudinary.com/dalpf8iip/image/upload/sincos-300x169_l6btck.png" },
  { name: "BEC", img: "https://via.placeholder.com/150x80" },
  { name: "Creative", img: "https://via.placeholder.com/150x80" },
  { name: "Autodesk", img: "https://via.placeholder.com/150x80" },
  { name: "BASIS", img: "https://via.placeholder.com/150x80" },
];
const DEFAULT_ROW3: Logo[] = [
  { name: "Archstone", img: "https://res.cloudinary.com/dalpf8iip/image/upload/bangla-mark-150x150_fkgguz.png" },
  { name: "SB Consultant", img: "https://via.placeholder.com/150x80" },
  { name: "Onestop", img: "https://via.placeholder.com/150x80" },
  { name: "DDS", img: "https://via.placeholder.com/150x80" },
  { name: "Compliance BD", img: "https://via.placeholder.com/150x80" },
];

const LogoCard = ({ logo }: { logo: Logo }) => (
  <div className="flex flex-col items-center mx-12">
    <img src={logo.img} alt={logo.name} className="h-14 md:h-16 object-contain" />
    <p className="text-[11px] text-gray-500 mt-4 font-semibold uppercase text-center">{logo.name}</p>
  </div>
);

const OurJourney: React.FC = () => {
  const t = useTranslations("ourJourney");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const j = cmsResponse?.data?.ourJourney;

  const title    = j?.title    || t("title");
  const subtitle = j?.subtitle || t("subtitle");
  const row1 = j?.row1?.length ? j.row1 : DEFAULT_ROW1;
  const row2 = j?.row2?.length ? j.row2 : DEFAULT_ROW2;
  const row3 = j?.row3?.length ? j.row3 : DEFAULT_ROW3;

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
              {[...row1, ...row1].map((logo, i) => <LogoCard key={i} logo={logo} />)}
            </Marquee>
          </div>
          <div className="border-t border-b border-gray-200 py-10 mb-8">
            <Marquee direction="right" speed={45} pauseOnHover gradient={false}>
              {[...row2, ...row2].map((logo, i) => <LogoCard key={i} logo={logo} />)}
            </Marquee>
          </div>
          <div className="border-t border-b border-gray-200 py-10">
            <Marquee direction="left" speed={35} pauseOnHover gradient={false}>
              {[...row3, ...row3].map((logo, i) => <LogoCard key={i} logo={logo} />)}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurJourney;
