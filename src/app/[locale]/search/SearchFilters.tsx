"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

/** Enum option list — values are the exact Prisma enum keys the vehicles API accepts. */
const BODY_TYPES = [
  "SEDAN", "HATCHBACK", "SUV", "PICKUP", "VAN", "COUPE",
  "CONVERTIBLE", "WAGON", "MPV", "OTHER",
];
const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "LPG", "CNG", "OTHER"];
const TRANSMISSIONS = ["Manual", "Automatic", "Other"];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tf = useTranslations("filters");
  const tsp = useTranslations("searchPage");

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [maxMileage, setMaxMileage] = useState(searchParams.get("maxMileage") || "");
  const [bodyType, setBodyType] = useState(searchParams.get("bodyType") || "");
  const [fuelType, setFuelType] = useState(searchParams.get("fuelType") || "");
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const apply = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (year) params.set("year", year);
    if (maxMileage) params.set("maxMileage", maxMileage);
    if (bodyType) params.set("bodyType", bodyType);
    if (fuelType) params.set("fuelType", fuelType);
    if (transmission) params.set("transmission", transmission);
    router.push(params.toString() ? `/search?${params.toString()}` : "/search");
  };

  const clear = () => {
    setQ("");
    setYear("");
    setMaxMileage("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    router.push("/search");
  };

  const hasAny = q.trim() || year || maxMileage || bodyType || fuelType || transmission;

  const selectClass =
    "w-full px-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30";
  const labelClass =
    "block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider";

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 md:p-6 space-y-4">
      {/* Smart free-text */}
      <div className="relative">
        <Search
          size={16}
          className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder={tsp("searchPlaceholder")}
          className="w-full ps-9 pe-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </div>

      {/* Extended filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Year */}
        <div>
          <label className={labelClass}>{tf("year")}</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectClass}
          >
            <option value="">{tf("allYears")}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Max Mileage */}
        <div>
          <label className={labelClass}>{tf("maxMileage")}</label>
          <input
            type="number"
            min={0}
            value={maxMileage}
            onChange={(e) => setMaxMileage(e.target.value)}
            placeholder={tf("max")}
            className={selectClass}
          />
        </div>

        {/* Body Type */}
        <div>
          <label className={labelClass}>{tf("bodyType")}</label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className={selectClass}
          >
            <option value="">{tf("allTypes")}</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>
                {tf(`bodyTypes.${b}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className={labelClass}>{tf("fuelType")}</label>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className={selectClass}
          >
            <option value="">{tf("allFuelTypes")}</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {tf(`fuelTypes.${f}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className={labelClass}>{tf("transmission")}</label>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className={selectClass}
          >
            <option value="">{tf("allTransmissions")}</option>
            {TRANSMISSIONS.map((tr) => (
              <option key={tr} value={tr}>
                {tf(`transmissions.${tr}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={apply}
          className="px-4 py-2 text-sm font-medium bg-[var(--color-ink)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-ink-hover)] transition-colors"
        >
          {tf("applyFilters")}
        </button>
        {hasAny && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
          >
            <X size={14} /> {tf("clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}