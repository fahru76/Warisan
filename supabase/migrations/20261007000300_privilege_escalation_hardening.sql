drop policy if exists profiles_update_self_or_admin on public.profiles;
drop policy if exists artisans_manage_owner_or_admin on public.artisans;
create or replace function public.prevent_privileged_mutation() returns trigger language plpgsql security definer set search_path=public as $$ begin
if tg_table_name='profiles' and old.role is distinct from new.role and coalesce(auth.role(),'') <> 'service_role' then raise exception 'profile role is server-managed'; end if;
if tg_table_name='artisans' and new.is_verified is distinct from old.is_verified and coalesce(auth.role(),'') <> 'service_role' and public.current_role()<>'admin' then raise exception 'artisan verification is admin-managed'; end if; return new; end; $$;
drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges before update on public.profiles for each row execute function public.prevent_privileged_mutation();
drop trigger if exists protect_artisan_verification on public.artisans;
create trigger protect_artisan_verification before update on public.artisans for each row execute function public.prevent_privileged_mutation();
create policy profiles_update_self_safe on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());
create policy profiles_admin_update on public.profiles for update using(public.current_role()='admin') with check(public.current_role()='admin');
create policy artisans_insert_unverified on public.artisans for insert with check(profile_id=auth.uid() and is_verified=false);
create policy artisans_update_owner_safe on public.artisans for update using(profile_id=auth.uid()) with check(profile_id=auth.uid() and is_verified=false);
create policy artisans_delete_owner on public.artisans for delete using(profile_id=auth.uid());
create policy artisans_admin_manage on public.artisans for all using(public.current_role()='admin') with check(public.current_role()='admin');
