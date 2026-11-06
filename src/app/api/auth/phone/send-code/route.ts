import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";
import { getCurrentUser } from "@/lib/user-auth";
import {
  normalizePhone,
  rateLimiter,
  phoneProviderEnabled,
  generateOtp,
  type OtpDecision,
} from "@/lib/phone-verification";
import { sendSmsCode } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.phoneVerified) return NextResponse.json({ error: "Phone already verified" }, { status: 400 });

    // Provider switch: when off/unconfigured, sending is disabled (fail-closed per §5).
    if (!phoneProviderEnabled()) {
      return NextResponse.json(
        { error: "Phone verification is not enabled yet.", providerDisabled: true },
        { status: 503 },
      );
    }

    const { phone } = await request.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }
    const normalized = normalizePhone(phone);
    if (!normalized) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });

    // Server-side abuse limits (1/min, 5/day per phone; per-IP cap).
    const decision: OtpDecision = rateLimiter.allow(normalized, getClientIp(request));
    if (!decision.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later.", retryAfterSeconds: decision.retryAfterSeconds },
        { status: 429 },
      );
    }

    // Dedupe per existing phone across users (one verified phone = one account is the intent; here we
    // allow re-verifying the current user only, so no cross-user conflict is possible at this step).
    rateLimiter.record(normalized, getClientIp(request));

    const code = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: normalized, phoneVerificationCode: code, phoneVerificationCodeExpiry: expiry },
    });

    const provider = (process.env.PHONE_PROVIDER || "off").toLowerCase();
    // Mock provider is for local/staging test only — simulate a successful send, no real SMS.
    if (provider === "mock") {
      return NextResponse.json({ ok: true, provider, mock: true });
    }

    // Real (twilio) delivery — never mistake mock for live SMS delivery (§5). Requires creds.
    const sent = await sendSmsCode(normalized, code);
    if (!sent) {
      return NextResponse.json(
        { error: "SMS sending is not available right now. Try again later.", smsUnavailable: true },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, provider });
  } catch (error) {
    console.error("Phone send-code error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}