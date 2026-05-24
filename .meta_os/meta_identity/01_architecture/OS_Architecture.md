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
| **Logic** | `.meta_os/meta_identity/` | Static laws, identity files, governance rules. Never modified by the daemon. |
| **State & Memory** | `.meta_os/meta_db/` + `CONTROLER.yaml` | Active memory, routing indexes, operational state. Written by agents and the daemon. |
| **Execution** | `pipeline_*/`, `projects/` | Where actual work, code, and artifacts are produced. Note: `.toolboxes/` and `.meta_os/meta_milestones/` are not execution environments themselves; rather, they are the always-on systems that power and direct the execution within the pipelines and projects. |

---

## 2. The Full Hierarchy (Top → Bottom)

```text
CONTROLER.yaml                        ← TOP: the single user-facing dashboard
    │
    ├── .meta_os/
    │       ├── meta_db/                  ← All routing databases
    │       │       ├── meta_os.yaml
    │       │       ├── pipeline_scaler_os.yaml
    │       │       ├── pipeline_hustler_os.yaml
    │       │       ├── projects_os.yaml
    │       │       ├── .toolboxes.yaml
    │       │       ├── .db_shemas_db/        ← YAML schema constraints
    │       │       └── toolboxes_db/         ← Local DBs for toolboxes
    │       │
    │       ├── meta_identity/            ← Logic & Governance Pillar
    │       │       ├── 01_architecture/
    │       │       ├── 02_behavior/
    │       │       ├── 03_state_and_memory/
    │       │       └── 04_execution/
    │       │
    │       └── meta_milestones/          ← Core system sessions and goals
    │               ├── .archived_milestones/
    │               └── <SESSION>/            (e.g., OS-DEV-DASHBOARD)
    │                     └── <SESSION>.yaml
    │
    ├── .meta_runtime/                    ← Global ephemeral execution context
    │       ├── .auth/
    │       ├── archive/
    │       └── scratch/
    │
    ├── .meta/                            ← Core OS infrastructure
    │       ├── venv/                 ← Local python environment
    │       ├── dashboard/            ← OS UI/Dashboard
    │       └── engine/               ← The Sync Daemon
    │
    ├── pipeline_scaler/              ← System Evolution workflow
    │       ├── .scaler_os/
    │       │       ├── scaler_identity/
    │       │       ├── scaler_db/
    │       │       └── scaler_milestones/   ← Pipeline-specific milestones
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
    │       ├── .hustler_os/
    │       │       ├── hustler_identity/
    │       │       ├── hustler_db/
    │       │       └── hustler_milestones/  ← Pipeline-specific milestones
    │       ├── .hustler_runtime/
    │       ├── _HUSTLER-EXTERNAL_SOURCES/
    │       └── algerian-ecommerce/   ← Active Project Folder
    │
    ├── projects/                     ← Finite bounded codebases
    │       ├── .projects_os/
    │       │       ├── .projects_identity/
    │       │       ├── .projects_db/
    │       │       └── .projects_milestones/ ← Project-specific milestones
    │       └── .projects_runtime/
    │
    └── .toolboxes/                   ← Capability registry (powers execution)
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

The OS is driven by `.yaml` databases inside `.meta_os/meta_db/` using a Dual-Entry direction model (`# (in)` vs OUT tags).
*For full details on DB schemas, responsibilities, and data flow, read `State_and_Memory_Ops.md`.*

---

## 4. The Sync Daemon & Ledger Synchronization

The Agentic OS is kept perfectly synchronized by a Python background daemon (`boot.py` ➔ `meta_engine.py`) that loops every 2-5 seconds. It orchestrates a rigorous bidirectional (IN-OUT) sync across the workspace.

### The Pipeline Ledger Sync Flow
In the pipelines (`pipeline_scaler`, `pipeline_hustler`), ledgers enforce a strict **State vs Metadata** split to prevent drift:
1. **[IN (Physical) ➔ State]:** The engine scans the physical folders (e.g. `_proposals` or `algerian-ecommerce`) and dynamically enforces the ledger's `state.tracked_gaps` or `state.tracked_products` to match exactly. **Physical Disk is the source of truth for work.**
2. **[OUT ➔ Ledger Metadata]:** The engine tallies the physical files in `state` and writes them as metrics into the ledger's `metadata.metrics` block. **Metadata is strictly for communication.**
3. **[OUT ➔ Global OS DB]:** The engine sums the `metadata.metrics` across all local ledgers and pushes the total to the pipeline's master database (e.g., `pipeline_scaler_os.yaml`).
4. **[IN (Commands) ➔ Ledger Metadata]:** If a master OS DB contains targeted signals (like a hub message specifically for `Foundational_Integrity`), the engine pushes that signal DOWN into the local ledger's `metadata.hub.messages`.

This guarantees **zero drift** and allows agents to work confidently in localized ledgers while the daemon handles the upward metrics and downward routing.

---

## 5. Toolboxes

Toolboxes are the system's muscles, invoked by agents to perform work.
*For a complete reference on available toolboxes and their dependencies, refer to `.meta_os/meta_db/.toolboxes.yaml` and read `Execution_Operations.md`.*

---

## 6. Execution & Milestones

Milestones guide the execution across the system. There are separated milestone systems for pipelines and projects.
*For detailed milestone lifecycle rules, agent execution flow, and session file layouts, read `Execution_Operations.md`.*
