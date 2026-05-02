export const locales = ['th', 'en', 'zh', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const dictionaries: Record<Locale, Record<string, string>> = {
  th: {
    overview: 'ภาพรวม', inbox: 'กล่องข้อความ', reservations: 'การจอง', rooms: 'ห้อง', guests: 'แขก', housekeeping: 'แม่บ้าน',
    channels: 'ช่องทางขาย', marketing: 'การตลาด', accounting: 'บัญชี', reports: 'รายงาน', settings: 'ตั้งค่า', systemCenter: 'ศูนย์จัดการระบบ',
    appearance: 'หน้าตา', integrations: 'การเชื่อมต่อ', modules: 'ฟังก์ชัน', assets: 'รูปและไอคอน', language: 'ภาษา', light: 'สว่าง', dark: 'มืด', system: 'ตามเครื่อง', save: 'บันทึก',
  },
  en: {
    overview: 'Overview', inbox: 'Inbox', reservations: 'Reservations', rooms: 'Rooms', guests: 'Guests', housekeeping: 'Housekeeping',
    channels: 'Channels', marketing: 'Marketing', accounting: 'Accounting', reports: 'Reports', settings: 'Settings', systemCenter: 'System Center',
    appearance: 'Appearance', integrations: 'Integrations', modules: 'Modules', assets: 'Assets & icons', language: 'Language', light: 'Light', dark: 'Dark', system: 'System', save: 'Save',
  },
  zh: {
    overview: '概览', inbox: '收件箱', reservations: '预订', rooms: '房间', guests: '客人', housekeeping: '客房服务',
    channels: '渠道', marketing: '营销', accounting: '会计', reports: '报表', settings: '设置', systemCenter: '系统中心',
    appearance: '外观', integrations: '集成', modules: '模块', assets: '图片与图标', language: '语言', light: '浅色', dark: '深色', system: '系统', save: '保存',
  },
  ja: {
    overview: '概要', inbox: '受信箱', reservations: '予約', rooms: '客室', guests: 'ゲスト', housekeeping: '清掃',
    channels: 'チャネル', marketing: 'マーケティング', accounting: '会計', reports: 'レポート', settings: '設定', systemCenter: 'システムセンター',
    appearance: '外観', integrations: '連携', modules: '機能', assets: '画像とアイコン', language: '言語', light: 'ライト', dark: 'ダーク', system: 'システム', save: '保存',
  },
};
