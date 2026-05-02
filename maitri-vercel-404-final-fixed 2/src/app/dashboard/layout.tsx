import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, organizations(name)')
    .eq('id', user.id)
    .single();

  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, name')
    .eq('organization_id', profile?.organization_id)
    .limit(1);

  return (
    <div className="flex min-h-screen bg-background texture-paper">
      <Sidebar
        hotelName={hotels?.[0]?.name || 'My Hotel'}
        userName={profile?.full_name || undefined}
        userEmail={profile?.email || user.email || undefined}
        userRole={profile?.role}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden pb-24 md:pb-0">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.10),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--secondary)),transparent_30%)]">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
