import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Gauge, Wrench, Palette } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import FavoriteButton from "@/components/FavoriteButton";
import SocialShare from "@/components/SocialShare";
import ContactSellerButton from "@/components/ContactSellerButton";
import VehicleImage from "@/components/VehicleImage";
import RelatedVehicles from "@/components/RelatedVehicles";

// ─── Data ──────────────────────────────────────

type VehicleData = {
  slug: string; title: string; year: number; make: string; model: string;
  trim: string | null; vin: string | null; mileage: number | null;
  exteriorColor: string | null; interiorColor: string | null;
  engine: string | null; transmission: string | null; drivetrain: string | null;
  price: string | null; descriptionEn: string | null; description: string | null;
  isPublished: boolean; image: string | null;
};

async function getVehicle(slug: string): Promise<VehicleData | null> {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      },
    });
    if (vehicle) {
      const primary = (vehicle as { images?: { src: string }[] }).images?.[0];
      return {
        slug: vehicle.slug,
        title: vehicle.title,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        vin: vehicle.vin,
        mileage: vehicle.mileage,
        exteriorColor: vehicle.exteriorColor,
        interiorColor: vehicle.interiorColor,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        drivetrain: vehicle.drivetrain,
        price: vehicle.price,
        descriptionEn: vehicle.descriptionEn,
        description: vehicle.descriptionEn,
        isPublished: vehicle.isPublished,
        image: primary?.src ?? null,
      };
    }
  } catch {
    // ignore, fall through to not-found
  }
  // DB unreachable or not found — never fabricate (FID-010).
  return null;
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
        <div className="relative aspect-[21/9] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden mb-8">
          <VehicleImage
            src={imagePath}
            alt={vehicle.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 90vw"
            className="object-cover"
          />
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

            <div className="mt-4 space-y-3">
              <ContactSellerButton
                vehicleSlug={slug}
                vehicleTitle={vehicle.title}
              />
              <FavoriteButton slug={slug} />
              <SocialShare
                url={`https://fidelisauto.com/vehicles/${slug}`}
                title={vehicle.title}
              />
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

      {/* Related Vehicles */}
      <RelatedVehicles
        currentSlug={vehicle.slug}
        make={vehicle.make}
        year={vehicle.year}
      />

      <section className="py-16">
        <div className="container-page text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-4">Interested in This Vehicle?</h2>
          <div className="max-w-xs mx-auto">
            <ContactSellerButton
              vehicleSlug={slug}
              vehicleTitle={vehicle.title}
            />
          </div>
        </div>
      </section>
    </>
  );
}