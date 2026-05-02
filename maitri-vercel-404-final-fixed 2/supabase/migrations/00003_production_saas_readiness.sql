-- Maitri PMS Production SaaS readiness pass
-- Adds idempotency, availability guard rails, indexes, and safer public booking controls.

BEGIN;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS reservations_hotel_idempotency_key_unique
  ON reservations (hotel_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS reservations_hotel_roomtype_dates_idx
  ON reservations (hotel_id, room_type_id, check_in, check_out)
  WHERE status NOT IN ('cancelled', 'no_show');

CREATE INDEX IF NOT EXISTS rooms_hotel_roomtype_status_idx
  ON rooms (hotel_id, room_type_id, status);

CREATE INDEX IF NOT EXISTS rate_calendar_lookup_idx
  ON rate_calendar (hotel_id, room_type_id, rate_plan_id, date);

CREATE INDEX IF NOT EXISTS payments_reservation_status_idx
  ON payments (reservation_id, status);

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS public_booking_requires_payment BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_booking_hold_minutes INT NOT NULL DEFAULT 30;

ALTER TABLE hotels
  ADD CONSTRAINT hotels_public_booking_hold_minutes_check
  CHECK (public_booking_hold_minutes BETWEEN 5 AND 1440) NOT VALID;

-- Optional defense: prevent a single room from being double-assigned for overlapping active reservations.
-- Needs btree_gist for UUID equality in exclusion constraints.
CREATE EXTENSION IF NOT EXISTS btree_gist;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_no_room_overlap'
  ) THEN
    ALTER TABLE reservations
      ADD CONSTRAINT reservations_no_room_overlap
      EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
      )
      WHERE (room_id IS NOT NULL AND status NOT IN ('cancelled', 'no_show'));
  END IF;
END $$;

-- Keep public booking using service role at API level, but make browser/RLS access explicit and minimal.
DROP POLICY IF EXISTS "webhook_events_hotel_select" ON webhook_events;
CREATE POLICY "webhook_events_hotel_select" ON webhook_events FOR SELECT
  USING (
    hotel_id IN (
      SELECT h.id FROM hotels h
      JOIN user_profiles up ON up.organization_id = h.organization_id
      WHERE up.id = auth.uid() AND up.active = true
    )
  );

COMMIT;
