"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Check } from "lucide-react";

type NewsletterSignupProps = {
  /** Renders a tighter, card-style layout for sidebars. */
  compact?: boolean;
};

export default function NewsletterSignup({ compact = false }: NewsletterSignupProps) {
  const t = useTranslations("newsletter");
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

      if (res.ok) {
        setStatus("success");
        setMessage(t("success"));
        setEmail("");
      } else {
        setStatus("error");
        setMessage(t("error"));
      }
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  if (compact) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 text-center">
        <Mail className="mx-auto mb-3 text-[var(--color-accent)]" size={24} />
        <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          {t("compactTitle")}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {t("compactDescription")}
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
                placeholder={t("placeholder")}
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-4 py-2 rounded-[var(--radius-control)] text-sm font-medium hover:bg-[var(--color-ink-hover)] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? t("subscribing") : t("subscribe")}
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
          {t("title")}
        </h2>
        <p className="text-[var(--color-text-inverse)]/70 mb-8 max-w-xl mx-auto">
          {t("description")}
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
              placeholder={t("placeholder")}
              className="flex-1 px-4 py-3 rounded border border-white/10 bg-white/5 text-[var(--color-text-inverse)] placeholder:text-[var(--color-text-inverse)]/50 focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[var(--color-text-inverse)] text-[var(--color-surface-dark)] px-6 py-3 rounded-[var(--radius-control)] font-medium hover:bg-[var(--color-text-inverse)]/90 transition-colors disabled:opacity-60"
            >
              {status === "loading" ? t("subscribing") : t("subscribe")}
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
