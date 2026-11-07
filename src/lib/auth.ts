import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  type AccountRole,
  type Permission,
  can,
  isAdminRole,
  isRoleAtLeast,
} from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";

export async function verifySession(): Promise<boolean> {
  const user = await getCurrentUser();
  return Boolean(user && isRoleAtLeast(user.role as AccountRole, "ADMINISTRATOR"));
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isRoleAtLeast(user.role as AccountRole, "ADMINISTRATOR")) {
    redirect("/login?redirect=/admin");
  }
  return user;
}

type AdminApiGuardResult =
  | { actor: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; response: null }
  | { actor: null; response: NextResponse };

/**
 * API route guard for admin endpoints.
 *
 * Returns `{ actor, response }` where:
 * - `response` is non-null when the request must be rejected:
 *   - 401 when no session exists,
 *   - 403 when the actor is authenticated but not an admin (or lacks the
 *     optional `permission` — the named-admin distinction means, e.g., a plain
 *     ADMINISTRATOR gets 403 for `system:manage`-only actions).
 * - otherwise `actor` is the authenticated admin user and `response` is null.
 *
 * Callers should return `guard.response` immediately when it is non-null.
 */
export async function requireAdminApi(permission?: Permission): Promise<AdminApiGuardResult> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { actor: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = actor.role as AccountRole;
  if (!isAdminRole(role) || (permission !== undefined && !can(role, permission))) {
    return { actor: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { actor, response: null };
}
