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

const ROLE_RANK: Record<AccountRole, number> = {
  BUYER: 0,
  SELLER: 1,
  DEALER: 2,
  ADMINISTRATOR: 3,
  SUPER_ADMIN: 4,
};

const ROLE_PERMISSIONS: Record<AccountRole, ReadonlySet<Permission>> = {
  BUYER: new Set(["vehicle:favorite"]),
  SELLER: new Set(["vehicle:favorite", "listing:create", "listing:manage-own"]),
  DEALER: new Set([
    "vehicle:favorite",
    "listing:create",
    "listing:manage-own",
    "dealer:manage",
    "dealer:inventory",
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

export function can(role: AccountRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function isRoleAtLeast(role: AccountRole, minimum: AccountRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function canManageRole(actor: AccountRole, target: AccountRole): boolean {
  if (actor === "SUPER_ADMIN") return target !== "SUPER_ADMIN";
  return actor === "ADMINISTRATOR" && ROLE_RANK[target] < ROLE_RANK.ADMINISTRATOR;
}

export function roleLandingPath(role: AccountRole): string {
  if (role === "ADMINISTRATOR" || role === "SUPER_ADMIN") return "/admin";
  if (role === "DEALER") return "/dealer";
  return "/dashboard";
}
