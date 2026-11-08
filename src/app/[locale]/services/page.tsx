import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { parseSpecialties } from "@/lib/service-listing";
import { prisma } from "@/lib/prisma";
import { Wrench, MapPin, Globe, Phone, Plus, Languages, Tag } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SERVICE_CATEGORIES } from "@/lib/fidelisTaxonomy";
import LocationSearchBox from "./LocationSearchBox";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

type ServiceRow = {
  id: string;
  businessName: string;
  category: string;
  description: string;
  phone: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  specialties: string | null;
  languages: string | null;
  coverageArea: string | null;
  whatsapp: string | null;
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { city, coverage } = await searchParams;
  const t = await getTranslations("services");

  // WS13 location search: a single term filters by city or coverage area (L+ basic).
  const location = (city || coverage || "").toString().trim();

  const services = (await prisma.serviceListing.findMany({
    where: {
      isPublished: true,
      ...(location
        ? {
            OR: [
              { city: { contains: location, mode: "insensitive" } },
              { coverageArea: { contains: location, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, businessName: true, category: true, description: true, phone: true, website: true, city: true, country: true, specialties: true, languages: true, coverageArea: true, whatsapp: true },
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">{t("networkLabel")}</p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold md:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
          {t("description")}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <Suspense>
          <LocationSearchBox />
        </Suspense>
        <Link href="/services/submit" className="inline-flex items-center gap-2 text-sm bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-4 py-2 rounded-md font-medium hover:opacity-95">
          <Plus size={15} /> {t("submitYourService")}
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <Wrench className="mx-auto text-[var(--color-accent)]" size={36} />
          <h2 className="mt-4 text-xl font-semibold">{location ? t("locationEmptyTitle") : t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{location ? t("locationEmptyDesc") : t("emptyDesc")}</p>
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
                      {(service.city || service.country || service.coverageArea) && (
                        <p className="mt-4 flex items-center gap-2 text-sm">
                          <MapPin size={15} /> {[service.coverageArea || service.city, service.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {service.languages && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <Languages size={15} /> {t("languages")}: {service.languages}
                        </p>
                      )}
                      {service.specialties && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <Tag size={14} className="text-[var(--color-text-secondary)]" />
                          {(parseSpecialties(service.specialties)).map((tag) => (
                            <span key={tag} className="rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--color-accent)]">
                        {service.website && (
                          <a className="inline-flex items-center gap-1 hover:underline" href={service.website} target="_blank" rel="noreferrer">
                            <Globe size={15} /> {t("website")}
                          </a>
                        )}
                        {(service.phone || service.whatsapp) && (
                          <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${service.whatsapp || service.phone}`}>
                            <Phone size={15} /> {service.whatsapp ? t("whatsapp") : t("contact")}
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
                      {(service.city || service.country || service.coverageArea) && (
                        <p className="mt-4 flex items-center gap-2 text-sm"><MapPin size={15} /> {[service.coverageArea || service.city, service.country].filter(Boolean).join(", ")}</p>
                      )}
                      {service.languages && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"><Languages size={15} /> {t("languages")}: {service.languages}</p>
                      )}
                      {service.specialties && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <Tag size={14} className="text-[var(--color-text-secondary)]" />
                          {(parseSpecialties(service.specialties)).map((tag) => (
                            <span key={tag} className="rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                      {(service.phone || service.whatsapp) && (
                        <a className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline" href={`tel:${service.whatsapp || service.phone}`}>
                          <Phone size={15} /> {service.whatsapp ? t("whatsapp") : t("contact")}
                        </a>
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
