import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // In Phase 1, log the inquiry (DB integration in Phase 2)
    console.log(`[INQUIRY] ${name} (${email}${phone ? ", " + phone : ""}): ${message}`);

    // TODO Phase 2: Persist to Inquiry table + send email via Resend

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}