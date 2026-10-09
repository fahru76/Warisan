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
