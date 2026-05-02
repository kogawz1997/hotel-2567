import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardPageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 animate-fade-in', className)}>
      {children}
    </div>
  );
}

export function DashboardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('grid gap-4 sm:gap-5', className)}>{children}</section>;
}
