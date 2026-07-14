"use client";

import { Footer } from "@/components/shared/Footer/Footer";
import Navbar from "@/components/shared/Navbar";
import { usePathname } from "@/i18n/routing";
import { ImmigrantAiWidget } from "@/components/ImmigrantAiWidget";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Hide navbar on dashboard and user-profile routes
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  const isUserProfileRoute = pathname?.startsWith("/user-profile");
  const shouldHideNavbar = isDashboardRoute || isUserProfileRoute;

  return (
    <main suppressHydrationWarning={true} className="">
      {!shouldHideNavbar && <Navbar />}

      <div className="flex flex-col min-h-screen">{children}</div>

      {/* Immigrant AI Chatbot Widget */}
      <ImmigrantAiWidget />
      {!shouldHideNavbar && <Footer />}
    </main>
  );
}
