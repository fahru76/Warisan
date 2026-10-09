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

## Phase 3.1: H-12 frontend trust gate (Claude Agent, 2026-10-07)
- [x] Verify Hermes P0 remediation in git + live (H-1..H-4 closed)
- [x] File H-12..H-15 in `tasks/handoff.md`
- [x] Eval first: `evals/trust.test.ts` (failed 6/7 before fix)
- [x] Data layer: listings/detail require a verified maker (`artisans!inner` join live, same rule on fixtures); `getArtisan` public lookup verified-only
- [x] Provenance page: "Maker not verified" state; never shows "authentic" for unverified makers
- [x] `pnpm test` 64/64, typecheck 3/3, build 2/2
- [x] Live check as `anon` via SQL: verified join returns 10/10 items, 3/3 workshops (no regression)
- [ ] Not verified: PostgREST `!inner` embed syntax against live REST (sandbox egress blocks *.supabase.co) — check on first `.env.local` run

- Authorization gate: T1–T18 (profiles/artisans), T19–T33 (inventory/bookings) pass live; booking and order status constraints (000400, 000500) are live.
- Order path: create_order (000600) is live, O1–O17 pass; payment intent reads the amount from the caller's pending order (P1–P10, CI green). Backend authorization gate: COMPLETE for current scope.


- [x] Apply and verify create_order RPC
- [x] Re-run O1–O17 order authorization tests
- [x] Harden and redeploy create-payment-intent ownership/amount checks
- [x] Add payment security regression tests and CI workflow
- [x] Run authenticated order permission tests (O1–O17 against the live create_order function, rolled back; Claude verified live grants: anon no execute, authenticated execute)
- [x] Verify payment-intent hardening: P1–P10 pass locally (Claude) and in CI run 37889240049
- [x] Align @warisan/supabase-types with live contract (Order/OrderItem/Booking, status unions, CreateOrderArgs; amountMyr removed from payment input)

## Phase 5: Warisan.net commerce UI (approved 2026-10-09; production domain warisan.net; hosting TBD)
- [x] Adopt the working frontend from `claude/new-session-b00fhf` (the frontend on main did not compile)
- [x] Wire checkout to live `create_order` RPC + hardened `create-payment-intent` (orderId only; sign-in required when live)
- [x] Customer sign-in/sign-up UI (existing) + server-trusted PDPA consent at signup (migration 20261009000700, S1–S6 pass in rollback)
- [x] Customer order history on /account (RLS-scoped `listMyOrders`)
- [x] Workshop booking via `api.requestBooking`: consent required + server-stamped (000700, B1–B2), friendly capacity/duplicate/unavailable errors
- [x] Evals: `evals/checkout-contract.test.ts` (12 tests; 76/76 total), typecheck 3/3, build 2/2
- [ ] Apply migration 20261009000700 live and re-run `supabase/tests/pdpa_consent.sql` (Hermes)
- [ ] Live browser smoke test against Supabase (blocked in Claude's sandbox: *.supabase.co egress denied) — run from a machine/preview with `VITE_SUPABASE_*` set
- [ ] Open tickets still relevant: H-5 timezone, H-8 get_provenance (optional), H-9 image columns, H-10 CORS allow-list for warisan.net, H-15 deterministic seed provenance ids
- [ ] Hosting decision → Supabase Site URL `https://warisan.net` + redirect allow-list (Hermes)
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` by name in the apps/net preview environment (Hermes)


## Phase 5 verification
- [x] Apply server-trusted PDPA consent migration
- [x] Re-run PDPA, inventory/booking, and order authorization tests
- [x] Extend CI with install, typecheck, test, and build gates
- [ ] Run full CI and fix any frontend compile/test failures
- [ ] Set Auth Site URL and redirect URLs after hosting is chosen
- [ ] Configure apps/net preview variables by name


## Phase 5 execution update
- [x] Apply server-trusted PDPA migration and rerun consent/authz tests
- [x] CI runs install, typecheck, test, and build
- [x] Configure preview variable names as GitHub Actions secrets
- [x] Add live Warisan.net smoke workflow
- [ ] Run live-shop-smoke workflow after preview workflow is manually dispatched
- [ ] Set Auth Site URL and redirect URLs after hosting is chosen
