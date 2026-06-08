"use client";

import React, { useState } from "react";
import Link from "next/link";

const COMPANY = {
  name: "CX Airlines",
  slug: "cx-airlines",
  logo: "CX",
  business: "Airline",
  homebase: "San Francisco",
  employees: "500-1200",
  socials: ["Website", "LinkedIn", "Instagram", "Glassdoor", "Kununu"],
  about: `CX Airlines is a young and ambitious aviation company founded in 1924. With a growing fleet of seven Airbus A320 aircraft, the airline is shaping a fresh and modern travel experience across its expanding network. The company stands for an open and welcoming spirit, a strong focus on customer comfort and a positive work culture where people are at the center of everything.\n\nAs a new player in the industry, CX Airlines combines efficient operations with a forward-looking approach that embraces innovation and quality service. The team is driven by passion for aviation and by the ambition to build an airline that feels vibrant, reliable and future-oriented. Whether in the air or on the ground, CX Airlines offers its employees an environment where every moment, careers can grow and every day brings the opportunity to create meaningful moments for passengers.`,
  mission: `At CX Airlines, our mission is to create a travel experience that feels modern, warm and accessible for everyone. We connect people and places with reliable operations, a welcoming spirit and a passion for service. We empower our teams to grow, innovate and shape the future of aviation with care and inspiration. Every flight we operate is a chance to make journeys smoother, moments brighter and the world a little closer.`,
  benefits: [
    { icon: "🏥", label: "Health Insurance" },
    { icon: "✈️", label: "Staff Travel" },
    { icon: "👔", label: "Free Uniform" },
    { icon: "📅", label: "42 Days Paid Leave" },
  ],
};

const OPEN_POSITIONS = [
  {
    _id: "1",
    slug: "cabin-crew-1",
    title: "Cabin Crew Member (m/f/x)",
    dept: "Cabin Department",
    type: "Permanent",
    jobType: "Full-time",
    location: "California, United States",
  },
  {
    _id: "2",
    slug: "cabin-crew-2",
    title: "Cabin Crew Member (m/f/x)",
    dept: "Cabin Department",
    type: "Permanent",
    jobType: "Full-time",
    location: "California, United States",
  },
  {
    _id: "3",
    slug: "cabin-crew-3",
    title: "Cabin Crew Member (m/f/x)",
    dept: "Cabin Department",
    type: "Permanent",
    jobType: "Full-time",
    location: "California, United States",
  },
  {
    _id: "4",
    slug: "cabin-crew-4",
    title: "Cabin Crew Member (m/f/x)",
    dept: "Cabin Department",
    type: "Permanent",
    jobType: "Full-time",
    location: "California, United States",
  },
];

export default function CompanyDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-52 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-700 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,#fff 0,#fff 1px,transparent 0,transparent 40px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5 items-end">
          {[65, 85, 95, 78, 68].map((h, i) => (
            <div
              key={i}
              className="rounded-t-full opacity-80"
              style={{
                width: 32,
                height: h,
                background: i % 2 === 0 ? "#f59e0b" : "#d97706",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── COMPANY HEADER ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          {/* Logo + socials */}
          <div className="flex items-end gap-4 -mt-7 pb-4">
            <div className="w-16 h-16 rounded-full bg-orange-500 border-[3px] border-white shadow-md flex items-center justify-center text-white font-black text-lg shrink-0 relative z-10">
              {COMPANY.logo}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-lg font-bold text-gray-800 mb-2 mt-2">
                {COMPANY.name}
              </h1>
              <div className="flex gap-1.5 flex-wrap">
                {COMPANY.socials.map((s) => (
                  <button
                    key={s}
                    className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5 font-medium hover:bg-[#1e3a5f] hover:text-white hover:border-[#1e3a5f] transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info bar */}
          <div className="grid grid-cols-3 border-t border-gray-100 py-3">
            {[
              { label: "Business", value: COMPANY.business },
              { label: "Homebase", value: COMPANY.homebase },
              { label: "Employees", value: COMPANY.employees },
            ].map((info, i) => (
              <div
                key={info.label}
                className={`text-center ${i > 0 ? "border-l border-gray-100" : ""}`}
              >
                <div className="text-[10px] text-gray-400 mb-0.5">
                  {info.label}
                </div>
                <div className="text-[13px] font-semibold text-gray-800">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-5 pb-12 flex flex-col gap-4">
        {/* About */}
        <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-5">
          <h2 className="text-[13px] font-bold text-[#1e3a5f] mb-3 flex items-center gap-1.5">
            <span className="w-0.5 h-3.5 bg-[#1e3a5f] rounded inline-block" />
            About {COMPANY.name}
          </h2>
          {COMPANY.about.split("\n\n").map((para, i) => (
            <p
              key={i}
              className={`text-[11.5px] text-gray-500 leading-relaxed ${i > 0 ? "mt-2.5" : ""}`}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Open Positions */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-gray-800">Open Positions</h2>
            <div className="flex gap-1.5 flex-wrap">
              {["Functions", "Location"].map((f) => (
                <button
                  key={f}
                  className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2.5 py-1 text-[11px] text-gray-600 font-medium hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all cursor-pointer"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {f}
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ))}
              <div className="w-px h-4 bg-gray-200 self-center mx-0.5" />
              <button className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2.5 py-1 text-[11px] text-gray-600 font-medium hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all cursor-pointer">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="21" y1="10" x2="7" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="21" y1="18" x2="7" y2="18" />
                </svg>
                Sort by
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {OPEN_POSITIONS.map((pos) => (
              <div
                key={pos._id}
                className="bg-white border border-gray-200 rounded-xl p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-[9px] shrink-0">
                      {COMPANY.logo}
                    </div>
                    <span className="font-bold text-[12.5px] text-gray-800">
                      {pos.title}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[9.5px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      {pos.type}
                    </span>
                    <span className="text-[9.5px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                      {pos.jobType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[10.5px] text-gray-500">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="2"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    {pos.dept}
                  </span>
                  <span className="flex items-center gap-1 text-[10.5px] text-gray-500">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {pos.location}
                  </span>
                </div>
                <Link href={`/jobs/${pos.slug}`}>
                  <button className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-md py-2 font-bold text-[12px] transition-colors cursor-pointer">
                    Details
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Our Mission</h2>
          <p className="text-[11.5px] text-gray-500 leading-relaxed">
            {COMPANY.mission}
          </p>
        </div>

        {/* Our Benefits */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Our Benefits</h2>
          <div className="grid grid-cols-4 gap-3">
            {COMPANY.benefits.map((b) => (
              <div key={b.label} className="text-center py-2">
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="text-xs font-semibold text-gray-600">
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Media</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              "from-amber-300 to-amber-400",
              "from-yellow-300 to-yellow-400",
              "from-orange-300 to-orange-400",
            ].map((g, i) => (
              <div
                key={i}
                className={`h-24 rounded-lg bg-gradient-to-br ${g} cursor-pointer hover:opacity-90 transition-opacity`}
              />
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link href="/jobs">
            <button className="border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white rounded-lg px-6 py-2 text-sm font-semibold transition-all cursor-pointer">
              ← Back to Jobs
            </button>
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="bg-white border-t border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1e3a5f] rounded flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            {/* <div>
              <div className="text-xs font-bold text-[#1e3a5f] leading-none">
                Immigrant Jobs World
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5">
                powered by aeroselect
              </div>
            </div> */}
          </div>
          {/* <div className="flex gap-4">
            {["Imprint", "Privacy", "Explore AeroHire"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors no-underline"
              >
                {item}
              </a>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
}
