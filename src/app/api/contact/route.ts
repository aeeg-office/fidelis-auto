import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, vehicleSlug } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    // Persist the inquiry so it appears in the admin Inquiries module (FID-005).
    let vehicleId: string | null = null;
    if (typeof vehicleSlug === "string" && vehicleSlug) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { slug: vehicleSlug },
        select: { id: true },
      });
      vehicleId = vehicle?.id ?? null;
    }
    await prisma.inquiry.create({
      data: {
        vehicleId,
        name,
        email,
        phone: phone || null,
        message,
        source: "contact-form",
      },
    });

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fidelis Auto <aeeg.education@gmail.com>",
        to: "aeeg.education@gmail.com",
        subject: `${name} - Fidelis Auto - Contact Form Inquiry`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Email send failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}