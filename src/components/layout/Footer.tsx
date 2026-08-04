import Link from "next/link";

const FOOTER_LINKS = {
  Explore: [
    { href: "/", label: "Home" },
    { href: "/vehicles", label: "Vehicles" },
    { href: "/journal", label: "Journal" },
    { href: "/about", label: "About" },
  ],
  Connect: [
    { href: "/contact", label: "Contact" },
    { href: "mailto:aeeg.education@gmail.com", label: "Email" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full border border-[var(--color-accent)] flex items-center justify-center">
                <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
              </span>
              <span className="font-[family-name:var(--font-cormorant)] text-lg font-semibold">
                Fidelis Auto
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
              For the love of cars. Every car has a story — we help you find yours.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-[var(--color-accent)]">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-inverse)]/70 hover:text-[var(--color-accent)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--color-text-secondary)]">
            &copy; {new Date().getFullYear()} Fidelis Auto. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            For the love of cars.
          </p>
        </div>
      </div>
    </footer>
  );
}