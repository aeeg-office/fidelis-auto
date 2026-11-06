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

    // Enforce the attempt limit durably BEFORE consuming (prevents unlimited brute-force guesses).
    if ((user.phoneOtpAttempts ?? 0) >= MAX_OTP_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerificationCode: null, phoneVerificationCodeExpiry: null, phoneOtpAttempts: 0 },
      }).catch(() => undefined);
      return NextResponse.json({ error: "Too many failed attempts. Request a new code." }, { status: 429 });
    }

    // Atomic, phone-bound consumption: compare the stored (user-id, code, expiry) in a single
    // conditional update so a concurrent send-code cannot race us into verifying a restored phone.
    const now = new Date();
    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        phoneVerificationCode: code,
        phoneVerificationCodeExpiry: { gt: now },
      },
      data: { phoneVerified: true, phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
    });

    if (result.count === 0) {
      // Wrong code (or expired) — increment durable attempts. Expired is treated as a failed try.
      const latest = await prisma.user.findUnique({ where: { id: user.id }, select: { phoneOtpAttempts: true, phoneVerificationCode: true, phoneVerificationCodeExpiry: true } });
      const attempts = (latest?.phoneOtpAttempts ?? 0) + 1;
      await prisma.user.update({ where: { id: user.id }, data: { phoneOtpAttempts: attempts } }).catch(() => undefined);
      const wrongCode = latest && latest.phoneVerificationCode === code && latest.phoneVerificationCodeExpiry && latest.phoneVerificationCodeExpiry > now;
      return NextResponse.json(
        { error: wrongCode ? "Wrong code" : "Code expired. Request a new code." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, message: "Phone verified." });
  } catch (error) {
    console.error("Phone verify error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}