import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, year, make, model, photoUrls } = body;

    if (!name || !email || !year || !make || !model) {
      return NextResponse.json({ error: "Name, email, year, make, and model are required." }, { status: 400 });
    }

    const listing = await prisma.listingRequest.create({
      data: {
        name, email, phone: body.phone || null,
        year: parseInt(year), make, model,
        trim: body.trim || null, mileage: body.mileage ? parseInt(body.mileage) : null,
        exteriorColor: body.exteriorColor || null, interiorColor: body.interiorColor || null,
        engine: body.engine || null, transmission: body.transmission || null,
        description: body.description || null,
        photoUrls: photoUrls ? JSON.stringify(photoUrls) : null,
      },
    });

    return NextResponse.json({ ok: true, id: listing.id });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}