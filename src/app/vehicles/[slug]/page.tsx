import { ArrowLeft, Calendar, Gauge, Wrench, Palette } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

// Placeholder — will come from DB
const VEHICLE = {
  slug: "porsche-911e",
  title: "1971 Porsche 911E",
  year: 1971,
  make: "Porsche",
  model: "911E",
  trim: "Coupe",
  mileage: 3742,
  exteriorColor: "Albert Blue",
  interiorColor: "Beige Leatherette",
  engine: "2.2L Flat-6 (1991cc)",
  transmission: "5-Speed Manual",
  drivetrain: "Rear-Wheel Drive",
  vin: "9111300987",
  description: `Delivered new in 1971 through a German military exchange program, this 911E has
    covered just 3,742 miles from new. Finished in its original Albert Blue over Beige
    Leatherette, it remains in remarkably preserved condition.`,
};

const SPECS = [
  { label: "Year", value: VEHICLE.year, icon: Calendar },
  { label: "Mileage", value: `${VEHICLE.mileage.toLocaleString()} mi`, icon: Gauge },
  { label: "Engine", value: VEHICLE.engine, icon: Wrench },
  { label: "Exterior", value: VEHICLE.exteriorColor, icon: Palette },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: VEHICLE.title,
    description: `1971 Porsche 911E — ${VEHICLE.mileage.toLocaleString()} original miles. Albert Blue over Beige. Fully documented provenance.`,
    alternates: {
      canonical: `https://fidelisauto.com/vehicles/${VEHICLE.slug}`,
    },
    openGraph: {
      title: VEHICLE.title,
      description: `1971 Porsche 911E — ${VEHICLE.mileage.toLocaleString()} original miles. Albert Blue over Beige. Fully documented provenance.`,
      url: `https://fidelisauto.com/vehicles/${VEHICLE.slug}`,
    },
  };
}

export default function VehicleDetailPage() {
  return (
    <>
      {/* Structured Data */}
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
              name: VEHICLE.title,
              item: `https://fidelisauto.com/vehicles/${VEHICLE.slug}`,
            },
          ],
        }}
      />
      <JsonLd
        type="Vehicle"
        data={{
          name: VEHICLE.title,
          description: VEHICLE.description.trim(),
          modelDate: VEHICLE.year,
          manufacturer: {
            "@type": "Organization",
            name: VEHICLE.make,
          },
          model: VEHICLE.model,
          vehicleIdentificationNumber: VEHICLE.vin,
          mileageFromOdometer: {
            value: VEHICLE.mileage,
            unitText: "mi",
          },
          vehicleTransmission: VEHICLE.transmission,
          vehicleEngine: {
            name: VEHICLE.engine,
          },
          color: VEHICLE.exteriorColor,
          vehicleInteriorColor: VEHICLE.interiorColor,
          vehicleSeatingCapacity: 2,
          url: `https://fidelisauto.com/vehicles/${VEHICLE.slug}`,
        }}
      />

      {/* Back Link */}
      <div className="container-page py-6">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Vehicles
        </Link>
      </div>

      {/* Vehicle Hero */}
      <section className="container-page">
        <div className="aspect-[21/9] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-8">
          <img src="/images/placeholder-porsche-911e.svg" alt="1971 Porsche 911E"
            className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Vehicle Info */}
      <section className="container-page pb-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-2">
              {VEHICLE.title}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              {VEHICLE.mileage.toLocaleString()} Original Miles
            </p>
            <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)]">
              <p>{VEHICLE.description}</p>
            </div>
          </div>

          {/* Sidebar Specs */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {SPECS.map((spec) => (
                  <div key={spec.label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <spec.icon size={14} className="text-[var(--color-accent)]" />
                      <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        {spec.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">VIN</p>
                <p className="text-sm font-mono text-[var(--color-text-primary)]">{VEHICLE.vin}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Provenance Timeline */}
      <section className="py-16 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="container-page">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
            Provenance Timeline
          </h2>
          <div className="space-y-6">
            {[
              { date: "1971", title: "Delivered New", desc: "Delivered through German military exchange program" },
              { date: "2024", title: "Acquired by Current Owner", desc: "Purchased from private collector in Germany" },
            ].map((milestone, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mt-1.5" />
                  {i < 1 && <div className="w-px flex-1 bg-[var(--color-border)]" />}
                </div>
                <div>
                  <p className="text-xs text-[var(--color-accent)] font-medium">{milestone.date}</p>
                  <p className="text-base font-medium text-[var(--color-text-primary)]">{milestone.title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry CTA */}
      <section className="py-16">
        <div className="container-page text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-4">
            Interested in This Vehicle?
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Make an Inquiry
          </Link>
        </div>
      </section>
    </>
  );
}