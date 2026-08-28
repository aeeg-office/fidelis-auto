import type { Metadata } from "next";
import ServiceSubmitForm from "@/components/ServiceSubmitForm";

export const metadata: Metadata = {
  title: "Submit a Service",
  description: "List your specialist service on Fidelis Auto — inspections, restoration, maintenance, and more.",
};

export default function ServiceSubmitPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">Fidelis network</p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[var(--color-text-primary)]">Submit Your Service</h1>
        <p className="mt-4 text-[var(--color-text-secondary)] mb-10">
          Join the Fidelis Auto directory of verified specialist services for collector and enthusiast vehicles.
          Your listing appears after a quick review by our team.
        </p>
        <ServiceSubmitForm />
      </div>
    </div>
  );
}