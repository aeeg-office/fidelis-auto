"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  if (done) {
    return (
      <div className="container-page py-24 max-w-sm mx-auto text-center">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-3">Account Created!</h1>
        <p className="text-[var(--color-text-secondary)]">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-center mb-2">Create Account</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
          Register to submit your vehicle for review.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
            <input id="name" name="name" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" name="password" type="password" required minLength={6} className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
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