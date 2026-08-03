import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Fidelis Auto about our collection or your vehicle.",
};

export default function ContactPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-4 text-center">
          Get in Touch
        </h1>
        <p className="text-center text-[var(--color-text-secondary)] mb-12 max-w-lg mx-auto">
          Whether you have a question about a vehicle, want to share your own collection,
          or are interested in listing with us — we&apos;d love to hear from you.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}