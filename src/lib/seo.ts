/**
 * Shared per-locale SEO helpers.
 *
 * Every page in the [locale] tree must produce a SELF-REFERENCING canonical and
 * an en <-> ar-EG hreflang pair. The root layout no longer hardcodes a global
 * canonical, so pages that don't set their own would be wrong — every page calls
 * getAlternates(locale, pagePath).
 */

const BASE_URL = "https://fidelisauto.com";

/**
 * Site-wide default social image. A page that sets its own `openGraph` object
 * replaces the root layout's one entirely (metadata objects merge shallowly),
 * so such pages must include this explicitly or they ship without og:image.
 */
export const DEFAULT_OG_IMAGE = {
  url: `${BASE_URL}/images/og-default.png`,
  width: 1200,
  height: 630,
  alt: "Fidelis Auto — Egypt's car destination",
} as const;

export type Locale = "en" | "ar";

/** Root path for a locale (en is default and has no prefix). */
export const localeRoot = (locale: string): string =>
  (locale as Locale) === "ar" ? "/ar" : "";

/**
 * Build alternates (canonical + hreflang) for a page whose path relative to the
 * locale root is `pagePath` (e.g. "/vehicles" or "/vehicles/volkswagen-beetle-1959").
 * Pass an empty string for the locale's own homepage.
 */
export function getAlternates(locale: string, pagePath: string = "") {
  const root = localeRoot(locale);
  // Normalise: path never has a trailing slash except the bare root.
  const path = pagePath && pagePath !== "/" ? pagePath.replace(/\/+$/, "") : "";
  const current = `${root}${path}`;
  const enPath = `${path}`;
  const arPath = `/ar${path}`;

  return {
    canonical: `${BASE_URL}${current}`,
    languages: {
      en: `${BASE_URL}${enPath}`,
      "ar-EG": `${BASE_URL}${arPath}`,
      "x-default": `${BASE_URL}${enPath}`,
    } as Record<string, string>,
  };
}
