"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { MAKES, TRANSMISSIONS, COUNTRIES } from "@/lib/car-data";

// ─── Props ──────────────────────────────────────
interface FilterBarProps {
  bodyTypes: string[];
  categories?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  Modern: "Modern",
  Classic: "Classic",
  Vintage: "Vintage",
  EV: "Electric",
  Other: "Other",
};

export default function FilterBar({ bodyTypes, categories = [] }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [make, setMake] = useState(searchParams.get("make") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [yearMin, setYearMin] = useState(searchParams.get("yearMin") || "");
  const [yearMax, setYearMax] = useState(searchParams.get("yearMax") || "");
  const [bodyType, setBodyType] = useState(searchParams.get("bodyType") || "");
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  // Get models for the selected make
  const makeEntry = MAKES.find((m) => m.make === make);
  const models = makeEntry ? makeEntry.models : [];

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (yearMin) params.set("yearMin", yearMin);
    if (yearMax) params.set("yearMax", yearMax);
    if (bodyType) params.set("bodyType", bodyType);
    if (transmission) params.set("transmission", transmission);
    if (country) params.set("country", country);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    return params.toString();
  }, [q, make, model, yearMin, yearMax, bodyType, transmission, country, priceMin, priceMax, category, sort]);

  const applyFilters = useCallback(() => {
    const qs = buildQuery();
    router.push(qs ? `/vehicles?${qs}` : "/vehicles");
  }, [buildQuery, router]);

  // Auto-submit on sort change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const clearFilters = useCallback(() => {
    setQ("");
    setMake("");
    setModel("");
    setYearMin("");
    setYearMax("");
    setBodyType("");
    setTransmission("");
    setCountry("");
    setPriceMin("");
    setPriceMax("");
    setCategory("");
    setSort("newest");
    router.push("/vehicles");
  }, [router]);

  const hasAnyFilter = q || make || model || yearMin || yearMax || bodyType || transmission || country || priceMin || priceMax || category || sort !== "newest";

  // Build year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 md:p-6 space-y-4">
      {/* Search Row */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="Search vehicles..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Make */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Make</label>
          <select
            value={make}
            onChange={(e) => { setMake(e.target.value); setModel(""); }}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          >
            <option value="">All Makes</option>
            {MAKES.map((m) => (
              <option key={m.make} value={m.make}>{m.make}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-50"
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Year Range */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Year</label>
          <div className="flex gap-1">
            <select
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              className="w-1/2 px-1 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
            >
              <option value="">Min</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={yearMax}
              onChange={(e) => setYearMax(e.target.value)}
              className="w-1/2 px-1 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
            >
              <option value="">Max</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          >
            <option value="">All Categories</option>
            {categories.length > 0 ? categories.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
            )) : (
              <>
                <option value="Modern">Modern</option>
                <option value="Classic">Classic</option>
                <option value="Vintage">Vintage</option>
                <option value="EV">Electric</option>
                <option value="Other">Other</option>
              </>
            )}
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Body Type</label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          >
            <option value="">All Types</option>
            {bodyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Transmission</label>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          >
            <option value="">All</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Price</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              className="w-1/2 px-1 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
            />
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              className="w-1/2 px-1 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Year: Newest</option>
            <option value="year-asc">Year: Oldest</option>
          </select>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-surface-dark)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Apply Filters
        </button>
        {hasAnyFilter && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}