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

/**
 * Indexable static routes. Auth/transient routes (login, signup, verify, offline,
 * dashboard, watchlist, submit, dealer, my-listing, my-vehicle, admin) are deliberately
 * excluded — they carry no canonical and /verify is additionally disallowed in robots.txt.
 * 2026-11-22 audit: `/vehicles`, `/collections`, `/search`, `/terms`, `/privacy`,
 * `/compare` and `/services/submit` were missing from the sitemap.
 */
const STATIC_ROUTES: StaticRoute[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/vehicles", priority: 0.9, changeFrequency: "daily" },
  { path: "/services", priority: 0.8, changeFrequency: "weekly" },
  { path: "/journal", priority: 0.8, changeFrequency: "weekly" },
  { path: "/collections", priority: 0.7, changeFrequency: "weekly" },
  { path: "/search", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/compare", priority: 0.5, changeFrequency: "monthly" },
  { path: "/services/submit", priority: 0.5, changeFrequency: "monthly" },
  { path: "/dealer/register", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

const LOCALES = ["en", "ar"] as const;

/** Locale-prefixed path, matching next-intl `localePrefix: "as-needed"`. */
function localizedPath(locale: string, path: string): string {
  if (locale === "en") return path || "";
  return `/ar${path}`;
}

/** en / ar-EG / x-default alternates for a locale-relative path. */
function alternatesFor(path: string) {
  const en = `${BASE_URL}${path}`;
  const ar = `${BASE_URL}/ar${path}`;
  return { languages: { en, "ar-EG": ar, "x-default": en } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes, both locales. Deliberately NO `lastModified`: a per-request
  // `new Date()` stamped every static URL with the current time and taught crawlers
  // to distrust the signal site-wide (2026-11-22 audit finding).
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}${localizedPath(locale, route.path)}`,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: alternatesFor(route.path),
      });
    }
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    for (const vehicle of vehicles) {
      const path = `/vehicles/${vehicle.slug}`;
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}${localizedPath(locale, path)}`,
          lastModified: vehicle.updatedAt,
          changeFrequency: "weekly",
          priority: 0.9,
          alternates: alternatesFor(path),
        });
      }
    }

    const journal = await prisma.journalEntry.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    for (const post of journal) {
      const path = `/journal/${post.slug}`;
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}${localizedPath(locale, path)}`,
          lastModified: post.updatedAt,
          changeFrequency: "monthly",
          priority: 0.7,
          alternates: alternatesFor(path),
        });
      }
    }
  } catch {
    // DB unavailable at request time — fall back to static routes only.
  }

  return entries;
}
