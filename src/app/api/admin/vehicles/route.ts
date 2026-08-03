import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const year = parseInt(formData.get("year") as string);
  const make = formData.get("make") as string;
  const model = formData.get("model") as string;

  // Auto-generate slug
  const baseSlug = `${make}-${model}-${year}`.toLowerCase().replace(/\s+/g, "-");
  const slug = baseSlug;

  const vehicle = await prisma.vehicle.create({
    data: {
      slug,
      title: `${year} ${make} ${model}${formData.get("trim") ? " " + formData.get("trim") : ""}`,
      year,
      make,
      model,
      trim: (formData.get("trim") as string) || null,
      vin: (formData.get("vin") as string) || null,
      mileage: formData.get("mileage") ? parseInt(formData.get("mileage") as string) : null,
      exteriorColor: (formData.get("exteriorColor") as string) || null,
      interiorColor: (formData.get("interiorColor") as string) || null,
      engine: (formData.get("engine") as string) || null,
      transmission: (formData.get("transmission") as string) || null,
      drivetrain: (formData.get("drivetrain") as string) || null,
      price: (formData.get("price") as string) || null,
      descriptionEn: (formData.get("descriptionEn") as string) || null,
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") !== "off",
    },
  });

  redirect("/admin/vehicles");
}