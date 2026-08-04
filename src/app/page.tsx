import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import VehicleImage from "@/components/VehicleImage";
import VehicleCard from "@/components/VehicleCard";
import type { VehicleCardData } from "@/components/VehicleCard";
import RecentlySold from "@/components/RecentlySold";

// ─── Placeholder data — will be replaced with DB content ──

const FEATURED_VEHICLES: VehicleCardData[] = [
  {
    slug: "porsche-911e",
    title: "1971 Porsche 911E",
    subtitle: "Albert Blue · 3,742 Original Miles",
    image: "/images/placeholder-porsche-911e.svg",
    year: 1971,
    make: "Porsche",
    model: "911E",
    trim: "Coupe",
    mileage: 3742,
    mileageUnit: "mi",
    exteriorColor: "Albert Blue",
    engine: "2.2L Flat-6",
    transmission: "5-Speed Manual",
    price: "USD 425,000",
    city: "Munich",
    country: "Germany",
  },
  {
    slug: "mercedes-230sl",
    title: "1967 Mercedes-Benz 230SL Pagoda",
    subtitle: "Silver · Fully Restored",
    image: "/images/placeholder-mercedes-230sl.svg",
    year: 1967,
    make: "Mercedes-Benz",
    model: "230SL",
    trim: "Roadster",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Silver",
    engine: "2.3L Inline-6",
    transmission: "4-Speed Manual",
    price: "USD 180,000",
    city: "Dubai",
    country: "United Arab Emirates",
  },
];

// Most recent vehicles (sorted by createdAt descending, top 4)
const RECENT_VEHICLES: VehicleCardData[] = [
  {
    slug: "porsche-911-carrera-rs",
    title: "1973 Porsche 911 Carrera RS 2.7",
    subtitle: "Grand Prix Red · Matching Numbers",
    image: "/images/placeholder-porsche-911-carrera-rs.svg",
    year: 1973,
    make: "Porsche",
    model: "911 Carrera RS",
    trim: "2.7",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Grand Prix Red",
    engine: "2.7L Flat-6 (210 hp)",
    transmission: "5-Speed Manual",
    price: "POA",
    city: "Stuttgart",
    country: "Germany",
  },
  {
    slug: "mercedes-280sl",
    title: "1969 Mercedes-Benz 280SL",
    subtitle: "White over Blue · Documented History",
    image: "/images/placeholder-mercedes-280sl.svg",
    year: 1969,
    make: "Mercedes-Benz",
    model: "280SL",
    trim: null,
    mileage: 82300,
    mileageUnit: "mi",
    exteriorColor: "White",
    engine: "2.8L Inline-6",
    transmission: "Automatic",
    price: "USD 145,000",
    city: "Cairo",
    country: "Egypt",
  },
  {
    slug: "porsche-911e",
    title: "1971 Porsche 911E",
    subtitle: "Albert Blue · 3,742 Original Miles",
    image: "/images/placeholder-porsche-911e.svg",
    year: 1971,
    make: "Porsche",
    model: "911E",
    trim: "Coupe",
    mileage: 3742,
    mileageUnit: "mi",
    exteriorColor: "Albert Blue",
    engine: "2.2L Flat-6",
    transmission: "5-Speed Manual",
    price: "USD 425,000",
    city: "Munich",
    country: "Germany",
  },
  {
    slug: "mercedes-230sl",
    title: "1967 Mercedes-Benz 230SL Pagoda",
    subtitle: "Silver · Fully Restored",
    image: "/images/placeholder-mercedes-230sl.svg",
    year: 1967,
    make: "Mercedes-Benz",
    model: "230SL",
    trim: "Roadster",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Silver",
    engine: "2.3L Inline-6",
    transmission: "4-Speed Manual",
    price: "USD 180,000",
    city: "Dubai",
    country: "United Arab Emirates",
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
              We Love Cars.
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-inverse)]/80 max-w-2xl mx-auto mb-8">
              Every car has a story. We verify it, document it, and tell it honestly.
              From daily drivers to once-in-a-lifetime finds — find the car you love.
            </p>
            <Link
              href="/vehicles"
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
              Every vehicle we present is documented, verified, and shared with the
              honesty every car and its story deserves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {FEATURED_VEHICLES.map((vehicle) => (
              <VehicleCard
                key={vehicle.slug}
                vehicle={vehicle}
                variant="simple"
                priority
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-16 md:py-24 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
              Recently Added
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              The latest additions to our collection — each one carefully documented and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {RECENT_VEHICLES.map((vehicle) => (
              <VehicleCard
                key={vehicle.slug}
                vehicle={vehicle}
                variant="simple"
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent)] hover:text-[var(--color-surface-dark)] transition-colors"
            >
              View All Vehicles
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-16 md:py-24 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
        <div className="container-page text-center max-w-3xl">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold mb-6">
            Honest. Verified. Loved.
          </h2>
          <p className="text-lg text-[var(--color-text-inverse)]/70 leading-relaxed">
            Fidelis Auto is more than a marketplace. It&apos;s a celebration of cars —
            the machines we grew up with, the ones we dreamed about, and the ones we
            can&apos;t stop thinking about. We document every vehicle honestly so you can
            buy, sell, and collect with confidence.
          </p>
        </div>
      </section>

      {/* Recently Sold */}
      <RecentlySold />

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-page text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-4">
            Have a Car to Share?
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
            We&apos;re always interested in great cars with honest stories. Tell us about
            yours and let&apos;s start the conversation.
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

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </>
  );
}