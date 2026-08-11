import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { type AccountRole, isRoleAtLeast } from "@/lib/authorization";
import { createOpaqueSessionToken, hashSessionToken } from "@/lib/session-token";

const SESSION_COOKIE = "fidelis_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createUserSession(userId: string) {
  const token = createOpaqueSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.authSession.create({
    data: { userId, tokenHash: hashSessionToken(token), expiresAt },
  });

  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function getCurrentUser(): Promise<SessionUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.authSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  void prisma.authSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  }).catch(() => undefined);

  return session.user;
}

export async function getUserId(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(minimumRole: AccountRole) {
  const user = await requireUser();
  if (!isRoleAtLeast(user.role as AccountRole, minimumRole)) redirect("/dashboard");
  return user;
}

export async function logoutUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.authSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }
  (await cookies()).delete(SESSION_COOKIE);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
