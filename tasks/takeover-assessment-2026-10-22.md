# Warisan coordination takeover assessment

Inspected 2026-10-22, Asia/Kuala_Lumpur. Repository: https://github.com/fahru76/Warisan. GitHub reports ADMIN access. Baseline main: `22e733e366d09bbd53339d1f97f094c4da6dc316` (2026-10-09). Only main was advertised on clone; no open PRs were returned. No `.codegraph/` index exists in this checkout.

Reconciled later on 2026-10-22 after Claude restored `claude/ecstatic-franklin-5j4zw0` at `e056997e9c246a46a1cb16708d704944b48e273a`. It contains the ten lost commits plus a restoration note, all descending from the baseline above. The original assessment had incomplete history: its missing-smoke and open-H-5/H-10/H-15 conclusions are superseded below. Full source review: `restored-branch-review-2026-10-22.md`.

Latest follow-up: restored head `637b2bb` closes both initial review findings. Codex independently verified fresh/repeated/legacy seed behavior in PGlite (10 items / 3 workshops, IDs preserved) and reviewed unconditional workshops smoke coverage. Exact-head Validate run 39808321727 passed. Latest smoke run 39808203459 failed at missing configuration before browser/live calls; repository Actions secret listing is empty. Owner must restore VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and rerun smoke. Production parity remains unverified and deployments remain on hold.

## Architecture observed in source

- pnpm/Turborepo monorepo: React/TypeScript/Vite apps in `apps/org` (provenance, verified artisan directory, registration/admin) and `apps/net` (catalogue, workshops, checkout, account/orders).
- `packages/ui` centralizes components, EN/BM i18n, consent/legal UI, fixture/live Supabase data access and payments. `packages/supabase-types` holds shared database contracts. Changes here affect both apps and need exclusive ownership plus cross-app review.
- `packages/ui/src/data/api.ts` filters public catalogue queries through verified artisans and falls back to fixtures without client configuration. `src/payments/index.ts` creates orders by RPC, then requests a payment intent with order ID and idempotency header. Server prices and ownership checks live in database/Edge Function code.
- `supabase/migrations`, `supabase/tests`, seed and Edge Functions carry backend contracts. `create-payment-intent/handler.ts` authenticates the caller, checks order ownership/pending state and derives the total server-side. Main has wildcard CORS, but the restored source has the allow-list reportedly deployed as payment v3. Test-mode intents remain; this is not a production FPX integration. The restored role function has a separate warisan.org allow-list awaiting deployment.

## GitHub workflow evidence

`validate.yml` runs frozen install, workspace validation, typecheck, tests and build on main push/PR/manual runs. Workspace validation itself checks required-file existence, not behavior. Payment security runs Deno tests/check on relevant pushes or manual dispatch; it has no pull_request trigger. Restored code also checks set-user-role. Restored live-shop smoke runs on relevant pushes/manual dispatch and covers all listed live items, detail, anonymous checkout gating and workshops when available; it does not exercise authenticated transactions.

Fresh GitHub inspection found successful baseline runs:

- [Workspace validation 38939262527](https://github.com/fahru76/Warisan/actions/runs/38939262527)
- [Payment security 38939267603](https://github.com/fahru76/Warisan/actions/runs/38939267603)

The initial returned run list omitted historical live smoke because the repository had been reset. Restored handoff reports smoke run `37918314667` passed on 2026-10-09; its original run record is unavailable in the recreated repository. Current payment-security run `39805789882` passed on recovered `fbb640f`; `e056997` adds documentation only. Current smoke run `39805789875` subsequently completed as cancelled; it provides no fresh passing result. No migration, Auth configuration change, user creation or payment was performed. Historical production reports remain distinct from fresh verification.

## Existing local work: preserve before integration

Read-only inspection found two distinct repositories:

1. `C:/Users/fahru/Warisan`: main at `275a412` (initial commit), with untracked `.claude-flow/`, `.env.example`, `.gitignore`, `Warisan/`, `evals/`, `supabase/`, `tasks/`. It is not synchronized with current GitHub main; do not pull/reset over it.
2. `C:/Users/fahru/Warisan/Warisan`: separate master at `d06626e` ("Add GSAP dependency"), preceding `afdcfbd` ("feat: initial commit"), author GoHealTrail; no remote was listed. Dirty files: `index.html`, `src/App.tsx`, `src/index.css`, deleted `src/assets/react.svg`. The diff reports 580 added App lines and 1,244 added CSS lines. It is a standalone React/Vite frontend with a different dependency/toolchain configuration from the monorepo.

The local frontend implements a bilingual Warisan Dirgahayu cultural landing page with heritage trail, events, archive, responsive styling and a join form. Its form submission sets local React success state; that is not evidence of persisted registration. The user attributes recent coding to Gemini Argon, but neither remote commit authors nor the nested repository establish that attribution. Treat this as candidate Gemini work requiring confirmation, not as an integrated GitHub feature. Both local repositories were left untouched. No patch, assets, dependencies or built output were imported.

## Hermes transition and backlog reconciliation

Hermes is retired and Codex now coordinates. The former GitHub-only rule conflicts with later lessons permitting local clones; the new protocol explicitly permits isolated task checkouts. Earlier handoff entries and unchecked TODOs say order RPC/payment hardening and PDPA migration are pending, while later 2026-10-09 entries report them applied and verified. Preserve the sequence; do not redeploy based on the older unchecked rows.

Reconciled next priorities (no source implementation assigned yet):

1. Preserve and identify Gemini's intended frontend variant; obtain a scoped integration proposal before moving it into either app.
2. Review and integrate the recovered commits before deployments from main. Preserve deployed migration 000800 and payment v3 origin checks; the seed rerun issue is resolved at 637b2bb. Historical catalogue smoke already passed. Restore missing Actions secrets for fresh smoke, and define separate signup/consent/order/booking coverage without recording credentials.
3. Resolve hosting/preview choice before Auth Site URL, redirect allow-list and production CORS changes. Existing notes report localhost:3000; this was not reverified live. Actions secrets are not proof a hosting preview has variables configured.
4. H-5 timezone and H-10 payment CORS are complete per 2026-10-09 live evidence; H-15 fixed IDs are complete in recovered Git. Only set-user-role CORS deployment remains, with separate authorization. H-9 image columns are deferred; H-8 provenance RPC is optional. Current live parity was not reverified: Claude reports Supabase access denied on 2026-10-22. Superseded frontend branches must not be blindly reintroduced.

## Scope and limits

This takeover changes Markdown only and publishes shared entry points plus a claim/handoff protocol. No application, dependency, migration, CI configuration or local prototype changes are included. Other agents have not been contacted or started, and their acceptance has not been claimed. Shared Markdown informs their next repository session; it does not create continuous background coordination.
