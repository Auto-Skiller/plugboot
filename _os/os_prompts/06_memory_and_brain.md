# 06 · Memory & the Brain (YAML-as-memory)

The YAMLs are your **memory** and a **pre-filled brain**. They let you know what
you have without re-reading every actual file each time.

## The fill_queue loop (hybrid brain — how it works)
1. The **daemon** watches folders (data/os_prompts, inbox `.gateway`, toolboxes).
   When a file/folder is **added or removed**, it stamps the structural entry
   (`path`, `kind`) and flags the gap in `runtime.fill_queue`.
2. **You** watch `fill_queue` (BOOT-4 and periodically during long runs). For each
   flagged entry, open the actual file, then fill its semantic fields in the
   owning yaml: `description`, `contains`, `when_to_use` (+ `aspects` for gateway
   items). Then remove the flag from `fill_queue`.
3. From then on, decide what to actually read from these pre-filled descriptions —
   only open the real file when the description says it's relevant.

## Field ownership (loose convention, not enforced)
- **Daemon owns:** `freshness`, engine metrics, `fill_queue` flags.
- **You / the user own:** content, control toggles, mission bodies, semantic
  descriptions, board text.
Don't rewrite whole files; change the field or group you mean to change.

## Recovery
These YAMLs are committed to git regularly. If one is ever corrupted, recovery is
`git checkout` of that file. Writes are simple and direct (no locks) — keep edits
small and field-scoped so concurrent edits don't collide.
