import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import SocialShare from "@/components/SocialShare";
import NewsletterSignup from "@/components/NewsletterSignup";
import VehicleImage from "@/components/VehicleImage";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

// ─── Types ──────────────────────────────────────

type EntryData = {
  slug: string;
  title: string;
  contentEn: string | null;
  contentAr: string | null;
  excerpt: string | null;
  author: string;
  publishedAt: Date | null;
  editorialDate: Date | null;
  coverImage: string | null;
  category?: string | null;
};

// ─── Data fetching ──────────────────────────────

async function getEntry(slug: string): Promise<EntryData | null> {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { slug, isPublished: true },
      select: {
        slug: true,
        title: true,
        contentEn: true,
        contentAr: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        editorialDate: true,
        coverImage: true,
        category: true,
      },
    });
    if (entry) return entry as unknown as EntryData;
  } catch {
    // DB unavailable — treat as not found (never serve placeholder content).
  }
  return null;
}

function formatDate(date: Date | null, locale: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Metadata ───────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  const entry = await getEntry(slug);
  if (!entry) return { title: t("notFound") };

  const url = `https://fidelisauto.com/journal/${slug}`;

  return {
    title: entry.title,
    description: entry.excerpt || entry.contentEn?.slice(0, 160) || "",
    alternates: { canonical: url },
    openGraph: {
      title: entry.title,
      description: entry.excerpt || entry.contentEn?.slice(0, 160) || "",
      url,
      type: "article",
      publishedTime: entry.publishedAt?.toISOString(),
      authors: [entry.author],
    },
  };
}

// ─── Page ──────────────────────────────────────

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  const entry = await getEntry(slug);
  if (!entry) notFound();

  const body = (locale === "ar" && entry.contentAr) ? entry.contentAr : entry.contentEn;

  const url = `https://fidelisauto.com/journal/${slug}`;

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <JsonLd
        type="BreadcrumbList"
        data={{
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://fidelisauto.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Journal",
              item: "https://fidelisauto.com/journal",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: entry.title,
              item: url,
            },
          ],
        }}
      />

      {/* BlogPosting JSON-LD */}
      <JsonLd
        type="BlogPosting"
        data={{
          headline: entry.title,
          description: entry.excerpt,
          author: {
            "@type": "Person",
            name: entry.author,
          },
          datePublished: entry.publishedAt?.toISOString(),
          publisher: {
            "@type": "Organization",
            name: "Fidelis Auto",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
          },
        }}
      />

      <div className="container-page py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <article className="lg:col-span-2">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors mb-8"
              >
                <ArrowLeft size={16} className="rtl:rotate-180" />
                {t("backToJournal")}
              </Link>

              {entry.coverImage && (
                <div className="relative aspect-[21/9] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-6">
                  <VehicleImage
                    src={entry.coverImage}
                    alt={entry.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-xs text-[var(--color-text-secondary)] font-medium mb-2">
                {formatDate(entry.editorialDate || entry.publishedAt, locale)}
              </p>

              {entry.category && (
                <Link
                  href={`/journal?cat=${encodeURIComponent(entry.category)}`}
                  className="inline-block text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[var(--color-ink)]/10 text-[var(--color-ink)] mb-3"
                >
                  {entry.category}
                </Link>
              )}

              <h1 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
                {entry.title}
              </h1>

              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                {t("byAuthor", { author: entry.author })}
              </p>

              <SocialShare url={url} title={entry.title} className="mb-8" />

              <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] whitespace-pre-line leading-relaxed">
                {body}
              </div>

              {/* WS16: single leaderboard after the article body — one slot per page. */}
              <AdSlot format="leaderboard" slotId="journal-detail" className="mt-10" />

              <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
                <SocialShare url={url} title={entry.title} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-8">
                <NewsletterSignup compact />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}