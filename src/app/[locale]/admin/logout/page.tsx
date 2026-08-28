import { redirect } from "next/navigation";
import { logoutUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

// GET /[locale]/admin/logout — clears the session and returns to admin login.
// Admin sidebars link here (previously pointed at a non-existent route).
export default async function AdminLogoutPage() {
  try {
    await logoutUser();
  } catch {
    // Session already cleared or not present — either way redirect to login.
  }
  redirect("/admin/login");
}