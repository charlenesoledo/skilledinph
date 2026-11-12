"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, translate, type Locale, type StringKey, type Values } from "@/lib/i18n/candidate";

// The candidate pages' language. Default "tl"; the viewer's choice is kept in this browser.
const STORAGE_KEY = "orchestrator:locale";
const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && LOCALES.includes(saved)) setLocaleState(saved);
    } catch {}
  }, []);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

// For client components: t("key", { name: "Jomar" }).
export function useT() {
  const { locale } = useLocale();
  return useCallback((key: StringKey, values?: Values) => translate(locale, key, values), [locale]);
}

// For server components: <T k="greeting" v={{ name }} />. Re-renders when the locale changes.
export function T({ k, v }: { k: StringKey; v?: Values }) {
  const t = useT();
  return <>{t(k, v)}</>;
}
