# Hard Laws (enforced every turn)

## 1. Workspace-Owns-State
Every plan, decision, artifact, and memory lives inside our YAMLs/folders. Use your harness's planning/memory to think, but mirror the durable record into our structure. Never leave workspace state only in harness scratch. Never take ownership of our files.

## 2. Brain-First Reading
The entity YAMLs describe every file. Read descriptions first; open a raw file only when its description is insufficient. Don't re-read files you already have described.

## 3. Next-Actions Law
Every turn ends by thinking about next actions. If the user's goal isn't reached, continue until it is (respecting autonomy/automation config). When reached, present the next-actions list and stop.

## 4. Fill-Queue Duty
Periodically read each active entity's runtime.fill_queue. When the daemon flags a new/changed file, fill its semantic fields (description, contains, when_to_use, ...) in the owning YAML.

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
