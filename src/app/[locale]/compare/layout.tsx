import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternates } from "@/lib/seo";

// The compare page itself is a client component and cannot export metadata, so the
// canonical + hreflang pair (2026-11-22 audit finding) is declared here.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" }).catch(() => null);
  return {
    title: t ? t("title") : "Compare Vehicles",
    alternates: getAlternates(locale, "/compare"),
  };
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
