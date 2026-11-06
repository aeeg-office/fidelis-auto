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

const DAILY_PHONE_LIMIT = 5;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const IP_SEND_LIMIT = 10; // durable per-IP sends per hour (DB-backed, survives restarts/multi-worker)

async function durableIpQuotaOk(ip: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(Date.now() - IP_WINDOW_MS);
  const rec = await prisma.otpIpCounter.findUnique({ where: { ip } });
  if (!rec) return true;
  if (rec.windowStart < windowStart) return true; // stale window -> reset
  return rec.count < IP_SEND_LIMIT;
}

async function durableIpRecord(ip: string): Promise<void> {
  const now = new Date();
  const windowStart = new Date(Date.now() - IP_WINDOW_MS);
  // Read-then-write inside a transaction: if the stored window is stale, start a fresh count (1),
  // else increment. This keeps the hour-window reset correct across restarts and multi-worker.
  await prisma.$transaction(async (tx) => {
    const rec = await tx.otpIpCounter.findUnique({ where: { ip } });
    if (!rec || rec.windowStart < windowStart) {
      await tx.otpIpCounter.upsert({
        where: { ip },
        update: { count: 1, windowStart, updatedAt: now },
        create: { ip, windowStart, count: 1, updatedAt: now },
      });
    } else {
      await tx.otpIpCounter.update({
        where: { ip },
        data: { count: { increment: 1 }, updatedAt: now },
      });
    }
  }).catch(() => undefined);
}

/** True if the user's durable daily per-phone send count is still under the cap (reset daily). */
async function durablePhoneQuotaOk(userId: string): Promise<boolean> {
  const now = new Date();
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { phoneOtpSentCount: true, phoneOtpSentDay: true } });
  if (!u) return false;
  if (!u.phoneOtpSentDay) return true;
  // Same calendar day? Compare date (not time).
  const sameDay = u.phoneOtpSentDay.toDateString() === now.toDateString();
  if (!sameDay) return true; // stale bucket -> allow (reset happens on record)
  return (u.phoneOtpSentCount ?? 0) < DAILY_PHONE_LIMIT;
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

    // Durable DB-backed quotas first (survive restart / multi-worker).
    if (!(await durableIpQuotaOk(ip))) {
      return NextResponse.json({ error: "Too many requests from your network. Try again later." }, { status: 429 });
    }
    if (!(await durablePhoneQuotaOk(user.id))) {
      return NextResponse.json({ error: "Max SMS codes for today reached. Try again tomorrow." }, { status: 429 });
    }

    // Fast in-memory limiter (1/min + 5/day per phone; 1h per-IP) as a complement.
    const decision: OtpDecision = rateLimiter.allow(normalized, ip);
    if (!decision.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later.", retryAfterSeconds: decision.retryAfterSeconds },
        { status: 429 },
      );
    }

    // Commit durable counters (per-IP window; daily per-phone + reset OTP attempt counter).
    await durableIpRecord(ip);
    rateLimiter.record(normalized, ip);
    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: normalized,
        phoneVerificationCode: null, // invalidate any prior code so a fresh one is required
        phoneVerificationCodeExpiry: null,
        phoneOtpAttempts: 0, // reset guess counter on a fresh code
        phoneOtpSentCount: user.phoneOtpSentDay && user.phoneOtpSentDay.toDateString() === now.toDateString()
          ? { increment: 1 }
          : 1,
        phoneOtpSentDay: now,
      },
    });

    const code = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerificationCode: code, phoneVerificationCodeExpiry: expiry },
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