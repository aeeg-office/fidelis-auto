import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import JournalNewForm from "./JournalNewForm";

export default async function AdminJournalNewPage() {
  if (!(await verifySession())) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="ml-56 p-8 max-w-2xl">
        <Link href="/admin/journal" className="text-sm text-[var(--color-accent)] hover:underline mb-4 block">← Back to Journal</Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-8">New Journal Entry</h1>
        <JournalNewForm />
      </div>
    </div>
  );
}