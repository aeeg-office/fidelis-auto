import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Gauge, Wrench, Palette } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";

// ─── Data ──────────────────────────────────────

async function getVehicle(slug: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { slug } });
    if (vehicle) return vehicle;
  } catch {}
  // Fallback data for when DB is unavailable
  const FALLBACKS: Record<string, any> = {
    "porsche-911e": {
      slug: "porsche-911e", title: "1971 Porsche 911E", year: 1971, make: "Porsche", model: "911E",
      trim: "Coupe", vin: "9111300987", mileage: 3742, exteriorColor: "Albert Blue",
      interiorColor: "Beige Leatherette", engine: "2.2L Flat-6 (1991cc)", transmission: "5-Speed Manual",
      drivetrain: "Rear-Wheel Drive", price: null,
      descriptionEn: `Delivered new in 1971 through a German military exchange program, this 911E has covered just 3,742 miles from new. Finished in its original Albert Blue over Beige Leatherette, it remains in remarkably preserved condition.`,
      isPublished: true, image: "/images/placeholder-porsche-911e.svg",
    },
    "mercedes-230sl": {
      slug: "mercedes-230sl", title: "1967 Mercedes-Benz 230SL Pagoda", year: 1967, make: "Mercedes-Benz", model: "230SL",
      trim: "Pagoda", vin: "11304212000345", mileage: 12450, exteriorColor: "Silver",
      interiorColor: "Red Leather", engine: "2.3L Inline-6", transmission: "4-Speed Manual",
      drivetrain: "Rear-Wheel Drive", price: null,
      descriptionEn: `A beautifully restored 1967 Mercedes-Benz 230SL Pagoda. This example received a full rotisserie restoration and is finished in its original Silver over Red leather.`,
      isPublished: true, image: "/images/placeholder-mercedes-230sl.svg",
    },
    "porsche-911-carrera-rs": {
      slug: "porsche-911-carrera-rs", title: "1973 Porsche 911 Carrera RS 2.7", year: 1973, make: "Porsche", model: "911 Carrera RS",
      trim: "2.7", vin: "9113601512", mileage: 28500, exteriorColor: "Grand Prix Red",
      interiorColor: "Black Leatherette", engine: "2.7L Flat-6 (210 hp)", transmission: "5-Speed Manual",
      drivetrain: "Rear-Wheel Drive", price: null,
      descriptionEn: `One of the most iconic sports cars ever built. This 1973 Carrera RS 2.7 is a matching-numbers example with full documentation.`,
      isPublished: true, image: "/images/placeholder-porsche-911-carrera-rs.svg",
    },
    "mercedes-280sl": {
      slug: "mercedes-280sl", title: "1969 Mercedes-Benz 280SL", year: 1969, make: "Mercedes-Benz", model: "280SL",
      trim: null, vin: "11304412000456", mileage: 82300, exteriorColor: "White",
      interiorColor: "Blue MB-Tex", engine: "2.8L Inline-6", transmission: "Automatic",
      drivetrain: "Rear-Wheel Drive", price: null,
      descriptionEn: `A charming 1969 Mercedes-Benz 280SL in White over Blue. Recently serviced with comprehensive records dating back to the 1970s.`,
      isPublished: true, image: "/images/placeholder-mercedes-280sl.svg",
    },
  };
  return FALLBACKS[slug] || null;
}

// ─── Metadata ───────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Vehicle Not Found" };
  return {
    title: vehicle.title,
    description: `${vehicle.title} — ${vehicle.mileage?.toLocaleString() || "?"} miles. ${vehicle.exteriorColor} over ${vehicle.interiorColor}.`,
    alternates: { canonical: `https://fidelisauto.com/vehicles/${slug}` },
    openGraph: {
      title: vehicle.title,
      description: `${vehicle.title} — ${vehicle.mileage?.toLocaleString() || "?"} miles.`,
      url: `https://fidelisauto.com/vehicles/${slug}`,
    },
  };
}

// ─── Page ──────────────────────────────────────

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  const specs = [
    { label: "Year", value: vehicle.year, icon: Calendar },
    { label: "Mileage", value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "—", icon: Gauge },
    { label: "Engine", value: vehicle.engine || "—", icon: Wrench },
    { label: "Exterior", value: vehicle.exteriorColor || "—", icon: Palette },
  ];

  const imagePath = vehicle.image || `/images/placeholder-${slug}.svg`;

  return (
    <>
      <JsonLd type="BreadcrumbList" data={{
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://fidelisauto.com" },
          { "@type": "ListItem", position: 2, name: "Vehicles", item: "https://fidelisauto.com/vehicles" },
          { "@type": "ListItem", position: 3, name: vehicle.title, item: `https://fidelisauto.com/vehicles/${slug}` },
        ],
      }} />
      <JsonLd type="Vehicle" data={{
        name: vehicle.title, modelDate: vehicle.year,
        manufacturer: { "@type": "Organization", name: vehicle.make },
        model: vehicle.model, vehicleIdentificationNumber: vehicle.vin || undefined,
        mileageFromOdometer: vehicle.mileage ? { value: vehicle.mileage, unitText: "mi" } : undefined,
        vehicleTransmission: vehicle.transmission || undefined,
        vehicleEngine: vehicle.engine ? { name: vehicle.engine } : undefined,
        color: vehicle.exteriorColor || undefined,
        vehicleInteriorColor: vehicle.interiorColor || undefined,
        url: `https://fidelisauto.com/vehicles/${slug}`,
      }} />

      <div className="container-page py-6">
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
          <ArrowLeft size={16} /> Back to Vehicles
        </Link>
      </div>

      <section className="container-page">
        <div className="aspect-[21/9] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-8">
          <img src={imagePath} alt={vehicle.title} className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-2">
              {vehicle.title}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : ""}
            </p>
            <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)]">
              <p>{vehicle.descriptionEn || vehicle.description || ""}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <spec.icon size={14} className="text-[var(--color-accent)]" />
                      <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">{spec.label}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{spec.value}</p>
                  </div>
                ))}
              </div>
              {vehicle.vin && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">VIN</p>
                  <p className="text-sm font-mono text-[var(--color-text-primary)]">{vehicle.vin}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="container-page">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">Provenance Timeline</h2>
          <div className="space-y-6">
            {[
              { date: String(vehicle.year), title: "Manufactured", desc: `${vehicle.year} ${vehicle.make} ${vehicle.model} built` },
              { date: "Present", title: "Available at Fidelis Auto", desc: "Contact us for the full provenance file." },
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

      <section className="py-16">
        <div className="container-page text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-4">Interested in This Vehicle?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors">Make an Inquiry</Link>
        </div>
      </section>
    </>
  );
}