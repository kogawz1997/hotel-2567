-- Maitri PMS Production operations hardening
-- Adds atomic payment application, safer constraints, OTA de-duplication, and indexes for real pilot traffic.

BEGIN;

-- Basic data integrity guard rails. NOT VALID keeps this safe on existing imperfect data.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_valid_dates_check') THEN
    ALTER TABLE reservations ADD CONSTRAINT reservations_valid_dates_check CHECK (check_out > check_in) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_amounts_non_negative_check') THEN
    ALTER TABLE reservations ADD CONSTRAINT reservations_amounts_non_negative_check CHECK (total_amount >= 0 AND paid_amount >= 0) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_amount_positive_check') THEN
    ALTER TABLE payments ADD CONSTRAINT payments_amount_positive_check CHECK (amount > 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_currency_format_check') THEN
    ALTER TABLE payments ADD CONSTRAINT payments_currency_format_check CHECK (currency ~ '^[A-Z]{3}$') NOT VALID;
  END IF;
END $$;

-- OTA retries often send the same external booking repeatedly. Make that idempotent at database level.
CREATE UNIQUE INDEX IF NOT EXISTS reservations_hotel_source_external_unique
  ON reservations (hotel_id, source, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS webhook_events_provider_status_created_idx
  ON webhook_events (provider, status, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_hotel_created_idx
  ON audit_logs (hotel_id, created_at DESC);

-- Atomic payment application prevents race conditions when API charge + gateway webhook arrive close together.
CREATE OR REPLACE FUNCTION apply_reservation_payment(
  p_reservation_id UUID,
  p_amount NUMERIC
)
RETURNS reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation reservations;
  v_next_paid NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'payment_amount_must_be_positive';
  END IF;

  SELECT * INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  v_next_paid := LEAST(v_reservation.total_amount, COALESCE(v_reservation.paid_amount, 0) + p_amount);

  UPDATE reservations
  SET
    paid_amount = v_next_paid,
    status = CASE
      WHEN status IN ('pending', 'on_hold') AND v_next_paid >= total_amount THEN 'confirmed'
      ELSE status
    END,
    confirmed_at = CASE
      WHEN v_next_paid >= total_amount AND confirmed_at IS NULL THEN NOW()
      ELSE confirmed_at
    END,
    updated_at = NOW()
  WHERE id = p_reservation_id
  RETURNING * INTO v_reservation;

  RETURN v_reservation;
END;
$$;

REVOKE ALL ON FUNCTION apply_reservation_payment(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_reservation_payment(UUID, NUMERIC) TO service_role;

-- Expire unpaid public holds without deleting records. Run from cron/pg_cron or a trusted scheduled job.
CREATE OR REPLACE FUNCTION expire_public_booking_holds()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE reservations
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW(), internal_notes = COALESCE(internal_notes || E'\n', '') || 'Auto-cancelled: public booking hold expired.'
  WHERE source = 'website'
    AND status IN ('pending', 'on_hold')
    AND expires_at IS NOT NULL
    AND expires_at < NOW()
    AND COALESCE(paid_amount, 0) <= 0;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION expire_public_booking_holds() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION expire_public_booking_holds() TO service_role;

COMMIT;
