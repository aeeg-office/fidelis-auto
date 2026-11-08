import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function OfflinePage() {
  const t = await getTranslations("offline");
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Brand mark */}
      <div className="w-20 h-20 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center mb-6">
        <span className="w-8 h-8 bg-[var(--color-accent)] rounded-full" />
      </div>

      <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-cormorant)] font-bold text-[var(--color-text-primary)] mb-3">
        {t("title")}
      </h1>

      <p className="text-[var(--color-text-secondary)] max-w-md mb-8">
        {t("description")}
      </p>

      <div className="w-16 h-px bg-[var(--color-accent)] mb-8" />

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[var(--color-ink-hover)] transition-colors"
      >
        {t("tryAgain")}
      </Link>

      <p className="mt-6 text-xs text-[var(--color-text-secondary)]/60">
        {t("tagline")}
      </p>
    </div>
  );
}
