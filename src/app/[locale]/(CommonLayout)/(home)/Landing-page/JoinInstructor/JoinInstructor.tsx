"use client";

import React from "react";
import { FaLaptop, FaCheckCircle, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { useTranslations, useLocale } from "next-intl";

const DEFAULT_EMAIL = "info@immigrantjobsworld.com";
const DEFAULT_PHONE = "+880 1843-432352";
const DEFAULT_BANNER_IMAGE = "https://img.freepik.com/free-photo/mechanical-engineer-working-his-project_23-2148914469.jpg";

const royalBlue = "#1a4da1";

const JoinInstructor: React.FC = () => {
  const t = useTranslations("joinInstructor");
  const locale = useLocale();
  const isBn = locale === "bn";
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const d = cmsResponse?.data?.joinInstructor;

  const title       = (isBn ? null : d?.title)       || t("title");
  const brand       = (isBn ? null : d?.brand)       || t("brand");
  const subtitle    = (isBn ? null : d?.subtitle)    || t("subtitle");
  const bannerImage = d?.bannerImage || DEFAULT_BANNER_IMAGE;
  const bannerTitle = (isBn ? null : d?.bannerTitle) || t("banner.title");
  const lookingFor  = (!isBn && d?.lookingFor?.length) ? d.lookingFor : [t("lookingFor.item1"), t("lookingFor.item2"), t("lookingFor.item3")];
  const infoTitle   = (isBn ? null : d?.infoTitle)   || t("info.title");
  const infoDesc    = (isBn ? null : d?.infoDesc)    || t("info.desc");
  const email       = d?.email       || DEFAULT_EMAIL;
  const phone       = d?.phone       || DEFAULT_PHONE;

  const formFields = [
    { label: t("form.name"),      placeholder: t("form.namePlaceholder"),      type: "text" },
    { label: t("form.email"),     placeholder: t("form.emailPlaceholder"),     type: "email" },
    { label: t("form.phone"),     placeholder: t("form.phonePlaceholder"),     type: "text" },
    { label: t("form.expertise"), placeholder: t("form.expertisePlaceholder"), type: "text" },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12" data-aos="fade-down">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            {title} <span style={{ color: royalBlue }}>{brand}</span>
          </h2>
          <p className="text-gray-500 mt-2 md:mt-3 text-base md:text-lg px-4">{subtitle}</p>
          <div className="w-16 md:w-20 h-1.5 mx-auto mt-3 md:mt-4 rounded-full" style={{ backgroundColor: royalBlue }} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">
          {/* Form */}
          <div className="w-full lg:w-1/2 bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200 flex flex-col">
            <div className="space-y-4 flex-grow flex flex-col justify-between">
              <div className="space-y-3 md:space-y-4">
                {formFields.map((field, idx) => (
                  <div key={idx}>
                    <label className="block font-bold mb-1 md:mb-1.5 text-xs md:text-sm" style={{ color: royalBlue }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all placeholder:text-gray-300 hover:shadow-sm text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="block font-bold mb-1 md:mb-1.5 text-xs md:text-sm" style={{ color: royalBlue }}>
                    {t("form.experience")}
                  </label>
                  <select className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:border-blue-700 outline-none bg-white text-gray-600 hover:shadow-sm transition-all text-sm">
                    <option>{t("form.experiencePlaceholder")}</option>
                    <option>{t("form.exp1")}</option>
                    <option>{t("form.exp2")}</option>
                    <option>{t("form.exp3")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 md:mb-1.5 text-xs md:text-sm" style={{ color: royalBlue }}>
                    {t("form.whyJoin")}
                  </label>
                  <textarea rows={2} placeholder={t("form.whyPlaceholder")} className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:border-blue-700 outline-none transition-all placeholder:text-gray-300 hover:shadow-sm resize-none text-sm" />
                </div>
              </div>
              <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                <div>
                  <label className="block font-bold mb-1 md:mb-1.5 text-xs md:text-sm" style={{ color: royalBlue }}>
                    {t("form.cv")}
                  </label>
                  <input type="file" className="w-full text-xs md:text-sm text-gray-500 border border-dashed border-gray-300 rounded-md p-2.5 md:p-3 hover:bg-blue-50 transition-colors hover:shadow-sm" />
                </div>
                <button type="button" className="w-full text-white font-bold py-3 md:py-4 rounded-md transition-all shadow-md hover:bg-blue-900 active:scale-[0.98] hover:shadow-lg text-sm md:text-base" style={{ backgroundColor: royalBlue }}>
                  {t("form.submit")}
                </button>
              </div>
            </div>
          </div>

          {/* Info + Banner */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
            <div className="p-5 sm:p-6 md:p-8 rounded-2xl border-l-[6px] transition-all duration-300 hover:scale-[1.02] cursor-default hover:shadow-md" style={{ backgroundColor: "#f0f4fa", borderColor: royalBlue }}>
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3 mb-2 md:mb-3" style={{ color: royalBlue }}>
                <FaLaptop className="shrink-0" /> {infoTitle}
              </h3>
              <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{infoDesc}</p>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl flex-grow group min-h-[280px] sm:min-h-[320px] md:min-h-[380px]">
              <img src={bannerImage} alt="Join" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col justify-end text-white transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(26,77,161,0.95), rgba(26,77,161,0.40), transparent)" }}>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3 md:mb-4 leading-tight whitespace-pre-line">
                  {bannerTitle}
                </h3>
                <div className="space-y-2 md:space-y-3 mb-5 md:mb-8">
                  {lookingFor.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs md:text-sm font-medium">
                      <FaCheckCircle className="text-green-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="pt-4 md:pt-6 border-t border-white/20">
                  <div className="flex flex-col gap-1.5 md:gap-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2 md:gap-3 hover:text-blue-300 transition-colors cursor-pointer">
                      <FaEnvelope className="shrink-0" /> {email}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 hover:text-blue-300 transition-colors cursor-pointer">
                      <FaPhoneAlt className="shrink-0" /> {phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinInstructor;
