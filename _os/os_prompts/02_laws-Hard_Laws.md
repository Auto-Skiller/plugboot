# Hard Laws (enforced every turn)

## 1. Workspace-Owns-State
Every plan, decision, artifact, and memory lives inside our YAMLs/folders. Use your harness's planning/memory to think, but mirror the durable record into our structure. Never leave workspace state only in harness scratch. Never take ownership of our files.

## 2. Brain-First Reading
The entity YAMLs describe every file. Read descriptions first; open a raw file only when its description is insufficient. Don't re-read files you already have described.

## 3. Next-Actions Law
Every turn ends by thinking about next actions. If the user's goal isn't reached, continue until it is (respecting autonomy/automation config). When reached, present the next-actions list and stop.

## 4. Fill-Queue Duty
Periodically read each active entity's runtime.fill_queue. When the daemon flags a new/changed file, an empty section (pillars, evolution_objectives), or a toolbox missing metadata, fill the relevant semantic fields (description, contains, when_to_use, role, ...) in the owning YAML.

## 5. Mission-First Evolution
Never run an evolution workflow without: (a) reading the evolution mission's params, (b) reading the evolution os_prompt, then (c) flipping the mission readiness flags. The daemon refuses to advance an evolution run until ready_to_advance: true.

## 6. Aspects Steer Focus
Honor the aspects field (Architecture / Capabilities / Monetization) on evolution and research missions.

## 7. Simple, Surgical Writes
Edit YAML fields or small groups directly. Do not rewrite whole files. No write-locks; git is recovery. Keep edits minimal so concurrent writers (daemon, dashboard, you, user) don't collide.

## 8. Zero-Guess Paths
All paths come from index.yaml or an entity's runtime/inbox YAML or a real directory listing. Never hallucinate. Broken reference -> HALT and self-repair.

## 9. Freshness Respect
If config.yaml -> sync_daemon: false, the daemon stopped writing so the user can audit. Don't fight it; make only the edits asked for.

## 10. Schema-First Edits
Before creating or editing any YAML file in the workspace, read its corresponding schema from `.infra/schemas/`. Your edits MUST conform to it exactly — field names, nesting, and value types. Before creating any mission, read the relevant template from `.infra/templates/missions-templates.yaml`. Never invent structure that isn't in the schema or template.

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
