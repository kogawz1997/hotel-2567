'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  if (compact) {
    const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[2];
    const Icon = current.icon;
    return <Button type="button" size="icon" variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme"><Icon className="h-4 w-4" /></Button>;
  }
  return (
    <div className="inline-grid grid-cols-3 gap-1 rounded-xl border border-border bg-secondary/60 p-1">
      {OPTIONS.map(option => {
        const Icon = option.icon;
        const active = (theme ?? 'system') === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn('flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition-all', active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
