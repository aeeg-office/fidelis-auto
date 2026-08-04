import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user-auth";

// ─── GET: check whether the vehicle is favorited ──
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ favorited: false });
    }

    const { slug } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: { userId_vehicleId: { userId, vehicleId: vehicle.id } },
    });

    return NextResponse.json({ favorited: Boolean(favorite) });
  } catch {
    return NextResponse.json({ favorited: false });
  }
}

// ─── POST: toggle a favorite ──
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to save favorites." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const desired = body?.favorited === true; // true = save, false = remove

    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_vehicleId: { userId, vehicleId: vehicle.id } },
    });

    let favorited: boolean;
    if (desired && !existing) {
      await prisma.favorite.create({ data: { userId, vehicleId: vehicle.id } });
      favorited = true;
    } else if (!desired && existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      favorited = false;
    } else {
      favorited = Boolean(existing);
    }

    return NextResponse.json({ favorited });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}