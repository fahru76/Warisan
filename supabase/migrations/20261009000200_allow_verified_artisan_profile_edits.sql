-- Verified artisan owners may edit their profile; the trigger still protects is_verified.
drop policy if exists artisans_update_owner_safe on public.artisans;
create policy artisans_update_owner_safe on public.artisans for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());