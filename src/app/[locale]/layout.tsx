import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/lib/Providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CADDCORELMS ",
  description: "Welcome to the LMS  website.",
};

export default async function LocaleLayout({
  children,
  auth,
  params,
}: {
  children: React.ReactNode;
  auth: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${poppins.variable} font-sans antialiased`}
        style={{
          fontFamily:
            locale === "bn"
              ? "banglaFont, var(--font-poppins)"
              : "var(--font-poppins), banglaFont",
        }}
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {auth}
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
