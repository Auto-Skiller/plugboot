# 📜 Rules & Considerations

## 🌍 Global System Rules
- **No native internet**: Requires tool call for web access.
- **Archive, never delete**: Move deprecated content to `archive/` preserving structure.
- **BOARD is real-time**: Update immediately, no batching.
- **Conflict resolution**: User prompt always wins. Update + log, never ask.
- **No Goals in Scratch**: NEVER put goal artifacts, mission definitions, or core system files in `scratch/`. The `scratch/` directory is strictly for temporary, disposable files. Operational goals must reside in `.scope/.../.missions/definitions/`.
- **Atomic Lock Files**: Before modifying `BOARD.yaml`, any `.catalog.yaml`, **or any shared state file (e.g., `.scope/` knowledge files and workflows)**, create a `.lock` file. If a lock exists, verify its timestamp. **Zombie Lock Recovery:** If the lock is older than 120 seconds, log the override to `recent_events`, delete the stale lock, and proceed. Delete the lock after writing.

## 🗂️ index & Engine Maintenance
- **Registry refresh at boot**: ALL registries must be refreshed using Navigator + Cataloger.
- **Cataloger relies on `last_modified`**: Always use the file's OS `last_modified` time, NOT the current time. This ensures accurate diffs.
- **Process flags file by file**: No batching descriptions. Prevents context drift.
- **Verify before routing**: Zero pending entries must exist before Router can run.
- **Engine protocols are `.md`**: They are human/agent-readable instructions.
- **Rules are `.yaml`**: Structured, parseable schemas.

- **Cross-Scope Isolation**: Agents operating in a specific scope (e.g., `.scope/pipelines/hustler/`) MUST NOT read or write directly to any other scope (e.g., `.scope/pipelines/scaler/` or `.scope/projects/`). Knowledge must be elevated to `.scope/.core/` via the Post-Mission Distillation Protocol only.
- **Distillation is Append-Only**: Step 10 interactions with `.scope/.core/.knowledge/knowledge.md` and `workflows.md` MUST be append-only operations performed under an atomic lock. Rewriting existing global knowledge is prohibited.

## 🎯 Domain-Specific Rules

### 🎨 Studio & Creative
- **Avoid Living Faces**: ALL faces of humans or animals in generated images must be avoided, blurred or replaced.
- **No music**: In generated videos or published posts.

### ⚙️ Engineering & Quality
- **Quality Standards (Taste Check)**: Before marking work complete, ask:
  1. Does this look intentional?
  2. Would I ship this?
  3. Is it functional?
  4. Are edge cases handled?
  5. Is it maintainable?
  **If any answer is "no" → Taste Check again.**
