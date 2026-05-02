import {
  Award,
  BarChart3,
  Bed,
  Calendar,
  Globe2,
  Heart,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Receipt,
  Settings,
  Sparkles,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type DashboardNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  shortLabel?: string;
  badge?: string;
  description?: string;
  priority?: 'primary' | 'secondary';
};

export type DashboardNavGroup = {
  label: string;
  description: string;
  items: DashboardNavItem[];
};

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: 'Command',
    description: 'ภาพรวมและจุดที่ต้องตอบไว',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', shortLabel: 'หน้าแรก', description: 'KPI วันนี้และงานด่วน', priority: 'primary' },
      { href: '/dashboard/inbox', icon: MessageSquare, label: 'Unified Inbox', shortLabel: 'Inbox', description: 'LINE / WhatsApp / OTA messages', badge: 'live', priority: 'primary' },
      { href: '/dashboard/settings', icon: Settings, label: 'System Center', shortLabel: 'ระบบ', description: 'ตั้งค่า เปิด/ปิด และเชื่อมต่อระบบ', priority: 'primary' },
    ],
  },
  {
    label: 'Operations',
    description: 'งานประจำวันของโรงแรม',
    items: [
      { href: '/dashboard/reservations', icon: Calendar, label: 'Reservations', shortLabel: 'จอง', description: 'จอง เช็กอิน เช็กเอาต์', priority: 'primary' },
      { href: '/dashboard/rooms', icon: Bed, label: 'Rooms', shortLabel: 'ห้อง', description: 'ห้องว่าง สถานะ และราคา', priority: 'primary' },
      { href: '/dashboard/guests', icon: Users, label: 'Guests', shortLabel: 'แขก', description: 'CRM และประวัติแขก', priority: 'primary' },
      { href: '/dashboard/housekeeping', icon: Sparkles, label: 'Housekeeping', shortLabel: 'แม่บ้าน', description: 'งานทำความสะอาดและซ่อมบำรุง', priority: 'primary' },
    ],
  },
  {
    label: 'Revenue',
    description: 'รายได้ การเงิน และรายงาน',
    items: [
      { href: '/dashboard/accounting', icon: Receipt, label: 'Accounting & Tax', shortLabel: 'บัญชี', description: 'folio, invoice, e-tax' },
      { href: '/dashboard/reports', icon: BarChart3, label: 'Reports', shortLabel: 'รายงาน', description: 'รายได้ occupancy และ performance' },
    ],
  },
  {
    label: 'Distribution',
    description: 'ช่องทางขายและการตลาด',
    items: [
      { href: '/dashboard/channels', icon: Globe2, label: 'Channel Manager', shortLabel: 'OTA', description: 'Agoda, Booking.com และช่องทางขาย' },
      { href: '/dashboard/marketing', icon: Megaphone, label: 'Marketing', shortLabel: 'ตลาด', description: 'แคมเปญ โปรโมชัน และ automation' },
    ],
  },
  {
    label: 'Add-ons',
    description: 'โมดูลเสริมสำหรับโรงแรม',
    items: [
      { href: '/dashboard/fb', icon: UtensilsCrossed, label: 'F&B', shortLabel: 'F&B', description: 'Restaurant, bar, room service' },
      { href: '/dashboard/spa', icon: Heart, label: 'Spa', shortLabel: 'Spa', description: 'Spa booking และ wellness' },
      { href: '/dashboard/loyalty', icon: Award, label: 'Loyalty', shortLabel: 'สะสมแต้ม', description: 'Member, points, rewards' },
    ],
  },
];

export const MOBILE_NAV_ITEMS = DASHBOARD_NAV_GROUPS.flatMap((group) => group.items)
  .filter((item) => item.priority === 'primary')
  .slice(0, 5);

export function isDashboardRouteActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
}

export function getCurrentDashboardItem(pathname: string) {
  return DASHBOARD_NAV_GROUPS.flatMap((group) => group.items).find((item) => isDashboardRouteActive(pathname, item.href));
}
