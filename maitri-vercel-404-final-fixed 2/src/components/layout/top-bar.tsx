'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { getCurrentDashboardItem } from '@/lib/navigation/dashboard-nav';

interface TopBarProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function TopBar({ title, description, action }: TopBarProps) {
  const pathname = usePathname();
  const current = getCurrentDashboardItem(pathname);

  return (
    <header className="mb-5 rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-xl sm:p-5 md:mb-6">
      <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{current?.label || title}</span>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {action}
          <LanguageSwitcher />
          <ThemeToggle compact />
          <Button type="button" size="icon" variant="outline" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
        </div>
      </div>
    </header>
  );
}
