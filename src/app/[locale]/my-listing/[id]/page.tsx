import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { localePath } from "@/lib/locale-path";
import EditListingForm from "./EditListingForm";

export default async function MyListingEditPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(localePath(locale, `/login?redirect=${localePath(locale, "/dashboard")}`));

  const listing = await prisma.listingRequest.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id) redirect(localePath(locale, "/dashboard"));

  let photoUrls: string[] = [];
  try {
    photoUrls = listing.photoUrls ? JSON.parse(listing.photoUrls) : [];
    if (!Array.isArray(photoUrls)) photoUrls = [];
  } catch {
    photoUrls = [];
  }

  return <EditListingForm listing={{ ...listing, photoUrls }} />;
}