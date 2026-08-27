import VehicleCard from "./VehicleCard";
import type { VehicleCardData } from "./VehicleCard";
import { getVehicles } from "@/lib/vehicle-data";

interface RelatedVehiclesProps {
  /** Slug of the current vehicle to exclude from results. */
  currentSlug: string;
  /** Vehicle make to match. */
  make: string;
  /** Vehicle model year. */
  year: number;
  /** Optional explicit list of all vehicles (e.g. from DB). Defaults to real published vehicles. */
  allVehicles?: VehicleCardData[];
}

/**
 * Shows 3-4 related vehicles on the vehicle detail page.
 * Related logic: same make, then same era (+/- 5 years).
 * Excludes the current vehicle. DB-driven — never fabricates inventory (FID-010).
 */
export default async function RelatedVehicles({
  currentSlug,
  make,
  year,
  allVehicles,
}: RelatedVehiclesProps) {
  const pool =
    allVehicles ?? (await getVehicles({ status: "available", orderBy: "recent", limit: 100 }));

  // Score candidates: same make = 2 pts, same era (+/- 5 years) = 1 pt
  const scored = pool
    .filter((v) => v.slug !== currentSlug)
    .map((v) => {
      let score = 0;
      if (v.make === make) score += 2;
      if (Math.abs(v.year - year) <= 5) score += 1;
      return { vehicle: v, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (scored.length === 0) return null;

  return (
    <section className="py-16 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="container-page">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
          Related Vehicles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {scored.map(({ vehicle }) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}
