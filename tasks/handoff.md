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

Live verification:
- 5 artisans
- 10 craft items
- 3 workshops
- `create-payment-intent` is ACTIVE, version 1, JWT verification enabled
- Smoke test returned HTTP 200 in test mode

## Security state
Live policy hardening blocks customer role mutation and self-created verified artisans through RLS and database triggers. Authenticated negative-path tests with non-admin customer/artisan accounts remain open.

## Frontend handoff completed
The GitHub PR `#1` (`feat/org-bilingual-privacy`) contains:
- Warisan.org trust-layer registry screen
- Provenance detail route
- Public artisan detail route
- Legal routes: `/privacy-policy`, `/terms`, `/vendor-agreement`
- Shared English/Bahasa Melayu locale provider and language switcher
- Persisted `<html lang>` and `og:locale`
- Versioned privacy preference banner with essential-only default
- Optional analytics disabled by default and withdrawable
- Separate unchecked PDPA consent and marketing opt-in controls
- Both `apps/org` and `apps/net` integration

## Supabase Preview integration
GitHub integration is authorized for project `wkreaniwmbditbshksja`. Supabase commented on PR #1 that it skipped preview creation because the PR contains no `supabase/` changes. This confirms the integration is connected, not broken. Preview branches are currently limited to Supabase-directory changes.

## Frontend constraints
- Do not expose service-role or management tokens in frontend code.
- Do not make profile roles or artisan verification client-writable.
- Use the public publishable key only in browser builds.
- Keep PDPA registration/booking consent separate from cookie/privacy preferences and marketing opt-in.

## Next actions
1. Review and merge PR #1 after the frontend CI check passes.
2. Run authenticated negative-path security tests.
3. Add real auth flows and connect deployment-time public Supabase variables.
4. Add Supabase-directory changes to a future backend PR when a preview branch is needed.
