import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Fidelis Auto — a curated collector vehicle showroom built on trust, provenance, and passion.",
};

export default function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-6">
          About Fidelis Auto
        </h1>

        <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-6">
          <p>
            <strong className="text-[var(--color-text-primary)]">Fidelis</strong> — from the Latin for
            &ldquo;faithful&rdquo; — represents our commitment to authenticity, provenance, and trust
            in every vehicle we present.
          </p>

          <p>
            Founded from a passion for automotive history and a frustration with how little
            trust exists in the collector car market, Fidelis Auto was built to change how
            exceptional vehicles are presented, documented, and connected with the right
            owners.
          </p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            Our Philosophy
          </h2>

          <p>
            We believe every collector vehicle has a story worth telling. Not just a list of
            specifications, but a narrative of where it&apos;s been, who owned it, what makes it
            unique. Our platform is designed to give each vehicle the presentation it deserves —
            gallery-grade photography, verified provenance, and the space to tell its story.
          </p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            What Sets Us Apart
          </h2>

          <ul className="space-y-4">
            <li>
              <strong className="text-[var(--color-text-primary)]">Verified Provenance</strong>
              <br />
              Every document, every service record, every ownership change is presented
              transparently. We don&apos;t just claim history — we show it.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Gallery-Grade Presentation</strong>
              <br />
              Professional photography, 4K resolution, detailed documentation. Each vehicle
              is presented with the care it deserves.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Curated Selection</strong>
              <br />
              We don&apos;t list every vehicle. We select vehicles with documented histories,
              exceptional condition, and compelling stories.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Global Reach, Regional Focus</strong>
              <br />
              Born in Egypt, built for the world. We connect collectors across the MENA
              region, Europe, and beyond.
            </li>
          </ul>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            The Vision
          </h2>

          <p>
            Fidelis Auto begins as a personal showroom for four exceptional vehicles and
            will evolve into a global platform where collectors can showcase, discover, and
            transact with confidence. Every feature we build serves one purpose: making it
            easier to trust the story behind the vehicle.
          </p>
        </div>
      </div>
    </div>
  );
}