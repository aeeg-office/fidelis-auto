import { redirect } from "next/navigation";
import { localePath } from "@/lib/locale-path";

export default async function LegacyAdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(localePath(locale, `/login?redirect=${localePath(locale, "/admin")}`));
}
