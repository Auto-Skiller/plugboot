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

## 11. Daemon State Reconciliation
The agent (the brain) is responsible for making reality match config.yaml -> sync_daemon, every turn:
- If sync_daemon: true  -> verify the daemon server is actually running (probe http://127.0.0.1:<dashboard.port>/api/config). If not running, launch it (see Launch command below). If launch fails or it exits with an error, immediately set sync_daemon: false, record the failure in os-runtime.yaml recent_events, and report to the user. Never leave sync_daemon: true while no server is up.
- If sync_daemon: false -> verify the daemon server is NOT running. If it is still running, stop it.
- Launch command (this host): `py -3 .infra/backend/daemon.py`  — NOT `python`/`python3` (those resolve to the Windows Store alias and fail). The daemon listens on 127.0.0.1:<dashboard.port> (default 8000).
- The `dashboard:` block in config.yaml controls the UI only (enabled/auto_open/theme/port); it does not start or stop the server. The server is governed solely by sync_daemon.
