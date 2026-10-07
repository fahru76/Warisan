create or replace function public.current_role() returns public.app_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, display_name, pdpa_consent_date)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''), null)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy profiles_update_self_or_admin on public.profiles for update
using (id = auth.uid() or public.current_role() = 'admin')
with check (id = auth.uid() or public.current_role() = 'admin');
create policy artisans_manage_owner_or_admin on public.artisans for all
using (profile_id = auth.uid() or public.current_role() = 'admin')
with check (profile_id = auth.uid() or public.current_role() = 'admin');
create policy craft_items_manage_owner_or_admin on public.craft_items for all
using (exists (select 1 from public.artisans a where a.id = artisan_id and (a.profile_id = auth.uid() or public.current_role() = 'admin')))
with check (exists (select 1 from public.artisans a where a.id = artisan_id and (a.profile_id = auth.uid() or public.current_role() = 'admin')));
create policy workshops_manage_owner_or_admin on public.workshops for all
using (exists (select 1 from public.artisans a where a.id = artisan_id and (a.profile_id = auth.uid() or public.current_role() = 'admin')))
with check (exists (select 1 from public.artisans a where a.id = artisan_id and (a.profile_id = auth.uid() or public.current_role() = 'admin')));
create policy bookings_admin_update on public.bookings for update
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy orders_admin_update on public.orders for update
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
