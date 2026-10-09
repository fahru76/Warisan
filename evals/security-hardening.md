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
