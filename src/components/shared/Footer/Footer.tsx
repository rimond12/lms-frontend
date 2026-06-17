"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Shield, Phone, MessageSquare, MapPin, Mail, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { ChangelogModal } from "../ChangelogModal";
import { useGetFooterQuery } from "@/app/redux/api/footerApi/footerApi";

export const Footer = () => {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // Fetch dynamic footer data
  const { data: apiResponse } = useGetFooterQuery();
  const footerData = apiResponse?.data;

  // Fallback defaults matching original content + new requirements
  const defaultFooter = {
    hotline: "+8809606810081",
    whatsappLink: "https://wa.me/8801843432352",
    email: "support@immigrantjobsworld.com\ninfo@immigrantjobsworld.com",
    address: "53, Beitul Abed Tower, Lift 5th Floor Purana Paltan, Dhaka, Bangladesh",
    mobile: "01843-432352 (Available during business hours)",
    officeHours: "Saturday - Thursday: 10:00 AM – 6:00 PM\nFriday: Closed",
    socialLinks: {
      facebook: "https://www.facebook.com/immigrantjobsworld",
      youtube: "https://www.youtube.com/@ImmigrantJobsWorld",
      linkedin: "https://www.linkedin.com/company/immigrant-jobs-world",
      tiktok: "https://www.tiktok.com/@immigrantjobsworld",
      x: "https://x.com/immigrantjobs"
    },
    copyrightText: "IMMIGRANT JOBS WORLD",
    quickLinks: [
      { label: "About Us", url: "/about-us" }
    ]
  };

  // Merge dynamic data with fallback defaults
  const footer = {
    hotline: footerData?.hotline || defaultFooter.hotline,
    whatsappLink: footerData?.whatsappLink || defaultFooter.whatsappLink,
    email: footerData?.email || defaultFooter.email,
    address: footerData?.address || defaultFooter.address,
    mobile: footerData?.mobile || defaultFooter.mobile,
    officeHours: footerData?.officeHours || defaultFooter.officeHours,
    socialLinks: {
      facebook: footerData?.socialLinks?.facebook ?? defaultFooter.socialLinks.facebook,
      youtube: footerData?.socialLinks?.youtube ?? defaultFooter.socialLinks.youtube,
      linkedin: footerData?.socialLinks?.linkedin ?? defaultFooter.socialLinks.linkedin,
      tiktok: footerData?.socialLinks?.tiktok ?? defaultFooter.socialLinks.tiktok,
      x: footerData?.socialLinks?.x ?? defaultFooter.socialLinks.x
    },
    copyrightText: footerData?.copyrightText || defaultFooter.copyrightText,
    quickLinks: footerData?.quickLinks?.length ? footerData.quickLinks : [
      { label: t("aboutUs") || defaultFooter.quickLinks[0].label, url: defaultFooter.quickLinks[0].url }
    ]
  };

  // Process multiple emails if present
  const emails = footer.email.split(/[\n, ]+/).filter(Boolean);

  return (
    <footer
      style={{
        fontFamily: "banglaFont",
      }}
      className="relative overflow-hidden bg-gradient-to-br from-[#060913] via-[#090f20] to-[#04060c] text-gray-300 border-t border-blue-900/30 font-sans"
    >
      {/* Decorative ambient glowing background blur */}
      <div className="absolute left-1/4 top-0 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 -z-10 h-96 w-96 translate-y-1/2 rounded-full bg-blue-900/15 blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 p-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Contact Section - Col Span 5 */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              {t("contact")}
            </h2>

            <div className="space-y-4">
              {/* Address (Click to open Google Maps) */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(footer.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 group hover:text-blue-400 transition-colors duration-200"
              >
                <div className="mt-1 p-2 rounded-lg bg-gray-900/50 group-hover:bg-blue-900/20 text-blue-500 transition-colors shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {t("address")}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-300 group-hover:text-blue-400 transition-colors">
                    {footer.address}
                  </p>
                </div>
              </a>

              {/* Mobile (Click to trigger direct phone call) */}
              <a
                href={`tel:${footer.mobile.split(" ")[0].replace(/[^0-9+]/g, '')}`}
                className="flex items-start gap-3 group hover:text-blue-400 transition-colors duration-200"
              >
                <div className="mt-1 p-2 rounded-lg bg-gray-900/50 group-hover:bg-blue-900/20 text-blue-500 transition-colors shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {t("mobile")}
                  </p>
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {footer.mobile}
                  </p>
                </div>
              </a>

              {/* Email */}
              <div className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-gray-900/50 group-hover:bg-blue-900/20 text-blue-500 transition-colors shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {t("email")}
                  </p>
                  <div className="space-y-1">
                    {emails.map((email, idx) => (
                      <a
                        key={idx}
                        href={`mailto:${email.trim()}`}
                        className="block text-sm text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        {email.trim()}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Col Span 3 */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight pl-3 border-l-4 border-blue-600">
              {t("quickLinks")}
            </h2>
            <ul className="space-y-3">
              {footer.quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-blue-500 rounded-full transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Center - Col Span 4 */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight pl-3 border-l-4 border-blue-600">
              {t("support")}
            </h2>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.04] shadow-2xl">
              <div className="absolute -right-8 -top-8 -z-10 h-20 w-20 rounded-full bg-blue-600/10 blur-xl" />

              {/* Hotline Row */}
              <div className="flex items-center gap-2.5">
                <a
                  href={`tel:${footer.hotline.replace(/\s+/g, '')}`}
                  className="p-2 rounded-xl bg-blue-950/40 text-blue-500 border border-blue-900/30 hover:scale-105 hover:bg-blue-600/20 transition-all duration-200"
                >
                  <Phone size={18} className="animate-pulse" />
                </a>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Hotline</p>
                  <a
                    href={`tel:${footer.hotline.replace(/\s+/g, '')}`}
                    className="text-lg font-extrabold bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent hover:opacity-95 transition-opacity"
                  >
                    {footer.hotline}
                  </a>
                </div>
              </div>

              {/* Office Hours Details */}
              <div className="border-t border-gray-800/60 pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {t("officeHoursTitle") || "Office Hours"}
                </p>

                <div className="text-sm text-gray-400 font-normal whitespace-pre-line leading-relaxed">
                  {footer.officeHours}
                </div>
              </div>

              {/* WhatsApp Contact Button */}
              {footer.whatsappLink && (
                <a
                  href={footer.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/10 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.353 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.804 6.166l-1.32 4.825 4.918-1.284z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              )}

              {/* Social Icons */}
              <div className="flex flex-wrap gap-2.5 pt-3 mt-4 border-t border-gray-800/60 justify-between">
                {footer.socialLinks.facebook && (
                  <a
                    href={footer.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {footer.socialLinks.youtube && (
                  <a
                    href={footer.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                )}
                {footer.socialLinks.linkedin && (
                  <a
                    href={footer.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                  </a>
                )}
                {footer.socialLinks.tiktok && (
                  <a
                    href={footer.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#FE2C55] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
                    </svg>
                  </a>
                )}
                {footer.socialLinks.x && (
                  <a
                    href={footer.socialLinks.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#000000] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                )}
                {footer.whatsappLink && (
                  <a
                    href={footer.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                    title="WhatsApp Contact"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.353 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.804 6.166l-1.32 4.825 4.918-1.284z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium tracking-wide">
            <div className="flex items-center gap-3">
              {/* Small circular Branding Icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <span className="text-xs font-bold text-white">N</span>
              </div>
              <p className="flex items-center gap-2">
                <span>© {currentYear} {footer.copyrightText}</span>
                <span className="hidden md:inline text-gray-800">|</span>
                <span>{t("allRights")}</span>
              </p>
            </div>
            <div className="text-[10px] text-gray-600 opacity-80 text-center md:text-right space-x-1.5 leading-relaxed">
              <span>Icons by</span>
              <a href="https://www.flaticon.com/authors/freepik" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-400">Freepik</a>
              <span>,</span>
              <a href="https://www.flaticon.com/authors/rukanicon" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-400">rukanicon</a>
              <span>,</span>
              <a href="https://www.flaticon.com/authors/justicon" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-400">justicon</a>
              <span>,</span>
              <a href="https://www.flaticon.com/authors/photo3idea-studio" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-400">photo3idea_studio</a>
              <span>, and</span>
              <a href="https://www.flaticon.com/authors/abbasi" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-400">Abbasi</a>
              <span>from</span>
              <a href="https://www.flaticon.com/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-400">Flaticon</a>
            </div>
          </div>
        </div>
      </div>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onOpenChange={setIsChangelogOpen}
      />
    </footer>
  );
};
