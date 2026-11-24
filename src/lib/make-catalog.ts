import { MAKES, dedupeMakes, type MakeEntry } from "./car-data";
import type { TaxonomyMake } from "./taxonomy-types";

export type VehicleTypeFilter = "CAR" | "MOTORCYCLE" | null;

/** Parse the `?type=` query value; anything other than CAR/MOTORCYCLE means "all". */
export function parseVehicleTypeParam(value: string | null | undefined): VehicleTypeFilter {
  const v = value?.trim().toUpperCase();
  return v === "CAR" || v === "MOTORCYCLE" ? v : null;
}

/**
 * Build the make catalog served by /api/makes.
 *
 * - Primary source: the DB taxonomy (Chinese brands sold in Egypt + motorcycle makes).
 * - Fallback when the DB taxonomy is empty/unavailable: the legacy static list,
 *   cars only — never fabricate motorcycle makes.
 * - Optional type filter; duplicates collapse case/space-insensitively.
 */
export function buildMakeCatalog(dbMakes: readonly TaxonomyMake[], type: VehicleTypeFilter): MakeEntry[] {
  let entries: MakeEntry[] =
    dbMakes.length > 0
      ? dbMakes.map((m) => ({ make: m.name, models: [...m.models], vehicleType: m.vehicleType }))
      : MAKES.map((m) => ({ ...m, vehicleType: "CAR" as const }));

  if (type) entries = entries.filter((m) => (m.vehicleType ?? "CAR") === type);
  return dedupeMakes(entries);
}
