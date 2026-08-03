import { NextResponse } from "next/server";
import { MAKES } from "@/lib/car-data";

export async function GET() {
  return NextResponse.json(MAKES);
}