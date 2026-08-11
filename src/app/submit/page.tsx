import { redirect } from "next/navigation";
import { can, type AccountRole } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";
import SubmitForm from "./SubmitForm";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/submit");
  if (!can(user.role as AccountRole, "listing:create")) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[var(--color-text-primary)]">Sell Your Car</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">Tell us about your vehicle and our team will review it.</p>
        <SubmitForm />
      </div>
    </main>
  );
}
