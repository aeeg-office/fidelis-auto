import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Wrench, MapPin, Globe, Phone, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/fidelisTaxonomy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Specialist Services",
  description: "Trusted specialist services for collector and enthusiast vehicles.",
};

type ServiceRow = {
  id: string;
  businessName: string;
  category: string;
  description: string;
  phone: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
};

export default async function ServicesPage() {
  const services = (await prisma.serviceListing.findMany({
    where: { isPublished: true },
    select: { id: true, businessName: true, category: true, description: true, phone: true, website: true, city: true, country: true },
    orderBy: [{ category: "asc" }, { businessName: "asc" }],
  })) as unknown as ServiceRow[];

  const byCategory: Record<string, ServiceRow[]> = {};
  for (const s of services) {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">Fidelis network</p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold md:text-5xl">Specialist Services</h1>
        <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
          A curated directory for the practical work behind exceptional ownership: restoration, maintenance,
          inspection, transport, storage, and more — arranged across six trusted specialties.
        </p>
      </div>

      <div className="mt-6">
        <Link href="/services/submit" className="inline-flex items-center gap-2 text-sm bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-4 py-2 rounded-md font-medium hover:opacity-95">
          <Plus size={15} /> Submit Your Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <Wrench className="mx-auto text-[var(--color-accent)]" size={36} />
          <h2 className="mt-4 text-xl font-semibold">The specialist directory is being curated.</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Check back soon for verified service partners.</p>
        </div>
      ) : (
        <div className="mt-12 space-y-10">
          {SERVICE_CATEGORIES.map((group) => {
            const items = byCategory[group.label];
            if (!items || items.length === 0) return null;
            return (
              <section key={group.slug}>
                <div className="flex items-baseline gap-3 border-b border-[var(--color-border)] pb-3 mb-5">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)]">
                    {group.label}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{group.description}</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {items.map((service) => (
                    <article key={service.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                      <h3 className="text-lg font-semibold">{service.businessName}</h3>
                      <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{service.description}</p>
                      {(service.city || service.country) && (
                        <p className="mt-4 flex items-center gap-2 text-sm">
                          <MapPin size={15} /> {[service.city, service.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--color-accent)]">
                        {service.website && (
                          <a className="inline-flex items-center gap-1 hover:underline" href={service.website} target="_blank" rel="noreferrer">
                            <Globe size={15} /> Website
                          </a>
                        )}
                        {service.phone && (
                          <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${service.phone}`}>
                            <Phone size={15} /> Contact
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          {/* If there are services in a category not in the 6 groups */}
          {Object.keys(byCategory)
            .filter((c) => !SERVICE_CATEGORIES.some((g) => g.label === c))
            .map((other) => (
              <section key={other}>
                <div className="flex items-baseline gap-3 border-b border-[var(--color-border)] pb-3 mb-5">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold">{other}</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {byCategory[other].map((service) => (
                    <article key={service.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                      <h3 className="text-lg font-semibold">{service.businessName}</h3>
                      <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{service.description}</p>
                      {(service.city || service.country) && (
                        <p className="mt-4 flex items-center gap-2 text-sm"><MapPin size={15} /> {[service.city, service.country].filter(Boolean).join(", ")}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}