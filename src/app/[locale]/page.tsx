import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight, Bike, Car, LayoutGrid } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import VehicleCard from "@/components/VehicleCard";
import VehicleImage from "@/components/VehicleImage";
import RecentlySold from "@/components/RecentlySold";
import { getFeaturedVehicles, getRecentVehicles } from "@/lib/vehicle-data";
import { getVisibleCollections } from "@/lib/collections-data";

export default async function HomePage() {
  const t = await getTranslations("homepage");
  const tHero = await getTranslations("hero");
  const locale = await getLocale();
  const isAr = locale === "ar";

  const [featuredVehicles, recentVehicles, collections] = await Promise.all([
    getFeaturedVehicles(2),
    getRecentVehicles(4),
    getVisibleCollections(),
  ]);

  const CATEGORIES = [
    { key: "cars", label: t("categories.cars"), icon: Car, href: "/vehicles?type=CAR", desc: t("categories.carsDesc") },
    { key: "motorcycles", label: t("categories.motorcycles"), icon: Bike, href: "/vehicles?type=MOTORCYCLE", desc: t("categories.motorcyclesDesc") },
    { key: "collections", label: t("categories.collections"), icon: LayoutGrid, href: "/collections", desc: t("categories.collectionsDesc") },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] bg-[var(--color-surface-dark)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-surface-dark)] z-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-20 px-4">
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl lg:text-8xl font-semibold text-[var(--color-text-inverse)] mb-4">
              {tHero("title")}
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-inverse)]/80 max-w-2xl mx-auto mb-8">
              {tHero("subtitle")}
            </p>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-[var(--color-text-inverse)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-text-inverse)]/90 transition-colors"
            >
              {tHero("cta")}
              <ArrowRight size={18} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 md:py-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
              {t("browseByCategory")}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              {t("browseSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className="group flex flex-col items-center text-center p-6 md:p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-accent)] text-[var(--color-ink)] hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-[var(--color-bg)] mb-4">
                    <Icon size={28} />
                  </div>
                  <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-1 text-[var(--color-ink)]">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{cat.desc}</p>
                  <span className="mt-3 text-xs font-medium inline-flex items-center gap-1 text-[var(--color-ink)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("browse")} <ArrowRight size={12} className="rtl:rotate-180" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-16 md:py-20 border-b border-[var(--color-border)]">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
              {t("curatedCollections")}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              {t("curatedSubtitle")}
            </p>
          </div>

          {collections.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)]">{t("collectionsEmpty")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {collections.slice(0, 6).map((c, i) => {
                const title = isAr && c.titleAr ? c.titleAr : c.titleEn;
                return (
                  <Link
                    key={c.id}
                    href={`/collections/${c.slug}`}
                    className="group block bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-[var(--color-accent)]/50"
                  >
                    <div className="relative aspect-[16/9] bg-[var(--color-surface-dark)] overflow-hidden">
                      {c.coverSrc ? (
                        <VehicleImage
                          src={c.coverSrc}
                          alt={title}
                          fill
                          priority={i < 3}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {title}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                        {title}
                      </h3>
                      <span className="inline-flex items-center mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                        {t("viewAllCollections")}
                        <ArrowRight size={14} className="ms-1 text-[var(--color-accent)] transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
              {t("featuredVehicles")}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              {t("featuredSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredVehicles.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] col-span-full text-center">
                {t("noFeaturedEmpty")}
              </p>
            ) : (
              featuredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.slug}
                  vehicle={vehicle}
                  variant="simple"
                  priority
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-16 md:py-24 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-3">
              {t("recentlyAdded")}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              {t("recentlySubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {recentVehicles.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] col-span-full text-center">
                {t("noRecentEmpty")}
              </p>
            ) : (
              recentVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.slug}
                  vehicle={vehicle}
                  variant="simple"
                />
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 border border-[var(--color-ink)] text-[var(--color-ink)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-text-inverse)] transition-colors"
            >
              {t("viewAllVehicles")}
              <ArrowRight size={18} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-16 md:py-24 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
        <div className="container-page text-center max-w-3xl">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold mb-6">
            {t("brandStatement")}
          </h2>
          <p className="text-lg text-[var(--color-text-inverse)]/70 leading-relaxed">
            {t("brandDescription")}
          </p>
        </div>
      </section>

      {/* Recently Sold */}
      <RecentlySold />

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-page text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-4">
            {t("haveACar")}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
            {t("haveACarDesc")}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-[var(--color-ink)] text-[var(--color-ink)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-text-inverse)] transition-colors"
          >
            {t("contactUs")}
            <ArrowRight size={18} className="rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </>
  );
}