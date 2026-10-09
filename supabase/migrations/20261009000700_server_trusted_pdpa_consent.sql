-- PDPA consent must be recorded with server time, never client time (handoff tickets H-11, H-7).

-- Signup: copy the registration metadata the Warisan.net/.org forms send into the profile.
-- pdpa_consent_date is stamped with now() only when the user ticked consent. Role is never read
-- from metadata. An artisan application creates an unverified artisans row for admin review.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  display_name text := left(btrim(coalesce(meta ->> 'display_name', '')), 120);
  craft text := left(btrim(coalesce(meta ->> 'craft_specialty', '')), 120);
  place text := left(btrim(coalesce(meta ->> 'location', '')), 120);
begin
  insert into public.profiles (id, display_name, pdpa_consent_date, marketing_opt_in)
  values (
    new.id,
    display_name,
    case when meta ->> 'pdpa_consent' = 'true' then now() end,
    coalesce(meta ->> 'pdpa_consent' = 'true' and meta ->> 'marketing_opt_in' = 'true', false)
  )
  on conflict (id) do nothing;

  if meta ->> 'applying_as' = 'artisan' and meta ->> 'pdpa_consent' = 'true' and craft <> '' and place <> '' then
    insert into public.artisans (profile_id, name, craft_specialty, location, is_verified, pdpa_consent_date, marketing_opt_in)
    values (new.id, coalesce(nullif(display_name, ''), 'Artisan'), craft, place, false, now(), coalesce(meta ->> 'marketing_opt_in' = 'true', false))
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

-- Bookings: customers must give consent, and the stored timestamp is always server time.
alter policy bookings_insert_own on public.bookings
with check (
  customer_id = auth.uid()
  and status = 'pending'
  and pdpa_consent_date is not null
  and exists (
    select 1 from public.workshops w join public.artisans a on a.id = w.artisan_id
    where w.id = workshop_id and w.is_published = true and a.is_verified = true and w.starts_at > now()
  )
);

create or replace function public.stamp_booking_consent() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.pdpa_consent_date is not null then
    new.pdpa_consent_date := now();
  end if;
  return new;
end;
$$;

create or replace trigger stamp_booking_consent before insert on public.bookings
for each row execute function public.stamp_booking_consent();
