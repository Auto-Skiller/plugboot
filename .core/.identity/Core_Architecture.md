# 🏗️ core_architecture — Agentic OS v5

## Core Philosophy

We are building the **Substrate** (Agentic OS). The architecture is strictly segregated into three pillars:
1. **Brain:** Routing and map-making automation (`.brain/`).
2. **Core:** Always-on system capabilities and mission context (`.core/`).
3. **Execution Workspaces:** Pure execution environments with localized operational context (`pipelines/` and `projects/`).

We are not building "an agent" — we are building the Substrate that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.

---

## Directory Roles — Strict Separation

| Directory | Role | Contains | Does NOT contain |
|-----------|------|----------|------------------|
| `.brain/` | **Routing & Automation** | `meta.router/` maps and `.sync_engine/` map-makers. | Context data, mission files, execution outputs, tools. |
| `.core/` | **Capabilities & Missions** | `toolbox_library/` (skills/agents), `mission_board/` (sessions/goals), and `.identity/`. | Control logic, execution code, outputs. |
| `pipelines/` & `projects/` | **Execution Environment** | Continuous workflows and bounded builds with localized `.meta/` contexts. | System rules, core capabilities, global routers. |
| `CONTROLER.yaml` | **Central Command (State)** | Active sessions, goal statuses, logs, system mode. | Loose global goals (all goals must be nested in sessions). |

---

## Complete Directory Structure

```text
open-workspace/
│
├── .brain/                                      # 🧠 ROUTING & ENGINES
│   ├── meta.router.yaml                         # The Master Map
│   ├── meta.router/                             # AUTO-GENERATED MAPS
│   │   ├── core.router/
│   │   │   ├── mission_board.router.yaml
│   │   │   └── toolbox_library.router.yaml
│   │   └── pipelines.router/
│   │       ├── hustler.router.yaml
│   │       └── scaler.router.yaml
│   │
│   └── .sync_engine/                            # THE MAP MAKERS (Automation)
│       ├── cataloger.py                         # (Or similar script) Syncs structure to catalogs
│       ├── navigator.py                         # Scans directories
│       └── router.py                            # Handles programmatic execution
│
├── .core/                                       # 🛡️ ALWAYS-ON CAPABILITIES & MISSIONS
│   ├── .identity/                               # OS Architecture & Rules
│   │
│   ├── mission_board/                           # SESSIONS & GOALS CONTEXT
│   │   ├── SES-ALPHA/
│   │   └── SES-BETA/
│   │
│   └── toolbox_library/                         # CAPABILITIES
│       ├── core.core/toolbox_library/
│       │   ├── core.toolbox.yaml
│       │   └── [toolbox-name]/
│       └── extended.core/toolbox_library/
│           ├── extended.toolbox.yaml
│           └── [domain.toolbox]/
│
├── pipelines/                                   # ⚡ EXECUTION ENVIRONMENT (Workflows)
│   ├── hustler/
│   │   ├── .hustler.meta/                       # Localized Operational Context
│   │   │   ├── hustler.runbook/
│   │   │   ├── hustler.scratch/
│   │   │   └── hustler.tracker/
│   │   └── [pure execution files/outputs]
│   └── scaler/
│       └── .scaler.meta/
│
├── projects/                                    # ⚡ EXECUTION ENVIRONMENT (Builds)
│
├── CONTROLER.yaml                               # 📋 CENTRAL COMMAND STATE
├── AGENTS.md                                    # Root pointer file for agents
└── README.md
```
