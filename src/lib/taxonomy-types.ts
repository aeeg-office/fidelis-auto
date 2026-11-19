/**
 * Client-safe taxonomy types + controlled body-type list.
 *
 * This file MUST NOT import Prisma or any server-only module — it is consumed by
 * the client FilterBar component. All DB access lives in ./taxonomy.ts (server).
 */

export type TaxonomyMake = {
  name: string;
  vehicleType: "CAR" | "MOTORCYCLE";
  models: string[];
};

export type TaxonomyCountry = {
  name: string;
  cities: string[];
};

/** Controlled body types for the filter (mirrors the BodyType enum). */
export const FILTER_BODY_TYPES = [
  "SEDAN",
  "HATCHBACK",
  "SUV",
  "PICKUP",
  "VAN",
  "COUPE",
  "CONVERTIBLE",
  "WAGON",
  "MPV",
  "OTHER",
];