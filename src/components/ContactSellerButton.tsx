import Link from "next/link";
import { Send, MessageCircle, Mail } from "lucide-react";

interface ContactSellerButtonProps {
  vehicleSlug: string;
  vehicleTitle: string;
  /** Owner's phone (E.164-ish). When present, a WhatsApp CTA renders. */
  ownerPhone?: string | null;
  /** Dealer business phone — takes precedence over the owner phone for WhatsApp. */
  dealerPhone?: string | null;
  /** Owner's email, shown as a secondary direct-contact link. */
  ownerEmail?: string | null;
}

/** Strip non-digits from a phone number for wa.me (keep leading country code). */
function toWaDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default function ContactSellerButton({
  vehicleSlug,
  vehicleTitle,
  ownerPhone,
  dealerPhone,
  ownerEmail,
}: ContactSellerButtonProps) {
  const waNumber = dealerPhone || ownerPhone;
  const waHref = waNumber
    ? `https://wa.me/${toWaDigits(waNumber)}?text=${encodeURIComponent(
        `${vehicleTitle} — https://fidelisauto.com/vehicles/${vehicleSlug}`
      )}`
    : null;

  return (
    <div className="space-y-2 w-full">
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp the seller about ${vehicleTitle}`}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1eb959] transition-colors"
        >
          <MessageCircle size={18} /> WhatsApp the Seller
        </a>
      )}
      <Link
        href={`/contact?vehicle=${encodeURIComponent(vehicleTitle)}&vehicleSlug=${encodeURIComponent(vehicleSlug)}`}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        <Send size={18} /> Contact Seller
      </Link>
      {ownerEmail && (
        <a
          href={`mailto:${ownerEmail}?subject=${encodeURIComponent(
            `Inquiry about ${vehicleTitle}`
          )}&body=${encodeURIComponent(
            `Hi, I'm interested in the ${vehicleTitle} (https://fidelisauto.com/vehicles/${vehicleSlug}).`
          )}`}
          className="w-full flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors py-1"
        >
          <Mail size={16} /> Email the seller
        </a>
      )}
    </div>
  );
}