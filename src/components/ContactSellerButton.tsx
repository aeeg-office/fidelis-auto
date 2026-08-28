import Link from "next/link";
import { Send } from "lucide-react";

interface ContactSellerButtonProps {
  vehicleSlug: string;
  vehicleTitle: string;
}

export default function ContactSellerButton({ vehicleSlug, vehicleTitle }: ContactSellerButtonProps) {
  return (
    <Link
      href={`/contact?vehicle=${encodeURIComponent(vehicleTitle)}&vehicleSlug=${encodeURIComponent(vehicleSlug)}`}
      className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      <Send size={18} /> Contact Fidelis Auto
    </Link>
  );
}
