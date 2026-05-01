"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaHeadset, FaBookReader, FaBriefcase,
  FaFolderOpen, FaUserTie, FaCertificate,
} from "react-icons/fa";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations } from "next-intl";

const ICON_STYLE = { color: "#1a4da1" };

const ICONS = [
  <FaHeadset size={40} style={ICON_STYLE} />,
  <FaBookReader size={40} style={ICON_STYLE} />,
  <FaBriefcase size={40} style={ICON_STYLE} />,
  <FaFolderOpen size={40} style={ICON_STYLE} />,
  <FaUserTie size={40} style={ICON_STYLE} />,
  <FaCertificate size={40} style={ICON_STYLE} />,
];

const OurServices: React.FC = () => {
  const t = useTranslations("ourServices");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.ourServices;

  const headingPrefix    = cms?.headingPrefix    || t("headingPrefix");
  const headingHighlight = cms?.headingHighlight || t("headingHighlight");
  const tItems           = t.raw("items") as { title: string; desc: string }[];
  const items            = cms?.items?.length ? cms.items : tItems;

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out" });
  }, []);

  return (
    <section className="md:py-20 py-10 bg-white">
      <div className="max-w-7xl mx-auto md:px-6 px-2">
        <div className="text-center mb-16" data-aos="fade-down">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            {headingPrefix}{" "}
            <span style={{ color: "#1a4da1" }}>{headingHighlight}</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-700 mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="flex items-start p-8 bg-white border border-gray-200 rounded-2xl transition-all duration-300 hover:border-blue-700 hover:shadow-md hover:-translate-y-1 group cursor-default"
            >
              <div className="mr-6 p-4 bg-blue-50 rounded-2xl duration-300 flex-shrink-0">
                <div className="group-hover:text-white transition-colors duration-300">
                  {ICONS[index % ICONS.length]}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "#1a4da1" }}>{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;
