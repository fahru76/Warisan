-- Order status vocabulary (confirmed by product owner 2026-10-09). 'failed' covers persisted failed payment attempts.
alter table public.orders add constraint orders_status_check
check (status in ('pending', 'paid', 'processing', 'fulfilled', 'cancelled', 'refunded', 'failed'));
