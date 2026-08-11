import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Wrench, MapPin, Globe, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Specialist Services",
  description: "Trusted specialist services for collector and enthusiast vehicles.",
};

export default async function ServicesPage() {
  const services = await prisma.serviceListing.findMany({
    where: { isPublished: true },
    select: { id: true, businessName: true, category: true, description: true, phone: true, website: true, city: true, country: true },
    orderBy: [{ category: "asc" }, { businessName: "asc" }],
  });

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">Fidelis network</p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold md:text-5xl">Specialist Services</h1>
        <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">A curated directory for the practical work behind exceptional ownership: restoration, maintenance, inspection, transport, storage, and more.</p>
      </div>
      {services.length === 0 ? (
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <Wrench className="mx-auto text-[var(--color-accent)]" size={36} />
          <h2 className="mt-4 text-xl font-semibold">The specialist directory is being curated.</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Check back soon for verified service partners.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">{service.category}</p>
              <h2 className="mt-2 text-xl font-semibold">{service.businessName}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{service.description}</p>
              {(service.city || service.country) && <p className="mt-4 flex items-center gap-2 text-sm"><MapPin size={15} /> {[service.city, service.country].filter(Boolean).join(", ")}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--color-accent)]">
                {service.website && <a className="inline-flex items-center gap-1 hover:underline" href={service.website} target="_blank" rel="noreferrer"><Globe size={15} /> Website</a>}
                {service.phone && <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${service.phone}`}><Phone size={15} /> Contact</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
