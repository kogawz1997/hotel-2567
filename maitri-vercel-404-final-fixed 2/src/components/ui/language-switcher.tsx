'use client';

import { Globe2 } from 'lucide-react';
import { useLocale } from '@/components/providers/locale-provider';
import { locales, type Locale } from '@/lib/i18n/dictionaries';

const LABELS: Record<Locale, string> = { th: 'ไทย', en: 'EN', zh: '中文', ja: '日本語' };

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
      <Globe2 className="h-3.5 w-3.5" />
      <select value={locale} onChange={e => setLocale(e.target.value as Locale)} className="bg-transparent text-foreground outline-none">
        {locales.map(l => <option key={l} value={l}>{LABELS[l]}</option>)}
      </select>
    </label>
  );
}
