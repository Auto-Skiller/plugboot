# 🏗️ Core Architecture — Agentic OS v5

## Core Philosophy

We are building the **Substrate** (Agentic OS). The architecture is strictly segregated into three pillars:
1. **The Logic (.brain/):** Routing, rules, identity, and the toolbox muscles.
2. **The State (.runtime/):** Mission tracking, dynamic cookies, and session states.
3. **Execution Workspaces:** Pure execution environments with localized operational context (`pipelines/` and `projects/`).

We are not building "an agent" — we are building the Substrate that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.

---

## Directory Roles — Strict Separation

| Directory | Role | Contains | Does NOT contain |
|-----------|------|----------|------------------|
| `.brain/` | **Logic, Routing & Muscles** | `meta.router/` maps, `.sync_engine/`, `.identity/`, and `.toolbox_library/`. | Transient auth cookies, execution outputs. |
| `.auth/` | **Auth & External State** | `.notebooklm/` (session cookies, auth profiles). | Control logic, system prompts, map fragments, mission tracking. |
| `.scratch/` | **Ephemeral Working Data** | Temporary tool configs (e.g., `pyragify/`). Never archived. | Anything meant to persist. |
| `pipelines/` & `projects/` | **Execution Environment** | Continuous workflows and bounded builds. | System rules, core capabilities, global routers. |
| `CONTROLER.yaml` | **Central Command (State)** | Active sessions, goal statuses, logs. | Loose global goals (all goals must be nested in sessions). |

### Strict Portability Rules
- **The .venv OS Engine**: All python modules are executed relatively from the master `.venv` environment.
- **Git Tracking**: The `.venv`, caches (`.auth/`), and secrets (`.env`) are intentionally pushed to Git for 100% clone-and-play teleportation.

---

## Complete Directory Structure

```text
open-workspace/
│
├── .env                                         # Redirects NOTEBOOKLM_HOME and API keys
├── requirements.txt                             # Master python dependency map
├── .venv/                                       # ⚡ THE PORTABLE OS ENGINE
│
├── .mission_board/                              # 📋 SESSIONS & GOALS STATE (synced by sync_engine)
│   ├── _index.yaml                              # Fast flat view — auto-generated
│   ├── .archive/                                # Archived sessions and MISSION_LOG
│   ├── SES-CORE-EVOLUTION/
│   └── SES-SCALER-EXECUTION/
│
├── .brain/                                      # 🧠 THE LOGIC (Routing, Rules & Muscles)
│   ├── meta.router.yaml                         # The Master Map
│   ├── BOOT_CONTRACT.yaml                       # Machine-readable boot sequence
│   ├── meta.router/                             # AUTO-GENERATED MAPS
│   │   ├── .sync_engine/                        # THE MAP MAKERS (Automation)
│   │   ├── _mission_board.router.yaml
│   │   ├── toolbox_library.router.yaml
│   │   ├── pipelines.router/
│   │   └── projects.router/
│   │
│   ├── .identity/                               # OS Architecture, System Prompts & Rules
│   │
│   └── .toolbox_library/                        # CAPABILITIES & MUSCLES
│       ├── _toolbox_graph.yaml
│       ├── core/
│       └── extended/
│
├── .runtime/                                    # 🔋 AUTH & EXTERNAL STATE
│   └── notebooklm/                              # Auth state and cookies (see .env → NOTEBOOKLM_HOME)
│
├── .scratch/                                    # 🗒️ EPHEMERAL WORKING DATA (never archived)
│   └── pyragify/                                # pyragify tool config and identity rules
│
├── pipelines/                                   # ⚙️ EXECUTION ENVIRONMENT (Infinite Workflows)
│   ├── hustler/
│   │   ├── .hustler.meta/                       # Localized Operational Context
│   │   └── [pure execution files/outputs]
│   └── scaler/
│       └── .scaler.meta/
│
├── projects/                                    # 📦 EXECUTION ENVIRONMENT (Finite Builds)
│
├── CONTROLER.yaml                               # 📋 CENTRAL COMMAND STATE
├── AGENTS.md                                    # Root pointer file for agents
└── README.md
```
