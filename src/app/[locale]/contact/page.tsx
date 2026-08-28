import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("pageDescription"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-4 text-center">
          {t("title")}
        </h1>
        <p className="text-center text-[var(--color-text-secondary)] mb-12 max-w-lg mx-auto">
          {t("description")}
        </p>
        <Suspense>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}