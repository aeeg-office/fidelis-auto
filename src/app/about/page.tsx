import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Fidelis Auto is a home for car lovers. We verify, document, and share the stories behind every car we feature.",
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
            &ldquo;faithful&rdquo; — represents our commitment to honesty, transparency, and trust
            in every car we feature.
          </p>

          <p>
            We built Fidelis Auto because we love cars. Not just the rare ones, not just the expensive ones —
            all of them. We believe every car has a story worth telling, and we believe that story should be told honestly.
          </p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            Why We Exist
          </h2>

          <p>
            The car market is full of noise. Misleading listings, hidden histories, exaggerated claims.
            We wanted something different — a place where every car is documented thoroughly, where
            buyers can trust what they see, and where sellers can present their cars with the pride they deserve.
          </p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            What We Do
          </h2>

          <ul className="space-y-4">
            <li>
              <strong className="text-[var(--color-text-primary)]">Verified Documentation</strong>
              <br />
              Every service record, ownership change, and detail is presented transparently.
              We don&apos;t claim history — we show it.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Honest Photography</strong>
              <br />
              Real photos, real condition. No deceptive angles, no misleading edits.
              What you see is what you get.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">A Home for Every Car</strong>
              <br />
              Whether it&apos;s a weekend sports car, a daily driver with history, or a
              once-in-a-generation find — if it has a story, it belongs here.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Built for the Middle East, Open to the World</strong>
              <br />
              Born in Egypt, built for the global car community. We connect enthusiasts
              across the Middle East, Europe, and beyond.
            </li>
          </ul>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-12">
            What&rsquo;s Next
          </h2>

          <p>
            Fidelis Auto starts as a curated showcase and will grow into a global platform
            where car lovers can discover, share, and transact with confidence. Every feature
            we build serves one purpose: making it easier to trust the story behind the car.
          </p>
        </div>
      </div>
    </div>
  );
}