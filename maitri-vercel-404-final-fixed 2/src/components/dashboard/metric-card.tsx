import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  href?: string;
  tone?: 'default' | 'accent' | 'success' | 'warning';
  progress?: number;
};

const toneClass = {
  default: 'bg-secondary text-foreground',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export function MetricCard({ label, value, sub, icon: Icon, href, tone = 'default', progress }: MetricCardProps) {
  const inner = (
    <Card className="motion-card h-full overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="ticker mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
            {sub && <p className="mt-1 text-xs leading-5 text-muted-foreground">{sub}</p>}
          </div>
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', toneClass[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {typeof progress === 'number' && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-accent transition-all duration-500 ease-out" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
          </div>
        )}
        {href && <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 opacity-0 transition group-hover:opacity-60" />}
      </CardContent>
    </Card>
  );

  if (!href) return inner;
  return <Link href={href} className="group relative block h-full focus-ring rounded-xl">{inner}</Link>;
}
