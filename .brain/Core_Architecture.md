# 🏗️ core_architecture — Agentic OS v5

## Core Philosophy

We are building the **Substrate** (Agentic OS) — the workspace provides **Senses** (catalogs), **Memory** (`BOARD.yaml`), and **Muscles** (toolbox skills). Agents provide the **Brain**.

We are not building "an agent" — we are building the Substrate that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.

---

## Directory Roles — One Job Each

| Directory | Role | Contains | Does NOT contain |
|-----------|------|----------|------------------|
| `.brain/` | **Identity + Catalogs + Rules** | Persona, modes, rules, and `.catalogs.index.yaml` | Context data, mission files, execution outputs |
| `.engines/` | **Core Protocols** | Engine instructions (cataloger, router, etc.) | Standard tools, content |
| `.toolbox/` | **Capabilities** | Skill definitions (`agents/` + `skills/` per domain) | Control logic, state, indexes |
| `.scope/` | **Operational Data** | Knowledge files, mission definitions + run logs | Engine protocols, rules, registries |
| `BOARD.yaml` | **Central Command (State)** | Mode, goal refs, scope index, events, messages, scratchpad | Full content — references only |
| `_pipelines/` | **Execution (Pipelines)** | Deliverables, outputs, discoveries — pure workspace | Context, missions, control, indexes |
| `_projects/` | **Execution (Projects)** | Builds, code, assets — pure workspace | Context, missions, control, indexes |
| `archive/` | **Archived content** | Deprecated items (never delete, move here) | Active work |
| `scratch/` | **Temporary files** | Drafts, test scripts, one-off data | Permanent content, Goal artifacts, Mission definitions |

---

## Complete Directory Structure

```text
open-workspace/
│
├── .brain/                                      # 🧠 IDENTITY + RULES + CATALOGS
│   ├── Core_Architecture.md                     # Full structural map
│   ├── Hierarchy.md                             # Multi-layer inheritance
│   ├── Modes.md                                 # STRICT / COLLAB / AUTO behavioral modes
│   ├── Persona.md                               # Agent name, role, tone, mission
│   ├── Core_Capabilities.md                     # Cognitive loop & operational protocols
│   ├── Decision_Making.md                       # Escalation, conflict resolution
│   ├── Orchestration_And_Flow.md                # 10-step execution flow
│   ├── Board_Guide.md                           # How to read/write BOARD.yaml
│   ├── Communication_Style.md                   # Response tone & formatting
│   ├── Quick_Start.md                           # Onboarding checklist
│   ├── Rules_And_Considerations.md              # Global + domain rules
│   │
│   ├── .catalogs.index.yaml                     # 🧭 THE MASTER ROUTER MAP
│   │
│   ├── .engines.context_control/                # ENGINE CATALOGS
│   │   ├── engines.rules.yaml
│   │   ├── core_engines.catalog.yaml
│   │   └── extended_engines.catalog.yaml
│   │
│   ├── .toolbox.context_control/                # TOOLBOX CATALOGS
│   │   ├── toolbox.rules.yaml
│   │   ├── core_toolbox.catalog.yaml
│   │   └── extended_toolbox.catalog.yaml
│   │
│   ├── .knowledge.context_control/              # KNOWLEDGE CATALOGS
│   │   ├── knowledge.rules.yaml
│   │   ├── core.knowledge.catalog.yaml
│   │   ├── pipelines/
│   │   │   ├── hustler.knowledge.catalog.yaml
│   │   │   └── scaler.knowledge.catalog.yaml
│   │   └── projects/
│   │       └── [name].knowledge.catalog.yaml
│   │
│   └── .missions.context_control/               # MISSION CATALOGS
│       ├── missions.rules.yaml
│       ├── definitions.missions.catalog.yaml
│       ├── runs/
│       │   └── runs/core.missions.catalog.yaml
│       ├── pipelines/
│       │   ├── hustler.missions.catalog.yaml
│       │   └── scaler.missions.catalog.yaml
│       └── projects/
│           └── [name].missions.catalog.yaml
│
├── .engines/                                    # ⚙️ OS CORE PROTOCOLS
│   └── .context_control.engine/
│       ├── navigator.engine.md                  # Programmatic directory scanning
│       ├── cataloger.engine.md                  # Programmatic diff + descriptions
│       └── router.engine.md                     # Agent-read routing decisions
│
├── .toolbox/                                    # 🛠️ CAPABILITIES
│   ├── business_toolbox/                        #   13 domains (agents/ + skills/ each)
│   ├── engineering_toolbox/                     #   15 domains
│   ├── life_toolbox/                            #   14 domains
│   └── studio_toolbox/                          #   11 domains
│
├── .scope/                                      # 📊 OPERATIONAL DATA
│   ├── .core/
│   │   ├── .knowledge/
│   │   │   ├── workflows.md
│   │   │   ├── knowledge.md
│   │   │   └── bootstrap_protocol.md
│   │   └── .missions/
│   │       ├── definitions/
│   │       ├── plans/
│   │       └── runs/
│   ├── pipelines/
│   │   ├── hustler/
│   │   │   ├── .knowledge/
│   │   │   └── .missions/
│   │   └── scaler/
│   │       ├── .knowledge/
│   │       └── .missions/
│   └── projects/
│       └── [project-name]/
│           ├── .knowledge/
│           └── .missions/
│
├── BOARD.yaml                                   # 📋 CENTRAL COMMAND
├── _pipelines/                                  # ⚡ EXECUTION (pure workspace)
│   ├── hustler/
│   │   ├── _discoveries/
│   │   └── algerian-ecommerce/
│   └── scaler/
│       ├── _discoveries/
│       └── _proposals/
├── _projects/                                   # ⚡ EXECUTION
├── archive/
├── scratch/
├── AGENTS.md                                    # Entry point for agents
└── README.md
```
