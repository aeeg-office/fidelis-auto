import VehicleCard from "./VehicleCard";
import type { VehicleCardData } from "./VehicleCard";

// ─── Placeholder data used when DB is unavailable ──
const ALL_FALLBACK_VEHICLES: VehicleCardData[] = [
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
  },
  {
    slug: "porsche-911-carrera-rs",
    title: "1973 Porsche 911 Carrera RS 2.7",
    year: 1973,
    make: "Porsche",
    model: "911 Carrera RS",
    trim: "2.7",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Grand Prix Red",
    engine: "2.7L Flat-6 (210 hp)",
    transmission: "5-Speed Manual",
    price: "POA",
    city: "Stuttgart",
    country: "Germany",
    image: "/images/placeholder-porsche-911-carrera-rs.svg",
  },
  {
    slug: "mercedes-280sl",
    title: "1969 Mercedes-Benz 280SL",
    year: 1969,
    make: "Mercedes-Benz",
    model: "280SL",
    trim: null,
    mileage: 82300,
    mileageUnit: "mi",
    exteriorColor: "White",
    engine: "2.8L Inline-6",
    transmission: "Automatic",
    price: "USD 145,000",
    city: "Cairo",
    country: "Egypt",
    image: "/images/placeholder-mercedes-280sl.svg",
  },
];

interface RelatedVehiclesProps {
  /** Slug of the current vehicle to exclude from results. */
  currentSlug: string;
  /** Vehicle make to match. */
  make: string;
  /** Vehicle model year. */
  year: number;
  /** Optional explicit list of all vehicles (e.g. from DB). Falls back to placeholder data. */
  allVehicles?: VehicleCardData[];
}

/**
 * Shows 3-4 related vehicles on the vehicle detail page.
 * Related logic: same make, then same era (+/- 5 years).
 * Excludes the current vehicle.
 */
export default function RelatedVehicles({
  currentSlug,
  make,
  year,
  allVehicles,
}: RelatedVehiclesProps) {
  const pool = allVehicles ?? ALL_FALLBACK_VEHICLES;

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