import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  metadataBase: new URL("https://fidelisauto.com"),
  alternates: {
    canonical: "/",
    languages: {
      en: "https://fidelisauto.com",
      "ar-EG": "https://fidelisauto.com/ar",
      "x-default": "https://fidelisauto.com",
    },
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#c9a84c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}