import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const { email, code, phoneCode } = await request.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify email code
    if (code) {
      if (user.verified) return NextResponse.json({ error: "Email already verified" }, { status: 400 });
      if (!user.verificationCode || !user.verificationCodeExpiry)
        return NextResponse.json({ error: "No code found. Register again." }, { status: 400 });
      if (user.verificationCode !== code)
        return NextResponse.json({ error: "Invalid email code" }, { status: 400 });
      if (new Date() > user.verificationCodeExpiry)
        return NextResponse.json({ error: "Email code expired." }, { status: 400 });

      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, verificationCode: null, verificationCodeExpiry: null },
      });

      // Create session
      await createUserSession(user.id);
    }

    // Verify phone code (standalone or combined)
    if (phoneCode) {
      if (user.phoneVerified) return NextResponse.json({ error: "Phone already verified" }, { status: 400 });
      if (!user.phoneVerificationCode || !user.phoneVerificationCodeExpiry)
        return NextResponse.json({ error: "No phone code found." }, { status: 400 });
      if (user.phoneVerificationCode !== phoneCode)
        return NextResponse.json({ error: "Invalid phone code" }, { status: 400 });
      if (new Date() > user.phoneVerificationCodeExpiry)
        return NextResponse.json({ error: "Phone code expired." }, { status: 400 });

      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
      });

      // Create session if not already
      if (!user.verified) await createUserSession(user.id);
    }

    return NextResponse.json({ ok: true, message: "Verified successfully." });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}