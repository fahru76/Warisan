# Agent Handoff

## Status
Hermes backend foundation and P0 authorization remediation are in GitHub and applied to the live Supabase project.

## Workspace contract
GitHub is the only workspace. Do not clone or use a local repository.

## Backend contract
- `supabase/migrations/20261007000100_initial_schema.sql`
- `supabase/migrations/20261007000200_auth_roles_and_policies.sql`
- `supabase/migrations/20261007000300_privilege_escalation_hardening.sql`
- `supabase/seed.sql`
- `supabase/functions/create-payment-intent/index.ts`

## Security state
Live policy hardening has been applied and inspected. Customer role mutation and self-created verified artisan paths are blocked by RLS and database triggers. Authenticated negative-path tests are still required.

## Frontend handoff gate
Claude may proceed with frontend scaffolding against the schema, but must not assume role changes or artisan verification are client-writable. Admin verification must use an admin-controlled path.

## Required next backend test
Use non-admin authenticated customer and artisan accounts to prove the denied mutation cases, then record the results in `evals/security-hardening.md`.
