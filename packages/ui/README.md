# @warisan/ui

Shared React UI, data layer, i18n, and legal boilerplate for Warisan.org and Warisan.net.

- Consumed as TypeScript source (`exports: ./src/index.ts`); each app's Vite build compiles it.
- Components use semantic Tailwind tokens (`brand`, `accent`, `ink`, `muted`, `canvas`, `surface`, `line`, `on-brand`) that each app defines in its own `@theme`, so one component renders emerald/slate on .org and gold/terracotta/charcoal on .net.
- Each app's CSS must include `@source "../../../packages/ui/src";` so Tailwind scans these classes.
