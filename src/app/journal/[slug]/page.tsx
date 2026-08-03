import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// Placeholder — will come from DB
const ENTRIES: Record<string, { title: string; date: string; content: string }> = {
  "porsche-911e-discovery": {
    title: "The Discovery of Chassis Number 9111300987",
    date: "2026-07-15",
    content: `It began with a phone call. A friend in Stuttgart had heard of a 911E that had been sitting in a heated garage since the early 1990s. The owner, an elderly gentleman who had purchased the car new through a German military exchange program, had stopped driving it when his eyesight began to fail.

    The car had covered just 3,742 miles in over five decades.

    When we arrived to inspect it, the Albert Blue paint was dusty but intact. The original Beige Leatherette interior — perforated front seats, ribbed rear seats, the iconic four-spoke steering wheel — looked as if it had just left the factory. Under the hood, the 2.2-liter flat-six was complete with all original components, including the factory air cleaner housing and the original battery cables.

    This wasn't just a car. It was a time capsule.

    The paperwork was equally remarkable: the original delivery documents, service booklets stamped through 1989, and correspondence from the Porsche factory confirming the build specifications. Every piece of paper told the same story: this was a car that had been cherished, not merely preserved.

    Bringing it back to running condition required patience. The fuel system was cleaned, the brakes were serviced, and all fluids were replaced. But the originality was preserved — the paint, the interior, the engine bay, the undercarriage. We believe a car can only be original once, and our goal was to make it roadworthy without erasing its history.

    The result is a 911E that drives as well as it looks. The engine fires instantly, the transmission shifts with the precision of a well-maintained example, and the car tracks straight and true on the road. It's a reminder of why the early 911s are so revered: they are driver's cars, pure and direct.

    This car is now available for viewing. We invite serious collectors to experience it in person.`,
  },
};

export function generateStaticParams() {
  return Object.keys(ENTRIES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = ENTRIES[params.slug];
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.content.slice(0, 160),
  };
}

export default function JournalEntryPage({ params }: { params: { slug: string } }) {
  const entry = ENTRIES[params.slug];
  if (!entry) notFound();

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Journal
        </Link>

        <article>
          <p className="text-xs text-[var(--color-accent)] font-medium mb-2">
            {new Date(entry.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-8">
            {entry.title}
          </h1>

          <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] whitespace-pre-line leading-relaxed">
            {entry.content}
          </div>
        </article>
      </div>
    </div>
  );
}