import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-8">
          {t("title")}
        </h1>
        <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-6">
          <p>{t("lastUpdated")}: {new Date().toLocaleDateString()}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section1")}</h2>
          <p>{t("section1Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section2")}</h2>
          <p>{t("section2Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section3")}</h2>
          <p>{t("section3Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section4")}</h2>
          <p>{t("section4Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section5")}</h2>
          <p>{t("section5Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section6")}</h2>
          <p>{t("section6Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section7")}</h2>
          <p>{t("section7Desc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">{t("section8")}</h2>
          <p>{t("section8Desc")}</p>
        </div>
      </div>
    </div>
  );
}