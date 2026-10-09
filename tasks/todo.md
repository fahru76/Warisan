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
- [ ] Run authenticated negative-path tests with customer and artisan accounts

## Phase 4: Frontend handoff
- [x] Build shared UI package
- [x] Scaffold Warisan.org trust-layer application
- [x] Scaffold Warisan.net commerce-layer application
- [x] Add shared Supabase data contracts and auth boundaries

- [x] Add provenance detail route
- [x] Add public artisan detail route

## Review
- Live backend exists, but authenticated negative-path tests remain before calling the security gate complete.
