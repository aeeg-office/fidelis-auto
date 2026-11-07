import { describe, expect, it } from "vitest";
import {
  ACCOUNT_ROLES,
  can,
  canManageRole,
  isAdminRole,
  isRoleAtLeast,
  isSuperAdmin,
  roleLandingPath,
  type AccountRole,
} from "./authorization";

describe("Fidelis Auto role authorization", () => {
  it("keeps role capabilities cumulative without exposing administrative actions to sellers", () => {
    expect(can("BUYER", "vehicle:favorite")).toBe(true);
    expect(can("SELLER", "listing:create")).toBe(true);
    expect(can("DEALER", "dealer:manage")).toBe(true);
    expect(can("DEALER", "service:manage")).toBe(true);
    expect(can("ADMINISTRATOR", "listing:moderate")).toBe(true);
    expect(can("SUPER_ADMIN", "system:manage")).toBe(true);

    expect(can("BUYER", "listing:create")).toBe(false);
    expect(can("SELLER", "listing:moderate")).toBe(false);
    expect(can("DEALER", "user:manage")).toBe(false);
    expect(can("ADMINISTRATOR", "system:manage")).toBe(false);
  });

  // Spec L: the named admin permission set — every role × the four admin permissions.
  it.each<[AccountRole, boolean, boolean, boolean, boolean]>([
    ["BUYER", false, false, false, false],
    ["SELLER", false, false, false, false],
    ["DEALER", false, false, false, false],
    ["ADMINISTRATOR", true, true, true, false],
    ["SUPER_ADMIN", true, true, true, true],
  ])(
    "grants %s listing:moderate / user:manage / seo:manage / system:manage = %s / %s / %s / %s",
    (role, listingModerate, userManage, seoManage, systemManage) => {
      expect(can(role, "listing:moderate")).toBe(listingModerate);
      expect(can(role, "user:manage")).toBe(userManage);
      expect(can(role, "seo:manage")).toBe(seoManage);
      expect(can(role, "system:manage")).toBe(systemManage);
    }
  );

  it("only grants system:manage to the named SUPER_ADMIN role (not plain ADMINISTRATOR)", () => {
    expect(can("SUPER_ADMIN", "system:manage")).toBe(true);
    expect(can("ADMINISTRATOR", "system:manage")).toBe(false);
  });

  it("identifies admins and distinguishes the named SUPER_ADMIN from ADMINISTRATOR", () => {
    expect(isAdminRole("ADMINISTRATOR")).toBe(true);
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
    expect(isAdminRole("DEALER")).toBe(false);
    expect(isAdminRole("SELLER")).toBe(false);
    expect(isAdminRole("BUYER")).toBe(false);

    expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
    expect(isSuperAdmin("ADMINISTRATOR")).toBe(false);
    expect(isSuperAdmin("DEALER")).toBe(false);
  });

  it("prevents privilege escalation and only lets super administrators manage administrators", () => {
    expect(canManageRole("BUYER", "SELLER")).toBe(false);
    expect(canManageRole("SELLER", "DEALER")).toBe(false);
    expect(canManageRole("DEALER", "ADMINISTRATOR")).toBe(false);
    expect(canManageRole("ADMINISTRATOR", "BUYER")).toBe(true);
    expect(canManageRole("ADMINISTRATOR", "ADMINISTRATOR")).toBe(false);
    expect(canManageRole("SUPER_ADMIN", "ADMINISTRATOR")).toBe(true);
    expect(canManageRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(false);
  });

  it("provides stable role ordering and role-aware dashboard destinations", () => {
    expect(ACCOUNT_ROLES).toEqual([
      "BUYER",
      "SELLER",
      "DEALER",
      "ADMINISTRATOR",
      "SUPER_ADMIN",
    ]);
    expect(isRoleAtLeast("DEALER", "SELLER")).toBe(true);
    expect(isRoleAtLeast("SELLER", "DEALER")).toBe(false);
    expect(roleLandingPath("BUYER")).toBe("/dashboard");
    expect(roleLandingPath("DEALER")).toBe("/dealer");
    expect(roleLandingPath("ADMINISTRATOR")).toBe("/admin");
    expect(roleLandingPath("SUPER_ADMIN")).toBe("/admin");
  });
});
