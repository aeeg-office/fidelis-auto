import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleLandingPath, type AccountRole } from "@/lib/authorization";
import { verifyPassword, createUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email first.", needsVerification: true, email: user.email }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createUserSession(user.id);
    return NextResponse.json({
      ok: true,
      name: user.name,
      role: user.role,
      redirectPath: roleLandingPath(user.role as AccountRole),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}