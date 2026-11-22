import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { localePath } from "@/lib/locale-path";
import EditVehicleForm from "./EditVehicleForm";

export default async function MyVehicleEditPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(localePath(locale, `/login?redirect=${localePath(locale, "/dashboard")}`));

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!vehicle || vehicle.ownerId !== user.id) redirect(localePath(locale, "/dashboard"));

  const images = vehicle.images.map((i) => ({
    id: i.id,
    src: i.src,
    cover: i.isPrimary,
  }));

  return <EditVehicleForm vehicle={{ ...vehicle, images }} slug={vehicle.slug} />;
}