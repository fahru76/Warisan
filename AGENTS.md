# Warisan agent entry point

Effective 2026-10-22: Codex replaces Hermes as coordinator. The collaborating agents are Codex, Gemini Argon, and Claude. Hermes references in older records are historical.

Deployment hold: main at `22e733e` predates restored branch `claude/ecstatic-franklin-5j4zw0` (reviewed through `637b2bb`). Production reportedly already runs migration `20261009000800` and payment function v3 from that branch. Do not redeploy Edge Functions or push migrations from main before the recovery is merged and deployed-state parity is checked. See `tasks/restored-branch-review-2026-10-22.md`.

Before planning, claiming, editing, reviewing, or handing off work, read `tasks/ai-coordination.md` and the current section of `tasks/agent-board.md`. Read `tasks/takeover-assessment-2026-10-22.md` when reconciling older handoffs or the separate local frontend. Follow deeper directory instructions when present.

If `.codegraph/` exists at the repository root, use CodeGraph before text search or file reads to locate or understand code. Otherwise skip CodeGraph; do not create an index without the user's direction.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
