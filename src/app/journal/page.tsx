import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VehicleImage from "@/components/VehicleImage";
import { prisma } from "@/lib/prisma";
import NewsletterSignup from "@/components/NewsletterSignup";
import { BLOG_CATEGORIES } from "@/lib/fidelisTaxonomy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, insights, and guides from the world of cars.",
  alternates: { canonical: "https://fidelisauto.com/journal" },
};

type JournalEntry = {
  slug: string;
  title: string;
  excerpt: string | null;
  author: string;
  publishedAt: Date | null;
  coverImage: string | null;
  category: string | null;
};

// Placeholder data used when the database is empty or unavailable.
const PLACEHOLDER_ENTRIES: JournalEntry[] = [
  {
    slug: "how-to-inspect-a-used-porsche-911",
    title: "How to Inspect a Used Porsche 911",
    excerpt:
      "A practical, hands-on checklist for evaluating a used 911 before you buy — from the flat-six to the body panels.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-05-12T09:00:00.000Z"),
    coverImage: null,
    category: "Inspection Guides",
  },
  {
    slug: "mercedes-benz-pagoda-what-to-know-before-buying",
    title: "Mercedes-Benz Pagoda: What to Know Before Buying",
    excerpt:
      "The W113 Pagoda is one of the most elegant roadsters ever built. Here is what buyers should know before taking the plunge.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-05-28T09:00:00.000Z"),
    coverImage: null,
    category: "Buying Guides",
  },
  {
    slug: "complete-guide-to-vehicle-provenance-checks",
    title: "The Complete Guide to Vehicle Provenance Checks",
    excerpt:
      "How to verify a vehicle's history before you buy — documentation, VIN checks, and avoiding hidden surprises.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-06-09T09:00:00.000Z"),
    coverImage: null,
    category: "Provenance & Paperwork",
  },
  {
    slug: "5-essential-tools-every-car-enthusiast-should-own",
    title: "5 Essential Tools Every Car Enthusiast Should Own",
    excerpt:
      "You do not need a full workshop to enjoy your car. These five tools cover the vast majority of enthusiast jobs.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-06-21T09:00:00.000Z"),
    coverImage: null,
    category: "Ownership & Running Costs",
  },
];

async function getJournalEntries(cat?: string): Promise<JournalEntry[]> {
  try {
    const where: Record<string, unknown> = { isPublished: true };
    if (cat) where.category = cat;
    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        coverImage: true,
        category: true,
      },
    });
    if (entries && entries.length > 0) return entries as unknown as JournalEntry[];
  } catch {
    // DB unavailable — fall through to placeholder.
  }
  return cat ? PLACEHOLDER_ENTRIES.filter((e) => e.category === cat) : PLACEHOLDER_ENTRIES;
}

async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const groups = await prisma.journalEntry.groupBy({
      by: ["category"],
      where: { isPublished: true, category: { not: null } },
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    for (const g of groups) {
      if (g.category) counts[g.category] = g._count._all;
    }
    return counts;
  } catch {
    return {};
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat } = await searchParams;
  const entries = await getJournalEntries(cat);
  const counts = await getCategoryCounts();
  const activeCat = cat || "";

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-3">
            Journal
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-xl">
            Stories, insights, and guides from the world of cars — from buying
            guides and road trips to maintenance advice and owner spotlights.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Entries grid */}
          <div className="lg:col-span-2">
            {entries.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-secondary)]">
                <p>
                  {activeCat
                    ? `No journal entries in "${activeCat}" yet.`
                    : "Journal entries coming soon."}
                </p>
                {activeCat && (
                  <Link href="/journal" className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline">
                    View all entries
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-8">
                {entries.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/journal/${entry.slug}`}
                    className="group block"
                  >
                    <article>
                      <div className="aspect-[16/10] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-4">
                        {entry.coverImage ? (
                          <VehicleImage
                            src={entry.coverImage}
                            alt={entry.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--color-surface-dark)] to-[var(--color-text-secondary)]/20 flex items-center justify-center">
                            <span className="text-[var(--color-text-inverse)]/30 font-[family-name:var(--font-cormorant)] text-lg">
                              Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-xs text-[var(--color-accent)] font-medium">
                          {formatDate(entry.publishedAt)}
                        </p>
                        {entry.category && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                            {entry.category}
                          </span>
                        )}
                      </div>
                      <h2 className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-2">
                        {entry.title}
                      </h2>
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                        {entry.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] mt-3 transition-colors">
                        Read More <ArrowRight size={14} />
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
                  Browse by Category
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/journal"
                      className={`block text-sm py-1.5 transition-colors ${
                        !activeCat
                          ? "text-[var(--color-accent)] font-medium"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                      }`}
                    >
                      All Entries
                    </Link>
                  </li>
                  {BLOG_CATEGORIES.map((c) => (
                    <li key={c}>
                      <Link
                        href={`/journal?cat=${encodeURIComponent(c)}`}
                        className={`flex items-center justify-between text-sm py-1.5 transition-colors ${
                          activeCat === c
                            ? "text-[var(--color-accent)] font-medium"
                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                        }`}
                      >
                        <span>{c}</span>
                        {counts[c] ? (
                          <span className="text-xs text-[var(--color-text-secondary)]/60">{counts[c]}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <NewsletterSignup compact />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}