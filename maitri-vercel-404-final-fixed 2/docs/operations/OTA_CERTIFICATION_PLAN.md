# OTA Certification Plan

The project now has a normalized OTA reservation parser scaffold in `src/lib/channel-manager/ota-parser.ts`.

## Integration stages

1. **Staged webhook**: receive payload, verify token, save `channel_sync_log`.
2. **Normalized parser**: map provider payload into `NormalizedOtaReservation`.
3. **Mapping**: resolve `roomTypeCode` and `ratePlanCode` using `channel_room_mappings`.
4. **Import**: upsert guest + reservation by `(source, external_id)`.
5. **Modify/cancel**: apply OTA changes without creating duplicates.
6. **Inventory push**: update `rate_calendar.available_count` after direct and OTA bookings.
7. **Certification**: run provider sandbox/certification scenarios before enabling live OTA.

## Important

Agoda and Booking.com payloads differ by account, connectivity method, and certification mode. Do not pretend a generic parser is certification-complete. That is how overbooking becomes a lifestyle choice.
