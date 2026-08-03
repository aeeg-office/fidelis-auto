"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vehicles/porsche-911e", label: "Vehicles" },
  { href: "/journal", label: "Journal" },
  { href: "/submit", label: "Sell Your Car" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="container-page flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center">
            <span className="w-3 h-3 bg-[var(--color-accent)] rounded-full" />
          </span>
          <span className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-semibold tracking-wide text-[var(--color-text-primary)]">
            Fidelis Auto
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => location.reload())}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors">
              <User size={16} /> {user.name} (Logout)
            </button>
          ) : (
            <Link href="/login"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              Sign In
            </Link>
          )}
        </nav>

        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[var(--color-text-primary)]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="container-page py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-[var(--color-accent)]">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}