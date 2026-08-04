import { Suspense } from "react";
import VerifyForm from "./VerifyForm";

export default function VerifyPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-center mb-2">Verify Your Email</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
          Enter the 6-digit code sent to your email to activate your account.
        </p>
        <Suspense fallback={<div className="text-center py-8 text-[var(--color-text-secondary)]">Loading...</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}