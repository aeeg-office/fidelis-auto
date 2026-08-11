import { redirect } from "next/navigation";
import { can, type AccountRole } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";
import SubmitForm from "./SubmitForm";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/submit");
  if (!can(user.role as AccountRole, "listing:create")) redirect("/dashboard");

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-2">Sell Your Vehicle</h1>
        <p className="text-[var(--color-text-secondary)] mb-10">
          Welcome, {user.name}. Fill in the details below and our team will review your submission.
        </p>
        <SubmitForm />
      </div>
    </div>
  );
}