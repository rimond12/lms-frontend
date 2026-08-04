import React from "react";
import { Metadata } from "next";
import ApplySection from "../(home)/Landing-page/ApplySection/ApplySection";

export const metadata: Metadata = {
  title: "Apply Directly — Overseas Career & Recruitment Application",
  description:
    "Fill out our secure application form to match your profile with verified international employers worldwide.",
  openGraph: {
    title: "Start a New Life Abroad — Apply Directly",
    description:
      "Fill out our secure candidate application form. Our recruitment experts match your profile with verified global employers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Start a New Life Abroad — Apply Directly",
    description:
      "Fill out our secure candidate application form for international job placement.",
  },
};

export default function StandaloneApplyPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-6 pb-12">
      <ApplySection />
    </main>
  );
}
