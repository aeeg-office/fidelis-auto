"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, User, BarChart3, Globe, ShieldCheck, Building2, LayoutDashboard, Heart } from "lucide-react";
import { roleLandingPath, type AccountRole } from "@/lib/authorization";
import { useCompareStore } from "@/lib/compare-store";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: AccountRole } | null>(null);
  const compareCount = useCompareStore((s) => s.slugs.length);
  const compareSlugs = useCompareStore((s) => s.slugs);
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const tb = useTranslations("brand");
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => {});
  }, []);

  // Determine current locale from pathname
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const switchLabel = currentLocale === "en" ? tc("languageSwitch") : tc("languageSwitchEnglish");

  // Build the switch URL by replacing /ar prefix or adding it
  const switchHref = (() => {
    if (currentLocale === "en") {
      return `/ar${pathname === "/" ? "" : pathname}`;
    } else {
      const withoutAr = pathname.replace(/^\/ar/, "") || "/";
      return withoutAr;
    }
  })();

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/vehicles", label: t("vehicles") },
    { href: "/search", label: t("search") },
    { href: "/journal", label: t("journal") },
    { href: "/services", label: t("services") },
    { href: "/submit", label: t("sellYourCar") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="container-page flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Fidelis Auto — home">
          {/* Ink + gold emblem on the ivory header surface */}
          <Image
            src="/logo-mark.svg"
            alt={tb("logoAlt")}
            width={40}
            height={40}
            className="w-10 h-10 shrink-0"
            unoptimized
            priority
          />
          <span className="flex flex-col leading-tight">
            {currentLocale === "ar" ? (
              <>
                <span lang="ar" dir="rtl" className="font-[family-name:var(--font-arabic)] font-bold text-xl md:text-2xl text-[var(--color-text-primary)] group-hover:text-[var(--color-ink)] transition-colors">
                  {tb("wordmarkAr")}
                </span>
                <span className="font-[family-name:var(--font-cormorant)] text-xs tracking-[0.22em] uppercase font-semibold text-[var(--color-text-secondary)]">
                  {tb("name")}
                </span>
              </>
            ) : (
              <>
                <span className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-ink)] transition-colors uppercase">
                  {tb("name")}
                </span>
                <span lang="ar" dir="rtl" className="font-[family-name:var(--font-arabic)] text-xs font-medium text-[var(--color-text-secondary)]">
                  {tb("wordmarkAr")}
                </span>
              </>
            )}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors">
              {link.label}
            </Link>
          ))}

          {/* Compare button */}
          {compareCount > 0 && (
            <Link
              href={`/compare?slugs=${compareSlugs.join(",")}`}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] hover:underline"
            >
              <BarChart3 size={16} />
              <span>{t("compare")} ({compareCount})</span>
            </Link>
          )}

          {user && (
            <Link
              href="/watchlist"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
            >
              <Heart size={16} />
              <span>{t("watchlist")}</span>
            </Link>
          )}

          {user && (
            <Link
              href={roleLandingPath(user.role)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
            >
              {user.role === "DEALER" ? <Building2 size={16} /> : user.role === "ADMINISTRATOR" || user.role === "SUPER_ADMIN" ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
              <span>{user.role === "DEALER" ? t("dealerPortal") : user.role === "ADMINISTRATOR" || user.role === "SUPER_ADMIN" ? t("administration") : t("dashboard")}</span>
            </Link>
          )}

          {/* Language Switcher */}
          <Link
            href={switchHref}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors border border-[var(--color-border)] rounded-md px-2.5 py-1.5"
            aria-label={switchLabel}
          >
            <Globe size={14} />
            {switchLabel}
          </Link>

          {user ? (
            <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => location.reload())}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors">
              <User size={16} /> {user.name} ({t("signOut")})
            </button>
          ) : (
            <Link href="/login"
              className="text-sm font-medium text-[var(--color-ink)] hover:underline">
              {t("signIn")}
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Language Switcher */}
          <Link
            href={switchHref}
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] px-2 py-1 border border-[var(--color-border)] rounded"
            aria-label={switchLabel}
          >
            <Globe size={14} />
            {switchLabel}
          </Link>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[var(--color-text-primary)]"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="container-page py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors">
                {link.label}
              </Link>
            ))}

            {compareCount > 0 && (
              <Link
                href={`/compare?slugs=${compareSlugs.join(",")}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-base font-medium text-[var(--color-ink)]"
              >
                <BarChart3 size={16} />
                <span>{t("compare")} ({compareCount})</span>
              </Link>
            )}

            {user && (
              <Link
                href={roleLandingPath(user.role)}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
              >
                {user.role === "DEALER" ? <Building2 size={16} /> : user.role === "ADMINISTRATOR" || user.role === "SUPER_ADMIN" ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
                {user.role === "DEALER" ? t("dealerPortal") : user.role === "ADMINISTRATOR" || user.role === "SUPER_ADMIN" ? t("administration") : t("dashboard")}
              </Link>
            )}

            {!user && (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-[var(--color-ink)]">
                {t("signIn")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}