import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tb = await getTranslations("brand");
  const locale = await getLocale();
  const isAr = locale === "ar";

  const FOOTER_LINKS = {
    [t("explore")]: [
      { href: "/", label: t("explore") },
      { href: "/vehicles", label: t("explore") },
    ],
  };

  const footerLinks: Record<string, { href: string; label: string }[]> = {
    [t("explore")]: [
      { href: "/", label: tn("home") },
      { href: "/vehicles", label: tn("vehicles") },
      { href: "/journal", label: tn("journal") },
      { href: "/about", label: tn("about") },
    ],
    [t("connect")]: [
      { href: "/contact", label: tn("contact") },
      { href: "mailto:aeeg.education@gmail.com", label: t("email") },
    ],
    [t("legal")]: [
      { href: "/privacy", label: t("privacy") },
      { href: "/terms", label: t("terms") },
    ],
  };

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4" aria-label="Fidelis Auto — home">
              {/* Gold line emblem for the ink footer surface */}
              <Image
                src="/logo-mark-light.svg"
                alt={tb("logoAlt")}
                width={32}
                height={32}
                className="w-8 h-8 shrink-0"
                unoptimized
              />
              <span className="flex flex-col leading-tight">
                {isAr ? (
                  <>
                    <span lang="ar" dir="rtl" className="font-[family-name:var(--font-arabic)] font-semibold text-lg text-[var(--color-text-inverse)]">
                      {tb("wordmarkAr")}
                    </span>
                    <span className="font-[family-name:var(--font-cormorant)] text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-text-inverse)]/70">
                      {tb("name")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[var(--color-text-inverse)]">
                      {tb("name")}
                    </span>
                    <span lang="ar" dir="rtl" className="font-[family-name:var(--font-arabic)] text-[0.7rem] font-medium text-[var(--color-text-inverse)]/70">
                      {tb("wordmarkAr")}
                    </span>
                  </>
                )}
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-[var(--color-accent)]">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link, idx) => (
                  <li key={`${link.href}-${idx}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-inverse)]/70 hover:text-[var(--color-accent)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--color-text-secondary)]">
            &copy; {new Date().getFullYear()} Fidelis Auto. {t("copyright")}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {t("forTheLoveOfCars")}
          </p>
        </div>
      </div>
    </footer>
  );
}