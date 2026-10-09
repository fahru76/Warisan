# Warisan Development Tasks

## Phase 0: GitHub-only foundation
- [x] Confirm GitHub repository is the canonical workspace
- [x] Remove local repository clone
- [x] Add environment and secret-exclusion contracts
- [x] Add GitHub Actions remote validation
- [ ] Configure replacement Supabase management token in GitHub Actions manually

## Phase 1: Monorepo contract
- [x] Add pnpm workspace and Turborepo task graph
- [x] Add apps/org, apps/net, and packages/ui boundaries
- [x] Add deterministic workspace validation

## Phase 2: Backend contract
- [x] Add schema for profiles, artisans, craft items, workshops, bookings, and orders
- [x] Add provenance UUID and local-pickup fields
- [x] Add PDPA consent and marketing fields
- [x] Add role-aware RLS policies and signup trigger
- [x] Add complete deterministic seed data
- [x] Add test-mode payment Edge Function
- [x] Apply schema and seed to live Supabase project
- [x] Deploy and smoke-test payment Edge Function

## Phase 3: P0 security hardening
- [x] Repair corrupted migration SQL in GitHub
- [x] Prevent client role self-escalation
- [x] Prevent self-created verified artisans
- [x] Add server-side privilege mutation triggers
- [x] Add authorization regression evaluation
- [x] Run authenticated negative-path tests with customer and artisan accounts (see evals/security-hardening.md)
- [x] Fix trigger that broke every profiles/artisans UPDATE (migration 20261009000100)
- [x] Apply migration 20261009000100 to the live Supabase project and re-run supabase/tests/authz_negative_paths.sql (Hermes)
- [x] Allow verified artisans to edit safe fields; add admin-only set-user-role function (Hermes)
- [x] Cover craft_items, workshops and bookings authorization (supabase/tests/authz_inventory_bookings.sql)
- [x] Apply migration 20261009000300 live and re-run supabase/tests/authz_inventory_bookings.sql (Hermes)
- [x] Redeploy set-user-role with role allowlist and admin-target guard (Hermes, v2)
- [x] Add bookings status check constraint (migration 20261009000400, verified in rollback)
- [x] Apply migration 20261009000400 live (Hermes; constraint verified live by Claude)
- [x] Define orders.status vocabulary (product owner: pending, paid, processing, fulfilled, cancelled, refunded, failed) and add check constraint (migration 20261009000500, verified in rollback)
- [x] Apply migration 20261009000500 live (Hermes)
- [x] Add server-side create_order RPC (migration 20261009000600) and order authorization tests O1–O17 (supabase/tests/authz_orders.sql, verified in rollback)
- [ ] Apply migration 20261009000600 live and re-run supabase/tests/authz_orders.sql (Hermes)
- [ ] Make create-payment-intent read the amount from the caller's order instead of trusting the client (Hermes; see handoff)

## Phase 4: Frontend handoff
- [x] Build shared UI package
- [x] Scaffold Warisan.org trust-layer application
- [x] Scaffold Warisan.net commerce-layer application
- [x] Add shared Supabase data contracts and auth boundaries

- [x] Add provenance detail route
- [x] Add public artisan detail route

- [x] Add shared bilingual language switcher and PDPA consent banner across both domains

- [x] Apply inventory and booking authorization migration
- [x] Verify booking capacity and cancelled-seat semantics
- [x] Redeploy hardened set-user-role function

## Review
- Authorization gate: T1–T18 (profiles/artisans), T19–T33 (inventory/bookings) pass live; booking and order status constraints (000400, 000500) are live.
- Order path: create_order (000600) is live, O1–O17 pass; payment intent reads the amount from the caller's pending order (P1–P10, CI green). Backend authorization gate: COMPLETE for current scope.


- [x] Apply and verify create_order RPC
- [x] Re-run O1–O17 order authorization tests
- [x] Harden and redeploy create-payment-intent ownership/amount checks
- [x] Add payment security regression tests and CI workflow
- [x] Run authenticated order permission tests (O1–O17 against the live create_order function, rolled back; Claude verified live grants: anon no execute, authenticated execute)
- [x] Verify payment-intent hardening: P1–P10 pass locally (Claude) and in CI run 37889240049
- [x] Align @warisan/supabase-types with live contract (Order/OrderItem/Booking, status unions, CreateOrderArgs; amountMyr removed from payment input)

## Phase 5: Warisan.net commerce UI (proposed, awaiting go-ahead)
- [ ] Customer sign-in/sign-up (Supabase Auth) with PDPA consent capture
- [ ] Catalog of published items from verified artisans
- [ ] Cart and checkout: create_order, then create-payment-intent (test mode)
- [ ] Customer order history (RLS-scoped)
- [ ] Workshop listing and pending booking flow
