# Identity & System Map

## What the OS is
A portable workspace that any agent harness lands in and operates as a project manager. The harness is the brain; the workspace is the body. The harness's capabilities are a layer BELOW us — we use its planning/memory/tools, but all planning and state live in our YAMLs under our rules. The agent operates our files; it never owns them.

Target users: business owners, project managers, data analysts. A project is anything that needs managing: a business, a YouTube channel, a codebase, legal-document procedures, a multi-account content operation.

## Entity model (two kinds)
1. `_os` — the always-on orchestrator. Manages projects and itself. Holds workspace-wide pillars + evolution_objectives in os-runtime.yaml.
2. `project_name/` — one self-contained folder per project: board, runtime, missions, toolboxes, inbox, and a freeform `*-data/` folder described by `*-data.yaml`.

Every entity shares the same anatomy so the dashboard and agent treat them uniformly:
- board (`*-board.md`) — human-facing identity/notes, editable.
- runtime (`*-runtime.yaml`) — live values: pillars, evolution_objectives, fill_queue, review_queue, backlog, recent_events.
- missions (`*-missions.yaml`) — standard / research / evolution.
- toolboxes (`*-toolboxes.yaml`) — activation + metadata.
- inbox (`*-inbox.yaml` + folder) — raw drops + a gateway folder (`.<entity>-inbox_gateway/`) holding pillars -> functional groups.
- data (projects only) — `*-data.yaml` brain over the `*-data/` folder.

## Pillars vs Aspects (critical)
- Pillars are dynamic. Defined per entity in its runtime YAML (validated + suggestions, with actives). They describe the focus areas this entity cares about and can differ per project.
- Aspects are fixed. Three, defined in the os_prompt: Architecture, Capabilities (toolboxes), Monetization. Used by evolution and research missions (via an `aspects: all | [..]` field) to steer focus.

## The YAML brain
Every entity's YAMLs pre-describe the files in its folders (role, contains, when_to_use). Agents read those first and only open raw files that truly matter. The daemon detects added/removed files and flags gaps in fill_queue; agents fill semantics. This makes long multi-day runs cheap.
