-- Public inventory: published craft items and workshops are only public when their artisan is verified.
-- Previously an unverified artisan could self-publish items/workshops straight into the public registry.
alter policy craft_items_public on public.craft_items
using (is_published = true and exists (select 1 from public.artisans a where a.id = artisan_id and a.is_verified = true));

alter policy workshops_public on public.workshops
using (is_published = true and exists (select 1 from public.artisans a where a.id = artisan_id and a.is_verified = true));

-- Customer bookings: clients may only create pending bookings for themselves on bookable workshops.
-- Previously a customer could insert status='confirmed' (skipping payment) or book unpublished workshops.
alter policy bookings_insert_own on public.bookings
with check (
  customer_id = auth.uid()
  and status = 'pending'
  and exists (
    select 1 from public.workshops w join public.artisans a on a.id = w.artisan_id
    where w.id = workshop_id and w.is_published = true and a.is_verified = true and w.starts_at > now()
  )
);

-- Capacity is enforced server-side for every writer (client, admin, service role).
-- The workshop row lock serializes concurrent bookings for the same workshop.
-- Assumption: bookings with status 'cancelled' no longer hold seats.
create or replace function public.enforce_workshop_capacity() returns trigger language plpgsql security definer set search_path=public as $$
declare
  seat_capacity integer;
  seats_taken integer;
begin
  if new.status = 'cancelled' then
    return new;
  end if;
  select capacity into seat_capacity from public.workshops where id = new.workshop_id for update;
  if seat_capacity is null then
    raise exception 'workshop not found';
  end if;
  select coalesce(sum(quantity), 0) into seats_taken from public.bookings
  where workshop_id = new.workshop_id and status <> 'cancelled' and id <> new.id;
  if seats_taken + new.quantity > seat_capacity then
    raise exception 'workshop capacity exceeded';
  end if;
  return new;
end;
$$;

create or replace trigger enforce_workshop_capacity before insert or update of quantity, workshop_id, status on public.bookings
for each row execute function public.enforce_workshop_capacity();
