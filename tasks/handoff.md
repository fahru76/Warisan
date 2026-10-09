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
