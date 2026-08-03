import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    if (!user.verificationCode || !user.verificationCodeExpiry) {
      return NextResponse.json({ error: "No verification code found. Please register again." }, { status: 400 });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (new Date() > user.verificationCodeExpiry) {
      return NextResponse.json({ error: "Verification code expired. Please register again." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    await createUserSession(user.id);

    return NextResponse.json({ ok: true, message: "Email verified successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}