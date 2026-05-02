import Link from 'next/link';

export const dynamic = 'force-static';

const links = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/settings', label: 'System Center' },
  { href: '/booking/demo', label: 'Booking Demo' },
  { href: '/api/mock/status', label: 'Mock API Status' },
];

export default function CatchAllPreviewPage({ params }: { params: { path?: string[] } }) {
  const requestedPath = `/${params.path?.join('/') || ''}`;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
          Vercel preview route fallback
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">ไม่เจอหน้านี้ แต่ระบบ Next.js ทำงานแล้ว</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          เส้นทาง <span className="font-mono text-amber-200">{requestedPath}</span> ยังไม่มีหน้าเฉพาะ ระบบเลยพามาที่ fallback แทน
          เพื่อกัน Vercel 404 แบบหน้าขาว ๆ ที่ทำให้ชีวิต dev หม่นลงโดยไม่จำเป็น.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
