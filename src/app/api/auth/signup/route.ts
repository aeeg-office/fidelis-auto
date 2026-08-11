import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/user-auth";
import { sendVerificationCode } from "@/lib/notifications";
import { normalizeRegistration, validateRegistration } from "@/lib/registration";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const validation = validateRegistration(input);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const registration = normalizeRegistration(input);
    const existing = await prisma.user.findUnique({ where: { email: registration.email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await hashPassword(registration.password);
    const emailCode = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.create({
      data: {
        name: `${registration.firstName} ${registration.lastName}`,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        phone: registration.phone,
        country: registration.country,
        city: registration.city,
        passwordHash,
        verificationCode: emailCode,
        verificationCodeExpiry: expiry,
      },
    });

    await sendVerificationCode(registration.email, emailCode);
    return NextResponse.json({ ok: true, message: "Verification code sent to email." });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
