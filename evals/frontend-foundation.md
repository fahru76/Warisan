# Frontend Foundation Evaluation (Claude Agent)

Written before implementation. `pnpm test` runs the deterministic suites in `evals/*.test.ts(x)`.

## Success criteria
- [ ] `pnpm test` passes (all suites below).
- [ ] `pnpm typecheck` and `pnpm build` pass for `@warisan/ui`, `@warisan/org`, `@warisan/net`.
- [ ] Both apps render without Supabase env (fixture fallback) and use live data when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set.
- [ ] No secret-bearing env var is referenced from browser code (only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## 5 deterministic cross-domain consistency cases (`evals/cross-domain.test.ts`)
1. **Provenance round-trip** — a URL built on Warisan.net for any craft item resolves to Warisan.org's `/provenance/:provenanceId` route and parses back to the same UUID.
2. **Legal route parity** — `/privacy-policy`, `/terms`, `/vendor-agreement` exist in both apps' route tables.
3. **Registry ⇄ marketplace referential integrity** — every craft item and workshop references an artisan that exists and is verified; every `provenance_id` is a unique v4-shaped UUID; fixture counts meet the seed contract (≥5 artisans, ≥10 items, ≥3 workshops).
4. **Timezone determinism** — a UTC timestamp formats to the same `Asia/Kuala_Lumpur` wall-clock time on both domains, even when the host process runs in `America/New_York`.
5. **Bilingual + cultural-term parity** — EN and BM dictionaries share an identical key set, and every protected term (Adiguru Kraf, Songket, Canting, Ukiran, Labu Sayong) appears in a BM string exactly when it appears in the EN string for the same key.

## UI guardrail cases (`evals/ui-guardrails.test.tsx`)
- PDPA consent checkbox renders **unchecked** by default and is `required`.
- Every `<img` in `packages/ui/src` and `apps/*/src` carries `object-cover` and `object-center`.
- MYR currency output is identical across domains for the same input.

## 3 likely Supabase CORS / RLS failure modes
| # | Symptom in browser | Root cause | Detection / fix |
|---|---|---|---|
| 1 | Marketplace grid is empty, no error, HTTP 200 `[]` | RLS `craft_items_public` filters `is_published=false` rows; seed/admin forgot to publish. RLS returns zero rows, not 401. | Data layer treats an empty result with a configured client as a warning (console) not a crash; eval 3 asserts fixtures are published. Check `select count(*) from craft_items where is_published` with service role. |
| 2 | `create-payment-intent` fails with `TypeError: Failed to fetch` / CORS preflight error | Browser sends `idempotency-key` header; if it is missing from `Access-Control-Allow-Headers`, or the function is invoked without `Authorization` while JWT verification is on, the preflight/401 response lacks CORS headers. | Client always sends via `supabase.functions.invoke` (attaches JWT + apikey) and only the header names listed in the function's allow-list. Ticket H-10 tightens origin. |
| 3 | Signed-in customer gets `new row violates row-level security policy` on booking/checkout | `orders`/`order_items` have no insert policy; `bookings_insert_own` requires `customer_id = auth.uid()` exactly — anon session or a mismatched id is rejected. | Booking/checkout require a session and send `customer_id` from `auth.getUser()`; orders blocked pending RPC ticket H-6, so checkout runs in test mode against a client-side draft. |
