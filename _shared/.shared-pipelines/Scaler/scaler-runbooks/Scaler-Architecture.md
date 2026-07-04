# 🏗️ Scaler Architecture

## Objective
Systemic Metabolism. The Scaler pipeline is the **Systemic Growth Engine** of the Agentic OS. Its mission is the continuous evaluation, enhancement, and extension of the workspace scopes. It uses a **5-Phase Execution Approach** (Discovery → Mapping & Tracking → Capability Engineering → Architecting & Proposing → Integration) to identify gaps or ingest external data, map and track them, engineer capabilities, architect runs, and integrate permanent solutions across the entire architecture.

---

## 1. Pipeline Execution Layers

### Global Always-On Layers (used for EVERY task)
- `_system/.system-meta/.system-os_prompts/` — Core identity, routing rules, and execution laws
- `index.yaml` — All paths; never guess paths, always read from here
- `system-board.yaml` — The control plane: modes, profiles, pipeline state, run tracking
- `_shared/.shared-toolboxes/` — Core agentic and extended capabilities. **Toolboxes MUST be used during every pipeline action.**

### Localized Pipeline Layers (paths from index)
- `_shared/.shared-pipelines/Scaler/scaler-runbooks/` — Operational rules and workflows (read before any execution)
- `entity-scaler-runtime/` — The Scaler's physical execution runtime (all folders below live here)

---

## 2. Runtime Folder Structure

The Scaler's entire execution state lives inside one named runtime folder per entity:

```
entity-scaler-runtime/
│
├── INTERNAL-PLANNING_runs/        # Runs in PLANNING phase (INTERNAL profile)
├── INTERNAL-EXECUTION_runs/       # Runs in EXECUTION phase (INTERNAL profile)
│
├── INBOX-inboxing/                # 📥 User drops files here (raw — agent does NOT scan directly)
├── INBOX-gateway/                 # 📦 Agent COPIes from INBOX-inboxing/ into pillar subfolders
│   ├── Foundational_Integrity/
│   ├── Operational_Muscles/
│   └── Value_Generation/
├── INBOX-PLANNING_runs/           # Runs in PLANNING phase (INBOX profile)
├── INBOX-EXECUTION_runs/          # Runs in EXECUTION phase (INBOX profile)
├── INBOX-tracker.yaml             # Tracks all items in INBOX-inboxing/ and INBOX-gateway/
│
├── RESEARCH-researching/          # 🔬 Agent writes web research results here
├── RESEARCH-gateway/              # 📦 Agent COPIes from RESEARCH-researching/ into pillar subfolders
│   ├── Foundational_Integrity/
│   ├── Operational_Muscles/
│   └── Value_Generation/
├── RESEARCH-PLANNING_runs/        # Runs in PLANNING phase (RESEARCH profile)
├── RESEARCH-EXECUTION_runs/       # Runs in EXECUTION phase (RESEARCH profile)
├── RESEARCH-tracker.yaml          # Tracks all items in RESEARCH-researching/ and RESEARCH-gateway/
│
└── .archived_runs/                # Terminal resting place for rejected and archived runs
    ├── INTERNAL-archived_runs/
    ├── INBOX-archived_runs/
    └── RESEARCH-archived_runs/
```

### Folder Purposes

| Folder | Owner | Purpose |
|--------|-------|---------|
| `INBOX-inboxing/` | **User** | User drops files for the agent to process. Agent does NOT scan this directly for runs. |
| `RESEARCH-researching/` | **Agent** | Agent deposits web research, scraped content, synthesis notes. |
| `INBOX-gateway/<Pillar>/` | **Agent** | Copies (never moves) from `INBOX-inboxing/` routed per pillar. Planning runs are generated from here. |
| `RESEARCH-gateway/<Pillar>/` | **Agent** | Copies (never moves) from `RESEARCH-researching/` routed per pillar. |
| `*-PLANNING_runs/` | **Agent** | Fully planned runs awaiting user decision. One folder per run. |
| `*-EXECUTION_runs/` | **Agent** | Approved runs being executed. One folder per run. |
| `.archived_runs/` | **Agent** | Rejected and completed+archived runs. Permanent storage. |

> **COPY, never move.** Source files always stay in `INBOX-inboxing/` or `RESEARCH-researching/`. Only copies go into the gateway pillar subfolders. The tracker records what was delivered where.

> **Gateway drives planning.** Runs are generated based on what is inside `*-gateway/<Pillar>/` folders — not directly from inboxing/researching.

---

## 2.1 Profiles and Execution (auto_mode + plan_first)

Scaler operations are controlled by the active profile set in `system-board.yaml`:

1. **INTERNAL** — Scans internal project ledgers and os_prompts to identify systemic gaps and enhancement opportunities. Uses the `INTERNAL` profile settings for `focused_pillars` and `action_gates`. Runs go into `INTERNAL-PLANNING_runs/` and `INTERNAL-EXECUTION_runs/`.
2. **INBOX** — Processes files the user drops in `INBOX-inboxing/`. Agent delivers (copies) relevant content into `INBOX-gateway/<Pillar>/` subfolders, then generates planning runs from gateway content. Uses the `INBOX` profile settings.
3. **RESEARCH** — Agent proactively researches and writes results into `RESEARCH-researching/`, then delivers copies into `RESEARCH-gateway/<Pillar>/`. Uses the `RESEARCH` profile settings.

Execution relies on the global `control.auto_mode` and `control.plan_first` flags. When `auto_mode` is enabled and `plan_first` is off, actions explicitly permitted by the profile's `action_gates` list proceed immediately. Otherwise, explicit user approval is required.

---

## 3. Run Lifecycle

Every Scaler run is tracked both in `system-board.yaml` and on disk.

```
[Agent completes planning]
        │
        ▼
    PLANNING
(run folder in *-PLANNING_runs/, board entry under profile.runs.PLANNING.PLANNING_runs)
        │
  User reviews → sets status to "approve" or "reject"
        │
   ┌────┴────┐
 reject    approve
   │          │
   ▼          ▼
rejected   EXECUTION
(moved to   (run folder → *-EXECUTION_runs/)
.archived)  (board entry → profile.runs.EXECUTION.EXECUTION_runs)
                │
          [Agent executes]
                │
           completed
           (status updated in board)
                │
          User reviews → sets "archive"
                │
           archived
           (run folder → .archived_runs/<PROFILE>-archived_runs/)
           (removed from board entirely)
```

### Status Vocabulary

| Status | Set by | Meaning |
|--------|--------|---------|
| `PLANNING` | Agent | Run is fully planned, waiting for user decision |
| `reject` | User | Signal to reject (agent processes on next cycle) |
| `rejected` | Agent | Confirmed rejected, moved to archive |
| `approve` | User | Signal to approve (agent processes on next cycle) |
| `EXECUTION` | Agent | Run is actively being executed |
| `completed` | Agent | Execution done, waiting for user review |
| `archive` | User | Signal to archive completed run (agent processes on next cycle) |
| `archived` | Agent | Confirmed archived, moved to `.archived_runs/` |

### Board ↔ Folder Movement

| Status change | Board | Folder |
|--------------|-------|--------|
| Planning complete → `PLANNING` | Add `run_name` under `PLANNING_runs:` | Create folder in `<PROFILE>-PLANNING_runs/` |
| `reject` → `rejected` | Remove from `PLANNING_runs:` | Move to `.archived_runs/<PROFILE>-archived_runs/`; `run_name` key moved to top of run file |
| `approve` → `EXECUTION` | Move to `EXECUTION_runs:` | Move folder from `PLANNING_runs/` to `EXECUTION_runs/` |
| Execution done → `completed` | Update status in `EXECUTION_runs:` | Folder stays in `EXECUTION_runs/` |
| `archive` → `archived` | Remove from `EXECUTION_runs:` | Move to `.archived_runs/<PROFILE>-archived_runs/`; `run_name` key moved to top of run file |

> **Archive rule:** When a run is archived, the `"run_name":` key is moved to the **top of the run YAML file** as a permanent identity header before the folder is moved.

---

## 4. Run Folder Structure

Each run lives in its own folder inside the relevant `*-PLANNING_runs/` or `*-EXECUTION_runs/` directory:

```
INBOX-PLANNING_runs/
└── <run_name>/
    ├── <run_name>.yaml       # The run definition (replaces old Proposal Card / Internal Action Card)
    └── <artifact_files>      # Optional: supporting files generated during planning/execution
```

### Run YAML Schema

```yaml
"<run_name>":
  status: PLANNING | reject | rejected | approve | EXECUTION | completed | archive | archived
  run_summary: string
  focused_pillars: [string]       # which pillars this run targets
  focused_objective: all | Link | Fix | Enhance
  action_gates: [string]          # which action types are permitted autonomously

  # Planning metadata
  profile: INTERNAL | INBOX | RESEARCH
  source_gateway_items:           # what gateway content drove this run (INBOX/RESEARCH only)
    - pillar: string
      item_path: string
  target_files:                   # what the run will modify (for INTERNAL runs)
    - path: string
      action: string              # CREATE | EDIT | MOVE | COPY | DELETE

  # Execution metadata (filled after approval)
  started_at: timestamp
  completed_at: timestamp
  execution_notes: string
```

---

## 5. The Three Pillars

The Scaler maps all work to one or more of the three target pillars:

| Pillar | Scope | Gateway Subfolder |
|--------|-------|-------------------|
| **Foundational_Integrity** | Core architecture, routing, identity laws, OS schemas, pipeline definitions | `*/gateway/Foundational_Integrity/` |
| **Operational_Muscles** | Toolboxes, agents, skills, automation capabilities | `*/gateway/Operational_Muscles/` |
| **Value_Generation** | Monetization strategies, business structures, market opportunities | `*/gateway/Value_Generation/` |

### Pillar → Aspect Mapping (for run targeting)

| Pillar | Valid Aspects |
|--------|--------------|
| `Foundational_Integrity` | `routing_and_syncing`, `identity_rules`, `identity_architecture`, `identity_operational`, `mission_board`, `controller`, `pipeline_scaler`, `pipeline_hustler` |
| `Operational_Muscles` | `identity_capabilities`, `core_toolbox`, `extended_toolbox_engineering`, `extended_toolbox_studio`, `extended_toolbox_life`, `extended_toolbox_business` |
| `Value_Generation` | `extended_toolbox_business`, `identity_architecture` (business structure angle) |

---

## 6. Tracker YAML Schemas

### INBOX-tracker.yaml

```yaml
tracker:
  pipeline: scaler
  last_updated: timestamp
  total_items: integer
  items:
    "<item_name>":
      source_folder: INBOX-inboxing/
      delivered_to:
        - pillar: string
          gateway_path: string
          delivered_at: timestamp
      status: pending | delivered | processed
      processed_by_runs: [string]
      action_gate_used: string
      focused_pillar: string
      focused_objective: all | Link | Fix | Enhance
```

### RESEARCH-tracker.yaml

Same schema as `INBOX-tracker.yaml`, with `source_folder: RESEARCH-researching/`.

---

## 7. Granular Action Gates Behavior

The `action_gates` array in the active profile of `system-board.yaml` controls what the Scaler executes autonomously vs. what requires user approval:

| Condition | Behavior |
|-----------|----------|
| Action type is in `action_gates` AND `plan_first` is off | Proceed autonomously. Run stays in `PLANNING_runs/` only until planning is complete, then auto-moves to `EXECUTION_runs/`. |
| Action type is missing from `action_gates` OR `plan_first` is on | Stop after planning. Post to `review_queue` in board. Await user `approve` signal. |

**Safety default:** If the action type is absent from `action_gates`, always default to requiring user approval.

---

## 8. Brain ↔ Runtime Separation

The Scaler has two completely separate concerns:

| Zone | Location | Contains |
|------|----------|---------|
| **Brain (Logic)** | `_shared/.shared-pipelines/Scaler/scaler-runbooks/` | All runbooks — Architecture, Workflows, Operational-Rules, Discovery-Logic, Gateway. Never modified by agents during execution. |
| **Runtime (State)** | `entity-scaler-runtime/` | All active runs, gateway content, inboxes, trackers, and archived runs. Fully agent-managed. |

> **Rule:** Agents write ONLY to `entity-scaler-runtime/`. Runbooks are read-only during execution. Runbook changes flow via the Scaler's own INTERNAL runs.

---

## 9. Automation Boundaries

### Deterministic Sync (Engine-Managed)
- `system-board.yaml` pipeline state and run tracking
- `index.yaml` rollups for pipeline metrics

### Cognitive Mapping (Agent-Managed — Scripts MUST NOT touch)
- `INBOX-inboxing/` contents — user-managed staging
- `RESEARCH-researching/` contents — agent research deposits
- `*-gateway/<Pillar>/` contents — agent delivery routing
- Run folders in `*-PLANNING_runs/` and `*-EXECUTION_runs/`

---

## 10. Hard Rules

1. **No paths in board** — All folder paths live in `index.yaml` only
2. **COPY never move** — From inboxing/researching to gateway; source files are immutable in landing zones
3. **Gateway drives planning** — Never generate runs directly from `INBOX-inboxing/` or `RESEARCH-researching/`
4. **One run = one folder** — Each run has its own named folder with the run YAML inside
5. **Board + folder must stay in sync** — Every status change updates both simultaneously
6. **Archive header** — `"run_name":` key promoted to top of run file before archiving
7. **Archived runs leave the board** — Only PLANNING, EXECUTION, and completed runs appear in board
8. **Toolboxes mandatory** — Every analysis, planning, and execution action must use a toolbox
9. **Read index, never guess paths** — Always use `index.yaml` to resolve the runtime folder path
10. **Runbooks are read-only at runtime** — Changes to runbooks require their own INTERNAL run
