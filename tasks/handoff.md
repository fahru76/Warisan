# Agent Handoff

## Status
Hermes backend foundation and P0 authorization remediation are in GitHub and applied to the live Supabase project.

## Workspace contract
GitHub is the only workspace. Do not clone or use a local repository.

## Backend contract
- `supabase/migrations/20261007000100_initial_schema.sql`
- `supabase/migrations/20261007000200_auth_roles_and_policies.sql`
- `supabase/migrations/20261007000300_privilege_escalation_hardening.sql`
- `supabase/migrations/20261009000100_fix_privileged_mutation_trigger.sql` (committed, NOT yet applied live)
- `supabase/seed.sql`
- `supabase/functions/create-payment-intent/index.ts`

## Security state
Live policy hardening has been applied and inspected. Customer role mutation and self-created verified artisan paths are blocked by RLS and database triggers. Authenticated negative-path tests ran on 2026-10-09 (`supabase/tests/authz_negative_paths.sql`). They found that the live trigger function makes every UPDATE on `profiles` and `artisans` fail with error 42703. With the fix migration, all denial cases still hold and legitimate updates (own profile/PDPA, admin verification) succeed.

## Frontend handoff gate
Claude may proceed with frontend scaffolding against the schema, but must not assume role changes or artisan verification are client-writable. Admin verification must use an admin-controlled path.

## Required next backend step
1. Apply `20261009000100_fix_privileged_mutation_trigger.sql` to the live project.
2. Re-run `supabase/tests/authz_negative_paths.sql`. It always rolls back; read the results from the `QA_ROLLBACK` message and confirm they match the table in `evals/security-hardening.md`.
3. Decide the follow-ups listed there (verified-artisan self-edit, service-role path for role changes).


## Claude security test follow-up
- Applied `20261009000100_fix_privileged_mutation_trigger.sql` live to `wkreaniwmbditbshksja`.
- Re-ran `supabase/tests/authz_negative_paths.sql`; the API returned HTTP 400 because the script intentionally raises `QA_ROLLBACK`. The embedded T1–T18 results match the expected security outcomes.
- T15 now allows verified artisans to edit safe profile fields.
- Verified artisan owners still cannot change `is_verified` or `profile_id`.
- Client role changes remain forbidden.
- Deployed ACTIVE `set-user-role` Edge Function, JWT-protected and admin-only, for server-side role changes.

## Claude inventory and booking follow-up (2026-10-09)
New live defects were found and are documented in `evals/security-hardening.md`:
- Unverified artisans' published items and workshops are publicly visible.
- Customers can self-confirm bookings, book unpublished workshops and exceed capacity.

The fix was verified in a rolled-back transaction. Required next steps for Hermes:
1. Apply `supabase/migrations/20261009000300_restrict_public_inventory_and_bookings.sql` live.
2. Re-run `supabase/tests/authz_inventory_bookings.sql` and `supabase/tests/authz_negative_paths.sql`; compare with the tables in `evals/security-hardening.md`.
3. Redeploy `set-user-role`, which now has a role allowlist (customer/artisan), a UUID check, a self-change guard, a 404 for unknown users and an admin-target guard.
4. Confirm the booking status vocabulary (`pending` / `confirmed` / `cancelled`); the capacity trigger assumes `cancelled` frees seats.


## Inventory, booking, and role-function follow-up
- Applied `20261009000300_restrict_public_inventory_and_bookings.sql` live.
- Re-ran both inventory/booking and negative-path authz scripts. Each returned HTTP 400 only for intentional `QA_ROLLBACK`; embedded T1–T33 and T1–T18 results match the evaluation tables.
- Booking `status` is currently `text`, default `pending`, not a database enum or check constraint. The application contract is `pending`, `confirmed`, `cancelled`, `completed`; the capacity trigger treats every status except `cancelled` as holding seats. Thus `cancelled` frees seats as assumed. A follow-up migration should add an enum/check constraint before production booking writes.
- Redeployed `set-user-role`: ACTIVE version 2, JWT verification enabled. The branch implementation validates UUID input, allows only customer/artisan, blocks self-change, returns 404 for unknown profiles, and refuses existing admins.

## Claude booking status follow-up (2026-10-09)
- I independently re-checked the live state: the inventory/booking policies and the capacity trigger are present, no QA users remain, and there are no booking or order rows yet.
- Added `supabase/migrations/20261009000400_bookings_status_check.sql`, which restricts `bookings.status` to `pending`, `confirmed`, `cancelled` and `completed`. I verified it in a rolled-back transaction: the 4 values are accepted, and `canceled`, `paid` and the empty string are rejected with 23514. **Not yet applied live.**
- `orders.status` is left unconstrained because its vocabulary isn't defined yet. Hermes: please confirm the order statuses (e.g. `pending` / `paid` / `cancelled` / `refunded`?) so a matching constraint can be added.

Next step for Hermes: apply `20261009000400_bookings_status_check.sql` live; it is safe because there are 0 booking rows.


## P0 security remediation
- Confirmed corrupted control bytes in the committed role migration.
- Repaired the migration and restored the complete seed file in GitHub.
- Applied live hardening: client users cannot change `profiles.role`; only unverified artisan rows may be self-created; artisan verification is admin-managed.
- Added database triggers rejecting role escalation and unauthorized verification changes.
- Verified the hardened policy set remotely.


## Claude Agent → Hermes tickets (opened 2026-10-07)

Claude Agent has picked up the frontend. Hermes owns everything below; frontend ships against fixtures/test-mode until each is closed.

### H-1 [CLOSED 2026-10-07 — verified live + git, migration 000300] [P0 security] Role self-escalation via `profiles` update policy
`profiles_update_self_or_admin` allows `update profiles set role = 'admin' where id = auth.uid()`. Any signed-in customer can become admin, and `current_role()` then unlocks every admin policy.
Fix: restrict self-updates to `display_name`, `pdpa_consent_date`, `marketing_opt_in` (column-level `grant update (...)` to `authenticated`, or a `before update` trigger rejecting `role` changes unless `current_role() = 'admin'`).

### H-2 [CLOSED 2026-10-07 — verified live + git, migration 000300] [P0 security] Self-verified artisans
`artisans_manage_owner_or_admin` (FOR ALL) lets any user insert/update a row with `profile_id = auth.uid()` and `is_verified = true`, which then appears in the public registry.
Fix: owners may not set `is_verified`; only admin. Same pattern as H-1.

### H-3 [CLOSED 2026-10-07 — 0 control bytes in all supabase/*.sql] [P1 repo drift] Migration file in git is not runnable
`supabase/migrations/20261007000200_auth_roles_and_policies.sql` contains control bytes (`\x5c\x10`) where `$$` belongs. Live DB was patched by hand, so `supabase db reset` from git fails. Commit the corrected SQL that was applied live.

### H-4 [CLOSED 2026-10-07 — seed 5/10/3, live counts match] [P1 repo drift] `supabase/seed.sql` only has 5 artisans
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

## Claude Agent verification of P0 remediation (2026-10-07)
Checked `origin/main` @ `45fe811` and the live project with read-only queries (`pg_policies`, `information_schema.triggers`, row counts). Live policies/triggers match `20261007000300_privilege_escalation_hardening.sql`. H-1..H-4 closed above. Not done: an authenticated attack run against production (would create users and write data in prod).
Note: `main` was force-pushed (`1bdb9da...45fe811`).

### H-12 [P0 security] Unverified artisans can publish to the public marketplace and provenance registry
Path: sign up → insert own artisan (`artisans_insert_unverified`, allowed) → insert `craft_items` / `workshops` with `is_published = true` (`*_manage_owner_or_admin` checks ownership only) → `craft_items_public` / `workshops_public` expose them to anon (`is_published = true` only).
Impact: counterfeit pieces appear on Warisan.net with a valid-looking provenance ID. Frontend now hides these and refuses to show "authentic" (branch `claude/new-session-b00fhf`), but the API still serves them to any client.
Fix (both needed):
1. Public select: `craft_items_public` / `workshops_public` → `is_published = true and exists (select 1 from artisans a where a.id = artisan_id and a.is_verified)`.
2. Owner write: owners of unverified artisans may draft but not publish — add `and (new.is_published = false or <artisan verified>)` to the owner `with check`, or extend `prevent_privileged_mutation()` to cover `craft_items` / `workshops` on INSERT and UPDATE.

### H-13 [P2 functional] Verified artisans cannot update their own row
`artisans_update_owner_safe` `with check (... and is_verified = false)` evaluates the NEW row, so every update by a verified owner fails (e.g. editing `bio`). The trigger already guards `is_verified` changes, so the check can become `with check (profile_id = auth.uid())`.

### H-14 [P2 ops] Admin promotion path is undefined
`prevent_privileged_mutation()` allows `role` changes only when `auth.role() = 'service_role'`. Existing admins (`profiles_admin_update`) and the SQL editor (`postgres`, `auth.role()` is null) are both rejected. Document the bootstrap procedure for the first admin, and decide whether admins may promote others (if yes, allow `current_role() = 'admin'` in the trigger).

### H-15 [P2 data] Non-deterministic `provenance_id` in seed
`seed.sql` lets `provenance_id` default to `gen_random_uuid()`, so local, staging and live get different IDs for the same piece; QR codes printed against one environment will not resolve in another. Seed explicit `id` and `provenance_id` values.

## Booking and order status follow-up
- Applied `20261009000400_bookings_status_check.sql` live.
- Verified `public.bookings` now restricts status to `pending`, `confirmed`, `cancelled`, and `completed`.
- Verified the live `orders.status` column is `text`, defaults to `pending`, and currently has zero rows. No order status vocabulary is confirmed yet; do not add a constraint until product/payment states are decided.
- Recommended candidate order vocabulary for review: `pending`, `paid`, `processing`, `fulfilled`, `cancelled`, `refunded`. `failed` may be needed if payment failures are persisted; `refunded` should be included if refunds are represented in orders.

## Claude order status follow-up (2026-10-09)
- The product owner confirmed the order statuses: `pending`, `paid`, `processing`, `fulfilled`, `cancelled`, `refunded`, `failed`.
- Added `supabase/migrations/20261009000500_orders_status_check.sql`. I verified it in a rolled-back transaction: the default `pending` and all 7 values are accepted; `canceled`, `completed`, `PAID` and the empty string are rejected with 23514. **Not yet applied live.**
- Next step for Hermes: apply it live. It is safe because there are 0 order rows.
- Checkout and payment code must use exactly these spellings.


## Order status constraint
- Applied `supabase/migrations/20261009000500_orders_status_check.sql` to live project `wkreaniwmbditbshksja`.
- Verified `orders_status_check` permits exactly: `pending`, `paid`, `processing`, `fulfilled`, `cancelled`, `refunded`, `failed`.
- Verified live order count is 0 at application time.
- Checkout, payment code, and frontend must use these exact spellings.
- Remaining verification: authenticated order permission tests after checkout begins creating orders.

## Claude order path follow-up (2026-10-09)
I verified the live `orders_status_check` (7 statuses) after Hermes applied it.

New since the last handoff:
- `supabase/migrations/20261009000600_create_order_rpc.sql` adds the `public.create_order(p_items jsonb, p_idempotency_key text) → uuid` function.
  - It is the only client path to create orders.
  - It uses server-side prices and only allows published items from verified artisans.
  - It validates quantities, merges duplicate lines, starts every order as `pending`, and handles idempotent replay.
  - Only `authenticated` users can call it.
- `supabase/tests/authz_orders.sql` contains tests O1–O17. All passed with the migration loaded inside a rolled-back transaction; results are in `evals/security-hardening.md`. **Not yet applied live.**

Frontend contract (Warisan.net checkout):
`supabase.rpc('create_order', { p_items: [{ craft_item_id, quantity }], p_idempotency_key })` returns the order id.
- Generate one idempotency key per checkout attempt, e.g. `crypto.randomUUID()`, and reuse it on retries.
- Never send prices.

Required next steps for Hermes:
1. Apply `20261009000600_create_order_rpc.sql` to `wkreaniwmbditbshksja`. It is safe: it only adds a function, and there are 0 orders.
2. Re-run `supabase/tests/authz_orders.sql` against live; it now runs without the migration loaded inline. Confirm the results match the O1–O17 table.
3. Harden `create-payment-intent`. It currently trusts the client-sent `amountMyr` and `orderId`. It should:
   - verify the caller's JWT;
   - load the order with the caller's client, so RLS ensures ownership;
   - require `status = 'pending'`;
   - use `orders.total_myr` as the amount and ignore `amountMyr`.
4. Optional: add the `create_order` signature to `packages/supabase-types` when the checkout UI is built.


## Order RPC and payment hardening — 2026-10-09
- Applied `20261009000600_create_order_rpc.sql` live.
- Re-ran `supabase/tests/authz_orders.sql`; HTTP 400 is intentional `QA_ROLLBACK`, and O1–O17 matched the table. Temporary users/orders rolled back; live counts remain 0.
- Redeployed `create-payment-intent` ACTIVE version 2 with JWT verification. It now ignores client `amountMyr`, loads only the caller's order, requires `pending`, and derives amount from `orders.total_myr`.
- Added pure handler tests and `.github/workflows/payment-security.yml`. Missing-auth and publishable-key smoke tests returned 401.
- Frontend checkout must call `create_order` first, then call payment intent with only `{orderId}` plus `Idempotency-Key`; never send or trust a price.

## Claude verification of order RPC and payment hardening (2026-10-09)
- Verified live: `create_order` is security definer; `anon` cannot execute it and `authenticated` can; 0 orders and 0 users remain.
- Ran the payment handler tests P1–P10 locally: all pass. CI run 37889240049 is green, including `deno check`. I reviewed the handler and found no issues.
- Updated `packages/supabase-types/src/database.ts`:
  - removed `amountMyr` from `CreatePaymentIntentInput`;
  - added `Booking`/`BookingStatus`, `Order`/`OrderStatus`, `OrderItem` and `CreateOrderArgs`, all matching the live constraints.
- The backend authorization gate is complete for the current scope. Nothing is pending for Hermes on the backend.

### Proposed next phase (awaiting product-owner go-ahead): Warisan.net commerce UI
Phase 5 in `tasks/todo.md`:
1. Customer auth with PDPA consent capture.
2. Catalog of published items from verified artisans.
3. Cart and checkout (`create_order`, then `create-payment-intent` in test mode).
4. Order history.
5. Workshop pending-booking flow.

Hermes prerequisites before Claude starts:
- Confirm the Supabase Auth settings for the project: email confirmation on or off, site URL, and redirect URLs for Warisan.net.
- Confirm that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for the `apps/net` preview environment (names only; never commit the values).


## Phase 5 Auth readiness — 2026-10-09

Live Auth config inspected for project `wkreaniwmbditbshksja` through the Supabase Management API:

- Email provider: enabled (`external_email_enabled=true`).
- Email confirmation: ON (`mailer_autoconfirm=false`; `mailer_allow_unverified_email_sign_ins=false`).
- Current Site URL: `http://localhost:3000` — development default, not production-ready.
- Current redirect allow-list: no `additional_redirect_urls` value was returned; the config exposes `uri_allow_list`, which must be checked/configured in the Supabase Dashboard.

No Auth settings were changed because the production Warisan.net URL and preview URL are not yet known. Do not guess these URLs.

Required before Phase 5 checkout/auth preview:
1. Confirm the canonical Warisan.net production URL.
2. Confirm the preview host pattern/provider (Vercel, Netlify, or other).
3. Configure the Site URL and exact preview/prod redirect URLs in Supabase Auth URL Configuration.
4. Configure deployment variables by **name only** in the apps/net preview environment:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

The Supabase project URL is known, but no frontend deployment environment was inspected or modified. No secret values were committed.

## Claude Phase 5 — Warisan.net commerce UI (2026-10-09)
Product-owner decisions:
- Phase 5 approved.
- Production domain is **warisan.net**.
- Hosting is **not decided yet**. There is no Warisan project in the connected Vercel team.

### Frontend foundation changed: please read
The frontend on `main` (and on this branch before today) **did not compile**:
- `packages/ui/src/index.ts` contained JSX;
- `apps/org/src/main.tsx` had broken JSX;
- `apps/net/src/main.tsx` had two root elements.

`validate.yml` only checks that files exist, so CI stayed green. I merged the earlier Claude frontend branch `claude/new-session-b00fhf`, which typechecks, passes its evals and builds both apps:
- Its `apps/` and `packages/ui` replace the broken ones.
- Five orphaned files were removed: `packages/ui/src/{PrivacyBanner,PrivacyControls}.tsx`, `packages/ui/src/i18n.ts`, `packages/ui/src/styles.css` and `apps/org/src/data.ts`.
- `scripts/validate-workspace.mjs` now lists the new structure.
- All backend, security and payment work is unchanged.

The bilingual/PDPA features from Hermes's `main` commits already exist in the merged UI (EN/BM i18n, `CookieBanner`, `PdpaConsent`, `LanguageSwitcher`, legal pages). The `feat/org-bilingual-privacy` branch is superseded by this; please do not merge it on top.

### Wired to the live contracts
- **Checkout:** sign-in is required in live mode. It calls `create_order` (no prices), then `create-payment-intent` with `{orderId}` and `Idempotency-Key`. The amount shown comes from the server.
- **Account:** order history (`listMyOrders`, RLS-scoped), with EN/BM labels for all 7 order statuses.
- **Workshop booking:** `api.requestBooking` maps the capacity trigger error, the duplicate-booking error (23505) and the RLS error (42501) to friendly EN/BM messages.
- **Accessibility:** `/workshops`, `/account` and the org directory now have an `<h1>`.

### New migration: needs live apply
`supabase/migrations/20261009000700_server_trusted_pdpa_consent.sql` closes H-11 and the consent part of H-7. Before it, **signup PDPA consent was never stored**, because `handle_new_user` ignored the metadata. Tests S1–S6 and B1–B2 pass in a rolled-back transaction; see `evals/security-hardening.md`.

### Verification (Claude sandbox)
- `pnpm test` 76/76, including 12 new tests in `evals/checkout-contract.test.ts`.
- `pnpm -r typecheck` 3/3 and `pnpm -r build` 2/2.
- Payment handler tests: Deno 10/10.
- Headless Chromium smoke test at 390px and 1440px in demo mode:
  - all pages render, with no horizontal overflow;
  - demo checkout and booking complete;
  - no JS errors; the only console errors are placeholder images, which the sandbox proxy blocks.
- **Not verified:** a live browser run against Supabase. This sandbox cannot reach `*.supabase.co`.

### Required next steps for Hermes
1. Apply `20261009000700_server_trusted_pdpa_consent.sql` to `wkreaniwmbditbshksja`. Then re-run `supabase/tests/pdpa_consent.sql`, `authz_inventory_bookings.sql` and `authz_orders.sql`.
   - `authz_inventory_bookings.sql` already sends consent on every booking insert, so T27–T33 keep testing status, visibility and capacity after 000700. Expected results are unchanged.
2. **Extend CI.** Add a job to `validate.yml` that runs `pnpm install --frozen-lockfile`, `pnpm -r run typecheck`, `pnpm test` and `pnpm -r run build`, so a non-compiling frontend can never pass CI again.
3. **Live smoke test.** From a machine that can reach Supabase, put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in root `.env.local` (gitignored). Then sign up, confirm the email, check out one item, and book a workshop.
4. **Hosting.** When the product owner picks a host:
   - Supabase Auth Site URL: `https://warisan.net`;
   - redirect allow-list: `https://warisan.net/**`, `https://www.warisan.net/**`, the host's preview pattern, and `http://localhost:5173/**` plus `http://localhost:5174/**` for dev (org and net dev ports);
   - set the env names on the host.
5. **Open tickets (Hermes):** H-5 timezone, H-9 image columns, H-10 CORS allow-list (set it to the warisan.net origins once hosting is known), and H-15 deterministic seed provenance IDs.


## Phase 5 PDPA and CI follow-up — 2026-10-09
- Applied `supabase/migrations/20261009000700_server_trusted_pdpa_consent.sql` live.
- Ran `supabase/tests/pdpa_consent.sql`: S1–S6 and B1–B2 matched expected results; HTTP 400 is intentional `QA_ROLLBACK`.
- Re-ran `authz_inventory_bookings.sql` and `authz_orders.sql`: T19–T33 and O1–O17 matched expected tables; both rolled back and live counts remain 0.
- Updated `validate.yml` to run frozen install, workspace validation, typecheck, test, and build.
- Auth URL configuration remains unchanged until hosting/preview URLs are selected.


## Phase 5 execution update — 2026-10-09
- Applied `20261009000700_server_trusted_pdpa_consent.sql` live.
- Re-ran `pdpa_consent.sql`, `authz_inventory_bookings.sql`, and `authz_orders.sql`; each returned intentional `QA_ROLLBACK` and all expected S/B/T/O results matched. Live order/booking/QA-user counts remain 0.
- `validate.yml` now enforces frozen install, validation, typecheck, test, and build. GitHub run 37892163405 passed all five gates.
- Added GitHub Actions secrets by name: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Values are not recorded in Markdown or source.
- Added manual `live-shop-smoke.yml` and `scripts/live-shop-smoke.py` to build Warisan.net, query the live published catalogue, render the built app in Chromium, and fail on page errors.
- Auth settings remain: email confirmation ON, Site URL `http://localhost:3000`; production is `https://warisan.net`, but preview hosting is not selected. Do not change Auth URLs until a hosting provider/preview URL is confirmed.
