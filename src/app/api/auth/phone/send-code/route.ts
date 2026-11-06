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

const IP_WINDOW_MS = 60 * 60 * 1000; // durable per-IP window (1 hour)
const IP_SEND_LIMIT = 10; // durable per-IP sends per hour
const DAILY_PHONE_LIMIT = 5; // durable per-phone-per-day sends (keyed by number, not account)

/** Local calendar day "YYYY-MM-DD" used to key the daily per-phone counter. */
function localDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Atomically check-and-increment the durable per-IP window (hourly cap; survives restart/multi-worker).
 * Uses a single conditional `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE count < limit RETURNING`,
 * which is atomic under any isolation level — a concurrent duplicate can never overshoot the cap.
 * A stale window self-resets by re-keying the row to the new window with count 1 (we delete expired
 * rows on read so a fresh window always starts at 1). Returns true when a send is allowed.
 */
async function durableIpQuota(ip: string, now: Date): Promise<boolean> {
  const cutoff = new Date(now.getTime() - IP_WINDOW_MS);
  // Prune expired windows (best-effort; if missing the atomically-decremented upsert still guards).
  await prisma.otpIpCounter.deleteMany({ where: { windowStart: { lt: cutoff } } }).catch(() => undefined);

  const rows: { allowed: boolean }[] = await prisma.$queryRaw`
    INSERT INTO "OtpIpCounter" ("ip", "windowStart", "count", "updatedAt")
    VALUES (${ip}, ${now}, 1, ${now})
    ON CONFLICT ("ip") DO UPDATE
      SET "count" = "OtpIpCounter"."count" + 1,
          "updatedAt" = ${now}
      WHERE "OtpIpCounter"."count" < ${IP_SEND_LIMIT}
    RETURNING ("count" <= ${IP_SEND_LIMIT}) AS "allowed"
  `;
  return rows.length === 1;
}

/** Atomic conditional increment for the per-PHONE-per-day cap (keyed by the phone NUMBER). */
async function durablePhoneQuota(phone: string, now: Date): Promise<boolean> {
  const day = localDay(now);
  const rows: { allowed: boolean }[] = await prisma.$queryRaw`
    INSERT INTO "OtpPhoneDaily" ("phone", "day", "count")
    VALUES (${phone}, ${day}, 1)
    ON CONFLICT ("phone", "day") DO UPDATE
      SET "count" = "OtpPhoneDaily"."count" + 1
      WHERE "OtpPhoneDaily"."count" < ${DAILY_PHONE_LIMIT}
    RETURNING ("count" <= ${DAILY_PHONE_LIMIT}) AS "allowed"
  `;
  return rows.length === 1;
}

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

    const ip = getClientIp(request);
    const now = new Date();

    // Durable DB-backed quotas (survive restart / multi-worker; atomic check-and-increment).
    if (!(await durableIpQuota(ip, now))) {
      return NextResponse.json({ error: "Too many requests from your network. Try again later." }, { status: 429 });
    }
    if (!(await durablePhoneQuota(normalized, now))) {
      return NextResponse.json({ error: "Max SMS codes for this number today reached. Try again tomorrow." }, { status: 429 });
    }

    // Fast in-memory limiter (1/min + 5/day per phone; 1h per-IP) as a complement.
    const decision: OtpDecision = rateLimiter.allow(normalized, ip);
    if (!decision.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later.", retryAfterSeconds: decision.retryAfterSeconds },
        { status: 429 },
      );
    }
    rateLimiter.record(normalized, ip);

    // Atomically store phone + code + expiry in ONE write, and only while the account is still
    // UNVERIFIED. This closes the race where a send-code could re-point an already-verified account's
    // phone (or pair a code with the wrong number). Guard via updateMany(phoneVerified:false).
    const code = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const update = await prisma.user.updateMany({
      where: { id: user.id, phoneVerified: false },
      data: {
        phone: normalized,
        phoneVerificationCode: code,
        phoneVerificationCodeExpiry: expiry,
        phoneOtpAttempts: 0, // reset the guess counter on a fresh challenge
        phoneOtpSentDay: now,
      },
    });
    if (update.count === 0) {
      // The account became verified between our check and the write — do not send.
      return NextResponse.json({ error: "Phone already verified" }, { status: 400 });
    }

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