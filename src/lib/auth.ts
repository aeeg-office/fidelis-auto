import { redirect } from "next/navigation";
import { type AccountRole, isRoleAtLeast } from "@/lib/authorization";
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
