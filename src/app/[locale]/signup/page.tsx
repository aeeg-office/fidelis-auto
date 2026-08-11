"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");

  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { label: "One symbol (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
  ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const missing = requirements.find((r) => !r.test(password));
    if (missing) {
      setError(`Password must have: ${missing.label}`);
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        mobileNumber: phone,
        country: form.get("country"),
        city: form.get("city"),
        password,
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push(`/verify?email=${encodeURIComponent(form.get("email") as string)}`);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-center mb-2">Create Account</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
          Register to submit your vehicle for review.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
              <input id="firstName" name="firstName" autoComplete="given-name" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
              <input id="lastName" name="lastName" autoComplete="family-name" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Mobile Number</label>
            <PhoneInput value={phone} onChange={setPhone} />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Required for seller and enquiry follow-up. Verification is not required yet.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
              <input id="country" name="country" autoComplete="country-name" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
              <input id="city" name="city" autoComplete="address-level2" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div className="space-y-1">
            {requirements.map((r, i) => (
              <p key={i} className={`text-xs flex items-center gap-1.5 ${r.test(password) ? "text-[var(--color-verified)]" : "text-[var(--color-text-secondary)]"}`}>
                <span>{r.test(password) ? "✓" : "○"}</span> {r.label}
              </p>
            ))}
            {confirm && (
              <p className={`text-xs flex items-center gap-1.5 ${password === confirm ? "text-[var(--color-verified)]" : "text-[var(--color-error)]"}`}>
                <span>{password === confirm ? "✓" : "✗"}</span> Passwords match
              </p>
            )}
          </div>

          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-[var(--color-text-secondary)] text-center mt-6">
          Already have an account? <Link href="/login" className="text-[var(--color-accent)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}