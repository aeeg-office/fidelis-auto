import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Gauge, Wrench, Cog } from "lucide-react";
import type { Metadata } from "next";
import VehicleCard from "@/components/VehicleCard";
import CompareVehicleCard from "@/components/CompareVehicleCard";
import type { VehicleCardData } from "@/components/VehicleCard";
import RecentlySold from "@/components/RecentlySold";
import { getVehicles } from "@/lib/vehicle-data";
import FilterBar from "./FilterBar";

// ─── Types ──────────────────────────────────────
// VehicleCardData imported from @/components/VehicleCard

export const metadata: Metadata = {
  title: "Vehicles",
  description:
    "Browse the Fidelis Auto collection of documented, verified collector vehicles. From daily drivers to once-in-a-lifetime finds.",
};

const PER_PAGE = 12;

// ─── Helpers ────────────────────────────────────
function normalizeTransmission(value?: string | null): string {
  const v = (value || "").toLowerCase();
  if (v.includes("automatic")) return "Automatic";
  if (v.includes("manual")) return "Manual";
  return "Other";
}

function extractPrice(value?: string | null): number | null {
  if (!value) return null;
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return null;
  return parseInt(clean, 10);
}

function formatPrice(value?: string | null): string {
  if (!value) return "Price on Application";
  const n = extractPrice(value);
  if (n === null) return value === "POA" ? "Price on Application" : value;
  return `$${n.toLocaleString()}`;
}

function filterVehicles(vehicles: VehicleCardData[], params: Record<string, string | string[] | undefined>): VehicleCardData[] {
  const q = (params.q || "").toString().toLowerCase().trim();
  const make = (params.make || "").toString().trim();
  const model = (params.model || "").toString().trim();
  const yearMin = (params.yearMin || "").toString();
  const yearMax = (params.yearMax || "").toString();
  const bodyType = (params.bodyType || "").toString().trim();
  const transmission = (params.transmission || "").toString().trim();
  const country = (params.country || "").toString().trim();
  const priceMin = (params.priceMin || "").toString();
  const priceMax = (params.priceMax || "").toString();
  const category = (params.category || "").toString().trim();

  return vehicles.filter((v) => {
    if (q) {
      const haystack = `${v.year} ${v.make} ${v.model} ${v.trim || ""} ${v.exteriorColor || ""} ${v.title}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (make && v.make !== make) return false;
    if (model && v.model !== model) return false;
    if (yearMin && v.year < parseInt(yearMin, 10)) return false;
    if (yearMax && v.year > parseInt(yearMax, 10)) return false;
    if (bodyType && (v.trim || "") !== bodyType) return false;
    if (transmission && normalizeTransmission(v.transmission) !== transmission) return false;
    if (country && v.country !== country) return false;
    if (category && (v.category || "") !== category) return false;

    const price = extractPrice(v.price);
    if (priceMin && price !== null && price < parseInt(priceMin, 10)) return false;
    if (priceMax && price !== null && price > parseInt(priceMax, 10)) return false;

    return true;
  });
}

function sortVehicles(vehicles: VehicleCardData[], sort: string): VehicleCardData[] {
  const arr = [...vehicles];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => (extractPrice(a.price) ?? Infinity) - (extractPrice(b.price) ?? Infinity));
    case "price-desc":
      return arr.sort((a, b) => (extractPrice(b.price) ?? -Infinity) - (extractPrice(a.price) ?? -Infinity));
    case "year-desc":
      return arr.sort((a, b) => b.year - a.year);
    case "year-asc":
      return arr.sort((a, b) => a.year - b.year);
    default:
      // Featured first, then by newest
      return arr.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
  }
}

// ─── Page ───────────────────────────────────────
export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sort = (params.sort || "newest").toString();
  const page = Math.max(1, parseInt((params.page || "1").toString(), 10) || 1);

  const allVehicles = await getVehicles({ status: "all", orderBy: "featured" });
  const filtered = sortVehicles(filterVehicles(allVehicles, params), sort);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageVehicles = filtered.slice(start, start + PER_PAGE);

  // Distinct body types from current data
  const bodyTypes = Array.from(new Set(allVehicles.map((v) => v.trim).filter(Boolean) as string[])).sort();

  // Distinct categories from current data
  const categories = Array.from(new Set(allVehicles.map((v) => v.category).filter(Boolean) as string[])).sort();

  // Build pagination links, preserving query params
  const baseParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "page") continue;
    baseParams.set(k, v as string);
  }
  const pageHref = (p: number) => {
    const sp = new URLSearchParams(baseParams);
    if (p > 1) sp.set("page", p.toString());
    return `/vehicles${sp.toString() ? `?${sp.toString()}` : ""}`;
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-[var(--color-surface-dark)] py-16 md:py-20">
        <div className="container-page">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
            The Collection
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-semibold text-[var(--color-text-inverse)]">
            Vehicles
          </h1>
          <p className="mt-3 text-[var(--color-text-inverse)]/70 max-w-2xl">
            Every vehicle in our collection is documented, verified, and presented with the care it deserves.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container-page py-10 md:py-14">
        <Suspense>
          <FilterBar bodyTypes={bodyTypes} categories={categories} />
        </Suspense>

        {/* Results count */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {filtered.length} {filtered.length === 1 ? "vehicle" : "vehicles"} found
          </p>
        </div>

        {pageVehicles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {pageVehicles.map((vehicle) => (
              <CompareVehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const active = p === currentPage;
              return (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-accent)] text-[var(--color-surface-dark)]"
                      : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {p}
                </Link>
              );
            })}
          </nav>
        )}
      </section>

      {/* Recently Sold Sidebar-style section */}
      <RecentlySold />
    </>
  );
}

// ─── Empty State ────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
        No vehicles match your filters
      </h3>
      <p className="text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
        Try adjusting or clearing your search criteria to see more vehicles from the collection.
      </p>
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        Clear All Filters
      </Link>
    </div>
  );
}