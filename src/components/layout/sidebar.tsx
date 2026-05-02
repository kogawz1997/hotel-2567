'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ChevronDown, Command, LogOut, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_NAV_GROUPS, isDashboardRouteActive } from '@/lib/navigation/dashboard-nav';

interface SidebarProps {
  hotelName: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function Sidebar({ hotelName, userName, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border/80 bg-card/90 backdrop-blur-xl md:flex md:flex-col">
      <div className="border-b border-border/80 p-4">
        <Link href="/dashboard" className="mb-4 flex items-center gap-3 focus-ring rounded-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
              <path d="M4 20V4h4l4 8 4-8h4v16h-3V9l-3 6h-4L7 9v11H4z" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block font-display text-xl font-semibold tracking-tight">Maitri</span>
            <span className="block text-2xs uppercase tracking-[0.2em] text-muted-foreground">Hotel PMS</span>
          </div>
        </Link>

        <button className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-secondary/50 px-3 py-3 text-left transition-all hover:bg-secondary focus-ring">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{hotelName}</span>
            <span className="block text-xs text-muted-foreground">Active property</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition group-hover:translate-y-0.5" />
        </button>
      </div>

      <div className="p-3">
        <button className="flex w-full items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground transition-all hover:bg-secondary focus-ring">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">ค้นหาเมนู แขก หรือการจอง...</span>
          <kbd className="hidden rounded bg-secondary px-1.5 py-0.5 text-[10px] lg:inline-flex"><Command className="mr-0.5 h-2.5 w-2.5" />K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin" aria-label="Dashboard navigation">
        {DASHBOARD_NAV_GROUPS.map((group) => (
          <section key={group.label} className="mb-5">
            <div className="mb-2 px-3">
              <p className="text-2xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/75">{group.label}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground/70">{group.description}</p>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = isDashboardRouteActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all focus-ring',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-0.5'
                    )}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', isActive ? 'bg-primary-foreground/10' : 'bg-secondary/70 group-hover:bg-card')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.label}</span>
                      {item.description && <span className={cn('block truncate text-2xs', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/75')}>{item.description}</span>}
                    </span>
                    {item.badge && <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] uppercase', isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-accent/10 text-accent')}>{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-border/80 p-3">
        <Link
          href="/dashboard/settings"
          className={cn('mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 transition-all hover:bg-secondary focus-ring', pathname.startsWith('/dashboard/settings') && 'bg-secondary')}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
            {(userName || userEmail || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{userName || userEmail || 'User'}</div>
            <div className="truncate text-xs text-muted-foreground">{userRole || 'staff'}</div>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
        <form action="/api/auth/logout" method="post">
          <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground focus-ring">
            <LogOut className="h-3.5 w-3.5" />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
