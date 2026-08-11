import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import ServiceListingForm from "@/components/ServiceListingForm";

export default async function DealerPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dealer");
  const profile = await prisma.dealerProfile.findUnique({ where: { ownerId: user.id } });

  if (!profile) {
    return (
      <div className="container-page py-16 md:py-24">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold">Dealer Portal</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">Register your business to request dealership access.</p>
        <Link href="/dealer/register" className="mt-6 inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 font-medium text-[var(--color-surface-dark)]">Register a Dealership</Link>
      </div>
    );
  }

  const status = profile.approvalStatus === "APPROVED" ? "Approved" : profile.approvalStatus === "CHANGES_REQUESTED" ? "Changes requested" : profile.approvalStatus === "REJECTED" ? "Not approved" : "Pending administrator approval";
  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold">{profile.businessName}</h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">Dealer application status: <strong className="text-[var(--color-text-primary)]">{status}</strong></p>
      {profile.moderationNotes && <p className="mt-4 rounded-lg border border-[var(--color-border)] p-4 text-sm">{profile.moderationNotes}</p>}
      {profile.approvalStatus === "APPROVED" ? (
        <>
          <p className="mt-8 text-sm text-[var(--color-text-secondary)]">Your dealer account is approved. Submit inventory through the vehicle form and add specialist services for marketplace review.</p>
          <ServiceListingForm />
        </>
      ) : (
        <p className="mt-8 text-sm text-[var(--color-text-secondary)]">Inventory and service directory access will appear here after approval.</p>
      )}
    </div>
  );
}
