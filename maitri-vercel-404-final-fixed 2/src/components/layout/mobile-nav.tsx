'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MOBILE_NAV_ITEMS, isDashboardRouteActive } from '@/lib/navigation/dashboard-nav';

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden" aria-label="Mobile dashboard navigation">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isDashboardRouteActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-2xs transition-all focus-ring',
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.shortLabel || item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
