# Warisan coordination takeover assessment

Inspected 2026-10-22, Asia/Kuala_Lumpur. Repository: https://github.com/fahru76/Warisan. GitHub reports ADMIN access. Baseline main: `22e733e366d09bbd53339d1f97f094c4da6dc316` (2026-10-09). Only main was advertised on clone; no open PRs were returned. No `.codegraph/` index exists in this checkout.

## Architecture observed in source

- pnpm/Turborepo monorepo: React/TypeScript/Vite apps in `apps/org` (provenance, verified artisan directory, registration/admin) and `apps/net` (catalogue, workshops, checkout, account/orders).
- `packages/ui` centralizes components, EN/BM i18n, consent/legal UI, fixture/live Supabase data access and payments. `packages/supabase-types` holds shared database contracts. Changes here affect both apps and need exclusive ownership plus cross-app review.
- `packages/ui/src/data/api.ts` filters public catalogue queries through verified artisans and falls back to fixtures without client configuration. `src/payments/index.ts` creates orders by RPC, then requests a payment intent with order ID and idempotency header. Server prices and ownership checks live in database/Edge Function code.
- `supabase/migrations`, `supabase/tests`, seed and Edge Functions carry backend contracts. `create-payment-intent/handler.ts` authenticates the caller, checks order ownership/pending state and derives the total server-side. It still returns test-mode intents and wildcard CORS. This is not a production FPX integration.

## GitHub workflow evidence

`validate.yml` runs frozen install, workspace validation, typecheck, tests and build on main push/PR/manual runs. Workspace validation itself checks required-file existence, not behavior. Payment security runs Deno tests/check on relevant pushes or manual dispatch; it has no pull_request trigger. Manual live-shop smoke builds apps/net, queries the published catalogue and checks a matching item renders without page errors; it does not exercise authenticated transactions.

Fresh GitHub inspection found successful baseline runs:

- [Workspace validation 38939262527](https://github.com/fahru76/Warisan/actions/runs/38939262527)
- [Payment security 38939267603](https://github.com/fahru76/Warisan/actions/runs/38939267603)

No live-shop-smoke run appeared in the returned run list. No live Supabase query, migration, Auth configuration change, user creation or payment was performed in this takeover. Reports in handoff/evals dated 2026-10-09 remain historical evidence, not current verification.

## Existing local work: preserve before integration

Read-only inspection found two distinct repositories:

1. `C:/Users/fahru/Warisan`: main at `275a412` (initial commit), with untracked `.claude-flow/`, `.env.example`, `.gitignore`, `Warisan/`, `evals/`, `supabase/`, `tasks/`. It is not synchronized with current GitHub main; do not pull/reset over it.
2. `C:/Users/fahru/Warisan/Warisan`: separate master at `d06626e` ("Add GSAP dependency"), preceding `afdcfbd` ("feat: initial commit"), author GoHealTrail; no remote was listed. Dirty files: `index.html`, `src/App.tsx`, `src/index.css`, deleted `src/assets/react.svg`. The diff reports 580 added App lines and 1,244 added CSS lines. It is a standalone React/Vite frontend with a different dependency/toolchain configuration from the monorepo.

The local frontend implements a bilingual Warisan Dirgahayu cultural landing page with heritage trail, events, archive, responsive styling and a join form. Its form submission sets local React success state; that is not evidence of persisted registration. The user attributes recent coding to Gemini Argon, but neither remote commit authors nor the nested repository establish that attribution. Treat this as candidate Gemini work requiring confirmation, not as an integrated GitHub feature. Both local repositories were left untouched. No patch, assets, dependencies or built output were imported.

## Hermes transition and backlog reconciliation

Hermes is retired and Codex now coordinates. The former GitHub-only rule conflicts with later lessons permitting local clones; the new protocol explicitly permits isolated task checkouts. Earlier handoff entries and unchecked TODOs say order RPC/payment hardening and PDPA migration are pending, while later 2026-10-09 entries report them applied and verified. Preserve the sequence; do not redeploy based on the older unchecked rows.

Next triage priorities (no implementation assigned yet):

1. Preserve and identify Gemini's intended frontend variant; obtain a scoped integration proposal before moving it into either app.
2. Close the live catalogue smoke evidence gap, then define separate signup/consent/order/booking coverage. Record environment, SHA and outcomes without credentials.
3. Resolve hosting/preview choice before Auth Site URL, redirect allow-list and production CORS changes. Existing notes report localhost:3000; this was not reverified live. Actions secrets are not proof a hosting preview has variables configured.
4. Reassess H-5 timezone, H-9 image columns, H-10 CORS and H-15 deterministic seed provenance. H-8 provenance RPC is optional; code inspection alone does not establish current database state. The old frontend branch described as superseded in handoff must not be blindly reintroduced.

## Scope and limits

This takeover changes Markdown only and publishes shared entry points plus a claim/handoff protocol. No application, dependency, migration, CI configuration or local prototype changes are included. Other agents have not been contacted or started, and their acceptance has not been claimed. Shared Markdown informs their next repository session; it does not create continuous background coordination.
