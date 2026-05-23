---
metadata:
  purpose: "Hard architectural laws and naming/structural rules that bind every agent."
  when_to_use: "Consult before creating any new file, folder, session, or goal to ensure strict naming and architectural compliance."
---
# 📜 Rules and Anti-Patterns

## 1. Naming — Pattern-First Inheritance
When you create a new file, folder, session, or goal, **look at its siblings first** and mirror the closest matching pattern (casing, prefix, separator).
Walk this list in order:
1. **Sibling lookup** — match the style of items in the same folder.
2. **Parent declaration** — honour any naming field declared by the parent router.
3. **Domain philosophy** (fallback defaults):
   - Workspace execution: `_pipelines/`, `_milestones/`
   - Code separator: `snake_case` (for things parsed by code)
   - Human separator: `kebab-case` (for human-facing slugs)
   - Doc casing: `Title-Case` (only for markdown files)

## 2. Hard Anti-Patterns (NEVER DO THESE)
- Numeric suffix on a session or goal (`-001`, `-3`). Sessions and goals are named directly by their **functional role** (e.g., `OS-DEV-DASHBOARD`, `UPDATE-SCHEMAS`), never by a counter.
- Using `SES-` or `GOAL-` prefixes. Sessions and goals should be named directly by the role so the user knows immediately what it is about from the name.
- Names that collide with existing router paths.

## 3. Encapsulated Execution
All pipeline-local ephemeral data (scratch, archive, logs) must reside strictly within the pipeline's localized `.runtime/` folder. Do not pollute the root workspace with transient outputs.
