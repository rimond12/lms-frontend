import { Footer } from "@/components/shared/Footer/Footer";
import Navbar from "@/components/shared/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IMMIGRANT JOBS WORLD",
  description: "IMMIGRANT JOBS WORLD - Your Gateway to Global Job Opportunities for Immigrants.",
  openGraph: {
    title: "IMMIGRANT JOBS WORLD",
    description: "IMMIGRANT JOBS WORLD - Your Gateway to Global Job Opportunities for Immigrants.",
    siteName: "IMMIGRANT JOBS WORLD",
    type: "website",
    url: "https://immigrantjobsworld.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMMIGRANT JOBS WORLD",
    description: "IMMIGRANT JOBS WORLD - Your Gateway to Global Job Opportunities for Immigrants.",
  },
};

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="">
      <div className="flex flex-col min-h-screen">{children}</div>
    </main>
  );
}
