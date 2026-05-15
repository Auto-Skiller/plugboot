# ⚙️ Sync Engine Protocols

**Location:** `.brain/.sync_engine/`
**Purpose:** Defines the programmatic tools that automate the map-making process for the Agentic OS v5.

## The Sync Engines

The sync engines exist to prevent the AI agents from ever needing to guess paths. They manually scan `.brain/` and the pipeline workspaces, and update the `.brain/meta.router/` maps automatically.

| Engine | Role |
|--------|------|
| **sync_mission_board.md** | Scans `mission_board/` and updates `mission_board.router.yaml` and `CONTROLER.yaml`. Enforces schemas. |
| **sync_toolbox.md** | Scans `toolbox_library/` and updates `toolbox_library.router.yaml`. Enforces schemas. |
| **sync_pipelines.md** | Scans `pipelines/` execution schemas, updates `pipelines.router.yaml`, and compiles the master `meta.router.yaml`. |

## Engine Rules

1. **Do NOT manual edit Maps blindly:** Agents should use these `.sync_engine/` markdown protocols to rebuild the `meta.router` maps when new folders (Sessions, Goals, Toolboxes) are created.
2. **Never Route on Stale:** If the physical structure changes, run the appropriate sync engine before executing tasks.
3. **Execution Pipeline:** These scripts are executed by the Agent acting as the engine.

