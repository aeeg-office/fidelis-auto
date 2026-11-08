"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Star } from "lucide-react";

type PublicReview = {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  createdAt: string;
};

type Props = {
  slug: string;
  userId: string | null;
  isVerified: boolean;
};

export default function VehicleReviews({ slug, userId, isVerified }: Props) {
  const t = useTranslations("reviews");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [providerContext, setProviderContext] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    fetch(`/api/vehicles/${slug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [slug]);

  useEffect(load, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/vehicles/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          text,
          providerContext: providerContext.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setMessage({ kind: "error", text: t("signInToReview") });
      } else if (res.status === 403) {
        setMessage({ kind: "error", text: t("verifyToReview") });
      } else if (res.status === 409) {
        setMessage({ kind: "error", text: t("alreadyReviewed") });
      } else if (!res.ok) {
        setMessage({ kind: "error", text: data.error || "Something went wrong." });
      } else {
        setMessage({ kind: "ok", text: t("submittedPending") });
        setRating(0);
        setText("");
        setProviderContext("");
      }
    } catch {
      setMessage({ kind: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="container-page">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
          {t("title")}
        </h2>

        {!loaded ? (
          <p className="text-sm text-[var(--color-text-secondary)]">…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t("noReviewsYet")}</p>
        ) : (
          <div className="space-y-5 mb-10">
            {reviews.map((r) => (
              <div key={r.id} className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] p-5">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{r.authorName}</p>
                  <div className="flex items-center gap-0.5" aria-label={`${r.rating}/5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={n <= r.rating ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-border)]"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">{r.text}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 opacity-70">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {userId === null ? (
          <div className="rounded-lg border border-[var(--color-border)] p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t("signInToReview")}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-[var(--color-ink)] text-[var(--color-ink)] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-text-inverse)] transition-colors"
            >
              {t("writeReview")}
            </Link>
          </div>
        ) : !isVerified ? (
          <div className="rounded-lg border border-[var(--color-border)] p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t("verifyToReview")}</p>
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 border border-[var(--color-ink)] text-[var(--color-ink)] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-text-inverse)] transition-colors"
            >
              {t("verifyToReview")}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-lg border border-[var(--color-border)] p-6 space-y-4 max-w-2xl">
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[var(--color-text-primary)]">
              {t("writeReview")}
            </h3>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t("rating")}</p>
              <div className="flex items-center gap-1" role="radiogroup" aria-label={t("rating")}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n}/5`}
                    onClick={() => setRating(n)}
                    className="p-1"
                  >
                    <Star
                      size={22}
                      className={n <= rating ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-border)]"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-text" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {t("yourReview")}
              </label>
              <textarea
                id="review-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                required
                minLength={10}
                maxLength={2000}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label htmlFor="review-context" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {t("providerContext")}
              </label>
              <textarea
                id="review-context"
                value={providerContext}
                onChange={(e) => setProviderContext(e.target.value)}
                rows={2}
                maxLength={1000}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{t("providerContextHint")}</p>
            </div>

            {message && (
              <p role="alert" className={`text-sm ${message.kind === "ok" ? "text-green-700" : "text-red-700"}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="inline-flex items-center gap-2 bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "…" : t("submit")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
