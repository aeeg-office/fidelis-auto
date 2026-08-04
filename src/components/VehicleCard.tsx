import Link from "next/link";
import { MapPin, Gauge, Wrench, Cog } from "lucide-react";
import VehicleImage from "./VehicleImage";

export interface VehicleCardData {
  slug: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileage?: number | null;
  mileageUnit?: string;
  exteriorColor?: string | null;
  engine?: string | null;
  transmission?: string | null;
  price?: string | null;
  city?: string | null;
  country?: string | null;
  image: string;
  /** Optional short subtitle shown in the "simple" variant (homepage). */
  subtitle?: string | null;
  /** Optional creation timestamp (epoch ms) used for "newest" sorting. */
  createdAt?: number;
}

interface VehicleCardProps {
  vehicle: VehicleCardData;
  /** "detailed" = specs grid (listing page); "simple" = image + title + subtitle (homepage). */
  variant?: "detailed" | "simple";
  /** When true, renders a subtle "Sold" badge over the image. */
  sold?: boolean;
  /** Mark the hero/first-fold image as high priority. */
  priority?: boolean;
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

export default function VehicleCard({
  vehicle,
  variant = "detailed",
  sold = false,
  priority = false,
}: VehicleCardProps) {
  const location =
    vehicle.city && vehicle.country ? `${vehicle.city}, ${vehicle.country}` : null;

  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className="group block bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-[var(--color-surface-dark)] overflow-hidden">
        <VehicleImage
          src={vehicle.image}
          alt={vehicle.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {sold && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--color-surface-dark)]/85 text-[var(--color-text-inverse)] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[var(--color-text-inverse)]/20">
            Sold
          </span>
        )}
      </div>

      {variant === "simple" ? (
        <div className="p-5">
          <h3 className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
            {vehicle.title}
          </h3>
          {vehicle.subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {vehicle.subtitle}
            </p>
          )}
        </div>
      ) : (
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
                <span>
                  {vehicle.mileage.toLocaleString()} {vehicle.mileageUnit || "mi"}
                </span>
              </div>
            )}
            {vehicle.exteriorColor && (
              <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <span
                  className="w-3 h-3 rounded-full border border-[var(--color-border)] shrink-0"
                  style={{ background: "var(--color-bg)" }}
                />
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
      )}
    </Link>
  );
}