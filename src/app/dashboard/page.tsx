import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BedDouble,
  CalendarCheck,
  CircleDollarSign,
  MessageSquareWarning,
  Sparkles,
  UsersRound,
  Wrench,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardGrid, DashboardPageShell } from '@/components/dashboard/page-shell';
import { MetricCard } from '@/components/dashboard/metric-card';
import { formatCurrency, formatDate } from '@/lib/utils';

async function countQuery(query: any) {
  const { count } = await query;
  return count || 0;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id, full_name, role')
    .eq('id', user.id)
    .single();

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name, currency, check_in_time, check_out_time')
    .eq('organization_id', profile?.organization_id)
    .limit(1)
    .single();

  if (!hotel) {
    return (
      <DashboardPageShell>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>ยังไม่มีโรงแรมในระบบ</CardTitle>
            <CardDescription>บัญชีนี้ยังไม่ถูกผูกกับ property ใด ๆ ระบบเลยยังไม่มีอะไรให้ดู น่าเศร้าแต่แก้ได้</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/dashboard/settings">ไปตั้งค่าโรงแรม</Link></Button>
          </CardContent>
        </Card>
      </DashboardPageShell>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);

  const [roomsTotal, roomsAvailable, roomsOccupied, checkIns, checkOuts, openInbox, hkPending, guestsTotal] = await Promise.all([
    countQuery(supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id)),
    countQuery(supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('status', 'available')),
    countQuery(supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('status', 'occupied')),
    countQuery(supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('check_in', today).in('status', ['confirmed', 'pending'])),
    countQuery(supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('check_out', today).eq('status', 'checked_in')),
    countQuery(supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('status', 'open')),
    countQuery(supabase.from('housekeeping_tasks').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).in('status', ['pending', 'in_progress'])),
    countQuery(supabase.from('guests').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id)),
  ]);

  const { data: revenueRows } = await supabase
    .from('payments')
    .select('amount')
    .eq('hotel_id', hotel.id)
    .eq('status', 'completed')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${tomorrow}T00:00:00.000Z`);
  const revenueToday = (revenueRows || []).reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
  const occupancyRate = roomsTotal ? Math.round((roomsOccupied / roomsTotal) * 100) : 0;

  const { data: arrivals } = await supabase
    .from('reservations')
    .select('reservation_code, check_in, check_out, status, guests(first_name,last_name), room_types(name)')
    .eq('hotel_id', hotel.id)
    .eq('check_in', today)
    .order('created_at', { ascending: false })
    .limit(6);

  const serviceHealth = [
    { label: 'Booking engine', ok: true },
    { label: 'Payment guard', ok: true },
    { label: 'OTA webhook', ok: false },
    { label: 'System settings', ok: true },
  ];

  return (
    <DashboardPageShell>
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/90 p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-accent/10 to-transparent lg:block" />
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="accent">Maitri PMS</Badge>
              <Badge variant="outline">{profile?.role || 'staff'}</Badge>
              <Badge variant="outline">{formatDate(today)}</Badge>
            </div>
            <h1 className="max-w-4xl font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{hotel.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Command center สำหรับวันนี้: occupancy, arrivals, payment, inbox และงานที่ต้องรีบจัดการก่อนแขกเริ่มมองหน้าพนักงานเหมือนระบบล่มอีกแล้ว
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild><Link href="/dashboard/reservations">เปิดรายการจอง <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/settings">ไป System Center</Link></Button>
            </div>
          </div>
          <Card className="bg-background/60">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Operation window</p>
                  <p className="mt-1 text-xs text-muted-foreground">เช็กอิน {hotel.check_in_time?.slice(0, 5) || '14:00'} · เช็กเอาต์ {hotel.check_out_time?.slice(0, 5) || '12:00'}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Clock3 className="h-5 w-5" /></div>
              </div>
              <div className="mt-4 space-y-2">
                {serviceHealth.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-2 text-sm">
                    <span>{item.label}</span>
                    <Badge variant={item.ok ? 'success' : 'warning'}>{item.ok ? 'ready' : 'needs setup'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <DashboardGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Occupancy" value={`${occupancyRate}%`} sub={`${roomsOccupied}/${roomsTotal} ห้องใช้งาน · ${roomsAvailable} ห้องว่าง`} icon={BedDouble} href="/dashboard/rooms" tone="accent" progress={occupancyRate} />
        <MetricCard label="Check-in วันนี้" value={checkIns} sub={`${checkOuts} check-out วันนี้`} icon={CalendarCheck} href="/dashboard/reservations" tone="success" />
        <MetricCard label="รายได้วันนี้" value={formatCurrency(revenueToday, hotel.currency || 'THB')} sub="เฉพาะ payment completed" icon={CircleDollarSign} href="/dashboard/accounting" />
        <MetricCard label="Inbox เปิดอยู่" value={openInbox} sub="ข้อความที่ต้องตอบ" icon={MessageSquareWarning} href="/dashboard/inbox" tone={openInbox ? 'warning' : 'success'} />
      </DashboardGrid>

      <DashboardGrid className="xl:grid-cols-[1.35fr_0.75fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Arrivals วันนี้</CardTitle>
                <CardDescription>รายชื่อที่ควรเตรียมต้อนรับ ไม่ใช่ให้แขกยืนงงหน้าเคาน์เตอร์เหมือน NPC</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline"><Link href="/dashboard/reservations">ดูทั้งหมด</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(arrivals || []).length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary"><CalendarCheck className="h-5 w-5 text-muted-foreground" /></div>
                <p className="text-sm font-medium">ยังไม่มี check-in วันนี้</p>
                <p className="mt-1 text-xs text-muted-foreground">วันนี้อาจจะสงบ หรือระบบยังไม่มีข้อมูล, สองอย่างนี้ต่างกันมากนะ</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {arrivals?.map((item: any) => (
                  <div key={item.reservation_code} className="grid gap-3 p-4 transition hover:bg-secondary/40 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.guests?.first_name} {item.guests?.last_name || ''}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{item.reservation_code} · {item.room_types?.name || 'Room type'} · {item.check_in} → {item.check_out}</p>
                    </div>
                    <Badge variant={item.status === 'confirmed' ? 'success' : 'warning'}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>งานที่ต้องจับตา</CardTitle>
              <CardDescription>จุดเสี่ยงประจำวัน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActionRow href="/dashboard/housekeeping" icon={Wrench} label="Housekeeping pending" value={hkPending} tone={hkPending ? 'warning' : 'success'} />
              <ActionRow href="/dashboard/guests" icon={UsersRound} label="Guest database" value={guestsTotal} tone="outline" />
              <ActionRow href="/dashboard/marketing" icon={Sparkles} label="AI/Marketing readiness" value="เตรียมใช้งาน" tone="info" />
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium">Production focus</p>
                  <p className="text-xs text-muted-foreground">เหลือเชื่อมของจริง</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><Activity className="mt-0.5 h-4 w-4 text-accent" />Payment live keys, OTA certification และ Supabase production migration ยังต้องเทสใน environment จริง</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardGrid>
    </DashboardPageShell>
  );
}

function ActionRow({ href, icon: Icon, label, value, tone }: { href: string; icon: any; label: string; value: any; tone: 'warning' | 'success' | 'outline' | 'info' }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/50 p-4 transition-all hover:-translate-y-0.5 hover:bg-secondary/60 focus-ring">
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary"><Icon className="h-5 w-5" /></span>
        <span className="truncate text-sm font-medium">{label}</span>
      </span>
      <Badge variant={tone}>{value}</Badge>
    </Link>
  );
}
