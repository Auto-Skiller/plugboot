# 📜 Rules and Anti-Patterns

## 1. Naming — Pattern-First Inheritance
When you create a new file, folder, mission, or goal, **look at its siblings first** and mirror the closest matching pattern (casing, prefix, separator).
Walk this list in order:
1. **Sibling lookup** — match the style of items in the same folder.
2. **Parent declaration** — honour any naming field declared by the parent router.
3. **Domain philosophy** (fallback defaults):
   - Code separator: `snake_case` (for things parsed by code)
   - Human separator: `kebab-case` (for human-facing slugs)
   - Doc casing: `Title-Case` (only for markdown files)

## 2. Hard Anti-Patterns (NEVER DO THESE)
- Numeric suffix on a mission or goal (`-001`, `-3`). Missions and goals are named directly by their **functional role** (e.g., `OS-DEV-DASHBOARD`, `UPDATE-SCHEMAS`), never by a counter.
- Names that collide with existing path map entries in the index.

## 3. Encapsulated Execution
All pipeline-local ephemeral data (scratch, archive, logs) must reside strictly within the entity's localized `.pipelines_runtime/` folder or `scratch/` folder. Do not pollute the root workspace with transient outputs.
