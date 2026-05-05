# 🏗️ Core Architecture — Agentic OS v5

## Core Philosophy

We are building the **Substrate** (Agentic OS) — the workspace provides **Senses** (registries), **Memory** (`BOARD.yaml`), and **Muscles** (toolbox skills). Agents provide the **Brain**.

We are not building "an agent" — we are building the Substrate that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.

---

## Directory Roles — One Job Each

| Directory | Role | Contains | Does NOT contain |
|-----------|------|----------|------------------|
| `.brain/` | **Identity + Engines + Rules + Registries** | Persona, modes, rules, engine protocols, control configs, registry files | Context data, mission files, execution outputs |
| `.toolbox/` | **Capabilities** | Skill definitions (`agents/` + `skills/` per domain) | Control logic, state, indexes |
| `.scope/` | **Operational Data (by scope)** | Knowledge files, mission definitions + run logs, reserved .registry/ dirs | Engine protocols, rules, registries, execution outputs |
| `BOARD.yaml` | **Central Command (State)** | Mode, goal refs, scope index, events, messages, scratchpad | Full content — references only |
| `_pipelines/` | **Execution (Pipelines)** | Deliverables, outputs, discoveries — pure workspace | Context, missions, control, indexes |
| `_projects/` | **Execution (Projects)** | Builds, code, assets — pure workspace | Context, missions, control, indexes |
| `archive/` | **Archived content** | Deprecated items (never delete, move here) | Active work |
| `scratch/` | **Temporary files** | Drafts, test scripts, one-off data | Permanent content |

---

## Complete Directory Structure

```text
open-workspace/
│
├── .brain/                                      # 🧠 IDENTITY + ENGINES + RULES + REGISTRIES
│   ├── Core Architecture.md                     # Full structural map
│   ├── Hierarchy.md                             # Multi-layer inheritance
│   ├── Modes.md                                 # STRICT / COLLAB / AUTO behavioral modes
│   ├── Persona.md                               # Agent name, role, tone, mission
│   ├── Core Capabilities.md                     # Cognitive loop & operational protocols
│   ├── Decision-Making.md                       # Escalation, conflict resolution
│   ├── Orchestration & Flow.md                  # 10-step execution flow
│   ├── Orchestrator.engine.md                   # Engine chaining & execution modes
│   ├── Board-Guide.md                           # How to read/write BOARD.yaml
│   ├── Communication-Style.md                   # Response tone & formatting
│   ├── Quick Start.md                           # Onboarding checklist
│   ├── Rules & Considerations.md                # Global + domain rules
│   │
│   ├── .control.engine/                         # ENGINE PROTOCOLS (universal)
│   │   ├── navigator.engine.md                  #   Programmatic directory scanning
│   │   ├── cataloger.engine.md                  #   Hybrid: programmatic diff + agent-read descriptions
│   │   └── router.engine.md                     #   Pure agent-read routing decisions
│   │
│   ├── .toolbox.control/                        # TOOLBOX RULES + REGISTRIES
│   │   ├── toolbox.rules.yaml                   #   Schema & standards for toolbox
│   │   ├── core_toolbox.registry                #   "." folders (.agentic_toolbox/)
│   │   └── extended_toolbox.registry            #   Non-"." folders (business_, engineering_, etc.)
│   │
│   ├── .context.control/                        # CONTEXT RULES + REGISTRIES
│   │   ├── context.rules.yaml                   #   Schema & standards for context files
│   │   ├── core.context.registry                #   .scope/.core/.context/
│   │   ├── pipelines.context.registry/
│   │   │   ├── hustler.context.registry
│   │   │   └── scaler.context.registry
│   │   └── projects.context.registry/
│   │       └── [name].context.registry
│   │
│   └── .missions.control/                       # MISSION RULES + REGISTRIES
│       ├── missions.rules.yaml                  #   Mission schema, lifecycle, required fields
│       ├── core.missions.registry               #   .scope/.core/.missions/
│       ├── pipelines.missions.registry/
│       │   ├── hustler.missions.registry
│       │   └── scaler.missions.registry
│       └── projects.missions.registry/
│           └── [name].missions.registry
│
├── .toolbox/                                    # 🛠️ CAPABILITIES
│   ├── .agentic_toolbox/                        #   Core cognitive loop (always-on)
│   │   ├── analysis/        (agents/ + skills/)
│   │   ├── benchmarking/    (agents/ + skills/)
│   │   ├── brainstorming/   (agents/ + skills/)
│   │   ├── documentation/   (agents/ + skills/)
│   │   ├── evaluation/      (agents/ + skills/)
│   │   ├── planning/        (agents/ + skills/)
│   │   └── research/        (agents/ + skills/)
│   ├── business_toolbox/                        #   13 domains (agents/ + skills/ each)
│   ├── engineering_toolbox/                     #   15 domains
│   ├── life_toolbox/                            #   14 domains
│   └── studio_toolbox/                          #   11 domains
│
├── .scope/                                      # 📊 OPERATIONAL DATA (organized by scope)
│   ├── .core/
│   │   ├── .registry/                           #   EMPTY (reserved for future internal use)
│   │   ├── .context/                            #   Core knowledge
│   │   │   ├── workflows.md                     #     Core operational workflows
│   │   │   ├── knowledge.md                     #     Evergreen domain knowledge
│   │   │   └── bootstrap-protocol.md            #     How to add new pipelines/projects
│   │   └── .missions/
│   │       ├── definitions/
│   │       └── runs/
│   ├── pipelines/
│   │   ├── hustler/
│   │   │   ├── .registry/                       #   EMPTY (reserved)
│   │   │   ├── .context/
│   │   │   └── .missions/
│   │   │       ├── definitions/
│   │   │       └── runs/
│   │   └── scaler/
│   │       ├── .registry/                       #   EMPTY (reserved)
│   │       ├── .context/
│   │       └── .missions/
│   │           ├── definitions/
│   │           └── runs/
│   └── projects/
│       └── [project-name]/
│           ├── .registry/                       #   EMPTY (reserved)
│           ├── .context/
│           └── .missions/
│               ├── definitions/
│               └── runs/
│
├── BOARD.yaml                                   # 📋 CENTRAL COMMAND
├── _pipelines/                                  # ⚡ EXECUTION (pure workspace)
│   ├── hustler/
│   │   ├── _discoveries/
│   │   └── algerian-ecommerce/
│   └── scaler/
│       ├── _discoveries/
│       └── _proposals/
├── _projects/                                   # ⚡ EXECUTION (pure workspace)
├── archive/
├── scratch/
├── AGENTS.md                                    # Entry point for agents
└── README.md
```
