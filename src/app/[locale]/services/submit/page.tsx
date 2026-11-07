import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ServiceSubmitForm from "@/components/ServiceSubmitForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ServiceSubmitPage() {
  const t = await getTranslations("services");
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">{t("networkLabel")}</p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[var(--color-text-primary)]">{t("submitTitle")}</h1>
        <p className="mt-4 text-[var(--color-text-secondary)] mb-10">
          {t("submitDescription")}
        </p>
        <ServiceSubmitForm />
      </div>
    </div>
  );
}
