import { NextResponse } from "next/server";
import { getFilterTaxonomy } from "@/lib/taxonomy";
import { buildMakeCatalog, parseVehicleTypeParam } from "@/lib/make-catalog";

/**
 * GET /api/makes[?type=CAR|MOTORCYCLE]
 *
 * Source of truth is the DB taxonomy (Make/Model tables, seeded from
 * prisma/taxonomy-data.ts — includes the Chinese brands sold in Egypt and the
 * motorcycle makes). It is the same source the /vehicles filter bar uses
 * (spec WS1b / A7), so the Sell form and the browse filters cannot disagree.
 *
 * Response: MakeEntry[] = { make, models, vehicleType }, deduplicated.
 * If the DB taxonomy is unavailable, falls back to the legacy static car list
 * (see buildMakeCatalog).
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const type = parseVehicleTypeParam(new URL(request.url).searchParams.get("type"));
  const { makes } = await getFilterTaxonomy();
  return NextResponse.json(buildMakeCatalog(makes, type));
}
