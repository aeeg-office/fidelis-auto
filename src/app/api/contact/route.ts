import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";
import { decidePhoneGate } from "@/lib/phone-gate";
import { getCurrentUser } from "@/lib/user-auth";

// Anti-spam configuration
const HONEYPOT_FIELD = "website";
const RATE_LIMIT_MAX = 4;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-IP sliding-window rate limiting (in-process Map; resets on server restart).
const ipHits = new Map<string, number[]>();

// Returns true if the IP has exceeded the limit; otherwise records the hit.
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

// Strip control characters (keeps line breaks out of single-line fields).
const stripControl = (s: string): string => s.replace(/[\u0000-\u001F\u007F]/g, "");

// POST /api/contact — persist an inquiry and email the vehicle owner (WS-D)
// Delivery: routes to the listing owner's email; falls back to ADMIN_EMAIL when
// no vehicle/owner is associated. Reply-To points back at the inquirer. The
// delivery outcome is recorded on the Inquiry row (emailStatus/emailError).
export async function POST(request: Request) {
  // WS2 phone-verified gate (OFF by default until an Egyptian OTP e2e passes — see phone-gate.ts).
  // decidePhoneGate returns allowed:true with reason "gate-disabled" when the switch is off.
  const currentUser = await getCurrentUser();
  const gate = decidePhoneGate(currentUser ? { id: currentUser.id, phoneVerified: currentUser.phoneVerified } : null);
  if (!gate.allowed) {
    const msg = gate.reason === "phone-not-verified"
      ? "Please verify your phone number to contact sellers."
      : "You must be signed in to contact sellers.";
    return NextResponse.json({ ok: false, error: msg }, { status: gate.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Please check your message and try again." },
      { status: 400 }
    );
  }

  // Honeypot: invisible field, left blank by humans. If it carries any value,
  // treat as a bot and silently accept (200) without emailing or persisting.
  const honey = body[HONEYPOT_FIELD];
  if (typeof honey === "string" && honey.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Per-IP sliding-window rate limit.
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait." },
      { status: 429 }
    );
  }

  // Trim and strip control characters from all inputs.
  const name = typeof body.name === "string" ? stripControl(body.name).trim() : "";
  const email = typeof body.email === "string" ? stripControl(body.email).trim() : "";
  const phone = typeof body.phone === "string" ? stripControl(body.phone).trim() : "";
  const message = typeof body.message === "string" ? stripControl(body.message).trim() : "";
  const vehicleSlug = typeof body.vehicleSlug === "string" && body.vehicleSlug ? body.vehicleSlug : undefined;

  // Validation: name 2-100, email valid, message 10-3000, phone optional (≤30).
  if (
    name.length < 2 ||
    name.length > 100 ||
    !EMAIL_RE.test(email) ||
    message.length < 10 ||
    message.length > 3000 ||
    (phone.length > 0 && phone.length > 30)
  ) {
    return NextResponse.json(
      { ok: false, error: "Please check your message and try again." },
      { status: 400 }
    );
  }

  // Resolve listing + owner (listing owner email wins; otherwise admin fallback)
  let vehicleId: string | null = null;
  let recipient = process.env.ADMIN_EMAIL || "aeeg.education@gmail.com";
  let subjectTitle = vehicleSlug ? String(vehicleSlug) : "Fidelis Auto";
  if (vehicleSlug) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug: vehicleSlug },
      select: { id: true, title: true, owner: { select: { email: true } } },
    });
    vehicleId = vehicle?.id ?? null;
    if (vehicle?.owner?.email) recipient = vehicle.owner.email;
    if (vehicle?.title) subjectTitle = vehicle.title;
  }

  // Persist the inquiry first. If this fails, nothing was saved — report 500.
  let inquiry;
  try {
    inquiry = await prisma.inquiry.create({
      data: {
        vehicleId,
        name,
        email,
        phone: phone || null,
        message,
        source: vehicleSlug ? "vehicle-inquiry" : "contact-form",
      },
    });
  } catch (persistError) {
    console.error("[CONTACT] Inquiry persistence failed:", persistError);
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 }
    );
  }

  // Send email via Resend, reply-to = inquirer so the owner can reply directly.
  // Email errors are logged but never break the (already-persisted) response.
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

  // Record delivery outcome on the inquiry row (never masks a persisted inquiry).
  try {
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { emailStatus, emailError },
    });
  } catch (outcomeError) {
    console.error("[CONTACT] Recording delivery outcome failed:", outcomeError);
  }

  return NextResponse.json({
    ok: true,
    recipient: recipient.replace(/(.{2}).*(@.*)/, "$1***$2"),
    emailStatus,
  });
}