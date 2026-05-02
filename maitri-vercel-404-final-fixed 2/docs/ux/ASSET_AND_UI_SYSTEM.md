# Maitri Asset, UI, Theme, Localization System

เอกสารนี้รวมจุดที่ต้องใส่รูป ไอคอน ฟังก์ชันเปิด/ปิด การเชื่อมต่อแอป และการตั้งค่าหน้าตาไว้ที่เดียว เพื่อไม่ให้โปรเจกต์กลายเป็นพิพิธภัณฑ์ไฟล์ PNG ไร้เจ้าของตามธรรมเนียมเว็บแอปมนุษย์

## Central registry

- `src/lib/assets/registry.ts` คือแหล่งกลางของรูปและไอคอน
- รูปทั้งหมดเก็บใน `public/brand`, `public/hospitality`, `public/integrations`
- ไอคอนใช้ `lucide-react` เพื่อให้ stroke, size และ mood ไปทางเดียวกันทั้งระบบ

## Required image placement

| Area | Asset | Path | Purpose |
|---|---|---|---|
| Brand | Maitri mark | `/brand/maitri-mark.svg` | Sidebar, auth, invoice header, favicon source |
| Booking | Hotel lobby hero | `/hospitality/hotel-lobby-hero.svg` | Public booking hero / marketing |
| Rooms | Suite room | `/hospitality/suite-room.svg` | Room cards, empty states, upsell |
| Inbox | Guest service | `/hospitality/guest-service.svg` | Empty states, concierge, AI reply |
| Integrations | Channel sync | `/integrations/channel-sync.svg` | OTA setup, webhook status |

## System Center

หน้า `/dashboard/settings` ถูกยกระดับเป็น control center:

- Hotel profile
- System module toggles
- App integrations
- Appearance and theme
- Asset and icon registry
- Localization
- Automation workflow placeholders

## Theme

ใช้ `next-themes` ผ่าน `src/components/providers/theme-provider.tsx`:

- Light
- Dark
- System

CSS token อยู่ที่ `src/app/globals.css` ภายใต้ `:root` และ `.dark`

## Localization

- `src/lib/i18n/dictionaries.ts`
- `src/components/providers/locale-provider.tsx`
- เริ่มต้นรองรับ `th`, `en`, `zh`, `ja`

> ตอนนี้เป็น client-side dictionary foundation ก่อน ถ้าจะ production เต็มควรต่อ route-based locale เช่น `/th`, `/en` หรือ middleware locale negotiation

## Responsive rules

- Mobile: bottom nav, single column, large touch target
- Tablet: 2-column cards
- Desktop: sidebar + content grid
- Front desk: future dense mode สำหรับจอ reception

## Production next steps

1. ต่อ asset upload กับ Supabase Storage
2. เพิ่มตาราง `tenant_feature_flags`
3. เพิ่มตาราง `tenant_branding_settings`
4. เพิ่ม audit log ทุกครั้งที่เปิด/ปิด module
5. Lock feature ตาม subscription package
6. แยก role permission: owner, manager, frontdesk, housekeeping, accounting
