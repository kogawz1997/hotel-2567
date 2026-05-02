'use client';

import type { ReactNode } from 'react';
import * as React from 'react';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('th');

  React.useEffect(() => {
    const stored = window.localStorage.getItem('maitri.locale') as Locale | null;
    if (stored && dictionaries[stored]) setLocaleState(stored);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem('maitri.locale', next);
    document.documentElement.lang = next;
  }, []);

  const t = React.useCallback((key: string) => dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key, [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}
