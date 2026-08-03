import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Placeholder data — will be replaced with DB content
const FEATURED_VEHICLES = [
  {
    slug: "porsche-911e",
    title: "1971 Porsche 911E",
    subtitle: "Albert Blue · 3,742 Original Miles",
    image: "/images/placeholder-porsche-911e.svg",
    year: 1971,
  },
  {
    slug: "mercedes-230sl",
    title: "1967 Mercedes 230SL",
    subtitle: "Pagoda · Fully Restored",
    image: "/images/placeholder-mercedes-230sl.svg",
    year: 1967,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] bg-[var(--color-surface-dark)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-surface-dark)] z-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-20 px-4">
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl lg:text-8xl font-semibold text-[var(--color-text-inverse)] mb-4">
              Own the Story
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-inverse)]/80 max-w-2xl mx-auto mb-8">
              A premium digital showroom for collector, classic, and enthusiast vehicles.
              Every vehicle tells a story. We make sure it&apos;s the truth.
            </p>
            <Link
              href="/vehicles/porsche-911e"
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Explore Vehicles
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
              Featured Vehicles
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Each vehicle in our collection is documented, verified, and presented with
              the care it deserves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {FEATURED_VEHICLES.map((vehicle) => (
              <Link
                key={vehicle.slug}
                href={`/vehicles/${vehicle.slug}`}
                className="group block"
              >
                <div className="aspect-[16/10] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-4">
                  <img src={vehicle.image} alt={vehicle.title}
                    className="w-full h-full object-cover" />
                </div>
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                  {vehicle.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {vehicle.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-16 md:py-24 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
        <div className="container-page text-center max-w-3xl">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold mb-6">
            Curated. Verified. Extraordinary.
          </h2>
          <p className="text-lg text-[var(--color-text-inverse)]/70 leading-relaxed">
            Fidelis Auto is more than a showroom. It&apos;s a commitment to provenance,
            a celebration of craftsmanship, and a platform built on trust.
            Every vehicle in our collection has been carefully selected,
            thoroughly documented, and presented with the authenticity it deserves.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-page text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-4">
            Have a Vehicle to Share?
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
            We&apos;re always interested in exceptional vehicles with documented histories.
            Get in touch to start the conversation.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent)] hover:text-[var(--color-surface-dark)] transition-colors"
          >
            Contact Us
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}