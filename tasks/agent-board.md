# Current agent board

Updated 2026-10-22 (Asia/Kuala_Lumpur). Codex is coordinator. Follow `ai-coordination.md` for claims and state changes. Queued routing below is a proposal, not an assertion that another agent is running.

| ID | State / owner / reviewer | Outcome and scope | Dependency / acceptance evidence |
| --- | --- | --- | --- |
| COORD-1 | review / Codex / user | Documentation takeover: root AGENTS.md, CLAUDE.md, GEMINI.md, README.md; tasks/ai-coordination.md, agent-board.md, takeover-assessment-2026-10-22.md, handoff.md, todo.md only. Validate links, whitespace and workspace structure. | User request accepted; base 22e733e366d09bbd53339d1f97f094c4da6dc316; branch codex/ai-coordination-takeover; isolated checkout work/Warisan in this chat workspace. No pre-existing dirty files. Commit/PR are reported in chat; review pending. |
| UI-1 | queued / proposed Gemini Argon / Claude | Inventory and explain local prototype; provide patch/branch and map intended UI into apps/org or apps/net. Read-only until a preservation/integration plan is accepted. | Await agent acceptance and provenance; protect local C:/Users/fahru/Warisan/Warisan dirty files. |
| VERIFY-1 | queued / proposed Claude / Codex | Review catalogue-smoke coverage and commerce regression needs; propose evals without changing source yet. | Await acceptance; UI-1 determines future integration tests. |
| OPS-1 | queued / proposed Codex / Claude | Reconcile stale Hermes tickets and hosting dependencies with fresh read-only evidence. No deployment or Auth setting changes. | Await separate scope/claim; hosting decision belongs to user. |

## Recovery reconciliation — 2026-10-22

This section supersedes the affected queued outcomes above. The user directly requested reconciliation and review; neither Claude nor Gemini is assumed to be running or to have accepted a new task.

| ID | State / owner / reviewer | Current outcome and boundary | Evidence / next action |
| --- | --- | --- | --- |
| COORD-2 | review / Codex / user | Correct coordination Markdown and review the restored branch. Exclusive edits: AGENTS.md, tasks/ai-coordination.md, agent-board.md, takeover-assessment-2026-10-22.md, restored-branch-review-2026-10-22.md, handoff.md, todo.md. No recovered source edits. | Direct user request accepted 2026-10-22; base 3bf5533; branch codex/ai-coordination-takeover; checkout work/Warisan. Review target e056997 against main 22e733e; report in restored-branch-review-2026-10-22.md. Publication commit/PR reported in chat. |
| RECOVER-1 | review / recovered author Claude; integration coordinator Codex / user | Restore main's parity with recovered source, preserving migration 000800 and payment v3 CORS. | Draft https://github.com/fahru76/Warisan/pull/2 reviewed through 637b2bb. Both source findings closed; exact-head validate 39808321727 green. Fresh smoke blocked by missing configuration; owner merge approval remains pending. |
| SEED-1 | done / Claude / Codex | Fixed IDs plus name/title guards preserve legacy rows and provenance; no live writes. | c45f745, included at reviewed head 637b2bb. Codex independently reproduced PGlite fresh/repeat/legacy/repeated-legacy 10/3, unchanged IDs, and previous-seed regression 20/6. Source resolution is committed, not yet integrated into main. |
| VERIFY-1 | blocked / coordinator Codex / user | P3 workshop-route coverage resolved in source. Fresh live smoke and separately authorized signed-in E2E remain outstanding. | Run 39808203459 failed before browser/live calls on missing configuration; historical pass 37918314667 remains valid as historical evidence. Chrome setup changed, full execution unverified. Dependency CONFIG-1. |
| OPS-1 | blocked / coordinator Codex / user | H-5 and H-10 payment were deployed per 2026-10-09 evidence; H-15 seed is committed. These are not pending deployment tasks. | No deployments from unreconciled main. Fresh production verification unavailable in this session; hosting remains deferred by owner. |
| ROLE-1 | queued / proposed Codex / Claude | set-user-role origin allow-list is present in restored source; deployment remains pending. | warisan.org was confirmed historically. Deploy only after recovery/parity checks and separate owner authorization. |
| CONFIG-1 | blocked / owner / Codex | Restore repository Actions secrets VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rerun failed smoke. | Secret-name listing returned no entries; logs confirm both env values empty. Use repository secret settings; values never belong in chat or Git. No configuration mutation authorized/performed in this review. |
| COORD-3 | review / Codex / user | Verify Claude follow-ups and update current Markdown: AGENTS.md, this board, ai-coordination.md if needed, handoff.md, todo.md, dated assessment and review. Preserve all source. | User relay accepted 2026-10-22; base a08bd79 on codex/ai-coordination-takeover in work/Warisan; clean starting checkout. Review e056997..637b2bb; publication commit reported in chat. |

H-9 image columns remain deferred; H-8 provenance RPC remains optional. UI-1 remains queued and the local Gemini candidate frontend remains protected. Historical main-compile-failure claims in recovered notes predate the recovered base: current main already includes c689400/455ece2 and had green validation. They do not describe the present recovery diff.

For the next accepted task, record base SHA, branch/checkout, exact file list, acceptance criteria, validation, acceptance timestamp and published claim commit. Implementers may not treat these broad queued outcomes as file ownership. This board is not a distributed lock: Codex serializes published claims and merges.
