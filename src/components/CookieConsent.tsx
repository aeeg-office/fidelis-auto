"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

const STORAGE_KEY = "fidelis-cookie-consent";

export default function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }, 100);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setAnimate(false);
    setTimeout(() => { setVisible(false); setDismissed(true); }, 300);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setAnimate(false);
    setTimeout(() => { setVisible(false); setDismissed(true); }, 300);
  }

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-0 start-0 end-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      } ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div className="container-page py-4">
        <div className="bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] rounded-lg shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-inverse)]/80">
            {t("message")}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={accept}
              className="bg-[var(--color-text-inverse)] text-[var(--color-surface-dark)] px-4 py-2 rounded-[var(--radius-control)] text-sm font-medium hover:bg-[var(--color-text-inverse)]/90 transition-colors"
            >
              {t("accept")}
            </button>
            <button
              onClick={dismiss}
              className="text-sm text-[var(--color-text-inverse)]/60 hover:text-[var(--color-text-inverse)] transition-colors"
            >
              {t("dismiss")}
            </button>
            <button onClick={dismiss} className="p-1 text-[var(--color-text-inverse)]/40 hover:text-[var(--color-text-inverse)]">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
