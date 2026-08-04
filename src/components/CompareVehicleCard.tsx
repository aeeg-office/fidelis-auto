"use client";

import { CheckSquare, Square } from "lucide-react";
import { useCompareStore } from "@/lib/compare-store";
import type { VehicleCardData } from "./VehicleCard";
import VehicleCard from "./VehicleCard";

export default function CompareVehicleCard({
  vehicle,
  variant = "detailed",
  sold = false,
  priority = false,
}: {
  vehicle: VehicleCardData;
  variant?: "detailed" | "simple";
  sold?: boolean;
  priority?: boolean;
}) {
  const { slugs, toggleSlug } = useCompareStore();
  const isSelected = slugs.includes(vehicle.slug);

  return (
    <div className="relative">
      <VehicleCard
        vehicle={vehicle}
        variant={variant}
        sold={sold}
        priority={priority}
      />
      {/* Compare checkbox overlay */}
      {variant === "detailed" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSlug(vehicle.slug);
          }}
          className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isSelected
              ? "bg-[var(--color-accent)] text-[var(--color-surface-dark)]"
              : "bg-[var(--color-surface)]/90 text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          }`}
          aria-label={isSelected ? "Remove from compare" : "Add to compare"}
        >
          {isSelected ? (
            <CheckSquare size={14} />
          ) : (
            <Square size={14} />
          )}
          <span>Compare</span>
        </button>
      )}
    </div>
  );
}