# AGENTS — Root Boot Pointer

> This is the absolute authority for agent behavior. You (the agent) are the brain. This workspace is the body: senses (os_prompts), memory (YAMLs), muscles (toolboxes). Your harness's own powers are welcome, but ALL plans and ALL state MUST live inside this workspace under its structure and rules. Never keep workspace state only in harness-private scratch. You operate our files, you don't own them.

## BOOT SEQUENCE (every session, in order)

- BOOT-0 Orientation: read `index.yaml` (root). It maps every entity, infra folder, key file. No guessing paths after this.
- BOOT-1 Laws: read every file indexed in `_os/os_prompts.yaml`. Mandatory operational laws, not optional context.
- BOOT-2 Global config: read `config.yaml` — which entities are active, autonomy/automation, and whether `sync_daemon` is on.
- BOOT-3 Current window: read `config.yaml -> current_window` (os or a project). Load that entity's board, runtime, missions, toolboxes, inbox.
- BOOT-4 Brain-first: entity YAMLs pre-describe every file (role, contains, when_to_use). Decide from descriptions, then read only the raw files that truly matter. Do not re-read files you already have described.

## CORE LAWS (every turn)

1. Workspace-owns-state. Every plan, decision, artifact, memory lives in our YAMLs/folders, never only in the harness.
2. Brain-first reading. Use pre-filled descriptions to avoid re-reading raw files.
3. Next-actions law. Every turn, think about next actions. If the user's goal isn't reached, continue until it is. When done, present the next-actions list.
4. Fill-queue duty. Periodically check each entity's `fill_queue`; when the daemon flags a new/changed file, fill its semantic fields.
5. Mission-first evolution. Never run an evolution workflow without first reading its evolution mission params + the evolution os_prompt, then flipping the mission `readiness` flags. The daemon won't advance an evolution run until `ready_to_advance: true`.
6. Aspects steer focus. Architecture / Capabilities / Monetization — honor the `aspects` field on evolution and research missions.
7. Simple writes. Edit YAML fields or small groups directly. Never rewrite whole files. Git is recovery.
8. Zero-guess paths. Paths come from index/runtime/inbox YAMLs or a real listing. Broken reference -> HALT and self-repair.

## COMMUNICATION LAYERS

- Standard: your harness/CLI/IDE prompt.
- Workspace layer: read directives from designated YAML sections; write status/results back. The YAMLs are your durable memory and the user's control surface across long runs.
- Floating chat window: POST to the daemon (`/agent/say`) to surface something live; it streams to the dashboard over SSE. Output-only for now.

Where to look for work: the active entity's `*-missions.yaml`. PLANNING missions await planning/approval; EXECUTION missions are live. Advance the highest-priority active mission, honoring `config.yaml` automation toggles.

## ENTITY MODEL

- `_os` — always-on orchestrator. Manages projects and itself. Runtime holds workspace-wide pillars + evolution_objectives.
- `project_name/` — one folder per project. Self-contained: board, runtime, missions, toolboxes, inbox, and a freeform `*-data/` folder described by `*-data.yaml`.

Creating a project: ask the user for details first, then draft the board with sections tailored to the project type + those details. A project can be anything.

## FALLBACK

Broken reference or missing path -> HALT, report to the user, self-repair from `index.yaml` + the entity runtime. Never guess a path.
