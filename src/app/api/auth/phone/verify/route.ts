import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.phoneVerified) return NextResponse.json({ error: "Phone already verified" }, { status: 400 });

    const { code } = await request.json();
    if (!code || typeof code !== "string") return NextResponse.json({ error: "Code is required" }, { status: 400 });
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    const now = new Date();

    // RESERVE an attempt FIRST (atomic conditional increment) so concurrent guesses cannot all
    // "pass" the later code comparison before budget runs out. Reservation only succeeds while the
    // challenge is live (unverified + unexpired) and attempts < MAX — so the guess budget is
    // enforced atomically regardless of how many requests race in.
    const reserve = await prisma.user.updateMany({
      where: {
        id: user.id,
        phoneVerified: false,
        phoneVerificationCodeExpiry: { gt: now },
        phoneOtpAttempts: { lt: MAX_OTP_ATTEMPTS },
      },
      data: { phoneOtpAttempts: { increment: 1 } },
    });
    if (reserve.count !== 1) {
      // No live challenge slot: either exhausted or expired. Invalidate if at/over the cap.
      const latest = await prisma.user.findUnique({
        where: { id: user.id },
        select: { phoneOtpAttempts: true, phoneVerificationCodeExpiry: true },
      });
      const overCap = (latest?.phoneOtpAttempts ?? 0) >= MAX_OTP_ATTEMPTS;
      if (overCap) {
        await prisma.user.updateMany({
          where: { id: user.id, phoneVerified: false },
          data: { phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
        });
        return NextResponse.json({ error: "Too many failed attempts. Request a new code." }, { status: 429 });
      }
      return NextResponse.json({ error: "Code expired. Request a new code." }, { status: 400 });
    }

    // We own a reserved guess slot. Atomically verify if-and-only-if the code matches and is still
    // unexpired (it may have been re-issued/cleared by a concurrent send-code; that is safe).
    const consumed = await prisma.user.updateMany({
      where: {
        id: user.id,
        phoneVerified: false,
        phoneVerificationCode: trimmed,
        phoneVerificationCodeExpiry: { gt: now },
      },
      data: { phoneVerified: true, phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
    });

    if (consumed.count === 1) {
      return NextResponse.json({ ok: true, message: "Phone verified." });
    }

    // Wrong code (or it was re-issued). The reserved attempt stands as charged. Report wrong-code.
    const latest = await prisma.user.findUnique({
      where: { id: user.id },
      select: { phoneOtpAttempts: true },
    });
    if ((latest?.phoneOtpAttempts ?? 0) >= MAX_OTP_ATTEMPTS) {
      await prisma.user.updateMany({
        where: { id: user.id, phoneVerified: false },
        data: { phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
      });
      return NextResponse.json({ error: "Too many failed attempts. Request a new code." }, { status: 429 });
    }
    return NextResponse.json({ error: "Wrong code" }, { status: 400 });
  } catch (error) {
    console.error("Phone verify error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}