-- Fix: the shared trigger function referenced old.role on artisans rows and new.is_verified on
-- profiles rows. PL/pgSQL resolves record fields even when an earlier AND operand is false, so every
-- UPDATE on public.profiles and public.artisans failed with 42703 (including PDPA consent updates
-- and admin verification). Branch per table so each record is only read for its own table.
create or replace function public.prevent_privileged_mutation() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_table_name = 'profiles' then
    if new.role is distinct from old.role and coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'profile role is server-managed';
    end if;
  elsif tg_table_name = 'artisans' then
    if new.is_verified is distinct from old.is_verified and coalesce(auth.role(), '') <> 'service_role' and public.current_role() is distinct from 'admin' then
      raise exception 'artisan verification is admin-managed';
    end if;
  end if;
  return new;
end;
$$;
