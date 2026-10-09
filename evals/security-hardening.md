# P0 Security Regression Evaluation

These checks must remain true in the live Supabase project:

- [ ] A customer cannot update `profiles.role` to `admin`.
- [ ] A customer cannot insert an artisan row with `is_verified = true`.
- [ ] An artisan owner cannot change `is_verified` from false to true.
- [ ] An admin can verify an artisan.
- [ ] Public reads expose verified artisans and published inventory only.
- [ ] Committed SQL files contain no control bytes and include complete deterministic seed data.

## Required evidence

Record the SQL policy inspection and seed-count query in the deployment handoff. Do not treat a successful migration response alone as proof that authorization is correct.

## Authenticated negative-path results — 2026-10-09 (Claude)

Project: `wkreaniwmbditbshksja` (Warisan). Script: `supabase/tests/authz_negative_paths.sql`.
Every run creates temporary customer, artisan and admin auth users and then raises `QA_ROLLBACK`. Afterwards the live data was confirmed unchanged: 0 QA users, 0 profiles, 5 artisans.

### Blocking defect found in the live trigger (P0, functional)

`public.prevent_privileged_mutation()` (migration `…000300`) reads `old.role` on `artisans` rows and `new.is_verified` on `profiles` rows. PL/pgSQL resolves those fields even when the `tg_table_name` check is false. As a result, **every UPDATE on `profiles` and `artisans` fails** with `42703 record "new"/"old" has no field …`. That includes PDPA consent updates, profile edits and admin verification.

- Reproduced live: a no-op `update public.artisans set bio=bio` failed with `42703 record "old" has no field "role"`.
- The earlier "denied" security checks passed only because all updates fail.
- Fix: `supabase/migrations/20261009000100_fix_privileged_mutation_trigger.sql`. It branches per table and keeps the same rules. **The fix is committed but not yet applied to the live project.**

### Results with the fix applied (inside the rolled-back transaction)

| # | Actor | Attempt | Result | Expected |
|---|---|---|---|---|
| T1 | customer | set own `role='admin'` | DENIED `profile role is server-managed` | ✅ |
| T1b | customer | edit own display name + PDPA consent | 1 row | ✅ |
| T2 | customer | edit another profile | 0 rows | ✅ |
| T3 | customer | insert artisan `is_verified=true` | DENIED 42501 RLS | ✅ |
| T4 | customer | insert artisan for another profile | DENIED 42501 RLS | ✅ |
| T5 | customer | update other artisans (incl. verify) | 0 rows | ✅ |
| T6 | customer | delete other artisans | 0 rows | ✅ |
| T7 | artisan | set own `role='admin'` | DENIED `profile role is server-managed` | ✅ |
| T8 | artisan | self-verify own artisan | DENIED `artisan verification is admin-managed` | ✅ |
| T9 | artisan | insert artisan `is_verified=true` | DENIED 42501 RLS | ✅ |
| T10 | artisan | edit own unverified bio | 1 row | ✅ |
| T11 | artisan | edit seeded artisan | 0 rows | ✅ |
| T12 | admin | verify artisan | 1 row | ✅ |
| T13 | admin | change another user's role from client | 0 rows (cannot see other profiles) | ✅ role is server-managed |
| T14 | verified owner | un-verify own artisan | DENIED `artisan verification is admin-managed` | ✅ |
| T15 | verified owner | edit own bio | DENIED 42501 RLS | ⚠️ see follow-up |
| T16 | anon | read artisans | verified only (unverified = 0) | ✅ |
| T17 | anon | read profiles | 0 rows | ✅ |
| T18 | anon | update artisans | 0 rows | ✅ |

### Follow-ups (not changed in this pass)

1. **T15:** `artisans_update_owner_safe` uses `with check (… and is_verified = false)`, so verified artisans cannot edit their own profile at all. The trigger already guards `is_verified`, so the clause could be relaxed to `with check (profile_id = auth.uid())`. This is a product decision.
2. **T13:** admins cannot read or update other profiles (`profiles_self` SELECT only). Role changes therefore need a service-role path, such as an Edge Function. This matches the handoff contract.
3. Public `craft_items` / `workshops` visibility was not covered here.
