import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fidelis2026";

export async function createSession() {
  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");
  (await cookies()).set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24,
  });
}

export async function verifySession(): Promise<boolean> {
  const session = (await cookies()).get("admin_session");
  if (!session) return false;

  const expected = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");
  return session.value === expected;
}

export async function requireAdmin() {
  const isAuth = await verifySession();
  if (!isAuth) {
    redirect("/admin/login");
  }
}