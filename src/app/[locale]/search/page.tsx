import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import { getVehicles } from "@/lib/vehicle-data";
import SearchFilters from "./SearchFilters";
import AdSlot from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "searchPage" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

// ─── Smart free-text matching (WS9) ──────────────
// Normalizes Arabic-Latin so "suv", "SUV", "دفع رباعي", "céline"-style diacritics and tab/space
// noise all resolve: lowercase, strip Latin + Arabic diacritics, fold Arabic letter variants.
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // Latin combining diacritics
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // Arabic diacritics + tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

interface SearchVehicle {
  title: string;
  make: string;
  model: string;
  year: number;
  category?: string;
  trim?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  fuelType?: string | null;
}

function matches(v: SearchVehicle, q: string): boolean {
  const haystack = normalizeText(
    [
      v.title,
      v.make,
      v.model,
      String(v.year),
      v.category || "",
      v.trim || "",
      v.transmission || "",
      v.bodyType || "",
      v.fuelType || "",
    ].join(" "),
  );
  return haystack.includes(q);
}

// Transmission is free text on the model (e.g. "Automatic", "6-speed Manual"); fold it into the
// three canonical buckets the filter UI exposes.
function normalizeTransmission(value?: string | null): string {
  const v = (value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  if (v.includes("automatic")) return "Automatic";
  if (v.includes("manual")) return "Manual";
  return "Other";
}

type MaybeParam = string | string[] | undefined;
const first = (v: MaybeParam): string => (Array.isArray(v) ? v[0] || "" : v || "");

// ─── Page ────────────────────────────────────────
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    year?: string | string[];
    maxMileage?: string | string[];
    bodyType?: string | string[];
    fuelType?: string | string[];
    transmission?: string | string[];
  }>;
}) {
  const { locale } = await params;
  const [sp, t, tv] = await Promise.all([
    searchParams,
    getTranslations({ locale, namespace: "searchPage" }),
    getTranslations({ locale, namespace: "vehicles" }),
  ]);

  const rawQ = first(sp.q).trim();
  const q = normalizeText(rawQ);
  const year = first(sp.year).trim();
  const maxMileage = first(sp.maxMileage).trim();
  const bodyType = first(sp.bodyType).trim().toUpperCase();
  const fuelType = first(sp.fuelType).trim().toUpperCase();
  const transmission = first(sp.transmission).trim();

  const allVehicles = await getVehicles({ status: "available", orderBy: "featured" });

  let results = allVehicles;
  if (q) results = results.filter((v) => matches(v, q));
  if (year) {
    const y = parseInt(year, 10);
    if (!Number.isNaN(y)) results = results.filter((v) => v.year === y);
  }
  if (maxMileage) {
    const m = parseInt(maxMileage, 10);
    if (!Number.isNaN(m)) results = results.filter((v) => (v.mileage ?? Infinity) <= m);
  }
  if (bodyType) results = results.filter((v) => (v.bodyType ?? "") === bodyType);
  if (fuelType) results = results.filter((v) => (v.fuelType ?? "") === fuelType);
  if (transmission) {
    const tt = normalizeTransmission(transmission);
    results = results.filter((v) => normalizeTransmission(v.transmission) === tt);
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-[var(--color-surface-dark)] py-16 md:py-20">
        <div className="container-page">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 flex items-center gap-2">
            <Search size={14} /> {t("searchLabel")}
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-semibold text-[var(--color-text-inverse)]">
            {rawQ ? `${t("resultsFor")} “${rawQ}”` : t("title")}
          </h1>
          <p className="mt-3 text-[var(--color-text-inverse)]/70 max-w-2xl">
            {t("description")}
          </p>
        </div>
      </section>

      {/* Smart search + extended filters */}
      <section className="container-page pt-8 md:pt-10">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
          {t("filtersTitle")}
        </h2>
        <SearchFilters />
      </section>

      {/* Results */}
      <section className="container-page py-10 md:py-14">
        <div className="flex items-center justify-between mt-2 mb-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {results.length} {results.length === 1 ? tv("vehiclesFound_one") : tv("vehiclesFound_other")}
          </p>
          {rawQ && (
            <Link
              href="/vehicles"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              {t("browseAll")}
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
              {t("noResults")}
            </h3>
            <p className="text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
              {t("noResultsDesc")}
            </p>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-ink-hover)] transition-colors"
            >
              {t("browseCta")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {results.slice(0, 3).map((vehicle) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
            {/* WS16: one in-feed slot mid-grid, only when there are enough results
                to absorb it without crowding the listing. Renders nothing unless
                NEXT_PUBLIC_ADSENSE_CLIENT is configured. */}
            {results.length >= 4 && (
              <AdSlot format="in-feed" slotId="search-results" className="self-start" />
            )}
            {results.slice(3).map((vehicle) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}