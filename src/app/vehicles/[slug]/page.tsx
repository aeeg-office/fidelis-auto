import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Gauge, Wrench, Palette } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import FavoriteButton from "@/components/FavoriteButton";
import SocialShare from "@/components/SocialShare";
import ContactSellerButton from "@/components/ContactSellerButton";
import VehicleGallery, { type GalleryImage } from "@/components/VehicleGallery";
import RelatedVehicles from "@/components/RelatedVehicles";
import { decidePhoneGate } from "@/lib/phone-gate";
import { getCurrentUser } from "@/lib/user-auth";

// ─── Config ────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fidelisauto.com";

/** Resolve a possibly-relative asset path to an absolute URL. */
function absoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Meta description from the long English description, flattened and truncated. */
function buildDescription(title: string, descriptionEn: string | null | undefined): string {
  const raw = descriptionEn?.replace(/\s+/g, " ").trim();
  if (!raw) return title;
  return raw.length > 158 ? `${raw.slice(0, 155).trimEnd()}…` : raw;
}

/** Structured-data price: parse the string price; omit when not parseable. */
function parsePrice(price: string | null | undefined): number | null {
  if (!price) return null;
  const n = Number(price.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─── Data ──────────────────────────────────────

type VehicleData = {
  slug: string; title: string; year: number; make: string; model: string;
  trim: string | null; vin: string | null; mileage: number | null;
  exteriorColor: string | null; interiorColor: string | null;
  engine: string | null; transmission: string | null; drivetrain: string | null;
  price: string | null; descriptionEn: string | null; description: string | null;
  isPublished: boolean;
  /** Ordered images from the DB (primary first, then sortOrder). */
  images: GalleryImage[];
  /** Cover image == first of the ordered images. */
  coverImage: string | null;
  /** Seller contact resolved from the owner (and dealer business profile when present). */
  ownerEmail: string | null;
  ownerPhone: string | null;
  dealerPhone: string | null;
};

async function getVehicle(slug: string): Promise<VehicleData | null> {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug, isPublished: true },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        owner: { include: { dealerProfile: true } },
      },
    });
    if (vehicle) {
      const images = (vehicle as { images: { src: string; alt?: string | null }[] }).images ?? [];
      const cover = images[0]?.src ?? null;
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
        images: images.map((i) => ({ src: i.src, alt: i.alt })),
        coverImage: cover,
        ownerEmail: vehicle.contactEmail ?? null, // never fall back to owner account email
        ownerPhone: vehicle.contactPhone ?? vehicle.owner?.phone ?? null,
        dealerPhone: vehicle.owner?.dealerProfile?.phone ?? null,
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

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
  const canonical = `https://fidelisauto.com/vehicles/${slug}`;
  const ogImage = absoluteUrl(vehicle.coverImage);

  return {
    title,
    description: buildDescription(vehicle.title, vehicle.descriptionEn),
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description: buildDescription(vehicle.title, vehicle.descriptionEn),
      url: canonical,
      siteName: "Fidelis Auto",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: buildDescription(vehicle.title, vehicle.descriptionEn),
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// ─── Page ──────────────────────────────────────

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  // WS2 privacy: gate seller phone/WhatsApp behind decidePhoneGate when enabled (off by default).
  const viewer = await getCurrentUser();
  const gateSeen = decidePhoneGate(viewer ? { id: viewer.id, phoneVerified: viewer.phoneVerified } : null);
  const vehicleForContact = {
    ...vehicle,
    ownerPhone: gateSeen.allowed ? vehicle.ownerPhone : null,
    dealerPhone: gateSeen.allowed ? vehicle.dealerPhone : null,
    ownerEmail: gateSeen.allowed ? vehicle.ownerEmail : null,
  };

  const specs = [
    { label: "Year", value: vehicle.year, icon: Calendar },
    { label: "Mileage", value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "—", icon: Gauge },
    { label: "Engine", value: vehicle.engine || "—", icon: Wrench },
    { label: "Exterior", value: vehicle.exteriorColor || "—", icon: Palette },
  ];

  const imagePath = vehicle.coverImage || `/images/placeholder-${slug}.svg`;
  const canonical = `https://fidelisauto.com/vehicles/${slug}`;
  const parsedPrice = parsePrice(vehicle.price);

  return (
    <>
      <JsonLd type="BreadcrumbList" data={{
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://fidelisauto.com" },
          { "@type": "ListItem", position: 2, name: "Vehicles", item: "https://fidelisauto.com/vehicles" },
          { "@type": "ListItem", position: 3, name: vehicle.title, item: canonical },
        ],
      }} />
      <JsonLd type="Vehicle" data={{
        name: vehicle.title,
        brand: { "@type": "Brand", name: vehicle.make },
        manufacturer: { "@type": "Organization", name: vehicle.make },
        model: vehicle.model,
        modelDate: vehicle.year,
        vehicleIdentificationNumber: vehicle.vin || undefined,
        mileageFromOdometer: vehicle.mileage ? { value: vehicle.mileage, unitText: "mi" } : undefined,
        vehicleTransmission: vehicle.transmission || undefined,
        vehicleEngine: vehicle.engine ? { name: vehicle.engine } : undefined,
        color: vehicle.exteriorColor || undefined,
        vehicleInteriorColor: vehicle.interiorColor || undefined,
        url: canonical,
        image: absoluteUrl(imagePath) ?? undefined,
        description: vehicle.descriptionEn || vehicle.description || undefined,
        ...(parsedPrice
          ? {
              offers: {
                "@type": "Offer",
                price: parsedPrice,
                priceCurrency: "USD",
                url: canonical,
                availability: "https://schema.org/InStock",
              },
            }
          : {}),
      }} />

      <div className="container-page py-6">
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
          <ArrowLeft size={16} /> Back to Vehicles
        </Link>
      </div>

      <section className="container-page">
        <div className="mb-8">
          <VehicleGallery
            images={vehicle.images}
            title={vehicle.title}
            fallbackSrc={imagePath}
          />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 min-w-0">
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-2 break-words">
              {vehicle.title}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : ""}
            </p>
            {(vehicle.descriptionEn || vehicle.description) && (
              <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)]">
                <p className="whitespace-pre-line">{vehicle.descriptionEn || vehicle.description}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 min-w-0">
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
                  <p className="text-sm font-mono text-[var(--color-text-primary)] break-words">{vehicle.vin}</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <ContactSellerButton
                vehicleSlug={slug}
                vehicleTitle={vehicle.title}
                ownerPhone={vehicleForContact.ownerPhone}
                dealerPhone={vehicleForContact.dealerPhone}
                ownerEmail={vehicleForContact.ownerEmail}
              />
              <FavoriteButton slug={slug} />
              <SocialShare
                url={canonical}
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
              ownerPhone={vehicleForContact.ownerPhone}
              dealerPhone={vehicleForContact.dealerPhone}
              ownerEmail={vehicleForContact.ownerEmail}
            />
          </div>
        </div>
      </section>
    </>
  );
}