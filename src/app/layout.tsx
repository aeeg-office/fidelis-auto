import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
  title: {
    default: "Hermes Car — Premium Collector Vehicle Showroom",
    template: "%s | Hermes Car",
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
    siteName: "Hermes Car",
  },
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}