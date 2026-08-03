import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/user-auth";
import { sendVerificationCode, sendSmsCode } from "@/lib/notifications";
import crypto from "crypto";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return "Password must contain at least one symbol.";
  return null;
}

function validatePhone(phone: string): string | null {
  if (!phone.startsWith("+")) return "Phone must include country code (e.g., +201234567890).";
  if (phone.length < 8 || phone.length > 16) return "Invalid phone number length.";
  return null;
}

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "All fields required (name, email, password, phone)" }, { status: 400 });
    }

    const phoneError = validatePhone(phone);
    if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });

    const passwordError = validatePassword(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const emailCode = crypto.randomInt(100000, 999999).toString();
    const phoneCode = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.create({
      data: {
        name, email, passwordHash, phone,
        verificationCode: emailCode,
        verificationCodeExpiry: expiry,
        phoneVerificationCode: phoneCode,
        phoneVerificationCodeExpiry: expiry,
      },
    });

    // Send both codes
    await sendVerificationCode(email, emailCode);
    await sendSmsCode(phone, phoneCode);

    return NextResponse.json({
      ok: true,
      message: "Verification codes sent to email and phone.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}