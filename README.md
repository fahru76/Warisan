# Warisan

Dual-domain Malaysian heritage ecosystem on one Supabase project:

- **Warisan.org** (`apps/org`) — provenance registry, cultural archive, verified Adiguru Kraf directory, artisan registration, admin.
- **Warisan.net** (`apps/net`) — verified craft marketplace, workshop booking, test-mode FPX checkout.
- **`packages/ui`** — shared components, EN/BM i18n, data layer, legal boilerplate, payment service layer.

## Quick start (local machine, repo root)

```bash
pnpm install
cp .env.example .env.local   # optional: fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY for live data
pnpm dev:org                 # http://localhost:5173
pnpm dev:net                 # http://localhost:5174
```

Without Supabase env vars both apps run on bundled fixture data and show a "demo data" notice.

## Checks

```bash
pnpm test        # evals/*.test.ts(x)
pnpm typecheck
pnpm build
pnpm validate
```

## Workspace protocol

- `tasks/todo.md` — plan + progress, `tasks/lessons.md` — corrections, `tasks/handoff.md` — Claude ⇄ Hermes tickets.
- `evals/` — success criteria written before code.
- Secrets never committed; only `VITE_`-prefixed public keys reach browser code.
