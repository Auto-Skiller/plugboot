# 💾 State and Memory Ops

## 1. The Separation of Control and Location
We strictly separate the **Control Plane** from the **Path Map**.

### 1.1 The Control Plane (Board)
Every entity (_system, project) has a `board.yaml` (e.g., `system-board.yaml`).
- **NO PATHS ALLOWED.** 
- It is the master dashboard for the entity.
- It controls missions (status, goals, tasks).
- It turns pipelines and toolboxes ON/OFF.
- It holds metrics (computed by the engine) and a live event log.
- It acts as the communication hub (`fill_queue`, `review_queue`, `backlog`).

### 1.2 The Path Map (Index)
Every entity has an `index.yaml` (e.g., `system-index.yaml`).
- **ALL PATHS GO HERE.**
- It maps the physical folder structure.
- It serves as a machine-indexed catalog of all OS prompts, pipelines, toolboxes, missions, active pipeline runs, and project ledgers.
- The engine scans the disk and populates this file.

### 1.3 The Workspace Map (Root Index)
The root `open-workspace/index.yaml` maps the global workspace layout, listing all shared resources, the system entity, and all valid projects.

## 2. The Schema Contract (`_shared/schemas/`)
Every YAML file is governed by schemas in `_shared/schemas/`. 
- **Strict Compliance:** Agents must NEVER invent new fields, status strings, or array structures.
- **`board.schema.yaml`**: Universal schema for all entity boards.
- **`index-schema.yaml`**: Universal schema for all entity indexes.
- **`config-schema.yaml`**: Schema for the root `config.yaml`.
- **`workspace-index-schema.yaml`**: Schema for the root `index.yaml`.

## 3. Freshness Model
The sync daemon tracks freshness on entity boards and indexes:
```yaml
freshness:
  sync_status: fresh       # fresh | need-syncing | syncing | error
  sync_count: integer
  last_synced: timestamp
  last_edited: timestamp
```
- `sync_status: syncing` — daemon sets this before writing.
- `sync_status: error` — daemon sets this if a write fails.

## 4. The Sync Daemon
The engine (`.infra/backend/engine.py`) is a process that:
1. **Reads `config.yaml`** to know which entities are active.
2. **Scans Disk**: Reads `_shared/` and the entity's `.meta/` folders to find available pipelines and toolboxes.
3. **Populates Index**: Writes the physical paths and metadata of all discovered resources to the entity's `index.yaml`. (It also scans and indexes all non-hidden project content folders as `ledgers`).
4. **Computes Metrics**: Aggregates counts (e.g., number of active missions, active toolboxes) and writes them to the entity's `board.yaml`.
5. **Maintains State**: Propagates `hub` requests and manages pipeline execution runtimes.

Agents do NOT need to manually index files or compute metrics. The daemon handles the upward rollups. Agents simply read the board and index to know what to do and where to do it.
