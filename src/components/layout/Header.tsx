"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, BarChart3, MessageSquare } from "lucide-react";
import { useCompareStore } from "@/lib/compare-store";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/journal", label: "Journal" },
  { href: "/submit", label: "Sell Your Car" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const compareCount = useCompareStore((s) => s.slugs.length);
  const compareSlugs = useCompareStore((s) => s.slugs);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="container-page flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-10 h-10 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center">
            <span className="w-4 h-4 bg-[var(--color-accent)] rounded-full" />
          </span>
          <span className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors uppercase">
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

          {/* Compare button */}
          {compareCount > 0 && (
            <Link
              href={`/compare?slugs=${compareSlugs.join(",")}`}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              <BarChart3 size={16} />
              <span>Compare ({compareCount})</span>
            </Link>
          )}

          {/* Messages link (logged in only) */}
          {user && (
            <Link
              href="/messages"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              <MessageSquare size={16} />
              <span>Messages</span>
            </Link>
          )}

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

            {compareCount > 0 && (
              <Link
                href={`/compare?slugs=${compareSlugs.join(",")}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-base font-medium text-[var(--color-accent)]"
              >
                <BarChart3 size={16} />
                <span>Compare ({compareCount})</span>
              </Link>
            )}

            {user && (
              <Link href="/messages" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                <MessageSquare size={16} />
                Messages
              </Link>
            )}

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