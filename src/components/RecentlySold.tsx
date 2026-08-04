import VehicleCard from "./VehicleCard";
import type { VehicleCardData } from "./VehicleCard";

// ─── Placeholder recently-sold vehicles ──
const SOLD_VEHICLES: VehicleCardData[] = [
  {
    slug: "ferrari-250-lusso",
    title: "1963 Ferrari 250 GT Lusso",
    year: 1963,
    make: "Ferrari",
    model: "250 GT Lusso",
    trim: "Berlinetta",
    mileage: 45000,
    mileageUnit: "mi",
    exteriorColor: "Rosso",
    engine: "3.0L V12",
    transmission: "4-Speed Manual",
    price: "Sold",
    city: "Monte Carlo",
    country: "Monaco",
    image: "/images/placeholder-porsche-911e.svg",
  },
  {
    slug: "aston-martin-db5",
    title: "1964 Aston Martin DB5",
    year: 1964,
    make: "Aston Martin",
    model: "DB5",
    trim: "Saloon",
    mileage: 38000,
    mileageUnit: "mi",
    exteriorColor: "Silver Birch",
    engine: "4.0L Inline-6",
    transmission: "5-Speed Manual",
    price: "Sold",
    city: "London",
    country: "United Kingdom",
    image: "/images/placeholder-mercedes-230sl.svg",
  },
  {
    slug: "jaguar-e-type",
    title: "1962 Jaguar E-Type Series 1",
    year: 1962,
    make: "Jaguar",
    model: "E-Type",
    trim: "Roadster",
    mileage: 62000,
    mileageUnit: "mi",
    exteriorColor: "British Racing Green",
    engine: "3.8L Inline-6",
    transmission: "4-Speed Manual",
    price: "Sold",
    city: "New York",
    country: "United States",
    image: "/images/placeholder-porsche-911-carrera-rs.svg",
  },
];

interface RecentlySoldProps {
  /** Optional heading level override (default "h2"). */
  headingLevel?: "h2" | "h3";
  /** Optional className for the section wrapper. */
  className?: string;
}

/**
 * "Recently Sold" section with placeholder data (3 vehicles).
 * Shows a subtle "Sold" badge on each card image.
 */
export default function RecentlySold({
  headingLevel: Heading = "h2",
  className = "",
}: RecentlySoldProps) {
  return (
    <section className={`py-16 ${className}`}>
      <div className="container-page">
        <Heading className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
          Recently Sold
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SOLD_VEHICLES.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} sold />
          ))}
        </div>
      </div>
    </section>
  );
}