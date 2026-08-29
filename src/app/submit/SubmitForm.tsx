"use client";

import { useState, FormEvent, useMemo, useEffect, useRef } from "react";
import { Upload, Check, Video } from "lucide-react";
import Link from "next/link";
import { YEARS, EXTERIOR_COLORS, INTERIOR_COLORS, TRANSMISSIONS, COUNTRIES } from "@/lib/car-data";
import PhoneInput from "@/components/PhoneInput";
import type { MakeEntry } from "@/lib/car-data";

export default function SubmitForm() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [phone, setPhone] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [makes, setMakes] = useState<MakeEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [assistanceLoading, setAssistanceLoading] = useState(false);
  const [assistanceError, setAssistanceError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/makes").then(r => r.json()).then(d => setMakes(d)).catch(() => {});
  }, []);

  const models = useMemo(() => {
    if (selectedMake === "Other") return [];
    const make = makes.find(m => m.make === selectedMake);
    return make?.models || [];
  }, [selectedMake, makes]);

  function validate(): string[] {
    const errs: string[] = [];
    if (!phone) errs.push("Phone number is required.");
    if (!selectedYear) errs.push("Year is required.");
    if (selectedMake === "Other" && !customMake) errs.push("Please enter the make.");
    else if (!selectedMake) errs.push("Make is required.");
    if (!selectedCountry && !customCountry) errs.push("Country is required.");
    if (photos.length < 6) errs.push(`At least 6 photos required (${photos.length} selected).`);
    if (photos.length > 30) errs.push("Maximum 30 photos.");
    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setLoading(true);
    const form = new FormData(e.currentTarget);

    const photoUrls: string[] = [];
    const uploadErrors: string[] = [];
    for (const file of photos) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        if (url) photoUrls.push(url);
        else uploadErrors.push(`${file.name}: upload succeeded but returned no URL.`);
      } else {
        uploadErrors.push(`${file.name}: upload failed (HTTP ${res.status}).`);
      }
    }
    if (photoUrls.length === 0) uploadErrors.push("No photos were uploaded successfully — please try again.");

    const videoUrls: string[] = [];
    for (const file of videos) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        if (url) videoUrls.push(url);
      }
    }

    if (uploadErrors.length > 0) {
      setLoading(false);
      setErrors([...errors, ...uploadErrors]);
      return;
    }

    const finalMake = selectedMake === "Other" ? customMake : selectedMake;
    const finalModel = selectedMake === "Other" ? customModel : form.get("model");
    const finalCountry = selectedCountry === "Other" ? customCountry : selectedCountry;

    const data = {
      name: form.get("name"), email: form.get("email"), phone,
      year: parseInt(selectedYear), make: finalMake, model: finalModel,
      trim: form.get("trim"), mileage: form.get("mileage") ? parseInt(form.get("mileage") as string) : null,
      exteriorColor: form.get("exteriorColor"), interiorColor: form.get("interiorColor"),
      engine: form.get("engine"), transmission: form.get("transmission"),
      description: form.get("description"), photoUrls, videoUrls,
      city: form.get("city"), state: form.get("state"), country: finalCountry, zipCode: form.get("zipCode"),
    };

    const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setLoading(false);
    if (res.ok) setStep("success");
  }

  async function improveDescription() {
    const form = formRef.current;
    if (!form) return;
    const fields = new FormData(form);
    setAssistanceError("");
    setAssistanceLoading(true);
    try {
      const response = await fetch("/api/listing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedYear,
          make: selectedMake === "Other" ? customMake : selectedMake,
          model: selectedMake === "Other" ? customModel : fields.get("model"),
          trim: fields.get("trim"), mileage: fields.get("mileage"),
          exteriorColor: fields.get("exteriorColor"), interiorColor: fields.get("interiorColor"),
          engine: fields.get("engine"), transmission: fields.get("transmission"), notes: description,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.description !== "string") {
        setAssistanceError(data.error || "Writing assistance is unavailable. You can continue manually.");
        return;
      }
      setDescription(data.description);
    } catch {
      setAssistanceError("Writing assistance is unavailable. You can continue manually.");
    } finally {
      setAssistanceLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[var(--color-verified)]/10 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-[var(--color-verified)]" />
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-3">Submission Received</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Our team will review your vehicle and get back to you within 48 hours.</p>
        <Link href="/" className="text-[var(--color-accent)] hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Contact */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Your Contact</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="name" label="Full Name *" required />
          <Input name="email" label="Email *" type="email" required />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
        </div>
      </fieldset>

      {/* Vehicle Details */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Vehicle Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Year *" value={selectedYear} onChange={setSelectedYear} required>
            <option value="">Select year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label="Make *" value={selectedMake} onChange={(v) => { setSelectedMake(v); setCustomMake(""); }}>
            <option value="">Select make</option>
            {makes.map(m => <option key={m.make} value={m.make}>{m.make}</option>)}
            <option value="Other">Other</option>
          </Select>
          {selectedMake === "Other" ? (
            <Input name="customMake" label="Enter Make *" value={customMake} onChange={setCustomMake} required />
          ) : selectedMake ? (
            <Select label="Model *" name="model" required>
              <option value="">Select model</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Other">Other</option>
            </Select>
          ) : <div />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input name="trim" label="Trim" />
          <Input name="mileage" label="Mileage" type="number" />
          <Select label="Transmission *" name="transmission" required>
            <option value="">Select</option>
            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Exterior Color *" name="exteriorColor" required>
            <option value="">Select color</option>
            {EXTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Interior Color" name="interiorColor">
            <option value="">Select color</option>
            {INTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input name="engine" label="Engine (optional)" />
        </div>
      </fieldset>

      {/* Location */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Vehicle Location</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input name="city" label="City *" required />
          <Input name="state" label="State / Province" />
          <Select label="Country *" value={selectedCountry} onChange={setSelectedCountry}>
            <option value="">Select country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          {selectedCountry === "Other" && (
            <Input name="customCountry" label="Enter Country *" value={customCountry} onChange={setCustomCountry} required />
          )}
          <Input name="zipCode" label="ZIP / Postal Code" />
        </div>
      </fieldset>

      {/* Description */}
      <fieldset>
        <div className="flex items-center justify-between gap-4 mb-4">
          <legend className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Description</legend>
          <button type="button" onClick={improveDescription} disabled={assistanceLoading}
            className="text-xs font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50">
            {assistanceLoading ? "Drafting…" : "Draft with AI"}
          </button>
        </div>
        <textarea name="description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell us about your vehicle's history, condition, and anything special..."
          className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none" />
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">AI drafts use only the details you provide. Review every statement before submitting.</p>
        {assistanceError && <p role="alert" className="mt-2 text-sm text-red-700">{assistanceError}</p>}
      </fieldset>

      {/* Photos */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
          Photos ({photos.length}/30) <span className="text-[var(--color-text-secondary)] font-normal">— min 6 required</span>
        </legend>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            {photos.map((f, i) => (
              <div key={i} className="aspect-square rounded-lg bg-[var(--color-surface-dark)] overflow-hidden relative">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Upload size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{photos.length > 0 ? "Add more photos" : "Choose photos"}</span>
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => setPhotos(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 30))} />
        </label>
      </fieldset>

      {/* Videos */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
          Videos ({videos.length}/3) <span className="text-[var(--color-text-secondary)] font-normal">— optional</span>
        </legend>
        {videos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {videos.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-dark)] rounded-lg text-sm text-[var(--color-text-inverse)]">
                <Video size={14} /> {f.name}
                <button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))} className="text-[var(--color-error)] ml-1">×</button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Video size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{videos.length > 0 ? "Add more videos" : "Upload videos (max 3)"}</span>
          <input type="file" accept="video/*" multiple className="hidden"
            onChange={(e) => setVideos(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 3))} />
        </label>
      </fieldset>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((err, i) => <p key={i} className="text-sm text-red-700">{err}</p>)}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-base">
        {loading ? "Submitting..." : "Submit Vehicle"}
      </button>
    </form>
  );
}

function Input({ label, name, type = "text", required, className, value, onChange }: {
  label: string; name: string; type?: string; required?: boolean; className?: string; value?: string; onChange?: (v: string) => void;
}) {
  return (
    <div className={className || ""}>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input id={name} name={name} type={type} required={required} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
    </div>
  );
}

function Select({ label, name, value, onChange, children, required }: {
  label: string; name?: string; value?: string; onChange?: (v: string) => void; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name || label} className="block text-sm font-medium mb-1">{label}</label>
      <select id={name || label} name={name} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] appearance-none">
        {children}
      </select>
    </div>
  );
}