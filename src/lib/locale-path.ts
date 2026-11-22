import { routing } from "@/i18n/routing";

/**
 * Prefix an internal path with the active locale, matching the next-intl
 * `localePrefix: "as-needed"` policy (the default locale has no prefix).
 *
 * Use this anywhere a redirect target is built inside the `[locale]` tree so the
 * visitor stays in the locale they were browsing (e.g. `/ar/watchlist` must send
 * an anonymous Arabic visitor to `/ar/login` and not to `/login`).
 */
export function localePath(locale: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === routing.defaultLocale ? clean : `/${locale}${clean}`;
}

/**
 * Safely extract an internal redirect target from a `?redirect=` query value.
 * Returns `null` for anything that is not a same-site absolute path, which makes
 * an open redirect impossible (rejects `https://evil`, `//evil`, `javascript:`,
 * backslashes and control characters).
 */
export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v.startsWith("/")) return null;
  if (v.startsWith("//") || v.startsWith("/\\")) return null;
  if (/[\u0000-\u001F\u007F\\]/.test(v)) return null;
  if (v.includes("://")) return null;
  return v;
}
