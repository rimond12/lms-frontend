import { Footer } from "@/components/shared/Footer/Footer";
import Navbar from "@/components/shared/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IMMIGRANT JOBS WORLD",
  description: "IMMIGRANT JOBS WORLD - Online CAD Training Center",
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
