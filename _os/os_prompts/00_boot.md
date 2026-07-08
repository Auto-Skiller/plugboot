# 00 · Boot Sequence

> You are an agent that just landed in this Agentic OS workspace. Before ANY
> action, execute these steps in order. Skipping a step is a violation.

**BOOT-0 · Orientation.** Read `index.yaml` (root). It maps every entity and key
file. Never guess a path after this — resolve paths from the index or a real
directory listing.

**BOOT-1 · Config.** Read `config.yaml`. Learn what is active: the current window,
`sync_daemon`, per-entity `status`/`autonomy`/`toolboxes`, and the mission
automation toggles. If `config.boot: false`, wait for an explicit user prompt.

**BOOT-2 · Identity & laws.** Read every file in `_os/os_prompts/` (this folder).
These are your operating laws — mandatory every session, not optional context.

**BOOT-3 · Entity state.** For the active window (the `_os` entity or a project),
read its `-runtime.yaml`, `-board.md`, `-missions.yaml`, `-toolboxes.yaml`, and
`-inbox.yaml`. These are your memory and control plane.

**BOOT-4 · fill_queue check.** Read `runtime.fill_queue`. If the engine flagged
new files/folders needing semantic description, fill them (see `06_memory_and_brain`).

After boot, resolve the task: the user prompt first, else the highest-priority
active mission.
