# Agent Handoff

## Status
Hermes backend foundation and P0 authorization remediation are in GitHub and applied to the live Supabase project.

## Workspace contract
GitHub is the only workspace. Do not clone or use a local repository.

## Backend contract
- `supabase/migrations/20261007000100_initial_schema.sql`
- `supabase/migrations/20261007000200_auth_roles_and_policies.sql`
- `supabase/migrations/20261007000300_privilege_escalation_hardening.sql`
- `supabase/migrations/20261009000100_fix_privileged_mutation_trigger.sql` (committed, NOT yet applied live)
- `supabase/seed.sql`
- `supabase/functions/create-payment-intent/index.ts`

## Security state
Live policy hardening has been applied and inspected. Customer role mutation and self-created verified artisan paths are blocked by RLS and database triggers. Authenticated negative-path tests ran on 2026-10-09 (`supabase/tests/authz_negative_paths.sql`). They found that the live trigger function makes every UPDATE on `profiles` and `artisans` fail with error 42703. With the fix migration, all denial cases still hold and legitimate updates (own profile/PDPA, admin verification) succeed.

## Frontend handoff gate
Claude may proceed with frontend scaffolding against the schema, but must not assume role changes or artisan verification are client-writable. Admin verification must use an admin-controlled path.

## Required next backend step
1. Apply `20261009000100_fix_privileged_mutation_trigger.sql` to the live project.
2. Re-run `supabase/tests/authz_negative_paths.sql`. It always rolls back; read the results from the `QA_ROLLBACK` message and confirm they match the table in `evals/security-hardening.md`.
3. Decide the follow-ups listed there (verified-artisan self-edit, service-role path for role changes).


## Claude security test follow-up
- Applied `20261009000100_fix_privileged_mutation_trigger.sql` live to `wkreaniwmbditbshksja`.
- Re-ran `supabase/tests/authz_negative_paths.sql`; the API returned HTTP 400 because the script intentionally raises `QA_ROLLBACK`. The embedded T1–T18 results match the expected security outcomes.
- T15 now allows verified artisans to edit safe profile fields.
- Verified artisan owners still cannot change `is_verified` or `profile_id`.
- Client role changes remain forbidden.
- Deployed ACTIVE `set-user-role` Edge Function, JWT-protected and admin-only, for server-side role changes.

## Claude inventory and booking follow-up (2026-10-09)
New live defects were found and are documented in `evals/security-hardening.md`:
- Unverified artisans' published items and workshops are publicly visible.
- Customers can self-confirm bookings, book unpublished workshops and exceed capacity.

The fix was verified in a rolled-back transaction. Required next steps for Hermes:
1. Apply `supabase/migrations/20261009000300_restrict_public_inventory_and_bookings.sql` live.
2. Re-run `supabase/tests/authz_inventory_bookings.sql` and `supabase/tests/authz_negative_paths.sql`; compare with the tables in `evals/security-hardening.md`.
3. Redeploy `set-user-role`, which now has a role allowlist (customer/artisan), a UUID check, a self-change guard, a 404 for unknown users and an admin-target guard.
4. Confirm the booking status vocabulary (`pending` / `confirmed` / `cancelled`); the capacity trigger assumes `cancelled` frees seats.
