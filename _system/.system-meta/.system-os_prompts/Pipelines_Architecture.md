# 🏗️ Pipelines Architecture — Shared Runtime Layout

## Objective
Define the **standard runtime folder structure** that ALL pipelines (Hustler, Scaler, and future pipelines) must follow when executing inside an entity's `pipelines_runtime/` folder. This is the single source of truth for pipeline runtime layout.

> **Board Control:** Pipeline profiles in `board.schema.yaml` control activation. This OS prompt defines the physical layout that runbooks reference.
>
> **No Metadata Frontmatter here.** This is an OS prompt file. Metadata for this file lives in the board (under the relevant pipeline's `pipeline_control` and `pillars` blocks).

---

## 1. Standard Runtime Structure

Every pipeline's execution happens inside the entity's `pipelines_runtime/` folder. Each pipeline gets its own named runtime folder:

```
pipelines_runtime/
└── entity-<pipeline_name>-runtime/    # One folder per pipeline (e.g. entity-scaler-runtime/, entity-hustler-runtime/)
    │
    ├── INTERNAL-PLANNING_runs/        # Runs currently in PLANNING phase (INTERNAL profile)
    ├── INTERNAL-EXECUTION_runs/       # Runs currently in EXECUTION phase (INTERNAL profile)
    │
    ├── INBOX-inboxing/                # 📥 User drops data here (raw — agent MUST NOT scan until delivery)
    ├── INBOX-gateway/                 # 📦 Agent delivers (COPY) items from INBOX-inboxing/ into pillar subfolders
    │   ├── <Pillar_A>/
    │   ├── <Pillar_B>/
    │   └── ...
    ├── INBOX-PLANNING_runs/           # Runs currently in PLANNING phase (INBOX profile)
    ├── INBOX-EXECUTION_runs/          # Runs currently in EXECUTION phase (INBOX profile)
    ├── INBOX-tracker.yaml             # Tracks all items in INBOX-inboxing/ and INBOX-gateway/
    │
    ├── RESEARCH-researching/          # 🔬 Agent writes new web research results here
    ├── RESEARCH-gateway/              # 📦 Agent delivers (COPY) items from RESEARCH-researching/ into pillar subfolders
    │   ├── <Pillar_A>/
    │   ├── <Pillar_B>/
    │   └── ...
    ├── RESEARCH-PLANNING_runs/        # Runs currently in PLANNING phase (RESEARCH profile)
    ├── RESEARCH-EXECUTION_runs/       # Runs currently in EXECUTION phase (RESEARCH profile)
    ├── RESEARCH-tracker.yaml          # Tracks all items in RESEARCH-researching/ and RESEARCH-gateway/
    │
    └── .archived_runs/                # All archived runs (structure mirrors active folders)
        ├── INTERNAL-archived_runs/
        ├── INBOX-archived_runs/
        └── RESEARCH-archived_runs/
```

---

## 2. Folder Purposes

### Inboxing / Researching (Data Landing Zones)
| Folder | Who writes | What goes in |
|--------|-----------|--------------|
| `INBOX-inboxing/` | **User** | Raw files dropped for the agent to process — PDFs, transcripts, notes, links |
| `RESEARCH-researching/` | **Agent** | Web research results, scraped content, synthesis notes generated autonomously |

> **Rule:** The agent MUST NOT scan `INBOX-inboxing/` or `RESEARCH-researching/` directly for run generation. Items must first be **delivered** (COPIed, never moved) into the corresponding `gateway/` folder.

### Gateway Folders (Pillar Delivery)
The gateway is where the agent sorts and delivers content into **pillar subfolders** before generating planning runs:

- `INBOX-gateway/<Pillar>/` — received copies from `INBOX-inboxing/` routed to this pillar
- `RESEARCH-gateway/<Pillar>/` — received copies from `RESEARCH-researching/` routed to this pillar

> **Copy, never move.** Source files always remain in their origin inboxing/researching folder. The tracker records what was delivered where.

**Planning runs are generated based on what is inside the gateway pillars**, not directly from inboxing/researching.

### Run Folders (PLANNING / EXECUTION)
Each `...-PLANNING_runs/` or `...-EXECUTION_runs/` folder contains individual **run folders**. Each run folder holds:
- The **run YAML file** (the run definition — previously called proposals/cards)
- Optional **artifact files** generated during the run

Run folders are named to match the `run_name` key tracked in the board.

### Tracker YAMLs
| File | Covers |
|------|--------|
| `INBOX-tracker.yaml` | All items in `INBOX-inboxing/` and `INBOX-gateway/` — their delivery status, pillar routing, and action gate used |
| `RESEARCH-tracker.yaml` | All items in `RESEARCH-researching/` and `RESEARCH-gateway/` — same fields |

### Archive Folder
`.archived_runs/` holds all runs that have been archived (after completion or rejection). Structure mirrors the active run folders:
- `INTERNAL-archived_runs/`
- `INBOX-archived_runs/`
- `RESEARCH-archived_runs/`

---

## 3. Run Lifecycle — Status Transitions

Each run is tracked both in the board (under the relevant profile's `PLANNING_runs:` or `EXECUTION_runs:` key) and on disk (in the corresponding run folder).

```
[Agent generates run]
        │
        ▼
  PLANNING (run folder → PLANNING_runs/, board → PLANNING_runs:)
        │
  User reviews
        │
   ┌────┴────┐
 reject    approve
   │          │
   ▼          ▼
rejected   EXECUTION (run folder → EXECUTION_runs/, board → EXECUTION_runs:)
   │          │
   │     [Agent executes]
   │          │
   │       completed
   │          │
   │     User reviews
   │          │
   │        archive
   │          │
   └────► archived (run folder → .archived_runs/<profile>-archived_runs/)
```

**Status vocabulary (board field `status`):**

| Status | Who sets it | What it means |
|--------|------------|---------------|
| `PLANNING` | Agent | Run is fully planned, waiting for user decision |
| `reject` | User | User is signaling rejection (transient — agent processes it) |
| `rejected` | Agent | Run has been archived as rejected |
| `approve` | User | User is approving for execution (transient — agent processes it) |
| `EXECUTION` | Agent | Run is actively being executed |
| `completed` | Agent | Execution finished, waiting for user review |
| `archive` | User | User is signaling archive (transient — agent processes it) |
| `archived` | Agent | Run has been archived after completion |

**Transient statuses** (`reject`, `approve`, `archive`) are user-set signals that the agent detects and processes on its next cycle. The agent then sets the final status (`rejected`, `EXECUTION`, `archived`) and moves the run folder accordingly.

### Board → Folder Movement Rules

| Status change | Board action | Folder action |
|--------------|-------------|---------------|
| Agent completes planning → `PLANNING` | Add `run_name` under profile's `PLANNING_runs:` | Create run folder in `<PROFILE>-PLANNING_runs/` |
| User sets `reject` → agent sets `rejected` | Remove from `PLANNING_runs:`, add header `run_name` in run file | Move folder to `.archived_runs/<PROFILE>-archived_runs/` |
| User sets `approve` → agent sets `EXECUTION` | Remove from `PLANNING_runs:`, add under `EXECUTION_runs:` | Move folder from `PLANNING_runs/` to `EXECUTION_runs/` |
| Agent completes execution → `completed` | Update status in `EXECUTION_runs:` | Run folder stays in `EXECUTION_runs/` |
| User sets `archive` → agent sets `archived` | Remove from `EXECUTION_runs:`, add header `run_name` in run file | Move folder to `.archived_runs/<PROFILE>-archived_runs/` |

> **Archive rule:** When a run is archived (rejected or completed+archived), the `"run_name":` key is moved to the **top of the run YAML file** as a permanent identity header before the file is moved to `.archived_runs/`.

---

## 4. Run Representation in the Board

Every active run is represented under the relevant pipeline and profile in the board:

```yaml
pipelines:
  "pipeline_name":
    profiles:
      INTERNAL:
        runs:
          PLANNING:
            PLANNING_runs:
              "run_name":
                status: PLANNING
                run_summary: string
                focused_pillars: [string]
                focused_objective: all | Link | Fix | Enhance
                action_gates: [string]

          EXECUTION:
            EXECUTION_runs:
              "run_name":
                status: EXECUTION | completed
                run_summary: string
                focused_pillars: [string]
                focused_objective: all | Link | Fix | Enhance
                action_gates: [string]

      INBOX:
        runs:
          PLANNING:
            PLANNING_runs:
              "run_name":
                status: PLANNING
                run_summary: string
                focused_pillars: [string]
                focused_objective: all | Link | Fix | Enhance
                action_gates: [string]
          EXECUTION:
            EXECUTION_runs:
              "run_name":
                status: EXECUTION | completed
                run_summary: string
                focused_pillars: [string]
                focused_objective: all | Link | Fix | Enhance
                action_gates: [string]

      RESEARCH:
        runs:
          PLANNING:
            PLANNING_runs:
              "run_name":
                status: PLANNING
                run_summary: string
                focused_pillars: [string]
                focused_objective: all | Link | Fix | Enhance
                action_gates: [string]
          EXECUTION:
            EXECUTION_runs:
              "run_name":
                status: EXECUTION | completed
                run_summary: string
                focused_pillars: [string]
                focused_objective: all | Link | Fix | Enhance
                action_gates: [string]
```

Archived runs are **removed from the board entirely** — they live only on disk in `.archived_runs/`.

---

## 5. Brain / Runbooks Location

Pipeline logic, runbooks, and identity files are NOT stored in the runtime folder. They live in the pipeline's shared definition:

```
_shared/.shared-pipelines/<PipelineName>/
├── <pipeline>-runbooks/          # All runbooks (Architecture, Workflows, Operational-Rules, etc.)
└── <pipeline>-schemas/           # Schema definitions
```

> **Rule:** The runtime folder (`entity-<pipeline>-runtime/`) is purely **ephemeral execution state** — runs, trackers, and archives. Logic lives in the pipeline definition under `_shared/`.

---

## 6. Tracker YAML Structure

Both `INBOX-tracker.yaml` and `RESEARCH-tracker.yaml` follow the same schema:

```yaml
tracker:
  last_updated: timestamp
  total_items: integer
  items:
    "item_name":
      source_folder: INBOX-inboxing/ | RESEARCH-researching/
      delivered_to:       # Which gateway pillars received a copy
        - pillar: string
          gateway_path: string
          delivered_at: timestamp
      status: pending | delivered | processed
      processed_by_runs: [string]  # run_names that consumed this item
      action_gate_used: string
      focused_pillar: string
      focused_objective: all | Link | Fix | Enhance
```

---

## 7. Automation Boundaries

| Zone | Manager | Rule |
|------|---------|------|
| `INBOX-inboxing/` | **User** | Never scanned autonomously — user-controlled staging only |
| `RESEARCH-researching/` | **Agent** | Agent writes research here; treated as agent-managed |
| `*-gateway/` | **Agent** | Agent routes (COPY) items into pillar subfolders |
| `*-PLANNING_runs/` | **Agent** | Agent creates runs here after planning |
| `*-EXECUTION_runs/` | **Agent** | Agent moves runs here after user approval |
| `.archived_runs/` | **Agent** | Agent archives runs here after user archive signal |
| Trackers | **Agent** | Agent maintains both tracker YAMLs |

---

## 8. Hard Rules

1. **No paths in board** — All folder paths in index only
2. **COPY, never move** from inboxing/researching to gateway — source files are immutable in landing zones
3. **Runs go in run folders** — Each run is a folder, not a loose file
4. **Board + folder in sync** — Every status change updates BOTH the board and moves the folder
5. **Archive header** — `"run_name":` key is promoted to top of run file before archiving
6. **Archived runs leave the board** — Only active runs (PLANNING / EXECUTION / completed) appear in board
7. **Lazy scaffolding** — Profile folders are created on first use, not pre-created
8. **Gateway drives planning** — Runs are generated from gateway pillar content, never directly from inboxing/researching
9. **Tracker accuracy** — Every gateway delivery and run consumption must be logged in the relevant tracker

---

## 9. Cross-Pipeline Rules

| Rule | Description |
|------|-------------|
| **Isolation** | Each pipeline has its own `entity-<pipeline_name>-runtime/` — no cross-pipeline reads/writes |
| **Self-Evolution** | Pipeline runbook changes flow OUT via Scaler INTERNAL pipeline |
| **Board Profiles** | `control.pipelines_control` and `control.toolboxes_control` gate access |
| **Engine Discovery** | Engine scans `_shared/.shared-pipelines/` and populates board |
| **Shared Layout** | All pipelines follow this identical 4-zone pattern: inboxing → gateway → runs → archive |

---

## 10. Quick Reference

| Folder | Profile | Who uses it |
|--------|---------|-------------|
| `INTERNAL-PLANNING_runs/` | INTERNAL | Agent — planning runs for internal audits |
| `INTERNAL-EXECUTION_runs/` | INTERNAL | Agent — executing internal audit runs |
| `INBOX-inboxing/` | INBOX | **User** — drops files here |
| `INBOX-gateway/<Pillar>/` | INBOX | Agent — delivers copies per pillar |
| `INBOX-PLANNING_runs/` | INBOX | Agent — planning runs for inbox-sourced work |
| `INBOX-EXECUTION_runs/` | INBOX | Agent — executing inbox-sourced runs |
| `RESEARCH-researching/` | RESEARCH | Agent — stores web research |
| `RESEARCH-gateway/<Pillar>/` | RESEARCH | Agent — delivers copies per pillar |
| `RESEARCH-PLANNING_runs/` | RESEARCH | Agent — planning runs for research-sourced work |
| `RESEARCH-EXECUTION_runs/` | RESEARCH | Agent — executing research-sourced runs |
| `.archived_runs/` | All | Agent — terminal resting place for rejected/completed runs |

> **Remember:** This architecture is the **contract** between the board (control), the index (paths), the engine (sync), and the runbooks (logic). All four must stay in sync.