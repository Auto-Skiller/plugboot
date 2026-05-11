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
| `.brain/` | **Logic, Routing & Muscles** | `meta.router/` maps, `.sync_engine/`, `.identity/`, and `.toolbox_library/`. | Transient state, mission tracking, execution outputs. |
| `.runtime/` | **State & Memory** | `.mission_board/` (sessions/goals), `.notebooklm/` (cookies). | Control logic, system prompts, map fragments. |
| `pipelines/` & `projects/` | **Execution Environment** | Continuous workflows and bounded builds. | System rules, core capabilities, global routers. |
| `CONTROLER.yaml` | **Central Command (State)** | Active sessions, goal statuses, logs. | Loose global goals (all goals must be nested in sessions). |

### Strict Portability Rules
- **The .venv OS Engine**: All python modules are executed relatively from the master `.venv` environment.
- **Git Tracking**: The `.venv`, caches (`.runtime/`), and secrets (`.env`) are intentionally pushed to Git for 100% clone-and-play teleportation.

---

## Complete Directory Structure

```text
open-workspace/
│
├── .env                                         # Redirects NOTEBOOKLM_HOME and API keys
├── requirements.txt                             # Master python dependency map
├── .venv/                                       # ⚡ THE PORTABLE OS ENGINE
│
├── .brain/                                      # 🧠 THE LOGIC (Immutable & Rules)
│   ├── meta.router.yaml                         # The Master Map
│   ├── meta.router/                             # AUTO-GENERATED MAPS
│   │   ├── .sync_engine/                        # THE MAP MAKERS (Automation)
│   │   ├── mission_board.router.yaml
│   │   └── toolbox_library.router.yaml
│   │
│   ├── .identity/                               # OS Architecture, System Prompts & Rules
│   │
│   └── .toolbox_library/                        # CAPABILITIES & MUSCLES
│       ├── core.toolbox/
│       └── extended.toolbox/
│
├── .runtime/                                    # 🔋 THE STATE (Dynamic Memory)
│   ├── .notebooklm/                             # Auth state and cookies
│   │
│   └── .mission_board/                          # SESSIONS & GOALS CONTEXT
│       ├── SES-ALPHA/
│       └── SES-BETA/
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
