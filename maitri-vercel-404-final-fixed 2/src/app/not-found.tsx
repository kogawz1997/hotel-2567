import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">404</p>
        <h1 className="mt-3 text-3xl font-semibold">ไม่เจอหน้านี้</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          เส้นทางนี้ไม่มีใน preview build แต่หน้าแรก, Dashboard และ Mock API พร้อมให้เทสแล้ว
          เพราะอย่างน้อยเราก็ไม่ควรปล่อยให้ Vercel ยืนงงคนเดียว.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950" href="/">
            กลับหน้าแรก
          </Link>
          <Link className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white" href="/dashboard">
            ไป Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
