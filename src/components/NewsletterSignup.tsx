"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

type NewsletterSignupProps = {
  /** Renders a tighter, card-style layout for sidebars. */
  compact?: boolean;
};

export default function NewsletterSignup({ compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (compact) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 text-center">
        <Mail className="mx-auto mb-3 text-[var(--color-accent)]" size={24} />
        <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          Stay in the Loop
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          New arrivals, guides, and stories from the world of cars — straight to
          your inbox.
        </p>
        {status === "success" ? (
          <p className="flex items-center justify-center gap-2 text-sm text-[var(--color-accent)]">
            <Check size={16} /> {message}
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-4 py-2 rounded text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
            {status === "error" && (
              <p className="mt-2 text-xs text-red-500">{message}</p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
      <div className="container-page max-w-2xl text-center">
        <Mail className="mx-auto mb-4 text-[var(--color-accent)]" size={28} />
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold mb-3">
          Stay in the Loop
        </h2>
        <p className="text-[var(--color-text-inverse)]/70 mb-8 max-w-xl mx-auto">
          New arrivals, buying guides, and stories from the world of cars. Join
          the Fidelis Auto newsletter — no spam, just good cars.
        </p>

        {status === "success" ? (
          <p className="flex items-center justify-center gap-2 text-lg text-[var(--color-accent)]">
            <Check size={20} /> {message}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded border border-white/10 bg-white/5 text-[var(--color-text-inverse)] placeholder:text-[var(--color-text-inverse)]/50 focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-4 text-sm text-red-400">{message}</p>
        )}
      </div>
    </section>
  );
}