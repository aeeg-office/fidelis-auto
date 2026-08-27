import VehicleCard from "./VehicleCard";
import type { VehicleCardData } from "./VehicleCard";
import { getSoldVehicles } from "@/lib/vehicle-data";

interface RecentlySoldProps {
  /** Optional heading level override (default "h2"). */
  headingLevel?: "h2" | "h3";
  /** Optional className for the section wrapper. */
  className?: string;
}

/**
 * "Recently Sold" section — DB-driven (FID-010).
 * Shows a subtle "Sold" badge on each card. Hides entirely when there
 * are no sold vehicles, rather than fabricating demo stock.
 */
export default async function RecentlySold({
  headingLevel: Heading = "h2",
  className = "",
}: RecentlySoldProps) {
  const soldVehicles: VehicleCardData[] = await getSoldVehicles(3);
  if (soldVehicles.length === 0) return null;

  return (
    <section className={`py-16 ${className}`}>
      <div className="container-page">
        <Heading className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
          Recently Sold
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {soldVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} sold />
          ))}
        </div>
      </div>
    </section>
  );
}
