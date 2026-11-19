import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  metadataBase: new URL("https://fidelisauto.com"),
  // NOTE: no global `alternates.canonical` here. Each [locale] route sets its
  // own self-referencing canonical via src/lib/seo.ts getAlternates(). A global
  // "/" leaked the homepage canonical onto every subpage (/vehicles, /services,
  // /journal, /ar, …) — fixed in the launch-blocker sprint 2026-11-19.
  title: {
    default: "Fidelis Auto — Egypt's car destination",
    template: "%s | Fidelis Auto",
  },
  description:
    "Buy and sell cars and motorcycles in Egypt — every make on the market including Chinese brands, an honest specialist directory, and useful guides.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fidelis Auto",
    images: [{ url: "https://fidelisauto.com/images/og-default.png", width: 1200, height: 630, alt: "Fidelis Auto — Egypt's car destination" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://fidelisauto.com/images/og-default.png"],
  },
  manifest: "/manifest.webmanifest",
  applicationName: "Fidelis Auto",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Fidelis Auto",
    statusBarStyle: "default",
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