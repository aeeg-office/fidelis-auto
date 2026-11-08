"use client";

import { useState, FormEvent, useMemo, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Check, Video, Volume2 } from "lucide-react";
import Link from "next/link";
import { YEARS, EXTERIOR_COLORS, INTERIOR_COLORS, TRANSMISSIONS, COUNTRIES } from "@/lib/car-data";
import {
  buildListingDraft,
  describeToConfirm,
  displayValue,
  FIELD_LABELS,
  type DraftField,
  type IntakeInput,
  type ListingDraft,
} from "@/lib/listing-intake";
import PhoneInput from "@/components/PhoneInput";
import type { MakeEntry } from "@/lib/car-data";

export default function SubmitForm() {
  const t = useTranslations("sellYourCar");
  const locale = useLocale();
  const lang: "en" | "ar" = locale.startsWith("ar") ? "ar" : "en";
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftCopied, setDraftCopied] = useState(false);
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  /** Single engine sound clip (Spec P2 free-listing media). */
  const [sound, setSound] = useState<File | null>(null);
  const [phone, setPhone] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [makes, setMakes] = useState<MakeEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

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
    if (!phone) errs.push(t("errors.phoneRequired"));
    if (!selectedYear) errs.push(t("errors.yearRequired"));
    if (selectedMake === "Other" && !customMake) errs.push(t("errors.makeRequired"));
    else if (!selectedMake) errs.push(t("errors.makeSelectRequired"));
    if (!selectedCountry && !customCountry) errs.push(t("errors.countryRequired"));
    if (photos.length < 6) errs.push(t("errors.photosMin6", { count: photos.length }));
    if (photos.length > 30) errs.push(t("errors.photosMax30"));
    return errs;
  }

  /** Deterministic draft: takes what the seller already typed and turns it into
   * a reviewable bilingual draft. The intake lib never invents anything — any
   * unconfirmed detail is explicitly marked "to confirm". Photo file names are
   * used as hints only. */
  function generateDraft() {
    setDraftError(null);
    setDraftCopied(false);
    const formEl = formRef.current;
    if (!formEl) return;
    const fd = new FormData(formEl);
    const input: IntakeInput = {
      year: selectedYear,
      make: selectedMake === "Other" ? customMake || fd.get("customMake") : selectedMake,
      model: selectedMake === "Other" ? customModel : fd.get("model"),
      trim: fd.get("trim"),
      mileage: fd.get("mileage"),
      transmission: fd.get("transmission"),
      exteriorColor: fd.get("exteriorColor"),
      interiorColor: fd.get("interiorColor"),
      engine: fd.get("engine"),
      notes: description,
      photoFilenames: photos.map(f => f.name),
    };
    const result = buildListingDraft(input);
    if (result.ok) {
      setDraft(result.draft);
    } else {
      setDraft(null);
      setDraftError(result.error);
    }
  }

  function applyDraft(localeCode: "en" | "ar") {
    if (!draft) return;
    setDescription(localeCode === "en" ? draft.descriptionEn : draft.descriptionAr);
    setDraftCopied(true);
  }

  /** Confirmed (non-null) optional fields, rendered as labeled rows. */
  function confirmedRows(d: ListingDraft): { label: string; value: string }[] {
    const rows: { label: string; value: string }[] = [];
    const add = (field: DraftField, value: string | number | null) => {
      if (value === null || value === "") return;
      rows.push({ label: FIELD_LABELS[field][lang], value: displayValue(field, value, lang, {
        mileageUnit: d.fields.mileageUnit,
        currency: d.fields.currency,
      }) });
    };
    add("transmission", d.fields.transmission);
    add("mileage", d.fields.mileage);
    add("exteriorColor", d.fields.exteriorColor);
    add("interiorColor", d.fields.interiorColor);
    add("engine", d.fields.engine);
    add("bodyType", d.fields.bodyType);
    add("fuelType", d.fields.fuelType);
    add("price", d.fields.price);
    return rows;
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
        else uploadErrors.push(t("errors.uploadNoUrl", { file: file.name }));
      } else {
        uploadErrors.push(t("errors.uploadFailed", { file: file.name, status: res.status }));
      }
    }
    if (photoUrls.length === 0) uploadErrors.push(t("errors.noUploads"));

    const videoUrls: string[] = [];
    for (const file of videos) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        if (url) videoUrls.push(url);
      }
    }

    // Single engine sound clip — uploaded exactly like photos/videos; the
    // upload API derives the kind from the MIME type (audio/* → audio-* path).
    let audioUrl: string | null = null;
    if (sound) {
      const fd = new FormData(); fd.append("file", sound);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        if (url) audioUrl = url;
        else uploadErrors.push(t("errors.uploadNoUrl", { file: sound.name }));
      } else {
        uploadErrors.push(t("errors.uploadFailed", { file: sound.name, status: res.status }));
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
      description: form.get("description"), photoUrls, videoUrls, audioUrl,
      city: form.get("city"), state: form.get("state"), country: finalCountry, zipCode: form.get("zipCode"),
    };

    const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setLoading(false);
    if (res.ok) setStep("success");
  }

  if (step === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[var(--color-verified)]/10 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-[var(--color-verified)]" />
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-3">{t("submissionReceived")}</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">{t("submissionReceivedDesc")}</p>
        <Link href="/" className="text-[var(--color-accent)] hover:underline">{t("returnHome")}</Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Contact */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{t("yourContact")}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="name" label={`${t("fullName")} *`} required />
          <Input name="email" label={`${t("email")} *`} type="email" required />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t("phone")} *</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
        </div>
      </fieldset>

      {/* Vehicle Details */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{t("vehicleDetails")}</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label={`${t("year")} *`} value={selectedYear} onChange={setSelectedYear} required>
            <option value="">{t("selectYear")}</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label={`${t("make")} *`} value={selectedMake} onChange={(v) => { setSelectedMake(v); setCustomMake(""); }}>
            <option value="">{t("selectMake")}</option>
            {makes.map(m => <option key={m.make} value={m.make}>{m.make}</option>)}
            <option value="Other">{t("other")}</option>
          </Select>
          {selectedMake === "Other" ? (
            <Input name="customMake" label={`${t("enterMake")} *`} value={customMake} onChange={setCustomMake} required />
          ) : selectedMake ? (
            <Select label={`${t("model")} *`} name="model" required>
              <option value="">{t("selectModel")}</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Other">{t("other")}</option>
            </Select>
          ) : <div />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input name="trim" label={t("trim")} />
          <Input name="mileage" label={t("mileage")} type="number" />
          <Select label={`${t("transmission")} *`} name="transmission" required>
            <option value="">{t("selectDefault")}</option>
            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label={`${t("exteriorColor")} *`} name="exteriorColor" required>
            <option value="">{t("selectColor")}</option>
            {EXTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label={t("interiorColor")} name="interiorColor">
            <option value="">{t("selectColor")}</option>
            {INTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input name="engine" label={t("engineOptional")} />
        </div>
      </fieldset>

      {/* Location */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{t("vehicleLocation")}</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input name="city" label={`${t("city")} *`} required />
          <Input name="state" label={t("state")} />
          <Select label={`${t("country")} *`} value={selectedCountry} onChange={setSelectedCountry}>
            <option value="">{t("selectCountry")}</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          {selectedCountry === "Other" && (
            <Input name="customCountry" label={`${t("enterCountry")} *`} value={customCountry} onChange={setCustomCountry} required />
          )}
          <Input name="zipCode" label={t("zipCode")} />
        </div>
      </fieldset>

      {/* Description */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{t("description")}</legend>
        <textarea name="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("descriptionPlaceholder")}
          className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none" />
      </fieldset>

      {/* AI listing intake: deterministic, never invents details */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{t("draftSection")}</legend>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">{t("draftSectionHint")}</p>
          <button type="button" onClick={generateDraft}
            className="shrink-0 px-4 py-2.5 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] text-sm font-medium hover:bg-[var(--color-accent)]/10 transition-colors">
            {t("draftFromInfo")}
          </button>
        </div>

        {draftError && (
          <p className="mt-3 text-sm text-red-700">{t("draftError", { error: draftError })}</p>
        )}

        {draft && (
          <div className="mt-4 space-y-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("draftConfirmed")}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                <li>{draft.fields.year} {draft.fields.make} {draft.fields.model}{draft.fields.trim ? ` ${draft.fields.trim}` : ""}</li>
                {confirmedRows(draft).map((row) => (
                  <li key={row.label}><span className="text-[var(--color-text-primary)]">{row.label}:</span> {row.value}</li>
                ))}
              </ul>
            </div>

            {draft.toConfirm.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("draftToConfirm")}</h3>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t("draftToConfirmNote")}</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  {draft.toConfirm.map((item, i) => (
                    <li key={`${item.field}-${i}`}>• {describeToConfirm(item, lang)}</li>
                  ))}
                </ul>
              </div>
            )}

            {draft.photoHints.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("draftPhotoHints")}</h3>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t("draftPhotoHintsNote")}</p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                  {draft.photoHints.map((h, i) => (
                    <li key={`${h.kind}-${i}`}>{h.kind}: {h.value} <span className="opacity-70">({h.source})</span></li>
                  ))}
                </ul>
              </div>
            )}

            {draft.notes && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("draftNotes")}</h3>
                <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">{draft.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("draftTitleEn")}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{draft.titleEn}</p>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] pt-2">{t("draftDescEn")}</h3>
                <textarea readOnly rows={7} value={draft.descriptionEn}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-dark)] text-sm text-[var(--color-text-inverse)] resize-none" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("draftTitleAr")}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] text-end">{draft.titleAr}</p>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] pt-2">{t("draftDescAr")}</h3>
                <textarea readOnly rows={7} value={draft.descriptionAr}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-dark)] text-sm text-[var(--color-text-inverse)] resize-none" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyDraft("en")}
                className="px-4 py-2 rounded-lg bg-[var(--color-ink)] text-[var(--color-text-inverse)] text-sm font-medium hover:bg-[var(--color-ink-hover)] transition-colors">
                {t("useEnDraft")}
              </button>
              <button type="button" onClick={() => applyDraft("ar")}
                className="px-4 py-2 rounded-lg bg-[var(--color-ink)] text-[var(--color-text-inverse)] text-sm font-medium hover:bg-[var(--color-ink-hover)] transition-colors">
                {t("useArDraft")}
              </button>
              <button type="button" onClick={() => { setDraft(null); setDraftCopied(false); }}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-colors">
                {t("keepMyText")}
              </button>
            </div>
            {draftCopied && (
              <p className="text-sm text-[var(--color-verified)]">{t("draftCopied")}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Photos */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
          {t("photos")} ({photos.length}/30) <span className="text-[var(--color-text-secondary)] font-normal">{t("photosMin6")}</span>
        </legend>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            {photos.map((f, i) => (
              <div key={i} className="aspect-square rounded-lg bg-[var(--color-surface-dark)] overflow-hidden relative">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute top-1 end-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Upload size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{photos.length > 0 ? t("addMorePhotos") : t("choosePhotos")}</span>
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => setPhotos(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 30))} />
        </label>
      </fieldset>

      {/* Videos (Spec P2: one ~60s 720p walkaround clip) */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
          {t("videos")} ({videos.length}/3) <span className="text-[var(--color-text-secondary)] font-normal">{t("videosOptional")}</span>
        </legend>
        {videos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {videos.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-dark)] rounded-lg text-sm text-[var(--color-text-inverse)]">
                <Video size={14} /> {f.name}
                <button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))} className="text-[var(--color-error)] ms-1">×</button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Video size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{videos.length > 0 ? t("addMoreVideos") : t("uploadVideos")}</span>
          <input type="file" accept="video/mp4,video/webm" multiple className="hidden"
            onChange={(e) => setVideos(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 3))} />
        </label>
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{t("videoHint")}</p>
      </fieldset>

      {/* Engine sound clip (Spec P2 free-listing media) */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
          {t("engineSound")} <span className="text-[var(--color-text-secondary)] font-normal">{t("engineSoundOptional")}</span>
        </legend>
        {sound && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-4 bg-[var(--color-surface-dark)] rounded-lg text-sm text-[var(--color-text-inverse)] w-fit">
            <Volume2 size={14} /> {sound.name}
            <button type="button" onClick={() => setSound(null)} className="text-[var(--color-error)] ms-1" aria-label={t("removeEngineSound")}>×</button>
          </div>
        )}
        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
          <Volume2 size={20} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{sound ? t("replaceEngineSound") : t("chooseEngineSound")}</span>
          <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg" className="hidden"
            onChange={(e) => setSound(e.target.files?.[0] ?? sound)} />
        </label>
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{t("engineSoundHint")}</p>
      </fieldset>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((err, i) => <p key={i} className="text-sm text-red-700">{err}</p>)}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[var(--color-ink)] text-[var(--color-text-inverse)] py-3 rounded-lg font-medium hover:bg-[var(--color-ink-hover)] disabled:opacity-50 text-base">
        {loading ? t("submitting") : t("submitVehicle")}
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
