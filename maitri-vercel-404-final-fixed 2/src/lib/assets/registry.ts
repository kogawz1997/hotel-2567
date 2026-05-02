import {
  Bed, Building2, Calendar, CreditCard, Globe2, Heart, Hotel, MessageCircle, Receipt, Sparkles, UtensilsCrossed, Users, type LucideIcon,
} from 'lucide-react';

export type AssetPlacement = 'brand' | 'dashboard' | 'booking' | 'integrations' | 'empty-state' | 'marketing';

export interface MaitriAsset {
  id: string;
  label: string;
  placement: AssetPlacement;
  src: string;
  alt: string;
  recommendedSize: string;
  usage: string;
}

export interface MaitriIcon {
  id: string;
  label: string;
  icon: LucideIcon;
  placement: AssetPlacement;
  usage: string;
}

export const ASSETS: MaitriAsset[] = [
  { id: 'brand-mark', label: 'Maitri logo mark', placement: 'brand', src: '/brand/maitri-mark.svg', alt: 'Maitri brand mark', recommendedSize: '256x256 SVG', usage: 'Sidebar, auth pages, favicon source, invoice header' },
  { id: 'hotel-hero', label: 'Hotel lobby hero', placement: 'booking', src: '/hospitality/hotel-lobby-hero.svg', alt: 'Warm hotel lobby illustration', recommendedSize: '1600x900 SVG/WebP', usage: 'Public booking page and marketing hero' },
  { id: 'suite-room', label: 'Suite room card', placement: 'dashboard', src: '/hospitality/suite-room.svg', alt: 'Suite room illustration', recommendedSize: '1200x800 SVG/WebP', usage: 'Room cards, empty states, upsell panels' },
  { id: 'guest-service', label: 'Guest service', placement: 'empty-state', src: '/hospitality/guest-service.svg', alt: 'Guest service illustration', recommendedSize: '960x720 SVG/WebP', usage: 'Inbox, concierge, AI assistant empty states' },
  { id: 'channel-sync', label: 'Channel sync', placement: 'integrations', src: '/integrations/channel-sync.svg', alt: 'Channel manager sync illustration', recommendedSize: '960x720 SVG/WebP', usage: 'OTA setup, webhook configuration, sync status' },
];

export const ICONS: MaitriIcon[] = [
  { id: 'overview', label: 'Overview', icon: Hotel, placement: 'dashboard', usage: 'Dashboard overview and hotel status' },
  { id: 'reservations', label: 'Reservations', icon: Calendar, placement: 'dashboard', usage: 'Bookings, calendar, arrival/departure' },
  { id: 'rooms', label: 'Rooms', icon: Bed, placement: 'dashboard', usage: 'Inventory, availability, housekeeping' },
  { id: 'guests', label: 'Guests', icon: Users, placement: 'dashboard', usage: 'CRM, profile, loyalty' },
  { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles, placement: 'dashboard', usage: 'Room cleaning and maintenance states' },
  { id: 'integrations', label: 'Integrations', icon: Globe2, placement: 'integrations', usage: 'OTA and app connections' },
  { id: 'payments', label: 'Payments', icon: CreditCard, placement: 'integrations', usage: 'Omise, PromptPay, card payments' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, placement: 'integrations', usage: 'LINE, WhatsApp, WeChat inbox' },
  { id: 'accounting', label: 'Accounting', icon: Receipt, placement: 'dashboard', usage: 'Invoices, tax, folios' },
  { id: 'fb', label: 'F&B', icon: UtensilsCrossed, placement: 'dashboard', usage: 'Restaurant, mini bar, POS' },
  { id: 'spa', label: 'Spa', icon: Heart, placement: 'dashboard', usage: 'Spa booking and wellness add-ons' },
  { id: 'property', label: 'Property', icon: Building2, placement: 'brand', usage: 'Organization and property selector' },
];
