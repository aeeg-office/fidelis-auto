import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode, sendSmsCode, callWithCode, sendWhatsAppCode } from "@/lib/notifications";
import crypto from "crypto";

// Resend email code
export async function POST(request: Request) {
  try {
    const { email, method } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.verified && user.phoneVerified) return NextResponse.json({ error: "Already verified" }, { status: 400 });

    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    if (method === "sms" || method === "whatsapp" || method === "call") {
      if (!user.phone) return NextResponse.json({ error: "No phone number on file" }, { status: 400 });

      // Update phone verification code
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerificationCode: code, phoneVerificationCodeExpiry: expiry },
      });

      if (method === "sms") await sendSmsCode(user.phone, code);
      else if (method === "whatsapp") await sendWhatsAppCode(user.phone, code);
      else await callWithCode(user.phone, code);

      return NextResponse.json({ ok: true, message: `Code sent via ${method}.` });
    }

    // Default: resend email code
    const newCount = user.emailResendCount + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: code, verificationCodeExpiry: expiry, emailResendCount: newCount },
    });

    await sendVerificationCode(email, code);

    return NextResponse.json({
      ok: true,
      message: "Code resent.",
      attempt: newCount,
      canCall: newCount >= 2,
    });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}