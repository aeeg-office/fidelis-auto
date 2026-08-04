import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Cormorant_Garamond, Noto_Kufi_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/JsonLd";
import CookieConsent from "@/components/CookieConsent";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <html
      lang={isRtl ? "ar-EG" : "en"}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${inter.variable} ${cormorant.variable} ${isRtl ? notoKufiArabic.variable : ""}`}
    >
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <JsonLd
            type="Organization"
            data={{
              name: "Fidelis Auto",
              url: "https://fidelisauto.com",
              description:
                "A premium digital showroom for collector, classic, and enthusiast vehicles.",
              sameAs: [],
            }}
          />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
          <PwaInstallPrompt />
          <Analytics />
          <Script
            id="register-sw"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('SW registered', reg.scope);
                    })
                    .catch(function(err) {
                      console.log('SW registration failed', err);
                    });
                }
              `,
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}