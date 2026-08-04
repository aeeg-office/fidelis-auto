"use client";

import { create } from "zustand";

const MAX_COMPARE = 3;

interface CompareState {
  slugs: string[];
  addSlug: (slug: string) => void;
  removeSlug: (slug: string) => void;
  toggleSlug: (slug: string) => void;
  isSelected: (slug: string) => boolean;
  clearAll: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  slugs: [],
  addSlug: (slug: string) => {
    const { slugs } = get();
    if (slugs.length >= MAX_COMPARE) return;
    if (slugs.includes(slug)) return;
    set({ slugs: [...slugs, slug] });
  },
  removeSlug: (slug: string) => {
    set((state) => ({
      slugs: state.slugs.filter((s) => s !== slug),
    }));
  },
  toggleSlug: (slug: string) => {
    const { slugs } = get();
    if (slugs.includes(slug)) {
      set({ slugs: slugs.filter((s) => s !== slug) });
    } else if (slugs.length < MAX_COMPARE) {
      set({ slugs: [...slugs, slug] });
    }
  },
  isSelected: (slug: string) => get().slugs.includes(slug),
  clearAll: () => set({ slugs: [] }),
}));