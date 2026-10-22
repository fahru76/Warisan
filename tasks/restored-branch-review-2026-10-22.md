# Restored branch merge review — 2026-10-22

Reviewed `origin/main` = `22e733e366d09bbd53339d1f97f094c4da6dc316` against `origin/claude/ecstatic-franklin-5j4zw0` = `e056997e9c246a46a1cb16708d704944b48e273a` using `git diff origin/main...origin/claude/ecstatic-franklin-5j4zw0`. The head is main plus ten recovered commits and the restoration note (eleven commits total). Twelve files differ. No recovered source was edited during review.

Recommendation: request a scoped resolution or explicit operational restriction for the P2 seed rerun risk before merging. The P3 smoke coverage issue is non-blocking. Review is not approval to merge or deploy. No functions, migrations, seeds, Auth configuration or secrets were deployed/changed.

Current review artifact: [draft PR #2](https://github.com/fahru76/Warisan/pull/2), created after the reset for head e056997. Its number happens to match the lost PR; validate the head rather than treating it as the historical review record.

## Standards

**[P2] Seed reruns can duplicate legacy fixture rows — `supabase/seed.sql:5-7` at e056997.** The change replaces name/title existence checks with `ON CONFLICT(id) DO NOTHING`. Older main assigns random IDs to craft items and workshops (initial schema lines 5-6), and neither name nor title is unique. On a database seeded from older main with IDs differing from the production IDs, rerunning this seed inserts ten additional published craft items and three workshops. Existing referenced rows remain, so the same named item can have two provenance IDs. This violates the drift-aware seed handling required by `tasks/lessons.md` and weakens H-15's cross-environment outcome. Provide a non-destructive legacy reconciliation strategy or retain duplicate prevention and explicitly restrict deterministic-ID initialization to fresh databases. Preserve existing order/booking references and printed provenance IDs. This is a source-derived finding; no live seed was run.

No introduced JWT/ownership regression found. Payment still authenticates through Auth and reads caller-owned pending orders; role assignment remains admin-only. Both CORS implementations compare exact origins. As an operational follow-up, a project-wide `ALLOWED_ORIGINS` override would affect both functions and must account for both applications; no override was read or changed.

## Spec

**[P3] Empty workshop catalogue bypasses route smoke — `scripts/live-shop-smoke.py:62-65` at e056997.** The handoff says the smoke “checks that the craft detail and `/workshops` pages render” (restored `tasks/handoff.md:303`), but `if workshops:` skips the entire workshop visit when zero rows are returned. A broken workshops page can pass in that state. Visit the route unconditionally and assert either a live workshop or the intended empty state.

H-5's portable timezone migration, H-10's separate payment/admin origin lists and replacement override, and H-15's explicit UUIDs otherwise match the recorded requirements. No scope creep found. Historical notes saying main has a broken frontend are superseded by its current working base; they are not a reason to import additional old branches.

## Validation and evidence

Fresh local checks on detached e056997 in `work/restored-review`:

- Frozen-lockfile dependency install succeeded (local pnpm 11.25.0; CI specifies 10.4.1).
- `node scripts/validate-workspace.mjs`: 15 required files found.
- `node node_modules/vitest/vitest.mjs run`: 76/76 tests, four suites pass. Initial `pnpm test` hit Windows sandbox temp-file ENOENT errors; rerunning the same suite with TEMP/TMP pointing to workspace scratch succeeded.
- `pnpm typecheck`: three tasks passed. `pnpm build`: both apps passed. The environment used Turbo 2.11.7 and emitted existing bundle-size warnings; configuration was not changed.
- `git diff --check` passed and the review checkout stayed clean.
- [Current payment-security run 39805789882](https://github.com/fahru76/Warisan/actions/runs/39805789882): passed twelve payment tests and checked both Edge Function entry points at fbb640f. Only tasks/handoff.md and tasks/todo.md differ from that tested SHA to e056997.
- [Current live smoke run 39805789875](https://github.com/fahru76/Warisan/actions/runs/39805789875): still in progress at the latest observation; do not count it as passed. No additional live test was dispatched by Codex.

Historical evidence recovered in the branch: smoke run 37918314667 passed on 2026-10-09; H-5 migration 000800 and payment v3 were applied and independently checked then; H-15 IDs matched production and a rolled-back seed rerun there was a no-op. These historical Actions records are not available in the recreated repository. Claude reports Supabase access denied on 2026-10-22. No current production-parity verification is claimed.

## Integration order and remaining ownership

1. Address/explicitly constrain SEED-1, publish a reviewed follow-up, and rerun affected checks. Keep recovery changes intact; do not rewrite Claude's branch or applied migration history.
2. Review and merge the recovered branch through a current PR with validation. Product-owner merge approval remains pending. The old PR #2 is historical; inspect the current PR's head rather than trusting the old number.
3. Integrate the coordination documentation PR and preserve both the recovered appended history and the current handoff header. Both branches start from 22e733e; one appends history and the other adds the header, so neither should replace the other file wholesale.
4. Verify actual deployed migration history/timezone and payment-function source against the integrated revision using restored read-only access. Keep all Edge Function redeploys/migration pushes from unreconciled main blocked.
5. Treat set-user-role CORS deployment as a separate authorized operation. Hosting-dependent Auth/preview settings and H-9 remain deferred; authenticated signup/checkout/booking E2E is still outstanding. Historical anonymous smoke does not close that gate.

Review totals: Standards 1 finding (P2 seed reruns); Spec 1 finding (P3 conditional workshop smoke).
