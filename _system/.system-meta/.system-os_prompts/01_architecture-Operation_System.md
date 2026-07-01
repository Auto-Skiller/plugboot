# 🏛️ OS Architecture & System Map

---

## 1. The Three-Layer Architecture

The Agentic OS is organized into three non-overlapping layers:

| Layer | Path | Role |
|-------|------|------|
| **Shared Library** | `_shared/` | Reusable blueprints and resources. Contains shared pipeline definitions (`.shared-pipelines/`), toolboxes (`.shared-toolboxes/`), and schemas. Available to system and all projects. |
| **System Orchestrator** | `_system/` | The ALWAYS-ON top core layer. It orchestrates, manages, and audits other projects or the core OS. It has its own board, index, meta resources, missions, and pipelines runtime. |
| **Projects** | `<project_name>/` | Bounded execution environments. Each project handles its own work in its own folders, with its own board, index, missions, pipelines runtime, and toolboxes. |

---

## 2. The Full Hierarchy (Top → Bottom)

```text
open-workspace/
├── AGENTS.md                              ← Root boot pointer for all agents
├── README.md                              ← Human-facing overview
├── index.yaml                             ← Workspace-level map (ALL infra + entities)
├── config.yaml                            ← Global modes (system + project activation)
│
├── _shared/                               ← LAYER 1: SHARED LIBRARY
│   ├── .shared-pipelines/                 ← Pipeline definitions (blueprints)
│   │   ├── Scaler/                        ← Systemic Growth Engine
│   │   └── Hustler/                       ← Product Discovery Engine
│   ├── .shared-toolboxes/                 ← Shared skill/agent toolboxes across 5 domains
│   └── schemas/                           ← YAML schema constraints
│
├── _system/                               ← LAYER 2: ALWAYS-ON ORCHESTRATOR
│   ├── system.md                          ← System overview
│   ├── system-board.yaml                  ← System state, pipeline/toolbox control (Control Plane)
│   ├── system-index.yaml                  ← System path map + machine index
│   ├── .system-meta/
│   │   ├── .system-os_prompts/            ← Core identity laws (read at every boot)
│   │   ├── .system-pipelines/             ← System-only pipeline definitions
│   │   └── .system-toolboxes/             ← System-only toolboxes
│   ├── .system-missions/                  ← System-level goals and orchestration missions
│   └── .system-pipelines_runtime/         ← Where pipelines execute for system work
│
├── project_name/                          ← LAYER 3: PROJECT (self-contained codebase)
│   ├── project_name.md                    ← Project overview
│   ├── project_name-board.yaml            ← Project state, pipeline/toolbox control (Control Plane)
│   ├── project_name-index.yaml            ← Project path map + machine index
│   ├── .project_name-meta/                ← Project-specific OS prompts, pipelines, toolboxes
│   ├── .project_name-missions/            ← Project-specific goals and missions
│   └── .project_name-pipelines_runtime/   ← Where pipelines execute for this project
│
├── .infra/                                ← Engine & Dashboard
│   ├── backend/                           ← Sync engine (engine.py), boot scripts
│   └── frontend/                          ← Dashboard UI
│
└── .stash/                                ← Runtime ephemeral
    ├── .venv/                             ← Cross-OS Python environment
    └── pids/                              ← Process IDs and locks
```

---

## 3. Data Logic & Memory (Boards & Indexes)

The OS is driven by `.yaml` files in each entity (System or Project). We strictly separate Control (Boards) from Location (Indexes).

- **Board (`system-board.yaml` / `<project>-board.yaml`)**: The ONLY Control Plane. Contains no paths. It manages missions, turns pipelines and toolboxes ON/OFF, holds action gate profiles, tracks metrics, and acts as a messaging hub (`fill_queue`, `review_queue`, `backlog`).
- **Index (`system-index.yaml` / `<project>-index.yaml`)**: The Path Map and Machine Index. Contains ALL paths for the entity. The engine populates this with machine-scanned metadata for OS prompts, pipelines, toolboxes, and ledgers.

---

## 4. The Sync Daemon & Ledger Synchronization

The Agentic OS is kept perfectly synchronized by a Loop-based verification via `.infra/backend/engine.py`. It orchestrates a rigorous bidirectional (IN-OUT) sync across the workspace.

### The Pipeline Ledger Sync Flow
In the pipeline runs (inside `pipelines_runtime/`), ledgers enforce a strict **State vs Metadata** split to prevent drift:
1. **[IN (Physical) ➔ State]:** The engine scans the physical folders and dynamically enforces the ledger's state to match exactly. **Physical Disk is the source of truth for work.**
2. **[OUT ➔ Ledger Metadata]:** The engine tallies the physical files in `state` and writes them as metrics into the ledger's metadata block. **Metadata is strictly for communication.**
3. **[OUT ➔ Entity Board]:** The engine sums the metrics across all local ledgers and pushes the total to the entity's board.
4. **[IN (Commands) ➔ Ledger Metadata]:** Targeted signals are pushed DOWN into local ledgers.

This guarantees **zero drift** and allows agents to work confidently in localized ledgers while the daemon handles the upward metrics and downward routing.

---

## 5. Toolboxes

Toolboxes are the system's muscles, invoked by agents to perform work. They are defined as blueprints in `_shared/.shared-toolboxes/` or locally in an entity's `.meta/.toolboxes/`.
Agents read `board.yaml` to see which toolboxes are currently active, and check `index.yaml` to find their paths and metadata. 
*Agent and skill files are plain markdown.*

---

## 6. Execution & Missions

Execution is driven by missions defined in the entity's `.missions/` folder and controlled via the entity's `board.yaml`.
Pipelines act as blueprints (toolboxes) that are executed inside the entity's `pipelines_runtime/` folder.
