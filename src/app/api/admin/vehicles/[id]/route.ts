import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { isFeatured, featuredUntil } = body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        isFeatured: typeof isFeatured === "boolean" ? isFeatured : undefined,
      },
    });

    return NextResponse.json({ ok: true, isFeatured: vehicle.isFeatured });
  } catch (error) {
    console.error("Vehicle update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}