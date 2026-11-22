import type { Metadata } from "next";
import { getAlternates } from "@/lib/seo";

// The dealer registration page is a client component and cannot export metadata, so the
// canonical + hreflang pair (2026-11-22 audit finding) is declared here.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل وكالة" : "Register a Dealership",
    alternates: getAlternates(locale, "/dealer/register"),
  };
}

export default function DealerRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
