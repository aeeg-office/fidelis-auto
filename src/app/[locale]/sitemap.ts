import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = "https://fidelisauto.com";

type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.7, changeFrequency: "weekly" },
  { path: "/signup", priority: 0.5, changeFrequency: "yearly" },
  { path: "/login", priority: 0.5, changeFrequency: "yearly" },
  { path: "/verify", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let vehicleUrls: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    vehicleUrls = vehicles.map((vehicle) => ({
      url: `${BASE_URL}/vehicles/${vehicle.slug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch {
    // DB unavailable at request time — fall back to static routes only.
  }

  return [...staticUrls, ...vehicleUrls];
}