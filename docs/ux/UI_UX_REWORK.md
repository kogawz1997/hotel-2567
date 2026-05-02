# Maitri PMS UI/UX Rework

รอบนี้ปรับจาก developer UI ให้เป็น product UI ที่เอาไปทดสอบกับ Vercel และ pilot user ได้เป็นระบบขึ้น

## สิ่งที่แก้แล้ว

### 1. Navigation hierarchy
- ย้าย menu structure ไปไว้กลางที่ `src/lib/navigation/dashboard-nav.ts`
- แยกกลุ่มเป็น Command, Operations, Revenue, Distribution, Add-ons
- Sidebar ใช้ข้อมูลกลางเดียวกับ mobile nav เพื่อลดความมั่วในอนาคต
- Mobile nav เหลือเฉพาะเส้นทางหลักที่ใช้จริงบ่อย

### 2. Dashboard command center
- ปรับหน้า `/dashboard` เป็น hero + KPI cards + arrivals + daily risk panel
- เพิ่ม KPI หลัก: occupancy, check-in, revenue, inbox
- เพิ่ม service health panel เพื่อแยกจุดที่ ready กับ needs setup
- ทำ responsive layout สำหรับ desktop/tablet/mobile

### 3. Design system utility
- เพิ่ม reusable layout ที่ `src/components/dashboard/page-shell.tsx`
- เพิ่ม metric card ที่ `src/components/dashboard/metric-card.tsx`
- เพิ่ม utility class ใน `globals.css` เช่น `.container-page`, `.section-card`, `.responsive-table`, `.touch-target`

### 4. App shell polish
- ปรับ dashboard layout ให้มี background layer + texture เบา ๆ
- ปรับ sidebar spacing, active state, labels, descriptions ให้เป็นระบบ
- ปรับ top bar ให้มี breadcrumb และ action cluster
- ปรับ mobile bottom nav ให้ touch target ใหญ่ขึ้นและใช้ safe-area

### 5. Responsive cleanup
- แก้ guest stats ไม่ให้ 3 columns บนมือถือแบบอัดแน่นเกินไป
- เพิ่ม CSS pattern สำหรับ table/card responsive ในหน้าที่ต้องปรับต่อ

## จุดที่ควรทำต่อหลังเทส Vercel

1. เปลี่ยน table หลักใน reservations/guests/reports เป็น mobile card view เต็มรูปแบบ
2. ต่อ global command search จริง ไม่ใช่ปุ่ม UI เฉย ๆ
3. เพิ่ม notification drawer จริง
4. ใส่ skeleton loading สำหรับ dashboard stats และ settings tabs
5. ทำ visual QA บนอุปกรณ์จริง: iPhone, iPad, desktop 1366px, desktop 1920px
6. ทำ E2E screenshot test ด้วย Playwright ก่อนขายจริง

## ไฟล์หลักที่แตะ

- `src/lib/navigation/dashboard-nav.ts`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/top-bar.tsx`
- `src/components/dashboard/page-shell.tsx`
- `src/components/dashboard/metric-card.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/globals.css`
- `src/app/dashboard/guests/page.tsx`
