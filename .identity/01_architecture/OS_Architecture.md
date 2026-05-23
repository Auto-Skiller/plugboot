---
metadata:
  purpose: "High-level reference for how the Agentic OS is structured. Explains the three pillars and the exact disk hierarchy."
  when_to_use: "Consult for a high-level map of the workspace structure. For deeper execution, state management, or laws, see the respective files."
---

# 🏛️ OS Architecture & System Map

---

## 1. The Three Pillars

The Agentic OS is organized into three non-overlapping pillars:

| Pillar | Path | Role |
|--------|------|------|
| **Logic** | `.identity/` | Static laws, identity files, governance rules. Never modified by the daemon. |
| **State & Memory** | `.db/` + `CONTROLER.yaml` | Active memory, routing indexes, operational state. Written by agents and the daemon. |
| **Execution** | `pipeline_*/`, `projects/` | Where actual work, code, and artifacts are produced. Note: `_toolboxes/` and `.milestones/` are not execution environments themselves; rather, they are the always-on systems that power and direct the execution within the pipelines and projects. |

---

## 2. The Full Hierarchy (Top → Bottom)

```text
CONTROLER.yaml                        ← TOP: the single user-facing dashboard
    │
    ├── .db/                          ← All routing databases
    │       ├── .core.yaml
    │       ├── pipeline_scaler.yaml
    │       ├── pipeline_hustler.yaml
    │       ├── projects.yaml
    │       ├── .toolboxes.yaml
    │       ├── .db_shemas_db/        ← YAML schema constraints
    │       └── toolboxes_db/         ← Local DBs for toolboxes
    │
    ├── .db - backup/                 ← Database backups
    │
    ├── .identity/                    ← Logic & Governance Pillar
    │       ├── 01_architecture/
    │       ├── 02_behavior/
    │       ├── 03_state_and_memory/
    │       └── 04_execution/
    │
    ├── .milestones/                  ← Core system sessions and goals
    │       ├── .archived_milestones/
    │       └── <SESSION>/            (e.g., OS-DEV-DASHBOARD)
    │             └── <SESSION>.yaml
    │
    ├── .runtime/                     ← Global ephemeral execution context
    │       ├── .auth/
    │       ├── archive/
    │       └── scratch/
    │
    ├── _os/                          ← Core OS infrastructure
    │       ├── .venv/                ← Local python environment
    │       ├── dashboard/            ← OS UI/Dashboard
    │       └── engine/               ← The Sync Daemon
    │
    ├── pipeline_scaler/              ← System Evolution workflow
    │       ├── .scaler_identity/
    │       ├── .scaler_db/
    │       ├── .scaler_milestones/   ← Pipeline-specific milestones
    │       ├── .scaler_runtime/
    │       ├── _SCALER-EXTERNAL_SOURCES/
    │       ├── Foundational_Integrity_external_proposals/
    │       ├── Foundational_Integrity_internal_proposals/
    │       ├── Operational_Muscles_external_proposals/
    │       ├── Operational_Muscles_internal_proposals/
    │       ├── Value_Generation_external_proposals/
    │       └── Value_Generation_internal_proposals/
    │
    ├── pipeline_hustler/             ← Product Discovery workflow
    │       ├── .hustler_identity/
    │       ├── .hustler_db/
    │       ├── .hustler_milestones/  ← Pipeline-specific milestones
    │       ├── .hustlrer_runtime/
    │       ├── _HUSTLER-EXTERNAL_SOURCES/
    │       └── algerian-ecommerce/   ← Active Project Folder
    │
    ├── projects/                     ← Finite bounded codebases
    │       ├── .projects_identity/
    │       ├── .projects_db/
    │       ├── .projects_milestones/ ← Project-specific milestones
    │       └── .projects_runtime/
    │
    └── _toolboxes/                   ← Capability registry (powers execution)
            ├── .core_toolboxes/      (analysis, research, planning, ...)
            ├── business_toolboxes/
            ├── engineering_toolboxes/
            ├── life_toolboxes/
            └── studio_toolboxes/
                 └── <toolbox>/
                       ├── agents/
                       └── skills/
```

---

## 3. Data Logic & Memory

The OS is driven by `.yaml` databases inside `.db/` using a Dual-Entry direction model (`# (in)` vs OUT tags).
*For full details on DB schemas, responsibilities, and data flow, read `State_and_Memory_Ops.md`.*

---

## 4. The Sync Daemon

*(This section is currently empty pending daemon logic updates.)*

---

## 5. Toolboxes

Toolboxes are the system's muscles, invoked by agents to perform work.
*For a complete reference on available toolboxes and their dependencies, refer to `.db/.toolboxes.yaml` and read `Execution_Operations.md`.*

---

## 6. Execution & Milestones

Milestones guide the execution across the system. There are separated milestone systems for pipelines and projects.
*For detailed milestone lifecycle rules, agent execution flow, and session file layouts, read `Execution_Operations.md`.*
