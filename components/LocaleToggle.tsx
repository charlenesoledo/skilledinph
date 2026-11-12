"use client";

import { useLocale } from "./Locale";
import type { Locale } from "@/lib/i18n/candidate";

// "TL | EN" pill. Switches the candidate pages' language at once, with no reload.
export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const option = (value: Locale, label: string) => (
    <button
      type="button"
      onClick={() => setLocale(value)}
      aria-pressed={locale === value}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${locale === value ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Candidate page language" className="flex items-center rounded-full border border-line p-0.5">
      {option("tl", "TL")}
      <span aria-hidden className="px-0.5 text-xs text-line">|</span>
      {option("en", "EN")}
    </div>
  );
}
