import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Fidelis Auto terms of service — the rules that govern your use of the platform.",
};

export default function TermsPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using Fidelis Auto, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">2. Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information when registering.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">3. Listings & Content</h2>
          <p>When you submit a vehicle listing, you warrant that you own the vehicle or are authorised to list it, and that all information and media you provide are accurate. You may not list vehicles you do not have the right to sell. Fidelis Auto may remove any listing that violates these terms.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">4. Prohibited Conduct</h2>
          <p>You agree not to: misuse the platform, attempt to gain unauthorised access, interfere with other users, upload malicious content, or use the service for any unlawful purpose.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">5. Intellectual Property</h2>
          <p>All content on the platform, including logos, text, graphics, and software, is the property of Fidelis Auto or its licensors and is protected by applicable intellectual property laws.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">6. Limitation of Liability</h2>
          <p>Fidelis Auto provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the platform.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">7. Changes to These Terms</h2>
          <p>We may update these Terms of Service from time to time. We will post any changes on this page, and your continued use of the platform constitutes acceptance of the revised terms.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">8. Contact</h2>
          <p>If you have questions about these Terms of Service, contact us at aeeg.education@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}
