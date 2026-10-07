# Agent Handoff

## Status
Hermes backend foundation is present in GitHub.

## Workspace contract
GitHub is the only workspace. Do not clone or use a local repository.

## Backend contract
- supabase/migrations/20261007000100_initial_schema.sql
- supabase/migrations/20261007000200_auth_roles_and_policies.sql
- supabase/seed.sql
- supabase/functions/create-payment-intent/index.ts

The backend defines profiles, artisans, craft items, workshops, bookings, orders, order items, provenance UUIDs, PDPA fields, RLS, signup profile creation, and a test-only payment intent function.

## Deployment blocker
The migration and Edge Function are not deployed to a live Supabase project. Deployment requires a project ref and securely configured GitHub Actions secrets. Do not claim live deployment before a remote verification query succeeds.

## Frontend contract
Claude Agent can build against the committed schema. If frontend work needs an RPC, add the request here before implementation.


## Live Supabase verification
- Project ref: `wkreaniwmbditbshksja`
- Initial schema migration applied successfully through the Supabase Management API.
- Role/auth migration initially failed because the GitHub copy contained malformed dollar-quote delimiters; corrected SQL was applied remotely and verified.
- Seed verification currently shows 5 artisans, 1 craft item, and 1 workshop. The full 10-item/3-workshop seed was not applied; this remains incomplete.
- Payment Edge Function has not been deployed.


## Final live deployment verification
- Full seed now verified: 5 artisans, 10 craft items, 3 workshops.
- Edge Function `create-payment-intent` deployed successfully, version 1, ACTIVE, JWT verification enabled.
- Live function smoke test returned HTTP 200 with a test-mode payment intent.
- GitHub Actions secret setup was not used; deployment was performed through the Supabase Management API.


## Claude Agent → Hermes tickets (opened 2026-10-07)

Claude Agent has picked up the frontend. Hermes owns everything below; frontend ships against fixtures/test-mode until each is closed.

### H-1 [P0 security] Role self-escalation via `profiles` update policy
`profiles_update_self_or_admin` allows `update profiles set role = 'admin' where id = auth.uid()`. Any signed-in customer can become admin, and `current_role()` then unlocks every admin policy.
Fix: restrict self-updates to `display_name`, `pdpa_consent_date`, `marketing_opt_in` (column-level `grant update (...)` to `authenticated`, or a `before update` trigger rejecting `role` changes unless `current_role() = 'admin'`).

### H-2 [P0 security] Self-verified artisans
`artisans_manage_owner_or_admin` (FOR ALL) lets any user insert/update a row with `profile_id = auth.uid()` and `is_verified = true`, which then appears in the public registry.
Fix: owners may not set `is_verified`; only admin. Same pattern as H-1.

### H-3 [P1 repo drift] Migration file in git is not runnable
`supabase/migrations/20261007000200_auth_roles_and_policies.sql` contains control bytes (`\x5c\x10`) where `$$` belongs. Live DB was patched by hand, so `supabase db reset` from git fails. Commit the corrected SQL that was applied live.

### H-4 [P1 repo drift] `supabase/seed.sql` only has 5 artisans
Live DB has 10 craft items + 3 workshops. Commit the full seed so local and live match.

### H-5 [P1 requirement] `Asia/Kuala_Lumpur` timezone
No timezone is pinned. Add `alter database postgres set timezone to 'Asia/Kuala_Lumpur';` (or role-level) in a migration. Frontend already formats all timestamps in `Asia/Kuala_Lumpur` explicitly.

### H-6 [P1 RPC] `create_order(items jsonb, idempotency_key text) returns uuid`
`orders`/`order_items` have no insert policy, so customers cannot create orders. Need a `security definer` RPC that prices items server-side from `craft_items.price_myr` (never trust client totals), rejects unpublished items, and is idempotent on `idempotency_key`. Frontend then calls `create-payment-intent` with the returned order id.

### H-7 [P1 RPC] `book_workshop(workshop_id uuid, quantity int, pdpa_consent boolean) returns uuid`
Current direct insert does not enforce `capacity` and trusts client `pdpa_consent_date`. RPC should lock the workshop row, check remaining capacity, require consent = true, and stamp `pdpa_consent_date = now()`.

### H-8 [P2 RPC] `get_provenance(p uuid)` for anon
Warisan.org QR landing (`/provenance/:id`) needs item + artisan by `provenance_id`, readable by anon for published items. Current policies allow it via two selects; an RPC is optional but would keep it one round-trip.

### H-9 [P2 schema] Image columns
No `image_url` on `artisans` / `craft_items` / `workshops`. Frontend uses deterministic placeholder images keyed by row id until these exist.

### H-10 [P2 CORS] Edge Function origin allow-list
`create-payment-intent` returns `Access-Control-Allow-Origin: *`. Before leaving test mode, restrict to the warisan.net origins (+ localhost for dev).

### H-11 [P1 trigger] Registration metadata → profile / artisan application
Frontend `signUp` sends `raw_user_meta_data`: `display_name`, `pdpa_consent` (bool), `marketing_opt_in` (bool), `applying_as` (`customer` | `artisan`), `craft_specialty`, `location`.
Extend `handle_new_user` to: set `pdpa_consent_date = now()` when `pdpa_consent` is true (server-trusted, never client time), copy `marketing_opt_in`, and when `applying_as = 'artisan'` insert an `artisans` row (`profile_id = new.id`, `is_verified = false`). Never set `role` from metadata — admins promote via the `/admin` queue.

## Frontend status (Claude Agent)
Phase 3 shipped on branch `claude/new-session-b00fhf`: `packages/ui`, `apps/org`, `apps/net`. Apps run on fixtures without env and switch to live Supabase when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set in root `.env.local`. Waiting on H-1/H-2 (security) before any public deploy.
