"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

/**
 * WS13 location search box for the services directory.
 *
 * Reads the current `city` query param (initial value) and, on submit, preserves the
 * current search params while setting `city` to the entered term. Bilingual labels come
 * from the `services` messages namespace. Debounced router navigation keeps it snappy.
 */
export default function LocationSearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("services");

  const [term, setTerm] = useState(searchParams.get("city") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function applyFilters(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("city", value.trim());
    } else {
      params.delete("city");
    }
    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  }

  function onChange(value: string) {
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilters(value), 400);
  }

  function onClear() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setTerm("");
    applyFilters("");
  }

  const hasCity = Boolean(searchParams.get("city"));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-xs">
        <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          value={term}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("locationSearchPlaceholder")}
          className="w-full ps-9 pe-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </div>
      {hasCity && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
        >
          <X size={14} /> {t("locationSearchClear")}
        </button>
      )}
      <p className="w-full max-w-xs text-xs text-[var(--color-text-secondary)]">{t("locationSearchHint")}</p>
    </div>
  );
}