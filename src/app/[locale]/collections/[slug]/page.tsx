import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import { getPublicCollection } from "@/lib/collections-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getPublicCollection(slug);
  if (!collection) return {};
  const isAr = locale === "ar";
  return {
    title: isAr && collection.titleAr ? collection.titleAr : collection.titleEn,
    description: (isAr ? collection.descriptionAr : collection.descriptionEn) ?? undefined,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const t = await getTranslations("collections");
  const { locale, slug } = await params;
  const isAr = locale === "ar";

  const collection = await getPublicCollection(slug);
  if (!collection) notFound();

  const title = isAr && collection.titleAr ? collection.titleAr : collection.titleEn;
  const description = isAr && collection.descriptionAr ? collection.descriptionAr : collection.descriptionEn;

  return (
    <div className="container-page py-12 md:py-16">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-8 transition-colors"
      >
        <ArrowLeft size={14} className="rtl:rotate-180" />
        {t("backToCollections")}
      </Link>

      <header className="mb-10 max-w-3xl">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-accent)] mb-3">
          <LayoutGrid size={14} /> {t("title")}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-4">
          {title}
        </h1>
        {description && <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">{description}</p>}
        <p className="text-sm text-[var(--color-text-secondary)] mt-4">
          {t("vehicleCount", { count: collection.vehicles.length })}
        </p>
      </header>

      {collection.vehicles.length === 0 ? (
        <p className="text-center text-[var(--color-text-secondary)] py-16">{t("noVehicles")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {collection.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}