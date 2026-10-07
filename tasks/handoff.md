# Agent Handoff

## Status
Hermes backend foundation is present in GitHub.

## Workspace contract
GitHub is the only workspace. Do not clone or use a local repository.

## Backend contract
- supabase/migrations/20261007000100_initial_schema.sql
- supabase/migrations/20261007000200_auth_roles_and_policies.sql
- supabase/seed.sql
- supabase/functions/create-payment-intent/index.ts

The backend defines profiles, artisans, craft items, workshops, bookings, orders, order items, provenance UUIDs, PDPA fields, RLS, signup profile creation, and a test-only payment intent function.

## Deployment blocker
The migration and Edge Function are not deployed to a live Supabase project. Deployment requires a project ref and securely configured GitHub Actions secrets. Do not claim live deployment before a remote verification query succeeds.

## Frontend contract
Claude Agent can build against the committed schema. If frontend work needs an RPC, add the request here before implementation.
