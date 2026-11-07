/**
 * Fidelis Auto role-based access control (RBAC).
 *
 * Roles are ordered by rank (see ROLE_RANK): BUYER < SELLER < DEALER < ADMINISTRATOR < SUPER_ADMIN.
 * Each role has a named permission set (ROLE_PERMISSIONS) that is cumulative with the roles below
 * it, plus admin-only powers:
 *
 * - ADMINISTRATOR ("named admin"): holds the full admin permission set except `system:manage`.
 *   Can moderate listings, manage users/dealers/services/SEO — but cannot manage system settings.
 * - SUPER_ADMIN (the "named admin" role with elevated powers): holds every permission including
 *   `system:manage`, and is the only role allowed to create/promote other administrators.
 *
 * Use `can(role, permission)` for fine-grained permission checks and `isAdminRole(role)` /
 * `isSuperAdmin(role)` when a route or page only cares about admin-ness (e.g. API route guards
 * that must reject non-admins with 403).
 */
export const ACCOUNT_ROLES = [
  "BUYER",
  "SELLER",
  "DEALER",
  "ADMINISTRATOR",
  "SUPER_ADMIN",
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export type Permission =
  | "vehicle:favorite"
  | "listing:create"
  | "listing:manage-own"
  | "dealer:manage"
  | "dealer:inventory"
  | "listing:moderate"
  | "user:manage"
  | "service:manage"
  | "seo:manage"
  | "system:manage";

/** Numeric rank used for ordering comparisons; higher = more privileged. */
const ROLE_RANK: Record<AccountRole, number> = {
  BUYER: 0,
  SELLER: 1,
  DEALER: 2,
  ADMINISTRATOR: 3,
  SUPER_ADMIN: 4,
};

/** Named permission set granted to each role (see module docs above). */
const ROLE_PERMISSIONS: Record<AccountRole, ReadonlySet<Permission>> = {
  BUYER: new Set(["vehicle:favorite"]),
  SELLER: new Set(["vehicle:favorite", "listing:create", "listing:manage-own"]),
  DEALER: new Set([
    "vehicle:favorite",
    "listing:create",
    "listing:manage-own",
    "dealer:manage",
    "dealer:inventory",
    "service:manage",
  ]),
  ADMINISTRATOR: new Set([
    "vehicle:favorite",
    "listing:create",
    "listing:manage-own",
    "dealer:manage",
    "dealer:inventory",
    "listing:moderate",
    "user:manage",
    "service:manage",
    "seo:manage",
  ]),
  SUPER_ADMIN: new Set([
    "vehicle:favorite",
    "listing:create",
    "listing:manage-own",
    "dealer:manage",
    "dealer:inventory",
    "listing:moderate",
    "user:manage",
    "service:manage",
    "seo:manage",
    "system:manage",
  ]),
};

export function isAccountRole(value: unknown): value is AccountRole {
  return typeof value === "string" && ACCOUNT_ROLES.includes(value as AccountRole);
}

/** True when the role holds the given permission (see ROLE_PERMISSIONS). */
export function can(role: AccountRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** True when `role` is at least as privileged as `minimum` in ROLE_RANK order. */
export function isRoleAtLeast(role: AccountRole, minimum: AccountRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/**
 * True when the actor is a named administrator — i.e. either the full
 * ADMINISTRATOR role or the elevated SUPER_ADMIN role. Use this to guard
 * any admin-only surface (API routes, pages) and reject non-admins.
 */
export function isAdminRole(role: AccountRole): role is "ADMINISTRATOR" | "SUPER_ADMIN" {
  return role === "ADMINISTRATOR" || role === "SUPER_ADMIN";
}

/**
 * True only for the named elevated admin role (SUPER_ADMIN). Use this in
 * addition to `isAdminRole` when an action must be reserved for the single
 * most privileged role (e.g. system settings, managing other administrators).
 */
export function isSuperAdmin(role: AccountRole): role is "SUPER_ADMIN" {
  return role === "SUPER_ADMIN";
}

/**
 * Whether `actor` may assign roles to `target`. Administrators may manage any
 * role below themselves; the named SUPER_ADMIN may additionally manage
 * administrators, but no one may manage a SUPER_ADMIN.
 */
export function canManageRole(actor: AccountRole, target: AccountRole): boolean {
  if (actor === "SUPER_ADMIN") return target !== "SUPER_ADMIN";
  return actor === "ADMINISTRATOR" && ROLE_RANK[target] < ROLE_RANK.ADMINISTRATOR;
}

/** Post-login landing path for each role. */
export function roleLandingPath(role: AccountRole): string {
  if (isAdminRole(role)) return "/admin";
  if (role === "DEALER") return "/dealer";
  return "/dashboard";
}
