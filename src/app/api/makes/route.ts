import { NextResponse } from "next/server";
import { MAKES, dedupeMakes } from "@/lib/car-data";

// Server-side case/space-insensitive dedupe (source array is already deduped via
// dedupeMakes at definition, but re-apply here so the API contract never returns
// duplicate makes — "BMW" / "bmw" / "BMW " collapse to one entry). Ordering is
// preserved (first occurrence wins, source list is alphabetical).
export async function GET() {
  return NextResponse.json(dedupeMakes(MAKES));
}
