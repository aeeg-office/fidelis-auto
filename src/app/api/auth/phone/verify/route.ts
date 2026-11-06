import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.phoneVerified) return NextResponse.json({ error: "Phone already verified" }, { status: 400 });

    const { code } = await request.json();
    if (!code || typeof code !== "string") return NextResponse.json({ error: "Code is required" }, { status: 400 });

    if (!user.phoneVerificationCode || !user.phoneVerificationCodeExpiry) {
      return NextResponse.json({ error: "No code found. Request a new code first." }, { status: 400 });
    }
    if (user.phoneVerificationCode !== code) {
      return NextResponse.json({ error: "Wrong code" }, { status: 400 });
    }
    if (new Date() > user.phoneVerificationCodeExpiry) {
      return NextResponse.json({ error: "Code expired. Request a new code." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true, phoneVerificationCode: null, phoneVerificationCodeExpiry: null },
    });

    return NextResponse.json({ ok: true, message: "Phone verified." });
  } catch (error) {
    console.error("Phone verify error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}