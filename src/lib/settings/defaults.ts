export type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  area: string;
  required?: boolean;
  enabled: boolean;
};

export type IntegrationSetting = {
  key: string;
  name: string;
  description: string;
  category: string;
  envKey: string;
  enabled: boolean;
  status: 'not_configured' | 'configured' | 'connected' | 'degraded' | 'disabled';
  publicConfig?: Record<string, unknown>;
};

export type BrandingSetting = {
  brandName: string;
  logoUrl: string;
  heroImageUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  radius: string;
  defaultTheme: 'light' | 'dark' | 'system';
};

export type LocaleSetting = {
  defaultLocale: string;
  enabledLocales: string[];
  timezone: string;
  currency: string;
  documentLocale: string;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  { key: 'bookingEngine', label: 'Booking Engine', description: 'Public booking page, quote, reserve and hold expiry.', area: 'Front Office', required: true, enabled: true },
  { key: 'reservations', label: 'Reservations', description: 'Reservation lifecycle, folios, check-in and check-out.', area: 'Front Office', required: true, enabled: true },
  { key: 'housekeeping', label: 'Housekeeping', description: 'Room cleaning, maintenance and task assignment.', area: 'Operations', enabled: true },
  { key: 'channelManager', label: 'Channel Manager', description: 'OTA webhook staging, room mapping and inventory sync.', area: 'Distribution', enabled: false },
  { key: 'payments', label: 'Payments', description: 'Omise, PromptPay, cards and payment webhooks.', area: 'Revenue', enabled: true },
  { key: 'inbox', label: 'Unified Inbox', description: 'LINE, WhatsApp, email, AI translate and guest replies.', area: 'Guest Experience', enabled: true },
  { key: 'fb', label: 'F&B / POS', description: 'Restaurant, minibar and room charge workflow.', area: 'Ancillary', enabled: false },
  { key: 'spa', label: 'Spa & Wellness', description: 'Spa booking, therapist schedule and packages.', area: 'Ancillary', enabled: false },
  { key: 'loyalty', label: 'Loyalty', description: 'Member points, vouchers and campaigns.', area: 'Marketing', enabled: false },
  { key: 'reports', label: 'Reports', description: 'ADR, RevPAR, occupancy and tax reports.', area: 'Analytics', required: true, enabled: true },
];

export const DEFAULT_INTEGRATIONS: IntegrationSetting[] = [
  { key: 'line', name: 'LINE Official Account', description: 'Messaging and guest support through LINE OA.', category: 'Messaging', envKey: 'LINE_CHANNEL_ACCESS_TOKEN', enabled: false, status: 'not_configured' },
  { key: 'whatsapp', name: 'WhatsApp Business', description: 'Messaging for international guests.', category: 'Messaging', envKey: 'WHATSAPP_ACCESS_TOKEN', enabled: false, status: 'not_configured' },
  { key: 'wechat', name: 'WeChat', description: 'Messaging for Chinese guests and tour groups.', category: 'Messaging', envKey: 'WECHAT_APP_SECRET', enabled: false, status: 'not_configured' },
  { key: 'booking', name: 'Booking.com', description: 'OTA reservation import and availability sync.', category: 'OTA', envKey: 'BOOKING_COM_WEBHOOK_TOKEN', enabled: false, status: 'not_configured' },
  { key: 'agoda', name: 'Agoda', description: 'OTA reservation import and staged parser.', category: 'OTA', envKey: 'AGODA_WEBHOOK_TOKEN', enabled: false, status: 'not_configured' },
  { key: 'airbnb', name: 'Airbnb', description: 'iCal bridge and availability blocking.', category: 'OTA', envKey: 'AIRBNB_ICAL_SECRET', enabled: false, status: 'not_configured' },
  { key: 'omise', name: 'Omise Payment', description: 'PromptPay, card charges and webhook confirmation.', category: 'Payment', envKey: 'OMISE_SECRET_KEY', enabled: false, status: 'not_configured' },
  { key: 'etax', name: 'e-Tax Invoice', description: 'Thai electronic tax invoice provider.', category: 'Compliance', envKey: 'ETAX_PROVIDER_KEY', enabled: false, status: 'not_configured' },
  { key: 'accounting', name: 'PEAK / FlowAccount', description: 'Accounting export and invoice sync.', category: 'Accounting', envKey: 'ACCOUNTING_API_KEY', enabled: false, status: 'not_configured' },
];

export const DEFAULT_BRANDING: BrandingSetting = {
  brandName: 'Maitri Hotel',
  logoUrl: '/brand/maitri-mark.svg',
  heroImageUrl: '/hospitality/lobby-hero.svg',
  faviconUrl: '/brand/favicon.svg',
  primaryColor: '#2A2522',
  accentColor: '#C66A30',
  radius: '0.75rem',
  defaultTheme: 'system',
};

export const DEFAULT_LOCALE: LocaleSetting = {
  defaultLocale: 'th',
  enabledLocales: ['th', 'en', 'zh', 'ja'],
  timezone: 'Asia/Bangkok',
  currency: 'THB',
  documentLocale: 'th',
};
