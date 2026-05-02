-- Maitri PMS Production SaaS hardening
-- Safe to run after 00001_initial_schema.sql. Adds SaaS safety rails without deleting existing data.

BEGIN;

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS public_booking_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS provider_event_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_event_type TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_transaction_unique
  ON payments (gateway, gateway_transaction_id)
  WHERE gateway IS NOT NULL AND gateway_transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_idempotency_key_unique
  ON payments (hotel_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_event_unique
  ON payments (gateway, provider_event_id)
  WHERE gateway IS NOT NULL AND provider_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_events_hotel_select" ON webhook_events;
CREATE POLICY "webhook_events_hotel_select" ON webhook_events FOR SELECT
  USING (
    hotel_id IN (
      SELECT h.id FROM hotels h
      JOIN user_profiles up ON up.organization_id = h.organization_id
      WHERE up.id = auth.uid() AND up.active = true
    )
  );

-- Strengthen relation-table RLS with explicit WITH CHECK clauses.
DROP POLICY IF EXISTS "folio_items_via_folio" ON folio_items;
CREATE POLICY "folio_items_via_folio" ON folio_items FOR ALL
  USING (folio_id IN (SELECT id FROM folios WHERE hotel_id IN (SELECT get_user_hotels())))
  WITH CHECK (folio_id IN (SELECT id FROM folios WHERE hotel_id IN (SELECT get_user_hotels())));

DROP POLICY IF EXISTS "invoice_items_via_invoice" ON invoice_items;
CREATE POLICY "invoice_items_via_invoice" ON invoice_items FOR ALL
  USING (invoice_id IN (SELECT id FROM invoices WHERE hotel_id IN (SELECT get_user_hotels())))
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE hotel_id IN (SELECT get_user_hotels())));

DROP POLICY IF EXISTS "channel_mapping_via_connection" ON channel_room_mappings;
CREATE POLICY "channel_mapping_via_connection" ON channel_room_mappings FOR ALL
  USING (channel_connection_id IN (SELECT id FROM channel_connections WHERE hotel_id IN (SELECT get_user_hotels())))
  WITH CHECK (channel_connection_id IN (SELECT id FROM channel_connections WHERE hotel_id IN (SELECT get_user_hotels())));

DROP POLICY IF EXISTS "channel_log_via_connection" ON channel_sync_log;
CREATE POLICY "channel_log_via_connection" ON channel_sync_log FOR ALL
  USING (channel_connection_id IN (SELECT id FROM channel_connections WHERE hotel_id IN (SELECT get_user_hotels())))
  WITH CHECK (channel_connection_id IN (SELECT id FROM channel_connections WHERE hotel_id IN (SELECT get_user_hotels())));

DROP POLICY IF EXISTS "fb_categories_via_outlet" ON fb_menu_categories;
CREATE POLICY "fb_categories_via_outlet" ON fb_menu_categories FOR ALL
  USING (outlet_id IN (SELECT id FROM fb_outlets WHERE hotel_id IN (SELECT get_user_hotels())))
  WITH CHECK (outlet_id IN (SELECT id FROM fb_outlets WHERE hotel_id IN (SELECT get_user_hotels())));

DROP POLICY IF EXISTS "fb_order_items_via_order" ON fb_order_items;
CREATE POLICY "fb_order_items_via_order" ON fb_order_items FOR ALL
  USING (fb_order_id IN (SELECT id FROM fb_orders WHERE hotel_id IN (SELECT get_user_hotels())))
  WITH CHECK (fb_order_id IN (SELECT id FROM fb_orders WHERE hotel_id IN (SELECT get_user_hotels())));

COMMIT;
