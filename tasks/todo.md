# Warisan Development Tasks

## Phase 0: GitHub-only foundation
- [x] Confirm GitHub repository is the canonical workspace
- [x] Remove local repository clone
- [x] Add environment and secret-exclusion contracts
- [x] Add GitHub Actions remote validation
- [ ] Initialize Supabase from a GitHub-hosted workflow or Codespace
- [ ] Confirm Supabase project credentials through a secure channel

## Phase 1: Monorepo contract
- [x] Add pnpm workspace definition
- [x] Add Turborepo task graph
- [x] Add apps/org boundary
- [x] Add apps/net boundary
- [x] Add packages/ui boundary
- [x] Add deterministic workspace validation

## Backend
- [ ] Add schema and migrations
- [ ] Add seed data
- [ ] Add RLS policies
- [ ] Add test-mode payment Edge Function

## Checkpoint: Backend handoff
- [ ] Remote checks pass
- [ ] Update tasks/handoff.md

## Review
- GitHub-only execution adopted.
- Monorepo boundaries and remote validation workflow added.
