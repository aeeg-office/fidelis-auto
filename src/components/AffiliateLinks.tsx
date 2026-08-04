import Link from "next/link";
import { Wrench, Shield, Truck } from "lucide-react";

const AFFILIATES = [
  {
    name: "Classic Parts Finder",
    url: "https://www.classicpartsfinder.com/?ref=fidelisauto",
    desc: "Source OEM and reproduction parts for your vehicle",
    icon: Wrench,
  },
  {
    name: "Hagerty Insurance",
    url: "https://www.hagerty.com/?aff=fidelisauto",
    desc: "Specialized collector and enthusiast vehicle insurance",
    icon: Shield,
  },
  {
    name: "Reliable Carriers",
    url: "https://www.reliablecarriers.com/?ref=fidelisauto",
    desc: "Enclosed auto transport for your prized vehicle",
    icon: Truck,
  },
];

export default function AffiliateLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {AFFILIATES.map((a) => (
        <a
          key={a.name}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-start gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors group"
        >
          <a.icon size={20} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
              {a.name}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{a.desc}</p>
          </div>
        </a>
      ))}
    </div>
  );
}