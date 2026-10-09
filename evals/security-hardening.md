# P0 Security Regression Evaluation

These checks must remain true in the live Supabase project:

- [x] A customer cannot update `profiles.role` to `admin`.
- [x] A customer cannot insert an artisan row with `is_verified = true`.
- [x] An artisan owner cannot change `is_verified` from false to true.
- [x] An admin can verify an artisan.
- [x] Public reads expose verified artisans and published inventory only.
- [x] Committed SQL files contain no control bytes and include complete deterministic seed data.

## Required evidence

Record the SQL policy inspection and seed-count query in the deployment handoff. Do not treat a successful migration response alone as proof that authorization is correct.

## Authenticated negative-path results — 2026-10-09 (Claude)

Project: `wkreaniwmbditbshksja` (Warisan). Script: `supabase/tests/authz_negative_paths.sql`.
Every run creates temporary customer, artisan and admin auth users and then raises `QA_ROLLBACK`. Afterwards the live data was confirmed unchanged: 0 QA users, 0 profiles, 5 artisans.

### Blocking defect found in the live trigger (P0, functional)

`public.prevent_privileged_mutation()` (migration `…000300`) reads `old.role` on `artisans` rows and `new.is_verified` on `profiles` rows. PL/pgSQL resolves those fields even when the `tg_table_name` check is false. As a result, **every UPDATE on `profiles` and `artisans` fails** with `42703 record "new"/"old" has no field …`. That includes PDPA consent updates, profile edits and admin verification.

- Reproduced live: a no-op `update public.artisans set bio=bio` failed with `42703 record "old" has no field "role"`.
- The earlier "denied" security checks passed only because all updates fail.
- Fix: `supabase/migrations/20261009000100_fix_privileged_mutation_trigger.sql`. It branches per table and keeps the same rules. **The fix is committed but not yet applied to the live project.**

### Results with the fix applied (inside the rolled-back transaction)

| # | Actor | Attempt | Result | Expected |
|---|---|---|---|---|
| T1 | customer | set own `role='admin'` | DENIED `profile role is server-managed` | ✅ |
| T1b | customer | edit own display name + PDPA consent | 1 row | ✅ |
| T2 | customer | edit another profile | 0 rows | ✅ |
| T3 | customer | insert artisan `is_verified=true` | DENIED 42501 RLS | ✅ |
| T4 | customer | insert artisan for another profile | DENIED 42501 RLS | ✅ |
| T5 | customer | update other artisans (incl. verify) | 0 rows | ✅ |
| T6 | customer | delete other artisans | 0 rows | ✅ |
| T7 | artisan | set own `role='admin'` | DENIED `profile role is server-managed` | ✅ |
| T8 | artisan | self-verify own artisan | DENIED `artisan verification is admin-managed` | ✅ |
| T9 | artisan | insert artisan `is_verified=true` | DENIED 42501 RLS | ✅ |
| T10 | artisan | edit own unverified bio | 1 row | ✅ |
| T11 | artisan | edit seeded artisan | 0 rows | ✅ |
| T12 | admin | verify artisan | 1 row | ✅ |
| T13 | admin | change another user's role from client | 0 rows (cannot see other profiles) | ✅ role is server-managed |
| T14 | verified owner | un-verify own artisan | DENIED `artisan verification is admin-managed` | ✅ |
| T15 | verified owner | edit own bio | DENIED 42501 RLS | ⚠️ see follow-up |
| T16 | anon | read artisans | verified only (unverified = 0) | ✅ |
| T17 | anon | read profiles | 0 rows | ✅ |
| T18 | anon | update artisans | 0 rows | ✅ |

### Follow-ups (not changed in this pass)

1. **T15:** `artisans_update_owner_safe` uses `with check (… and is_verified = false)`, so verified artisans cannot edit their own profile at all. The trigger already guards `is_verified`, so the clause could be relaxed to `with check (profile_id = auth.uid())`. This is a product decision.
2. **T13:** admins cannot read or update other profiles (`profiles_self` SELECT only). Role changes therefore need a service-role path, such as an Edge Function. This matches the handoff contract.
3. Public `craft_items` / `workshops` visibility was not covered here.


## Re-run after trigger fix — 2026-10-09

Applied `20261009000100_fix_privileged_mutation_trigger.sql` to `wkreaniwmbditbshksja`. Re-ran the authz script. The SQL endpoint returns HTTP 400 only because the script intentionally raises `QA_ROLLBACK`; its embedded results are the test output.

Verified: T1, T1b, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18 all match expected security outcomes after the fix. T15 now allows verified owners to edit safe profile fields.

Policy decision: verified artisans may edit their own profile fields, but cannot change `profile_id` or `is_verified`; the trigger remains the server-side guard. Client role changes are not allowed. Admin role changes use the JWT-protected `set-user-role` Edge Function, which verifies the caller from Auth and requires the `admin` profile role before using the service role.

## Inventory and booking authorization — 2026-10-09 (Claude)

This closes follow-up 3 (`craft_items` / `workshops` coverage) and extends testing to bookings. Script: `supabase/tests/authz_inventory_bookings.sql`; it rolls back like the first script.

### Defects found live (before the fix)

| # | Finding | Live result |
|---|---|---|
| T19/T23 | Unverified artisan publishes a craft item; it appears in the public provenance registry | anon sees 1 |
| T20/T24 | Unverified artisan publishes a workshop; it appears publicly | anon sees 1 |
| T27 | Customer inserts a booking with `status='confirmed'` (no payment) | ALLOWED |
| T28 | Customer books an unpublished workshop | ALLOWED |
| T29 | Customer books 99 seats on a capacity-2 workshop | ALLOWED |

Fix: `supabase/migrations/20261009000300_restrict_public_inventory_and_bookings.sql`. It uses `ALTER POLICY` and `CREATE OR REPLACE TRIGGER`; no drops. **Committed; not yet applied live.**

- **Public inventory:** `craft_items_public` and `workshops_public` now also require the artisan to be verified.
- **Booking inserts:** `bookings_insert_own` requires `status='pending'` and a published, future workshop from a verified artisan.
- **Capacity:** the new `enforce_workshop_capacity` trigger enforces capacity for all writers. It locks the workshop row to serialize concurrent bookings. Assumption: `cancelled` bookings free their seats.

### Results with the fix loaded (inside the rolled-back transaction)

| # | Case | Result | Expected |
|---|---|---|---|
| T19/T20 | Unverified owner inserts published item/workshop | allowed (own draft) | ✅ hidden until verified |
| T21 | Owner sees own items | 1 | ✅ |
| T23/T24 | anon sees unverified artisan items/workshops | 0 / 0 | ✅ |
| T25 | anon sees unpublished workshop | 0 | ✅ |
| T26 | anon sees verified artisan published item | 1 | ✅ |
| T27 | Customer self-confirmed booking | DENIED 42501 | ✅ |
| T28 | Customer books unpublished workshop | DENIED 42501 | ✅ |
| T29 | Customer books qty 99 on capacity 2 | DENIED `workshop capacity exceeded` | ✅ |
| T30 | Customer pending booking qty 1 | allowed | ✅ |
| T31 | Second customer qty 2 with 1 seat left | DENIED `workshop capacity exceeded` | ✅ |
| T32 | Second customer takes the last seat | allowed | ✅ |
| T33 | Duplicate booking, full workshop | DENIED | ✅ |

### `set-user-role` hardening (code only; needs redeploy)

`role` was only typed, not checked at runtime, so an admin client could send `"admin"`, or any string, and the function would apply it. The function now:
- accepts only `customer` or `artisan`, and requires `userId` to be a UUID;
- refuses self-changes;
- returns 404 for unknown users;
- refuses to change an existing admin.

Granting or revoking admin remains a manual service-role operation.

### Tooling note

The Supabase MCP `execute_sql` tool holds statements containing `DROP` or `DELETE` for user confirmation. In a non-interactive agent session this shows up as a 60 s timeout, not an error. Keep rollback test scripts free of `DROP` and `DELETE`.

## Booking status constraint — 2026-10-09 (Claude)

Migration `20261009000400_bookings_status_check.sql` adds `check (status in ('pending','confirmed','cancelled','completed'))`. Without it, a typo such as `canceled` would keep seats held under the capacity trigger. I verified it in a rolled-back transaction: `pending`, `confirmed`, `cancelled` and `completed` were accepted; `canceled`, `paid` and the empty string were rejected with 23514. The constraint is committed but not yet applied live.

## Order status constraint — 2026-10-09 (Claude)

The product owner confirmed the order statuses: `pending`, `paid`, `processing`, `fulfilled`, `cancelled`, `refunded`, `failed`. Migration `20261009000500_orders_status_check.sql` adds the matching check constraint. I verified it in a rolled-back transaction: the default `pending` and all 7 values were accepted; `canceled`, `completed`, `PAID` and the empty string were rejected with 23514. The constraint is committed but not yet applied live.


## Order status constraint — 2026-10-09

Applied `20261009000500_orders_status_check.sql` live. The database accepts exactly `pending`, `paid`, `processing`, `fulfilled`, `cancelled`, `refunded`, and `failed`; rejects `canceled`, `completed`, `PAID`, and empty status. Live order count was 0.

The remaining security check is order authorization after checkout begins creating real order rows.

## Order creation path and order authorization — 2026-10-09 (Claude)

No code created orders, so order permissions could not be tested. Migration `20261009000600_create_order_rpc.sql` adds `public.create_order(p_items jsonb, p_idempotency_key text) returns uuid`, a security-definer function. It is the only client path to create orders; clients still have no INSERT policy on `orders` or `order_items`.

- Prices are read from `craft_items`. Any client-sent price field is ignored.
- Only published items from verified artisans can be ordered.
- Each quantity must be an integer from 1 to 99; there can be 1 to 50 lines, and duplicate items are merged.
- Orders always start as `pending`. The total is computed from the stored line prices.
- The idempotency key (8–128 chars) returns the caller's existing order on replay. Another customer reusing the key gets 23505.
- Execute permission is granted to `authenticated` only; it is revoked from `anon` and `public`.

Script: `supabase/tests/authz_orders.sql` (rolls back; contains no DROP/DELETE). Results with the migration loaded inside the rolled-back transaction:

| # | Case | Result | Expected |
|---|---|---|---|
| O1 | anon calls create_order | DENIED 42501 permission denied | ✅ |
| O2 | customer orders 2 items (dup lines + injected `unit_price_myr: 0.01`) | total 421.50, status pending, 2 lines | ✅ server prices, merged |
| O3 | replay same idempotency key with different items | same order, still 1 order | ✅ |
| O4 | unpublished item | DENIED 22023 | ✅ |
| O5 | unverified artisan item | DENIED 22023 | ✅ |
| O6/O7/O8 | quantity 0 / −3 / "abc" | DENIED 22023 | ✅ |
| O9 | empty items | DENIED 22023 | ✅ |
| O10 | direct insert `orders` status paid | DENIED 42501 RLS | ✅ |
| O11 | direct insert `order_items` at price 0 | DENIED 42501 RLS | ✅ |
| O12 | customer marks own order paid | 0 rows | ✅ |
| O13/O14 | customer sees own order / items | 1 / 2 | ✅ |
| O15/O16 | other customer sees order / items | 0 / 0 | ✅ |
| O17 | other customer reuses idempotency key | DENIED 23505 | ✅ |

The migration is committed but not yet applied live. Afterwards the live state was confirmed unchanged: no `create_order` function, 0 orders, 0 users.

### Open finding: payment intent trusts the client amount

`supabase/functions/create-payment-intent/index.ts` takes `orderId` and `amountMyr` from the request body. It does not check that the order exists, belongs to the caller, is `pending`, or that the amount equals `orders.total_myr`. It is test-mode only today, but it must read the amount from the caller's own order before any real payment provider is connected.


## Payment intent authorization — 2026-10-09

Finding fixed before any real provider integration: the previous function trusted browser-supplied `orderId` and `amountMyr`.

The function now requires a user JWT, reads the caller's order through the caller-scoped Supabase client, returns 404 for another user's/missing order, requires `pending`, and derives `amountMyr` from `orders.total_myr`. Client-supplied amounts are ignored. Invalid UUIDs, invalid keys, zero totals, and backend failures are rejected.

Added deterministic unit tests in `supabase/functions/create-payment-intent/handler_test.ts` and GitHub workflow `.github/workflows/payment-security.yml`. Live deployment is ACTIVE version 2 with JWT verification. Smoke tests: missing auth returned 401; publishable key without a user JWT returned 401.
