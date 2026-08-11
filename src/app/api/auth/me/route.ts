import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(null, { status: 401 });
  return NextResponse.json({
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    city: user.city,
    role: user.role,
  });
}
