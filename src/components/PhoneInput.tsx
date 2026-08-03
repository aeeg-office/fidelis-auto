"use client";

import { useState } from "react";

// Country codes with flags and dial codes
const COUNTRIES = [
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "AE", dial: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "QA", dial: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", dial: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "BH", dial: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", dial: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "JO", dial: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "LB", dial: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "PS", dial: "+970", name: "Palestine", flag: "🇵🇸" },
  { code: "IQ", dial: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "TR", dial: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "IT", dial: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", dial: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", dial: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "SE", dial: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", dial: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "DK", dial: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", dial: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "RU", dial: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "MA", dial: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "DZ", dial: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "TN", dial: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "LY", dial: "+218", name: "Libya", flag: "🇱🇾" },
  { code: "SD", dial: "+249", name: "Sudan", flag: "🇸🇩" },
  { code: "SY", dial: "+963", name: "Syria", flag: "🇸🇾" },
  { code: "YE", dial: "+967", name: "Yemen", flag: "🇾🇪" },
  { code: "IR", dial: "+98", name: "Iran", flag: "🇮🇷" },
  { code: "PK", dial: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", dial: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "MY", dial: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", dial: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", dial: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "KR", dial: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "TH", dial: "+66", name: "Thailand", flag: "🇹🇭" },
].sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [selected, setSelected] = useState(COUNTRIES.find(c => c.code === "EG") || COUNTRIES[0]);
  const [localNum, setLocalNum] = useState("");
  const [open, setOpen] = useState(false);

  function selectCountry(c: typeof COUNTRIES[0]) {
    setSelected(c);
    setOpen(false);
    onChange(c.dial + localNum);
  }

  function handleLocalChange(val: string) {
    // Strip leading zero if user typed it (we already have dial code)
    const cleaned = val.replace(/^0+/, "");
    setLocalNum(cleaned);
    onChange(selected.dial + cleaned);
  }

  return (
    <div className="flex gap-0">
      {/* Country selector */}
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-l-lg border border-r-0 border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-colors whitespace-nowrap min-w-[100px]">
          <span className="text-lg">{selected.flag}</span>
          <span className="text-sm font-medium">{selected.dial}</span>
          <span className="text-xs opacity-50">{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-1 z-20 w-72 max-h-60 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg">
              {COUNTRIES.map((c) => (
                <button key={c.code} type="button" onClick={() => selectCountry(c)}
                  className={`flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-[var(--color-bg)] transition-colors ${c.code === selected.code ? "bg-[var(--color-bg)]" : ""}`}>
                  <span className="text-lg">{c.flag}</span>
                  <span className="font-medium">{c.dial}</span>
                  <span className="text-[var(--color-text-secondary)] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Local number input */}
      <input type="tel" inputMode="numeric" value={localNum} required
        onChange={(e) => handleLocalChange(e.target.value)}
        placeholder="123456789"
        className="flex-1 px-4 py-2.5 rounded-r-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
    </div>
  );
}