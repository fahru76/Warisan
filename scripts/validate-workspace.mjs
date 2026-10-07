import { access } from "node:fs/promises";

const required = [
  ".env.example",
  ".gitignore",
  "tasks/todo.md",
  "tasks/lessons.md",
  "tasks/handoff.md",
  "evals/backend-foundation.md",
  "evals/frontend-foundation.md",
  "supabase/config.toml"
];

for (const path of required) {
  await access(path);
}

console.log(`Workspace validation passed: ${required.length} required files found.`);
