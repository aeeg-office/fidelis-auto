import type { Metadata, Viewport } from "next";

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
  manifest: "/manifest.webmanifest",
  applicationName: "Fidelis Auto",
  icons: {
    icon: [
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}