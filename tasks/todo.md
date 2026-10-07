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

## Phase 3: Frontend foundation (Claude Agent)
- [x] Write frontend evals before code (`evals/frontend-foundation.md`, `evals/*.test.ts`)
- [x] Root toolchain: Turborepo scripts, Vitest, shared TS config
- [x] `packages/ui`: brand mark, bento/glass primitives, ratio-locked `SmartImage`, PDPA checkbox, cookie banner, language switcher, legal pages
- [x] `packages/ui`: i18n (EN/BM) with protected cultural terms, language-aware OG tags
- [x] `packages/ui`: Supabase client + data layer with fixture fallback, MYR + `Asia/Kuala_Lumpur` formatters, provenance URL builder
- [x] `apps/org`: Vite + React + Tailwind, emerald/slate theme, registry, artisan profile, provenance lookup, artisan registration, mobile-first admin, legal routes
- [x] `apps/net`: Vite + React + Tailwind, gold/terracotta/charcoal theme, marketplace, craft detail, workshops, booking, test-mode checkout, legal routes
- [x] Evals green, both apps typecheck + build
- [x] File backend tickets in `tasks/handoff.md`

## Phase 3 review (Claude Agent, 2026-10-07)
- Evals: `pnpm test` → 57/57 pass (5 cross-domain consistency suites + PDPA/image/currency guardrails).
- `pnpm typecheck` (3 packages) and `pnpm build` (org + net) pass.
- Headless Chromium smoke (11 pages, desktop 1440 + mobile 390, host TZ America/New_York): no JS errors, no horizontal scroll, PDPA boxes unchecked, BM auto-detected from `ms-MY` locale with `og:locale=ms_MY`.
- Not verified here: live Supabase reads/writes (no `VITE_SUPABASE_*` in this sandbox) and placeholder images (picsum.photos blocked by sandbox proxy).
- Known debt: ~650 kB JS bundle per app (code-split on Day 6); SPA OG tags need prerender for social crawlers.

## Phase 4: Next (frontend)
- [ ] Wire live env (`.env.local` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and smoke-test against project `wkreaniwmbditbshksja`
- [ ] Swap booking insert → `book_workshop` RPC (H-7) and checkout draft id → `create_order` RPC (H-6)
- [ ] QR code render + print view on `/provenance/:id`
- [ ] Route-level code splitting; prerender OG tags
- [ ] Replace placeholder logo with final SVG when supplied
