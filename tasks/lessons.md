# Lessons

- Treat GitHub as the only canonical workspace; use GitHub API, Actions, or Codespaces instead of a local clone.
- Never place secrets in repository files, commits, logs, or chat.
- Tailwind utilities that conflict in one class list (e.g. `p-6` + `p-0`, `bg-surface/70` + `bg-brand`) resolve by stylesheet order, not position. Shared components expose variant props (`tone`, `flush`) instead of accepting overrides via `className`.
- Verify repo files against live state: the live DB was hand-patched, so git and production drifted (H-3, H-4). Fixtures must not assume the repo seed is complete.
- Unsplash Source is deprecated; use seeded Lorem Picsum URLs for placeholders, and keep every `<img>` behind `SmartImage` so ratio + `object-cover object-center` are enforced in one place.
- Cloud sandbox: local clone + push to the session branch is the working mode here; the earlier "GitHub-only, no local clone" rule applied to Hermes's environment.
