-- Booking status vocabulary (agreed application contract). The capacity trigger treats every status
-- except 'cancelled' as holding seats, so a typo such as 'canceled' would silently keep seats taken.
alter table public.bookings add constraint bookings_status_check
check (status in ('pending', 'confirmed', 'cancelled', 'completed'));
