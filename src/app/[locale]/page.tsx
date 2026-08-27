import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight, Car, CableCar, Zap } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import VehicleCard from "@/components/VehicleCard";
import RecentlySold from "@/components/RecentlySold";
import { getFeaturedVehicles, getRecentVehicles } from "@/lib/vehicle-data";

export default async function HomePage() {
  const t = await getTranslations("homepage");
  const tHero = await getTranslations("hero");

  const [featuredVehicles, recentVehicles] = await Promise.all([
    getFeaturedVehicles(2),
    getRecentVehicles(4),
  ]);

  const CATEGORIES = [
    { key: "Modern", label: t("categories.modern"), icon: Car, desc: t("categories.modernDesc"), color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "Classic", label: t("categories.classic"), icon: Car, desc: t("categories.classicDesc"), color: "bg-amber-50 text-amber-700 border-amber-200" },
    { key: "Vintage", label: t("categories.vintage"), icon: CableCar, desc: t("categories.vintageDesc"), color: "bg-purple-50 text-purple-700 border-purple-200" },
    { key: "EV", label: t("categories.electric"), icon: Zap, desc: t("categories.electricDesc"), color: "bg-green-50 text-green-700 border-green-200" },
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
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {tHero("cta")}
              <ArrowRight size={18} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.key}
                  href={`/vehicles?category=${cat.key}`}
                  className={`group flex flex-col items-center text-center p-6 md:p-8 rounded-xl border ${cat.color} hover:shadow-md hover:-translate-y-1 transition-all duration-200`}
                >
                  <div className="p-3 rounded-full bg-white/80 mb-4">
                    <Icon size={28} />
                  </div>
                  <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-1">
                    {cat.label}
                  </h3>
                  <p className="text-xs opacity-80 leading-relaxed">{cat.desc}</p>
                  <span className="mt-3 text-xs font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("browse")} <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
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
                No featured vehicles yet. New additions will appear here as they&apos;re published.
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
                No vehicles have been added yet. Check back soon.
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
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent)] hover:text-[var(--color-surface-dark)] transition-colors"
            >
              {t("viewAllVehicles")}
              <ArrowRight size={18} />
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
            className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent)] hover:text-[var(--color-surface-dark)] transition-colors"
          >
            {t("contactUs")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </>
  );
}