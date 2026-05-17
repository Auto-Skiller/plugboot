# 🏗️ Core Architecture — Agentic OS v5

## Core Philosophy

We are building the **Substrate** (Agentic OS). The architecture is strictly segregated into three pillars:
1. **The Logic (.meta_brain/):** Routing, rules, identity, and the toolbox muscles.
2. **The State (.meta_runtime/):** Mission tracking, dynamic cookies, and session states.
3. **Execution Workspaces:** Pure execution environments with localized operational context (`_pipelines/` and `projects/`).

We are not building "an agent" — we are building the Substrate that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.

---

## Directory Roles — Strict Separation

| Directory | Role | Contains | Does NOT contain |
|-----------|------|----------|------------------|
| `.meta_brain/` | **Logic, Routing & Muscles** | `.meta_routing/.meta_engines/` (Micro-Engines), `meta_identity/`. | Transient auth cookies, execution outputs. |
| `.meta_runtime/auth/` | **Auth & External State** | `notebooklm/` (session cookies, auth profiles). | Control logic, system prompts, map fragments, mission tracking. |
| `.meta_runtime/.meta_scratch/` | **Ephemeral Working Data** | Temporary tool configs (e.g., `pyragify/`). Never archived. | Anything meant to persist. |
| `_pipelines/` & `projects/` | **Execution Environment** | Continuous workflows and bounded builds. | System rules, core capabilities, global routers. |
| `CONTROLER.yaml` | **Central Command (State)** | Active sessions, goal statuses, logs. | Loose global goals (all goals must be nested in sessions). |

### Strict Portability Rules
- **The .venv OS Engine**: All python modules are executed relatively from the master `.meta_runtime\venv\.venv` environment.
- **Git Tracking**: The `venv`, caches (`auth/`), and secrets (`.env`) are intentionally pushed to Git for 100% clone-and-play teleportation.

---

## Complete Directory Structure

```text
open-workspace/
│
├── .gitignore
├── AGENTS.md                                    # Root pointer file for agents
├── CONTROLER.yaml                               # 📋 CENTRAL COMMAND STATE
├── README.md
│
├── .meta_brain/                                 # 🧠 THE LOGIC (Routing, Rules & Muscles)
│   ├── BOOT_CONTRACTS.yaml                      # 🚀 THE PROTOCOL (How to Boot)
│   ├── meta_router.yaml                         # 🗺️ THE MAP (Where things are)
│   ├── meta_sync.py                             # ⚙️ Master Sync Script
│   │
│   ├── .meta_routing/                           # 🗂️ ALL-IN-ONE ROUTERS
│   │   ├── milestones.yaml                      # Parts 1, 2, 3
│   │   ├── toolboxes.yaml                       # Parts 1, 2, 3
│   │   ├── pipelines.yaml                       # Parts 1, 2, 3
│   │   ├── projects.yaml                        # Parts 1, 2, 3
│   │   ├── meta_runtime.yaml                    # Parts 1, 2, 3
│   │   │
│   │   └── meta_sync_engines/                   # ⚙️ THE WORKER SCRIPTS
│   │       ├── milestones_sync.py
│   │       ├── toolboxes_sync.py
│   │       ├── projects_sync.py
│   │       ├── pipelines_sync.py
│   │       └── meta_runtime_sync.py
│   │
│   ├── meta_identity/                           # OS Architecture, System Prompts & Rules
│   ├── milestones/                              # 📋 SESSIONS & GOALS STATE (synced by sync_engine)
│   │   ├── .milestones_archive/                 # Archived sessions and MISSION_LOG
│   │   └── SES-SCALER-GROWTH/
│   │
│   └── toolboxes/                               # CAPABILITIES & MUSCLES
│       ├── _toolbox_graph.yaml
│       ├── core/
│       └── extended/
│
├── .meta_runtime/                               # 🔋 RUNTIME & EXTERNAL STATE
│   ├── auth/                                    # Auth state and cookies
│   │   └── notebooklm/
│   ├── venv/                                    # ⚡ THE PORTABLE OS ENGINE
│   │   ├── .env                                 # Redirects NOTEBOOKLM_HOME and API keys
│   │   └── .venv/
│   └── .meta_scratch/                           # 🗒️ EPHEMERAL WORKING DATA (never archived)
│       └── pyragify/                            # pyragify tool config and identity rules
│
├── _pipelines/                                  # ⚙️ EXECUTION ENVIRONMENT (Infinite Workflows)
│   ├── hustler/
│   └── _scaler/                                 # Scaler pipeline
│
└── projects/                                    # 📦 EXECUTION ENVIRONMENT (Finite Builds)
```

## ⚙️ Micro-Engine Architecture (v5.2)

To ensure maximum portability and separation of concerns, the Agentic OS uses a **Component-Based Micro-Engine Architecture**. 

Instead of having a monolithic sync script and scattered schemas, each domain (Milestones, Toolboxes, etc.) is housed in its own `.engine` folder inside `.meta_engine/`.

Each `.engine` folder is a self-contained module containing:
1.  **`[domain].yaml`**: The Data Map (The state of the domain).
2.  **`[domain]_sync.py`**: The Script (Contains both execution logic and validation).
3.  **`[domain]_schemas.yaml`**: The Schema (Defines the strict structure rules).
4.  **`[domain]_protocol.md`**: The Protocol (Human and agent-readable documentation of rules and steps).

This makes the system highly modular. If you want to understand or modify how Milestones are managed, everything you need is inside `milestones.engine/`.

### Active Micro-Engines

Here are the active worker engines located in `.meta_routing/meta_sync_engines/`:

1. **milestones_sync.py**: Scans `milestones/` and updates `milestones.yaml`.
2. **toolboxes_sync.py**: Scans `toolboxes/` and updates `toolboxes.yaml`.
3. **pipelines_sync.py**: Scans `_pipelines/` and updates `pipelines.yaml`.
4. **projects_sync.py**: Scans `projects/` and updates `projects.yaml`.
5. **meta_runtime_sync.py**: Scans `.meta_runtime/` and updates `meta_runtime.yaml`.

### System Usage Logic
> [!IMPORTANT]
> When using an engine, first read the protocol file, then execute the script, solve errors and re-execute the script until everything is perfect.
