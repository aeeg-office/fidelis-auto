"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

const STORAGE_KEY = "fidelis-pwa-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const t = useTranslations("pwa");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Check if already permanently dismissed
    if (localStorage.getItem(STORAGE_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay for smooth UX
      setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }, 2000);
    };
    const installedHandler = () => {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }
    setDeferredPrompt(null);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setAnimate(false);
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 start-4 end-4 z-50 max-w-md mx-auto transition-all duration-300 ${
        animate ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-xl shadow-2xl p-4 flex items-center gap-4">
        {/* App icon */}
        <div className="w-12 h-12 shrink-0 rounded-xl border-2 border-[var(--color-accent)] flex items-center justify-center bg-[var(--color-surface-dark)]">
          <span className="w-5 h-5 bg-[var(--color-accent)] rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-inverse)]">
            {t("title")}
          </p>
          <p className="text-xs text-[var(--color-text-inverse)]/60 truncate">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="bg-[var(--color-text-inverse)] text-[var(--color-surface-dark)] px-4 py-2 rounded-[var(--radius-control)] text-sm font-medium hover:bg-[var(--color-text-inverse)]/90 transition-colors whitespace-nowrap"
          >
{t("button")}
          </button>
          <button
            onClick={dismiss}
            className="p-1.5 text-[var(--color-text-inverse)]/40 hover:text-[var(--color-text-inverse)] transition-colors"
aria-label={t("dismiss")}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
