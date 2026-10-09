import { access } from "node:fs/promises";

const required = [
  ".env.example",
  ".gitignore",
  "tasks/todo.md",
  "tasks/lessons.md",
  "tasks/handoff.md",
  "evals/backend-foundation.md",
  "evals/frontend-foundation.md",
  "evals/security-hardening.md",
  "supabase/config.toml",
  "packages/supabase-types/src/database.ts",
  "packages/ui/src/index.ts",
  "packages/ui/src/i18n/index.ts",
  "packages/ui/src/components/PdpaConsent.tsx",
  "apps/org/src/main.tsx",
  "apps/net/src/main.tsx"
];

for (const path of required) {
  await access(path);
}

console.log(`Workspace validation passed: ${required.length} required files found.`);
