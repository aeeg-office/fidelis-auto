import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import EditListingForm from "./EditListingForm";

export default async function MyListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");
  const { id } = await params;

  const listing = await prisma.listingRequest.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id) redirect("/dashboard");

  let photoUrls: string[] = [];
  try {
    photoUrls = listing.photoUrls ? JSON.parse(listing.photoUrls) : [];
    if (!Array.isArray(photoUrls)) photoUrls = [];
  } catch {
    photoUrls = [];
  }

  return <EditListingForm listing={{ ...listing, photoUrls }} />;
}