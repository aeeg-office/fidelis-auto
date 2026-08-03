import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, histories, and insights from the world of collector automobiles.",
};

const ENTRIES = [
  {
    slug: "porsche-911e-discovery",
    title: "The Discovery of Chassis Number 9111300987",
    excerpt: "How a 1971 Porsche 911E with 3,742 original miles was found in a German garage after decades of storage.",
    date: "2026-07-15",
    cover: null,
  },
];

export default function JournalPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-4">
          Journal
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-12 max-w-xl">
          Stories, histories, and insights from the world of collector automobiles.
        </p>

        {ENTRIES.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-secondary)]">
            <p>Journal entries coming soon.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {ENTRIES.map((entry) => (
              <Link
                key={entry.slug}
                href={`/journal/${entry.slug}`}
                className="group block"
              >
                <article>
                  <div className="aspect-[2/1] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-surface-dark)] to-[var(--color-text-secondary)]/20 flex items-center justify-center">
                      <span className="text-[var(--color-text-inverse)]/30 font-[family-name:var(--font-cormorant)] text-lg">
                        Image
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-accent)] font-medium mb-2">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-2">
                    {entry.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)]">{entry.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] mt-3 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={14} />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}