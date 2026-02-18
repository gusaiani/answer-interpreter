"use client";

import { LOCALES } from "@/lib/i18n";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageDropdown() {
  const { locale, setLocale } = useLanguage();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      className="text-muted uppercase tracking-[0.15em] bg-transparent border-none outline-none cursor-pointer text-sm"
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
