import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-6">
          {t("title")}
        </h1>

        <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-6">
          <p>
            <strong className="text-[var(--color-text-primary)]">Fidelis</strong> — {t("fidelisLatin")}
          </p>

          <p>{t("weBuiltIt")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            {t("whyWeExist")}
          </h2>

          <p>{t("whyWeExistDesc")}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            {t("whatWeDo")}
          </h2>

          <ul className="space-y-4">
            <li>
              <strong className="text-[var(--color-text-primary)]">{t("verifiedDocumentation")}</strong>
              <br />
              {t("verifiedDocumentationDesc")}
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">{t("honestPhotography")}</strong>
              <br />
              {t("honestPhotographyDesc")}
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">{t("aHomeForEveryCar")}</strong>
              <br />
              {t("aHomeForEveryCarDesc")}
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">{t("builtForMENA")}</strong>
              <br />
              {t("builtForMENADesc")}
            </li>
          </ul>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            {t("whatsNext")}
          </h2>

          <p>{t("whatsNextDesc")}</p>
        </div>
      </div>
    </div>
  );
}