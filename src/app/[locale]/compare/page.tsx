"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  X,
  Gauge,
  Wrench,
  Cog,
  Palette,
  MapPin,
  Calendar,
  DollarSign,
  Shuffle,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface CompareVehicle {
  slug: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  mileageUnit: string;
  exteriorColor: string | null;
  interiorColor: string | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  price: string | null;
  city: string | null;
  country: string | null;
  image: string;
}

interface VehicleOption {
  slug: string;
  title: string;
  year: number;
  make: string;
  model: string;
  image: string;
}

// ─── Compare Rows ───────────────────────────────

type RowDef = {
  key: string;
  label: string;
  render: (v: CompareVehicle) => string;
  icon?: LucideIcon;
};

const COMPARE_ROWS: RowDef[] = [
  { key: "year", label: "Year", render: (v) => String(v.year), icon: Calendar },
  { key: "make", label: "Make", render: (v) => v.make },
  { key: "model", label: "Model", render: (v) => v.model },
  {
    key: "mileage",
    label: "Mileage",
    render: (v) =>
      v.mileage != null
        ? `${v.mileage.toLocaleString()} ${v.mileageUnit || "mi"}`
        : "—",
    icon: Gauge,
  },
  { key: "engine", label: "Engine", render: (v) => v.engine || "—", icon: Wrench },
  {
    key: "transmission",
    label: "Transmission",
    render: (v) => v.transmission || "—",
    icon: Cog,
  },
  {
    key: "exteriorColor",
    label: "Exterior Color",
    render: (v) => v.exteriorColor || "—",
    icon: Palette,
  },
  {
    key: "interiorColor",
    label: "Interior Color",
    render: (v) => v.interiorColor || "—",
  },
  {
    key: "drivetrain",
    label: "Drivetrain",
    render: (v) => v.drivetrain || "—",
  },
  {
    key: "price",
    label: "Price",
    render: (v) => formatPrice(v.price),
    icon: DollarSign,
  },
  {
    key: "location",
    label: "Location",
    render: (v) =>
      v.city && v.country ? `${v.city}, ${v.country}` : v.country || v.city || "—",
    icon: MapPin,
  },
];

function formatPrice(value?: string | null): string {
  if (!value) return "Price on Application";
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return value === "POA" ? "Price on Application" : value;
  return `$${parseInt(clean, 10).toLocaleString()}`;
}

// ─── Difference Highlighting ────────────────────

function getDiffKey(rowKey: string, value: string): string {
  return `${rowKey}::${value}`;
}

function computeDifferences(
  vehicles: CompareVehicle[]
): Map<string, boolean> {
  const diffKeys = new Map<string, boolean>();

  if (vehicles.length < 2) return diffKeys;

  for (const row of COMPARE_ROWS) {
    const values = vehicles.map((v) => {
      const val = row.render(v);
      return val;
    });
    const allSame = values.every((v) => v === values[0]);
    diffKeys.set(row.key, !allSame);
  }

  return diffKeys;
}

// ─── Vehicle Selector ───────────────────────────

function VehicleSelector({
  index,
  selected,
  options,
  onSelect,
  onRemove,
  showRemove,
}: {
  index: number;
  selected: CompareVehicle | null;
  options: VehicleOption[];
  onSelect: (slug: string) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter(
    (o) =>
      !search ||
      `${o.year} ${o.make} ${o.model} ${o.title}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Selected vehicle */}
      {selected ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="relative aspect-[16/10] bg-[var(--color-surface-dark)] flex items-center justify-center">
            {selected.image ? (
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[var(--color-text-secondary)] text-sm">No image</span>
            )}
            {showRemove && (
              <button
                onClick={onRemove}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Remove vehicle"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="p-3">
            <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">
              {selected.year} {selected.make} {selected.model}
            </p>
            {selected.trim && (
              <p className="text-xs text-[var(--color-text-secondary)]">{selected.trim}</p>
            )}
          </div>
        </div>
      ) : (
        /* Empty slot — click to open search */
        <button
          onClick={() => setOpen(true)}
          className="w-full h-full min-h-[200px] border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]/50 transition-colors text-[var(--color-text-secondary)]"
        >
          <Search size={24} />
          <span className="text-sm">Select Vehicle {index + 1}</span>
        </button>
      )}

      {/* Dropdown search */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              setSearch("");
            }}
          />
          <div className="absolute top-0 left-0 right-0 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl max-h-[400px] flex flex-col">
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vehicles..."
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-[var(--color-text-secondary)] py-8">
                  No vehicles found
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.slug}
                    onClick={() => {
                      onSelect(o.slug);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-bg)] transition-colors text-left"
                  >
                    <div className="w-10 h-8 rounded bg-[var(--color-bg)] flex items-center justify-center overflow-hidden shrink-0">
                      {o.image ? (
                        <img src={o.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-[var(--color-text-secondary)]">img</span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--color-text-primary)] truncate">
                      {o.year} {o.make} {o.model}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-[var(--color-text-secondary)]">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<CompareVehicle[]>([]);
    const [options, setOptions] = useState<VehicleOption[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all available vehicles for the dropdown
  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CompareVehicle[]) => {
        const opts: VehicleOption[] = data.map((v: CompareVehicle) => ({
          slug: v.slug,
          title: v.title,
          year: v.year,
          make: v.make,
          model: v.model,
          image: v.image || "",
        }));
        setOptions(opts);
      })
      .catch(() => {
        // Fallback: use placeholder data
        const fallback: VehicleOption[] = [
          { slug: "porsche-911e", title: "1971 Porsche 911E", year: 1971, make: "Porsche", model: "911E", image: "/images/placeholder-porsche-911e.svg" },
          { slug: "mercedes-230sl", title: "1967 Mercedes-Benz 230SL Pagoda", year: 1967, make: "Mercedes-Benz", model: "230SL", image: "/images/placeholder-mercedes-230sl.svg" },
          { slug: "porsche-911-carrera-rs", title: "1973 Porsche 911 Carrera RS 2.7", year: 1973, make: "Porsche", model: "911 Carrera RS", image: "/images/placeholder-porsche-911-carrera-rs.svg" },
          { slug: "mercedes-280sl", title: "1969 Mercedes-Benz 280SL", year: 1969, make: "Mercedes-Benz", model: "280SL", image: "/images/placeholder-mercedes-280sl.svg" },
        ];
        setOptions(fallback);
      });
  }, []);

  // Load vehicles from slugs
  const loadVehicles = useCallback(async (slugs: string[]) => {
    if (slugs.length === 0) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/vehicles");
      const allVehicles: CompareVehicle[] = await response.json();
      const matched = allVehicles.filter((v) => slugs.includes(v.slug));
      setVehicles(matched);
    } catch {
      // Fallback
      const fallback: Record<string, CompareVehicle> = {
        "porsche-911e": {
          slug: "porsche-911e", title: "1971 Porsche 911E", year: 1971, make: "Porsche", model: "911E",
          trim: "Coupe", mileage: 3742, mileageUnit: "mi", exteriorColor: "Albert Blue",
          interiorColor: "Beige Leatherette", engine: "2.2L Flat-6 (1991cc)", transmission: "5-Speed Manual",
          drivetrain: "Rear-Wheel Drive", price: "USD 425,000", city: "Munich", country: "Germany",
          image: "/images/placeholder-porsche-911e.svg",
        },
        "mercedes-230sl": {
          slug: "mercedes-230sl", title: "1967 Mercedes-Benz 230SL Pagoda", year: 1967, make: "Mercedes-Benz", model: "230SL",
          trim: "Pagoda", mileage: 12450, mileageUnit: "mi", exteriorColor: "Silver",
          interiorColor: "Red Leather", engine: "2.3L Inline-6", transmission: "4-Speed Manual",
          drivetrain: "Rear-Wheel Drive", price: "USD 180,000", city: "Dubai", country: "United Arab Emirates",
          image: "/images/placeholder-mercedes-230sl.svg",
        },
        "porsche-911-carrera-rs": {
          slug: "porsche-911-carrera-rs", title: "1973 Porsche 911 Carrera RS 2.7", year: 1973, make: "Porsche", model: "911 Carrera RS",
          trim: "2.7", mileage: 28500, mileageUnit: "mi", exteriorColor: "Grand Prix Red",
          interiorColor: "Black Leatherette", engine: "2.7L Flat-6 (210 hp)", transmission: "5-Speed Manual",
          drivetrain: "Rear-Wheel Drive", price: "POA", city: "Stuttgart", country: "Germany",
          image: "/images/placeholder-porsche-911-carrera-rs.svg",
        },
        "mercedes-280sl": {
          slug: "mercedes-280sl", title: "1969 Mercedes-Benz 280SL", year: 1969, make: "Mercedes-Benz", model: "280SL",
          trim: null, mileage: 82300, mileageUnit: "mi", exteriorColor: "White",
          interiorColor: "Blue MB-Tex", engine: "2.8L Inline-6", transmission: "Automatic",
          drivetrain: "Rear-Wheel Drive", price: "USD 145,000", city: "Cairo", country: "Egypt",
          image: "/images/placeholder-mercedes-280sl.svg",
        },
      };
      const matched = slugs.map((s) => fallback[s]).filter(Boolean);
      setVehicles(matched);
    } finally {
      setLoading(false);
    }
  }, []);

  // Read slugs from URL
  useEffect(() => {
    const slugsParam = searchParams.get("slugs");
    if (slugsParam) {
      const slugs = slugsParam.split(",").filter(Boolean);
      setSelectedSlugs(slugs);
      loadVehicles(slugs);
    } else {
      setLoading(false);
    }
  }, [searchParams, loadVehicles]);

  const handleSelect = (slug: string) => {
    const newSlugs = [...selectedSlugs, slug];
    setSelectedSlugs(newSlugs);
    router.push(`/compare?slugs=${newSlugs.join(",")}`, { scroll: false });
  };

  const handleRemove = (index: number) => {
    const newSlugs = selectedSlugs.filter((_, i) => i !== index);
    setSelectedSlugs(newSlugs);
    if (newSlugs.length === 0) {
      router.push("/compare", { scroll: false });
    } else {
      router.push(`/compare?slugs=${newSlugs.join(",")}`, { scroll: false });
    }
  };

  const differences = computeDifferences(vehicles);
  const maxVehicles = 3;

  return (
    <div className="container-page py-10 md:py-14">
      {/* Breadcrumb */}
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Vehicles
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
            Compare Vehicles
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Select up to 3 vehicles to compare side by side
          </p>
        </div>
        {vehicles.length > 0 && (
          <button
            onClick={() => {
              setSelectedSlugs([]);
              setVehicles([]);
              router.push("/compare", { scroll: false });
            }}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
          >
            <X size={16} /> Clear All
          </button>
        )}
      </div>

      {/* Vehicle Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[0, 1, 2].map((i) => (
          <VehicleSelector
            key={i}
            index={i}
            selected={vehicles[i] || null}
            options={options.filter((o) => !selectedSlugs.includes(o.slug) || o.slug === selectedSlugs[i])}
            onSelect={handleSelect}
            onRemove={() => handleRemove(i)}
            showRemove={!!vehicles[i] && selectedSlugs.length > 1}
          />
        ))}
      </div>

      {/* Comparison Table */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {COMPARE_ROWS.map((row) => (
            <div
              key={row.key}
              className="h-12 rounded bg-[var(--color-surface)] border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : vehicles.length < 2 ? (
        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
          <Shuffle size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
            Select at least 2 vehicles
          </h3>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
            Use the selectors above to choose 2 or 3 vehicles and see a detailed comparison.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-4 pr-4 w-40">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Specification
                  </span>
                </th>
                {vehicles.map((v, i) => (
                  <th key={v.slug} className="pb-4 px-3 text-center">
                    <Link
                      href={`/vehicles/${v.slug}`}
                      className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {v.year} {v.make}
                      <br />
                      {v.model}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => {
                const isDifferent = differences.get(row.key) ?? false;
                const values = vehicles.map((v) => row.render(v));

                return (
                  <tr key={row.key} className="border-t border-[var(--color-border)]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {row.icon && (() => {
                          const Icon = row.icon;
                          return <Icon size={14} className="text-[var(--color-accent)] shrink-0" />;
                        })()}
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {row.label}
                        </span>
                        {isDifferent && (
                          <ArrowUpDown size={12} className="text-[var(--color-accent)] shrink-0" />
                        )}
                      </div>
                    </td>
                    {values.map((val, i) => (
                      <td
                        key={i}
                        className={`py-3 px-3 text-center text-sm ${
                          isDifferent
                            ? "bg-[var(--color-accent)]/5 font-medium text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Vehicle links */}
      {vehicles.length >= 2 && (
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {vehicles.map((v) => (
            <Link
              key={v.slug}
              href={`/vehicles/${v.slug}`}
              className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 rounded-lg text-sm text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              <span>View {v.year} {v.make} {v.model}</span>
              <ArrowLeft size={14} className="rotate-180" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}