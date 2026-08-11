import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VehicleImage from "@/components/VehicleImage";
import { prisma } from "@/lib/prisma";
import NewsletterSignup from "@/components/NewsletterSignup";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "https://fidelisauto.com/journal" },
  };
}

type JournalEntry = {
  slug: string;
  title: string;
  excerpt: string | null;
  author: string;
  publishedAt: Date | null;
  coverImage: string | null;
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
  },
  {
    slug: "mercedes-benz-pagoda-what-to-know-before-buying",
    title: "Mercedes-Benz Pagoda: What to Know Before Buying",
    excerpt:
      "The W113 Pagoda is one of the most elegant roadsters ever built. Here is what buyers should know before taking the plunge.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-05-28T09:00:00.000Z"),
    coverImage: null,
  },
  {
    slug: "complete-guide-to-vehicle-provenance-checks",
    title: "The Complete Guide to Vehicle Provenance Checks",
    excerpt:
      "Provenance is the difference between a great car and a great story. Here is how to verify a vehicle's history properly.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-06-09T09:00:00.000Z"),
    coverImage: null,
  },
  {
    slug: "5-essential-tools-every-car-enthusiast-should-own",
    title: "5 Essential Tools Every Car Enthusiast Should Own",
    excerpt:
      "You do not need a full workshop to enjoy your car. These five tools cover the vast majority of enthusiast jobs.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-06-21T09:00:00.000Z"),
    coverImage: null,
  },
  {
    slug: "road-trip-cairo-to-the-red-sea",
    title: "Road Trip: Cairo to the Red Sea in a Convertible",
    excerpt:
      "Six hours of open road, desert light, and a coastal payoff. A first-hand account of the classic Cairo to Red Sea run.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-07-03T09:00:00.000Z"),
    coverImage: null,
  },
  {
    slug: "understanding-vehicle-import-rules-egypt-and-gcc",
    title: "Understanding Vehicle Import Rules in Egypt and the GCC",
    excerpt:
      "Importing a car into Egypt or the GCC involves specific rules, taxes, and paperwork. Here is what you need to know.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-07-14T09:00:00.000Z"),
    coverImage: null,
  },
  {
    slug: "how-to-sell-your-car-online-step-by-step",
    title: "How to Sell Your Car Online: A Step-by-Step Guide",
    excerpt:
      "Selling your car online is easier than ever — if you do it right. Here is a step-by-step guide to a faster, fairer sale.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-07-24T09:00:00.000Z"),
    coverImage: null,
  },
  {
    slug: "best-weekend-cars-under-50000",
    title: "The Best Weekend Cars Under $50,000",
    excerpt:
      "You do not need a fortune to have a brilliant weekend car. Here are the best enthusiast picks under $50,000.",
    author: "Fidelis Auto",
    publishedAt: new Date("2026-08-01T09:00:00.000Z"),
    coverImage: null,
  },
];

async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        coverImage: true,
      },
    });
    if (entries && entries.length > 0) return entries as unknown as JournalEntry[];
  } catch {
    // DB unavailable — fall through to placeholder.
  }
  return PLACEHOLDER_ENTRIES;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function JournalPage() {
  const entries = await getJournalEntries();
  const t = await getTranslations("journal");

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-3">
            {t("title")}
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-xl">
            {t("subtitle")}
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Entries grid */}
          <div className="lg:col-span-2">
            {entries.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-secondary)]">
                <p>{t("comingSoon")}</p>
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
                              {t("image")}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-accent)] font-medium mb-2">
                        {formatDate(entry.publishedAt)}
                      </p>
                      <h2 className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-2">
                        {entry.title}
                      </h2>
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                        {entry.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] mt-3 transition-colors">
                        {t("readMore")} <ArrowRight size={14} />
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
              <NewsletterSignup compact />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}