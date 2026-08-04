import type { Metadata } from "next";

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
  themeColor: "#c9a84c",
  manifest: "/manifest.json",
  icons: {
    apple: [{ url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}