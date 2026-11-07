import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import VehicleImage from "@/components/VehicleImage";
import { ArrowRight } from "lucide-react";
import { getVisibleCollections } from "@/lib/collections-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("collections");
  return { title: t("title"), description: t("description") };
}

export default async function CollectionsListPage() {
  const t = await getTranslations("collections");
  const locale = await getLocale();
  const isRtl = locale === "ar";

  const collections = await getVisibleCollections();

  return (
    <div className="container-page py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-3">
          {t("title")}
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">{t("description")}</p>
      </header>

      {collections.length === 0 ? (
        <p className="text-center text-[var(--color-text-secondary)] py-16">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {collections.map((c) => {
            const title = isRtl && c.titleAr ? c.titleAr : c.titleEn;
            const desc = isRtl && c.descriptionAr ? c.descriptionAr : c.descriptionEn;
            return (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="group block bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-[var(--color-accent)]/50"
              >
                <div className="relative aspect-[16/9] bg-[var(--color-surface-dark)] overflow-hidden">
                  {c.coverSrc ? (
                    <VehicleImage
                      src={c.coverSrc}
                      alt={t("coverAlt", { title })}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">
                      {title}
                    </span>
                  )}
                  <span className="absolute top-3 end-3 z-10 bg-[var(--color-surface-dark)]/85 text-[var(--color-text-inverse)] text-xs font-medium px-2.5 py-1 rounded-full border border-white/20">
                    {t("vehicleCount", { count: c.vehicleCount })}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                    {title}
                  </h2>
                  {desc && <p className="text-sm text-[var(--color-text-secondary)] mt-2">{desc}</p>}
                  <span className="inline-flex items-center mt-4 text-sm font-medium text-[var(--color-text-primary)]">
                    {t("viewCollection")}
                    <ArrowRight size={14} className="ms-1 text-[var(--color-accent)] transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}