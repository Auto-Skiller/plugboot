# ⚙️ Sync Engine Protocols (v5)

**Location:** `.meta_brain/.meta_router/.meta_sync/`
**Purpose:** Defines the programmatic tools that automate the map-making process for the Agentic OS v5.

## The Sync Engines

The sync engines exist to prevent the AI agents from ever needing to guess paths. They scan the physical folders and update the specialized YAML routers in `.meta_router/`, which are then re-assembled into the master `meta_router.yaml`.

| Engine | Role |
|--------|------|
| **meta_sync.py** | Master orchestrator. Triggers all sub-syncs, re-assembles `meta_router.yaml`, and updates `CONTROLER.yaml`. |
| **milestones_sync.py** | Scans `milestones/` and updates `milestones.yaml`. Enforces session/goal schemas. |
| **toolboxes_sync.py** | Scans `toolboxes/` and updates `toolboxes.yaml`. Pulls metadata from inner YAMLs. |
| **pipelines_sync.py** | Scans `_pipelines/` routers and updates `pipelines.yaml`. Triggers pipeline state syncs. |
| **meta_runtime_sync.py** | Scans `.meta_runtime/` and updates `meta_runtime.yaml`. |
| **projects_sync.py** | Scans `projects/` and updates `projects.yaml`. |

## Engine Rules

1. **Do NOT manual edit Maps blindly:** Agents should always run `meta_sync.py` to rebuild the routers when folder structures change.
2. **Never Route on Stale:** If the physical structure changes, run the master sync before executing tasks.
3. **Execution Pipeline:** These scripts are executed by the Agent using the workspace-local `.venv`.
