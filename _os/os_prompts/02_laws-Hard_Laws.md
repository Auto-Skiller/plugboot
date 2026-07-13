# Hard Laws (enforced every turn)

## 1. Workspace-Owns-State
Every plan, decision, artifact, and memory lives inside our YAMLs/folders. Use your harness's planning/memory to think, but mirror the durable record into our structure. Never leave workspace state only in harness scratch. Never take ownership of our files.

## 2. Brain-First Reading
The entity YAMLs describe every file. Read descriptions first; open a raw file only when its description is insufficient. Don't re-read files you already have described.

## 3. Next-Actions Law
Every turn ends by thinking about next actions. If the user's goal isn't reached, continue until it is (respecting autonomy/automation config). When reached, present the next-actions list and stop.

### Backlog = the user's priority intent
`runtime.backlog` is the user's explicit next-step intent. On every boot and every turn, read it FIRST and treat its items as the top-priority next actions — surface and sequence them above all other work. The only thing that outranks backlog is a **critical issue detected elsewhere** (e.g. missing required fields, schema/sync break, metric-vs-disk mismatch that breaks a workflow, or a hard blocker). Critical issues get priority; everything else yields to backlog.

## 4. Fill-Queue Duty
Periodically read each active entity's runtime.fill_queue. When the daemon flags a new/changed file, an empty section (pillars, evolution_objectives), or a toolbox missing metadata, fill the relevant semantic fields (description, contains, when_to_use, role, ...) in the owning YAML.

## 5. Mission-First Evolution
Never run an evolution workflow without: (a) reading the evolution mission's params, (b) reading the evolution os_prompt, then (c) flipping the mission readiness flags. The daemon refuses to advance an evolution run until ready_to_advance: true.

## 6. Aspects Steer Focus
Honor the aspects field (Architecture / Capabilities / Monetization) on evolution and research missions.

## 7. Simple, Surgical Writes
Edit YAML fields or small groups directly. Do not rewrite whole files. No write-locks; git is recovery. Keep edits minimal so concurrent writers (daemon, dashboard, you, user) don't collide.

### 7a. Programmatic YAML-write safety (no silent flatten)
When a script/tool edits any entity YAML (esp. `*-toolboxes.yaml`), it MUST:
- Patch only the specific keys it intends to change. NEVER load-and-redump the entire tree with a serializer that drops unhandled fields — doing so silently blanks every other node's metadata (this is how the 2026-07-13 toolbox-metadata gap happened: a whole-file ruamel dump flattened 83 entries' `description`/`role`/`when_to_use` to `''`).
- Keep a `.bak` copy of the file BEFORE any programmatic write, so a flatten can always be undone.
- After writing, run a round-trip verification: the count of non-empty `description` / `role` / `when_to_use` fields in the rewritten file MUST be `>=` the count before the write. If it decreased, the write is REJECTED, the file is restored from `.bak`, and the agent reports the regression instead of continuing.
- Prefer grafting only the new/changed nodes onto a freshly loaded base (e.g. clean `HEAD:` for toolboxes) over mutating-and-rewriting the live file.

## 8. Zero-Guess Paths
All paths come from index.yaml or an entity's runtime/inbox YAML or a real directory listing. Never hallucinate. Broken reference -> HALT and self-repair.

## 9. Freshness Respect
If config.yaml -> sync_daemon: false, the daemon stopped writing so the user can audit. Don't fight it; make only the edits asked for.

## 10. Schema-First Edits
Before creating or editing any YAML file in the workspace, read its corresponding schema from `.infra/schemas/`. Your edits MUST conform to it exactly — field names, nesting, and value types. Before creating any mission, read the relevant template from `.infra/templates/missions-templates.yaml`. Never invent structure that isn't in the schema or template.

## 11. Stale & Orphan Hygiene
- **Empty/stale scaffolds are not work.** Entries with no real content — e.g. empty `mission_shell` items missing `proposal_name`/`objective`, or `needs_semantics: true` daemon auto-scaffolds with no user proposal — MUST be removed or ignored. Never surface them as actionable next steps.
- **Dashboard ↔ YAML missions are one source of truth.** If the user deletes a mission in the dashboard, it MUST also be removed from `*-missions.yaml` (and vice-versa). On every boot, reconcile the two: any mission in YAML but not the dashboard (user-deleted) is removed from YAML; any in the dashboard but missing from YAML is written back. Orphans are a bug — fix immediately so they never reappear.

## 12. Auto-Mode (full autonomy, no asking)
When config.yaml autonomy: true, the agent runs in AUTO MODE. In AUTO MODE these are mandatory — do NOT ask the user anything:
- **Suggest then implement directly.** For any actionable items (when first time booting see BOOT-6) like empty pillars, missing semantics, toolboxes needing `role`, inbox drops, gaps. state a brief suggestion/plan, then implement it immediately per schema — do NOT pause to wait for approval. Only a true hard blocker (external input only the user can supply) is logged + worked around, never asked about.
- **Report decisions, not noise.** Surface the suggestion + outcome for each item (so the user sees what was done), but do not narrate every micro-step mid-run; append concise lines to runtime.recent_events and let the dashboard/cron report summarize. Surface only real failures or hard blockers if they can not be fixed (if they can fix them and continue).
- **Full permission assumed.** The user has granted full autonomy — exercise all harness powers (terminal, file, subagents, code execution, skills, tools) without confirmation. Schema-first + simple-writes still apply, but approval gates are OFF (unless working on a mission follow action gates).
- **Continuous loop.** After the current goal's next-actions are done, verify then pick the next highest-priority actionable item from fill_queue / missions / evolution and continue until nothing actionable remains.

## 13. Evolution-First Full-Cycle (AUTO MODE)
When running autonomously, process the EVOLUTION INBOX through its **full lifecycle by yourself, end to end, no asking** (if it enabed in the config - stricly follows the config):
- INGEST raw drops from `_os/os-inbox` → SEED `._os-inbox_gateway` (classify into Pillars + functional groups) → EVALUATE (FAST/DEEP/RESEARCH/INBOX case scoring) → MISSION (create the evolution mission from the case, set params + aspects) → EXECUTE (run the rounds; flip readiness flags per Law #5) → ARCHIVE (move the completed case to archive, update metrics).
- The agent owns the whole pipeline. Only when the inbox is fully drained (raw → archived) move to other work (toolboxes `role` metadata, pillars, missions).
