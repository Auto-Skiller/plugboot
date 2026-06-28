---
metadata:
  name: os-architecture
  class: system/identity
  type: identity
  version: '1.0'
  schema_version: '1.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-06-27T00:00:00'
credentials:
  description: High-level reference for how the Agentic OS is structured. Explains
    the three pillars and the exact disk hierarchy.
  when_to_use: Consult for a high-level map of the workspace structure. For deeper
    execution, state management, or laws, see the respective files.
  contains: architecture, pillars, subsystems
---
contains: architecture, pillars, subsystems, three_pillars, identity_laws
---

# 🏛️ OS Architecture & System Map

---

## 1. The Three Pillars

The Agentic OS is organized into three non-overlapping pillars:

| Pillar | Path | Role |
|--------|------|------|
| **Logic** | `.meta/.os/.system.identity/` | Static laws, identity files, governance rules. Never modified by the daemon. |
| **State & Memory** | `.db/` + `.db/.system.board.yaml` | Active memory, routing indexes, operational state. Written by agents and the daemon. |
| **Execution** | `pipeline_*/`, `projects/` | Where actual work, code, and artifacts are produced. Note: `.meta/toolboxes/` and `.meta/milestones/` are not execution environments themselves; rather, they are the always-on systems that power and direct the execution within the pipelines and projects. |

---

## 2. The Full Hierarchy (Top → Bottom)

```text
.db/.system.board.yaml                        ← TOP: the single user-facing dashboard
    │
    ├── .db/
    │       ├── .system.rollup.yaml           ← Identity + runbooks index
    │       ├── pipeline_scaler.board.yaml     ← Scaler pipeline board
    │       ├── pipeline_scaler.rollup.yaml    ← Scaler runbooks + ledgers index
    │       ├── pipeline_hustler.board.yaml    ← Hustler pipeline board
    │       ├── pipeline_hustler.rollup.yaml   ← Hustler runbooks + ledgers index
    │       ├── project_assets.board.yaml      ← Project Assets board
    │       ├── project_assets.rollup.yaml     ← Project Assets docs index
    │       ├── project_ecoma.board.yaml       ← Project Ecoma board
    │       ├── project_ecoma.rollup.yaml      ← Project Ecoma docs index
    │       ├── toolboxes.board.yaml           ← Toolbox index board
    │       ├── toolboxes.rollups/             ← Individual toolbox rollups
    │       ├── .schemas/                      ← YAML schema constraints
    │       │
    │       ├── pipeline_scaler.ledgers/       ← Scaler granular tracking
    │       └── pipeline_hustler.ledgers/      ← Hustler granular tracking
    │
    ├── .meta/.os/                             ← Logic & Governance
    │       ├── .system.identity/              ← Core identity laws (10 files)
    │       ├── pipeline_scaler.runbooks/      ← Scaler runbooks
    │       └── pipeline_hustler.runbooks/     ← Hustler runbooks
    │
    ├── .infra/                                ← Engine & Dashboard
    │       ├── engine.py                      ← Sync Daemon
    │       ├── verify_boot.py                 ← Boot verification (agent-driven)
    │       ├── dashboard/                     ← Web UI (port 8000)
    │       └── .venv/                         ← Cross-OS Python environment
    │
    ├── .meta/                                 ← OS infrastructure
    │       ├── toolboxes/                     ← Capability registry
    │       └── milestones/                    ← Milestone sessions
    │
    ├── pipeline_scaler/                       ← System Evolution workflow
    ├── pipeline_hustler/                      ← Product Discovery workflow
    ├── project_assets/                        ← Real Estate project
    └── project_ecoma/                         ← Algerian Ecommerce project
```

---

## 3. Data Logic & Memory

The OS is driven by `.yaml` databases inside `.db/` using a Dual-Entry direction model (`# (in)` vs OUT tags).
*For full details on DB schemas, responsibilities, and data flow, read `State_and_Memory_Ops.md`.*

---

## 4. The Sync Daemon & Ledger Synchronization

The Agentic OS is kept perfectly synchronized by a Loop-based verification via .infra/engine.py. It orchestrates a rigorous bidirectional (IN-OUT) sync across the workspace.

### The Pipeline Ledger Sync Flow
In the pipelines (`pipeline_scaler`, `pipeline_hustler`), ledgers enforce a strict **State vs Metadata** split to prevent drift:
1. **[IN (Physical) ➔ State]:** The engine scans the physical folders (e.g. `_proposals` or `algerian-ecommerce`) and dynamically enforces the ledger's `state.tracked_gaps` or `state.tracked_products` to match exactly. **Physical Disk is the source of truth for work.**
2. **[OUT ➔ Ledger Metadata]:** The engine tallies the physical files in `state` and writes them as metrics into the ledger's `metadata.metrics` block. **Metadata is strictly for communication.**
3. **[OUT ➔ Global OS DB]:** The engine sums the `metadata.metrics` across all local ledgers and pushes the total to the pipeline's master board (e.g., `pipeline_scaler.board.yaml`).
4. **[IN (Commands) ➔ Ledger Metadata]:** If a master OS DB contains targeted signals (like a hub message specifically for `Foundational_Integrity`), the engine pushes that signal DOWN into the local ledger's `hub.messages`.

This guarantees **zero drift** and allows agents to work confidently in localized ledgers while the daemon handles the upward metrics and downward routing.

---

## 5. Toolboxes

Toolboxes are the system's muscles, invoked by agents to perform work.
*For a complete reference on available toolboxes and their dependencies, refer to `.db/toolboxes.board.yaml` and read `Execution_Operations.md`.*

---

## 6. Execution & Milestones

Milestones guide the execution across the system. There are separated milestone systems for pipelines and projects.
*For detailed milestone lifecycle rules, agent execution flow, and session file layouts, read `Execution_Operations.md`.*
