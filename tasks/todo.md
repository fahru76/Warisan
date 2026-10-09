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
- [ ] Apply migration 20261009000300 live and re-run supabase/tests/authz_inventory_bookings.sql
- [ ] Redeploy set-user-role with role allowlist and admin-target guard
- [ ] Cover orders/order_items creation path once the checkout Edge Function writes orders

## Phase 4: Frontend handoff
- [x] Build shared UI package
- [x] Scaffold Warisan.org trust-layer application
- [x] Scaffold Warisan.net commerce-layer application
- [x] Add shared Supabase data contracts and auth boundaries

- [x] Add provenance detail route
- [x] Add public artisan detail route

- [x] Add shared bilingual language switcher and PDPA consent banner across both domains

## Review
- Authenticated negative-path tests pass with the trigger fix; the gate closes once migration 20261009000100 is applied live and the test script is re-run.
