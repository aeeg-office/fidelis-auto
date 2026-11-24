import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/notifications";
import { getClientIp } from "@/lib/request-ip";
import crypto from "crypto";

// Per-IP sliding-window rate limit: max 5 resend attempts per 15 minutes.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// In-process sliding window (resets on server restart) — same pattern as /api/contact.
const ipHits = new Map<string, number[]>();

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

export async function POST(request: Request) {
  try {
    const email: unknown = (await request.json().catch(() => null))?.email;
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Per-IP sliding-window rate limit (abuse control; unrelated to account existence).
    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Anti-enumeration: return the SAME success response whether or not an account
    // exists. A probe can never tell "no account" apart from "code sent".
    if (user) {
      const code = crypto.randomInt(100000, 999999).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationCode: code, verificationCodeExpiry: expiry },
      });
      try {
        await sendVerificationCode(email, code);
      } catch (sendErr) {
        // A delivery failure must not let an attacker infer the account exists.
        console.error("Resend send failed:", sendErr);
      }
    }

    return NextResponse.json({ ok: true, message: "Code resent." });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}