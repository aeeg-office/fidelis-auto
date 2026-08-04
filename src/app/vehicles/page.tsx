import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Gauge, Wrench, Cog } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FilterBar from "./FilterBar";

// ─── Types ──────────────────────────────────────
export interface VehicleCardType {
  slug: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileage?: number | null;
  mileageUnit: string;
  exteriorColor?: string | null;
  engine?: string | null;
  transmission?: string | null;
  price?: string | null;
  city?: string | null;
  country?: string | null;
  image: string;
  createdAt: number;
}

// ─── Placeholder listing data (used when the DB has no vehicles yet) ──
const PLACEHOLDER_VEHICLES: VehicleCardType[] = [
  {
    slug: "porsche-911e",
    title: "1971 Porsche 911E",
    year: 1971,
    make: "Porsche",
    model: "911E",
    trim: "Coupe",
    mileage: 3742,
    mileageUnit: "mi",
    exteriorColor: "Albert Blue",
    engine: "2.2L Flat-6",
    transmission: "5-Speed Manual",
    price: "USD 425,000",
    city: "Munich",
    country: "Germany",
    image: "/images/placeholder-porsche-911e.svg",
    createdAt: new Date("2026-07-15").getTime(),
  },
  {
    slug: "mercedes-230sl",
    title: "1967 Mercedes-Benz 230SL Pagoda",
    year: 1967,
    make: "Mercedes-Benz",
    model: "230SL",
    trim: "Roadster",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Silver",
    engine: "2.3L Inline-6",
    transmission: "4-Speed Manual",
    price: "USD 180,000",
    city: "Dubai",
    country: "United Arab Emirates",
    image: "/images/placeholder-mercedes-230sl.svg",
    createdAt: new Date("2026-07-20").getTime(),
  },
  {
    slug: "porsche-911-carrera-rs",
    title: "1973 Porsche 911 Carrera RS 2.7",
    year: 1973,
    make: "Porsche",
    model: "911 Carrera RS",
    trim: "Coupe",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Red",
    engine: "2.7L Flat-6",
    transmission: "5-Speed Manual",
    price: "POA",
    city: "Stuttgart",
    country: "Germany",
    image: "/images/placeholder-porsche-911-carrera-rs.svg",
    createdAt: new Date("2026-07-25").getTime(),
  },
  {
    slug: "mercedes-280sl",
    title: "1969 Mercedes-Benz 280SL",
    year: 1969,
    make: "Mercedes-Benz",
    model: "280SL",
    trim: "Roadster",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "White",
    engine: "2.8L Inline-6",
    transmission: "Automatic",
    price: "USD 145,000",
    city: "Cairo",
    country: "Egypt",
    image: "/images/placeholder-mercedes-280sl.svg",
    createdAt: new Date("2026-07-30").getTime(),
  },
];

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

async function getVehicles(): Promise<VehicleCardType[]> {
  let dbVehicles = null;
  try {
    dbVehicles = await prisma.vehicle.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  } catch {
    dbVehicles = null;
  }

  if (Array.isArray(dbVehicles) && dbVehicles.length > 0) {
    return dbVehicles.map((v) => ({
      slug: v.slug,
      title: v.title,
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      mileage: v.mileage,
      mileageUnit: v.mileageUnit,
      exteriorColor: v.exteriorColor,
      engine: v.engine,
      transmission: v.transmission,
      price: v.price,
      city: null,
      country: null,
      image: `/images/placeholder-${v.slug}.svg`,
      createdAt: v.createdAt.getTime(),
    }));
  }

  return PLACEHOLDER_VEHICLES;
}

function filterVehicles(vehicles: VehicleCardType[], params: Record<string, string | string[] | undefined>): VehicleCardType[] {
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

    const price = extractPrice(v.price);
    if (priceMin && price !== null && price < parseInt(priceMin, 10)) return false;
    if (priceMax && price !== null && price > parseInt(priceMax, 10)) return false;

    return true;
  });
}

function sortVehicles(vehicles: VehicleCardType[], sort: string): VehicleCardType[] {
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
      return arr.sort((a, b) => b.createdAt - a.createdAt);
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

  const allVehicles = await getVehicles();
  const filtered = sortVehicles(filterVehicles(allVehicles, params), sort);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageVehicles = filtered.slice(start, start + PER_PAGE);

  // Distinct body types from current data
  const bodyTypes = Array.from(new Set(allVehicles.map((v) => v.trim).filter(Boolean) as string[])).sort();

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
          <FilterBar bodyTypes={bodyTypes} />
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
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
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
    </>
  );
}

// ─── Vehicle Card ───────────────────────────────
function VehicleCard({ vehicle }: { vehicle: VehicleCardType }) {
  const location =
    vehicle.city && vehicle.country ? `${vehicle.city}, ${vehicle.country}` : null;

  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className="group block bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-shadow"
    >
      <div className="aspect-[16/10] bg-[var(--color-surface-dark)] overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.price && (
            <span className="shrink-0 text-sm font-semibold text-[var(--color-accent)] text-right">
              {formatPrice(vehicle.price)}
            </span>
          )}
        </div>

        {vehicle.trim && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{vehicle.trim}</p>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-[var(--color-border)] pt-3">
          {vehicle.mileage !== null && vehicle.mileage !== undefined && (
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Gauge size={14} className="text-[var(--color-accent)] shrink-0" />
              <span>{vehicle.mileage.toLocaleString()} {vehicle.mileageUnit}</span>
            </div>
          )}
          {vehicle.exteriorColor && (
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <span className="w-3 h-3 rounded-full border border-[var(--color-border)] shrink-0" style={{ background: "var(--color-bg)" }} />
              <span>{vehicle.exteriorColor}</span>
            </div>
          )}
          {vehicle.engine && (
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Wrench size={14} className="text-[var(--color-accent)] shrink-0" />
              <span>{vehicle.engine}</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Cog size={14} className="text-[var(--color-accent)] shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] mt-3">
            <MapPin size={14} className="text-[var(--color-accent)] shrink-0" />
            <span>{location}</span>
          </div>
        )}

        <span className="inline-flex items-center mt-4 text-sm font-medium text-[var(--color-accent)]">
          View Details
          <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
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