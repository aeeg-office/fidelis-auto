import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Fidelis Auto privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly when you register an account, submit a vehicle listing, or contact us. This includes your name, email address, phone number, and any details you provide about your vehicle.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">2. How We Use Your Information</h2>
          <p>We use your information to: operate and maintain your account, process and manage vehicle listings, send you verification emails and SMS codes, respond to your inquiries, and improve our services.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">3. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with service providers who help us operate the platform (such as email delivery and SMS providers), and we may disclose information when required by law.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">4. Data Security</h2>
          <p>We take reasonable measures to protect your data, including secure password storage (hashed) and HTTPS encryption. However, no method of transmission over the Internet is 100% secure.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">5. Cookies</h2>
          <p>We use cookies to keep you logged in and to remember your preferences. You can disable cookies in your browser, but some features may not function properly.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">6. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can also delete your account by contacting our support team.</p>

          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mt-8">7. Contact</h2>
          <p>If you have questions about this privacy policy, contact us at aeeg.education@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}