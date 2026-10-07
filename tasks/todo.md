# Warisan Development Tasks

## Phase 0: GitHub-only foundation
- [x] Confirm GitHub repository is the canonical workspace
- [x] Remove local repository clone
- [x] Add environment and secret-exclusion contracts
- [x] Add GitHub Actions remote validation
- [ ] Configure remote Supabase project credentials

## Phase 1: Monorepo contract
- [x] Add pnpm workspace and Turborepo task graph
- [x] Add apps/org, apps/net, and packages/ui boundaries
- [x] Add deterministic workspace validation

## Phase 2: Backend contract
- [x] Add schema for profiles, artisans, craft items, workshops, bookings, and orders
- [x] Add provenance UUID and local-pickup fields
- [x] Add PDPA consent and marketing fields
- [x] Add role-aware RLS policies and signup trigger
- [x] Add deterministic seed data
- [x] Add test-mode payment Edge Function
- [ ] Apply migration to live Supabase project
- [ ] Verify migration and RLS against live project

## Checkpoint: Backend handoff
- [ ] Remote checks pass
- [ ] Live Supabase migration verified
- [ ] Frontend agent begins implementation

## Review
- GitHub-only execution adopted.
- Backend schema, seed, RLS, auth trigger, and test payment contract are present remotely.
