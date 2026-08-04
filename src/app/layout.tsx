import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/JsonLd";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fidelisauto.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Fidelis Auto — Premium Collector Vehicle Showroom",
    template: "%s | Fidelis Auto",
  },
  description:
    "A premium digital showroom for collector, classic, and enthusiast vehicles. Every vehicle tells a story. Own the story.",
  keywords: [
    "collector cars",
    "classic cars",
    "vintage cars",
    "Egypt",
    "GCC",
    "premium automotive",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fidelis Auto",
  },
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen flex flex-col">
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
      </body>
    </html>
  );
}