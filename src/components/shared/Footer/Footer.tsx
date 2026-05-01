"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Send, ArrowRight, Shield } from "lucide-react";
import { useState } from "react";
import { ChangelogModal } from "../ChangelogModal";

export const Footer = () => {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const currentYear = new Date().getFullYear();
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <footer
      style={{
        fontFamily: "banglaFont",
      }}
      className="bg-[#0a0a0a] text-gray-300 border-t border-gray-900 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 p-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Contact Section - Col Span 4 */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              {t("contact")}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-gray-900/50 group-hover:bg-red-900/20 text-red-500 transition-colors">
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
                  <p className="text-sm leading-relaxed text-gray-300">
                    {t("addressContent")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-gray-900/50 group-hover:bg-red-900/20 text-red-500 transition-colors">
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
                  <p className="text-sm font-medium text-white hover:text-red-400 transition-colors">
                    +880 1611-223631
                  </p>
                  <p className="text-sm font-medium text-white hover:text-red-400 transition-colors">
                    +880 1611-223637
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-gray-900/50 group-hover:bg-red-900/20 text-red-500 transition-colors">
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
                  <a
                    href="mailto:caddcorebd@gmail.com"
                    className="text-sm text-gray-300 hover:text-red-400 transition-colors"
                  >
                    caddcorebd@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Col Span 2 */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t("quickLinks")}
            </h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#seminar-time"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("seminarTime")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#success-story"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("successStory")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/student-corner"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("verificationCenter")}
                </Link>
              </li>
            </ul>
            <div className="mt-6 pl-2">
              <Image
                src="https://res.cloudinary.com/dalpf8iip/image/upload/v1749027587/images__8_-removebg-preview_qfukeu.png"
                width={140}
                height={50}
                alt="Autodesk Authorised Training Centre"
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Others - Col Span 3 */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t("others")}
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.facebook.com/groups/caddcore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("community")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/caddcorebd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("fbPage")}
                </a>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span>
                  {t("refundPolicy")}
                </Link>
              </li>
            </ul>
            <div className="pt-2">
              <Image
                src="https://res.cloudinary.com/dalpf8iip/image/upload/v1753593763/Pi7_autodesk-learning-partner-logo-rgb-black_wpqshs.webp"
                width={140}
                height={50}
                alt="Autodesk Learning Partner"
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Support Center - Col Span 3 */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t("support")}
            </h2>

            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <p className="text-xl font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                +880 9613-202060
              </p>
              <p className="text-xs font-medium text-gray-500 mt-2 uppercase tracking-wider flex items-center gap-2">
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
                {t("supportTime")}
              </p>

              <div className="flex gap-3 mt-6">
                {/* Social Icons with improved hover effects */}
                <a
                  href="https://facebook.com/caddcorebd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/c/caddcorebd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/cadd-core-ltd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a
                  href="https://wa.me/+8801611223637"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.353 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.804 6.166l-1.32 4.825 4.918-1.284z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Banner */}
      <div className="border-t border-gray-900 bg-[#0f0f0f]/50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-black/40 rounded-xl p-4 border border-gray-800/50">
            <Image
              className="w-full h-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              src="https://res.cloudinary.com/dalpf8iip/image/upload/v1753097013/0_c8xd5e.png"
              width={1000}
              height={100}
              alt="Payment Methods"
            />
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium tracking-wide">
            <p className="flex items-center gap-2">
              <span>© {currentYear} CADD CORE.</span>
              <span className="hidden md:inline text-gray-800">|</span>
              <span>{t("allRights")}</span>
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-gray-600" />
                Trade License: 000257
              </span>
              <span
                className="flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition-colors"
                onClick={() => setIsChangelogOpen(true)}
                title="Click to see what's new"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse"></div>
                V: 1.0.1
              </span>
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
