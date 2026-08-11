import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use the universal login. Access is granted according to the authenticated account role." },
    { status: 410 }
  );
}
