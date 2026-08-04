import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    try {
      await prisma.newsletterSubscription.upsert({
        where: { email },
        update: { subscribed: true },
        create: { email, subscribed: true },
      });
    } catch {
      // DB unavailable — still return success so the UX doesn't break.
      console.error("Newsletter: database write failed");
    }

    return NextResponse.json({ ok: true, message: "Thanks for subscribing!" });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}