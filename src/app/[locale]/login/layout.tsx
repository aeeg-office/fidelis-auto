import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternates } from "@/lib/seo";

// The login page is a client component and cannot export metadata, so the
// self-canonical + hreflang pair (Wave-E0 close-out) is declared here.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" }).catch(() => null);
  return {
    title: t ? t("signIn") : "Sign In",
    alternates: getAlternates(locale, "/login"),
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
