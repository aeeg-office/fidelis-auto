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

    // Atomic consume: verify ONLY when code matches, is unexpired, attempts < MAX, and the account
    // is still unverified. One conditional updateMany = no read-then-write race and bounded guesses.
    const ok = await prisma.user.updateMany({
      where: {
        id: user.id,
        phoneVerified: false,
        phoneVerificationCode: trimmed,
        phoneVerificationCodeExpiry: { gt: now },
        phoneOtpAttempts: { lt: MAX_OTP_ATTEMPTS },
      },
      data: { phoneVerified: true, phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
    });

    if (ok.count === 1) {
      return NextResponse.json({ ok: true, message: "Phone verified." });
    }

    // Not verified: atomically count the failed attempt against a LIVE challenge (unverified,
    // unexpired, under the cap) so surprise guesses cannot inflate the counter. On reaching MAX,
    // invalidate the challenge so further guesses are impossible. Expected message differs by why
    // the consume failed — determined below after the atomic increment.
    const failed = await prisma.user.updateMany({
      where: {
        id: user.id,
        phoneVerified: false,
        phoneVerificationCodeExpiry: { gt: now },
        phoneOtpAttempts: { lt: MAX_OTP_ATTEMPTS },
      },
      data: { phoneOtpAttempts: { increment: 1 } },
    });

    if (failed.count === 1) {
      const latest = await prisma.user.findUnique({
        where: { id: user.id },
        select: { phoneOtpAttempts: true, phoneOtpSentDay: true },
      });
      const attempts = latest?.phoneOtpAttempts ?? 0;
      if (attempts >= MAX_OTP_ATTEMPTS) {
        // Exhausted: invalidate the challenge durably.
        await prisma.user.updateMany({
          where: { id: user.id, phoneVerified: false, phoneVerificationCode: trimmed },
          data: { phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
        });
        return NextResponse.json({ error: "Too many failed attempts. Request a new code." }, { status: 429 });
      }
      return NextResponse.json({ error: "Wrong code" }, { status: 400 });
    }

    // No live challenge matched (wrong/expired/invalidated or already gone).
    return NextResponse.json({ error: "Code expired. Request a new code." }, { status: 400 });
  } catch (error) {
    console.error("Phone verify error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}