# 📜 Rules & Considerations

## 🌍 Global System Rules
- **No native internet**: Requires tool call for web access.
- **Archive, never delete**: Move deprecated content to `archive/` preserving structure.
- **BOARD is real-time**: Update immediately, no batching.
- **Conflict resolution**: User prompt always wins. Update + log, never ask.
- **Atomic Lock Files**: Before modifying `BOARD.yaml` or any `.catalog.yaml`, create a `.lock` file. If a lock exists, wait and retry. Delete the lock after writing.

## 🗂️ index & Engine Maintenance
- **Registry refresh at boot**: ALL registries must be refreshed using Navigator + Cataloger.
- **Cataloger relies on `last_modified`**: Always use the file's OS `last_modified` time, NOT the current time. This ensures accurate diffs.
- **Process flags file by file**: No batching descriptions. Prevents context drift.
- **Verify before routing**: Zero pending entries must exist before Router can run.
- **Engine protocols are `.md`**: They are human/agent-readable instructions.
- **Rules are `.yaml`**: Structured, parseable schemas.

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
