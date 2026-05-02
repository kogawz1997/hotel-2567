import Link from 'next/link';

const quickLinks = [
  { href: '/dashboard', label: 'เปิด Dashboard', primary: true },
  { href: '/dashboard/settings', label: 'System Center' },
  { href: '/booking/demo', label: 'ทดสอบหน้าจอง' },
  { href: '/api/mock/status', label: 'Mock API Status' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Maitri Hotel PMS home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20">
              M
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight">Maitri Hotel PMS</span>
              <span className="block text-xs text-slate-400">Vercel preview ready</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Mock mode enabled
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur">
              Production SaaS preview build
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              ระบบจัดการโรงแรมที่พร้อมให้กดเทสบน Vercel แล้ว
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              หน้าแรกนี้ถูกเพิ่มมาเพื่อกัน 404 ที่ root domain และพาเข้า Dashboard, System Center, Booking demo และ Mock API ได้ทันที
              โดยยังไม่ต้องต่อ Supabase หรือ Omise จริงให้จักรวาลปั่นหัวเราเล่นอีกหนึ่งรอบ.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.primary
                      ? 'rounded-2xl bg-amber-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-xl shadow-amber-400/20 transition hover:-translate-y-0.5 hover:bg-amber-300'
                      : 'rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <StatusCard title="Root route" value="/ พร้อมแล้ว" />
              <StatusCard title="Vercel mode" value="Mock services" />
              <StatusCard title="Next.js" value="App Router" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Command center</p>
                  <h2 className="mt-1 text-xl font-semibold">Today overview</h2>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Live preview</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Occupancy" value="72%" />
                <Metric label="Check-ins" value="18" />
                <Metric label="Revenue" value="฿84.2k" />
                <Metric label="Pending" value="6" />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold">ระบบที่เชื่อมไว้สำหรับเทส</p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <ToggleLine label="Mock Auth" />
                  <ToggleLine label="Mock Payments" />
                  <ToggleLine label="Mock Booking Engine" />
                  <ToggleLine label="System Center UI" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ToggleLine({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">ON</span>
    </div>
  );
}
