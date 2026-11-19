import { prisma } from "@/lib/prisma";

/**
 * DB-driven taxonomy for the filter bar (spec WS1b / A7).
 *
 * Sources of truth, never invented:
 *  - Makes/models come from the Make/Model tables (seeded from cited sources,
 *    incl. Chinese brands sold in Egypt and motorcycle makes).
 *  - Countries/cities come from the Country/City tables. Only LIVE and
 *    EARLY-ACCESS countries advertise (Egypt live; UAE + Saudi early access).
 *  - Body types are the controlled BodyType enum (not free-text trim values).
 */

import { FILTER_BODY_TYPES as _FILTER_BODY_TYPES, type TaxonomyMake, type TaxonomyCountry } from "@/lib/taxonomy-types";
export type { TaxonomyMake, TaxonomyCountry };
export const FILTER_BODY_TYPES = _FILTER_BODY_TYPES;

export async function getFilterTaxonomy(): Promise<{
  makes: TaxonomyMake[];
  countries: TaxonomyCountry[];
}> {
  try {
    const makes = await prisma.make.findMany({
      where: { isActive: true },
      include: {
        models: { where: { isActive: true }, select: { nameEn: true }, orderBy: { nameEn: "asc" } },
      },
      orderBy: { nameEn: "asc" },
    });

    const countriesData = await prisma.country.findMany({
      where: {
        OR: [{ isLive: true }, { isEarlyAccess: true }],
      },
      include: {
        cities: { select: { nameEn: true }, orderBy: { nameEn: "asc" } },
      },
      orderBy: [{ isLive: "desc" }, { nameEn: "asc" }],
    });

    return {
      makes: makes.map((m) => ({
        name: m.nameEn,
        vehicleType: m.vehicleType,
        models: m.models.map((mm) => mm.nameEn),
      })),
      countries: countriesData.map((c) => ({
        name: c.nameEn,
        cities: c.cities.map((city) => city.nameEn),
      })),
    };
  } catch {
    // DB unavailable — fail closed to empty taxonomy (never fabricate).
    return { makes: [], countries: [] };
  }
}
