import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import { getVehicles } from "@/lib/vehicle-data";

export const metadata: Metadata = {
  title: "Search Vehicles",
  description:
    "Search the Fidelis Auto collection of documented, verified collector vehicles.",
};

// Keyword match across the fields a buyer is most likely to query.
function matches(vehicle: { title: string; make: string; model: string; year: number; category?: string }, q: string): boolean {
  const haystack = [
    vehicle.title,
    vehicle.make,
    vehicle.model,
    String(vehicle.year),
    String(vehicle.category || ""),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").toString().trim().toLowerCase();

  const allVehicles = await getVehicles({ status: "available", orderBy: "featured" });
  const results = q ? allVehicles.filter((v) => matches(v, q)) : allVehicles;

  return (
    <>
      {/* Page Header */}
      <section className="bg-[var(--color-surface-dark)] py-16 md:py-20">
        <div className="container-page">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 flex items-center gap-2">
            <Search size={14} /> Search
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-semibold text-[var(--color-text-inverse)]">
            {q ? `Results for “${q}”` : "Search the Collection"}
          </h1>
          <p className="mt-3 text-[var(--color-text-inverse)]/70 max-w-2xl">
            Search by make, model, year, or category. Every vehicle is documented and verified.
          </p>
        </div>
      </section>

      {/* Results */}
      <section className="container-page py-10 md:py-14">
        <div className="flex items-center justify-between mt-2 mb-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {results.length} {results.length === 1 ? "vehicle" : "vehicles"} found
          </p>
          {q && (
            <Link
              href="/vehicles"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Browse all vehicles →
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
              No vehicles match your search
            </h3>
            <p className="text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
              Try a different make, model, or year, or browse the full collection.
            </p>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Browse All Vehicles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {results.map((vehicle) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
