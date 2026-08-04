"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  slug: string;
  className?: string;
};

export default function FavoriteButton({ slug, className = "" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promptLogin, setPromptLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/vehicles/${slug}/favorite`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.favorited) setFavorited(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function toggle() {
    setLoading(true);
    setPromptLogin(false);
    try {
      const res = await fetch(`/vehicles/${slug}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorited: !favorited }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setPromptLogin(true);
      } else {
        setFavorited(Boolean(data.favorited));
      }
    } catch {
      // Ignore network errors.
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={toggle}
        disabled={loading}
        aria-pressed={favorited}
        className={`inline-flex items-center gap-2 border px-5 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
          favorited
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-surface-dark)]"
            : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        }`}
      >
        <Heart size={16} fill={favorited ? "currentColor" : "none"} />
        {favorited ? "Saved to Favorites" : "Save to Favorites"}
      </button>
      {promptLogin && (
        <p className="mt-2 text-xs text-[var(--color-accent)]">
          Please log in to save favorites.
        </p>
      )}
    </div>
  );
}