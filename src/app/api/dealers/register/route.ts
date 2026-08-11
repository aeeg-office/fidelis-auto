import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { validateDealerRegistration } from "@/lib/registration";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to register a dealership." }, { status: 401 });

  try {
    const validation = validateDealerRegistration(await request.json());
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

    const existing = await prisma.dealerProfile.findUnique({ where: { ownerId: user.id } });
    if (existing) {
      return NextResponse.json({ error: "A dealer application already exists for this account." }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.dealerProfile.create({ data: { ownerId: user.id, ...validation.value } }),
      prisma.user.update({
        where: { id: user.id },
        data: { role: user.role === "BUYER" ? "SELLER" : user.role },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Your dealer application is pending administrator approval.",
    });
  } catch (error) {
    console.error("Dealer registration error:", error);
    return NextResponse.json({ error: "Unable to submit dealer application." }, { status: 500 });
  }
}
