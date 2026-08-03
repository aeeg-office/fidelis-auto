"use client";

import { useState, FormEvent } from "react";
import { Upload, Check, Video } from "lucide-react";
import Link from "next/link";

export default function SubmitForm({ userId }: { userId: string }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    // Upload photos
    const photoUrls: string[] = [];
    for (const file of photos) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        photoUrls.push(url);
      }
    }

    // Upload videos
    const videoUrls: string[] = [];
    for (const file of videos) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        videoUrls.push(url);
      }
    }

    // Submit listing request
    const data = {
      userId,
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      year: parseInt(form.get("year") as string),
      make: form.get("make"),
      model: form.get("model"),
      trim: form.get("trim"),
      mileage: form.get("mileage") ? parseInt(form.get("mileage") as string) : null,
      exteriorColor: form.get("exteriorColor"),
      interiorColor: form.get("interiorColor"),
      engine: form.get("engine"),
      transmission: form.get("transmission"),
      description: form.get("description"),
      photoUrls,
      videoUrls,
    };

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) setStep("success");
  }

  if (step === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[var(--color-verified)]/10 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-[var(--color-verified)]" />
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-3">Submission Received</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Thank you. Our team will review your vehicle and get back to you within 48 hours.
        </p>
        <Link href="/" className="text-[var(--color-accent)] hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Your Contact</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <Input name="name" label="Name *" required />
          <Input name="email" label="Email *" type="email" required />
          <Input name="phone" label="Phone" type="tel" className="md:col-span-2" />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Vehicle Details</legend>
        <div className="grid md:grid-cols-3 gap-4">
          <Input name="year" label="Year *" type="number" required />
          <Input name="make" label="Make *" required />
          <Input name="model" label="Model *" required />
          <Input name="trim" label="Trim" />
          <Input name="mileage" label="Mileage" type="number" />
          <Input name="exteriorColor" label="Exterior Color" />
          <Input name="interiorColor" label="Interior Color" />
          <Input name="engine" label="Engine" />
          <Input name="transmission" label="Transmission" />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Description & Media</legend>
        <textarea name="description" rows={5} placeholder="Tell us about your vehicle's history, condition, and anything special..." className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none" />

        <label className="mt-4 flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Upload size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{photos.length > 0 ? `${photos.length} photo(s) selected` : "Upload photos"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotos(Array.from(e.target.files || []))} />
        </label>

        <label className="mt-3 flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Video size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{videos.length > 0 ? `${videos.length} video(s) selected` : "Upload videos (optional)"}</span>
          <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => setVideos(Array.from(e.target.files || []))} />
        </label>
      </fieldset>

      <button type="submit" disabled={loading} className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Vehicle"}
      </button>
    </form>
  );
}

function Input({ label, name, type = "text", required, className = "" }: { label: string; name: string; type?: string; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
    </div>
  );
}