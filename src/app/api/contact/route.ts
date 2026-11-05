import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/contact — persist an inquiry and email the vehicle owner (WS-D)
// Delivery: routes to the listing owner's email; falls back to ADMIN_EMAIL when
// no vehicle/owner is associated. Reply-To points back at the inquirer. The
// delivery outcome is recorded on the Inquiry row (emailStatus/emailError).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, vehicleSlug, vehicleTitle } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    // Resolve listing + owner (listing owner email wins; otherwise admin fallback)
    let vehicleId: string | null = null;
    let recipient = process.env.ADMIN_EMAIL || "aeeg.education@gmail.com";
    let subjectTitle = vehicleSlug ? String(vehicleSlug) : "Fidelis Auto";
    if (typeof vehicleSlug === "string" && vehicleSlug) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { slug: vehicleSlug },
        select: { id: true, title: true, owner: { select: { email: true } } },
      });
      vehicleId = vehicle?.id ?? null;
      if (vehicle?.owner?.email) recipient = vehicle.owner.email;
      if (vehicle?.title) subjectTitle = vehicle.title;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        vehicleId,
        name,
        email,
        phone: phone || null,
        message,
        source: vehicleSlug ? "vehicle-inquiry" : "contact-form",
      },
    });

    // Send email via Resend, reply-to = inquirer so the owner can reply directly.
    let emailStatus: string | null = "sent";
    let emailError: string | null = null;
    const apiKey = process.env.RESEND_API_KEY || "";
    if (!apiKey) {
      console.error("[CONTACT] No RESEND_API_KEY configured — email not sent.");
      emailStatus = "failed";
      emailError = "RESEND_API_KEY not configured";
    } else {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.FIDELIS_EMAIL_FROM || "Fidelis Auto <no-reply@fidelis-auto.com>",
            to: recipient,
            replyTo: email,
            subject: `${name} — ${subjectTitle} inquiry via Fidelis Auto`,
            text: `You received a new inquiry about "${subjectTitle}" on Fidelis Auto.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}`,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("[CONTACT] Email send failed:", errText);
          emailStatus = "failed";
          emailError = errText.slice(0, 500);
        } else {
          const data = await res.json().catch(() => ({}));
          console.log(`[CONTACT] Email sent to ${recipient} | Resend id: ${(data as { id?: string }).id ?? "n/a"}`);
        }
      } catch (err) {
        console.error("[CONTACT] Email error:", err);
        emailStatus = "failed";
        emailError = String(err).slice(0, 500);
      }
    }

    // Record delivery outcome on the inquiry row.
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { emailStatus, emailError },
    });

    return NextResponse.json({ ok: true, recipient: recipient.replace(/(.{2}).*(@.*)/, "$1***$2"), emailStatus });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
