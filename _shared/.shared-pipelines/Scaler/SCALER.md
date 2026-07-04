<div align="center">
  <h1>⚖️ Scaler — The Systemic Growth Engine</h1>
  <p><em>The pipeline that evolves the OS itself.</em></p>

  <p>
    <a href="#"><img alt="Pipeline" src="https://img.shields.io/badge/Pipeline-Scaler-blue"></a>
    <a href="#"><img alt="Phases" src="https://img.shields.io/badge/Phases-5--phase-purple"></a>
    <a href="#"><img alt="Laws" src="https://img.shields.io/badge/P--LAWs-23-success"></a>
    <a href="#"><img alt="Audit" src="https://img.shields.io/badge/Audit%20Pass-Live-orange"></a>
  </p>
</div>

---

## What the Scaler does

The Scaler is **the OS's metabolism.** It does two things, and only these two:

1. **Ingests external discoveries** — new skills, agents, scripts, design systems, business strategies — and assimilates them into the OS structure without breaking what's already there.
2. **Audits the OS internally** — finds gaps, drift, deprecated logic, missing components — and proposes solutions through a strict gateway.

Every output of the Scaler — without exception — passes through a **Run** (planning + execution) before it touches anything. There is no direct path from "I see something interesting" to "I changed the workspace." The gateway (run planning → user approval → execution) is the law.

---

## Why you'd use it

If you're tired of:

- Agents inventing new folder structures every cycle
- Logic getting silently overwritten when a "better" version arrives
- Sync failures leaving the workspace in a half-state with no rollback
- Discoveries getting lost between sessions
- The router pointing at files that no longer exist

…then the Scaler is the answer. Specifically:

| Pain point | How Scaler closes it |
|---|---|
| Folder thrashing | Three fixed pillars: `Foundational_Integrity`, `Operational_Muscles`, `Value_Generation`. Every output routes to one. New scopes require explicit user approval. |
| Logic erasure | **DNA Preservation Laws** (`Scaler-Discovery-Logic.md §7` / `Scaler-Operational-Rules.md` P-LAW-012) — UPGRADEs must merge, not replace. Old logic moves to archive, never deleted. |
| Sync half-state | **Atomic Trio Recovery** (P-LAW-019) — every operation writes 3 stores in one transaction. Partial failures roll back automatically. |
| Lost discoveries | **Tracker YAMLs** (`INBOX-tracker.yaml`, `RESEARCH-tracker.yaml`) for anti-duplication, plus per-pillar gateway folders with functional groups. |
| Stale router | **Sync engine** aggregates decentralized metrics on every run. Freshness contracts on every localized OS file catch drift at the next cycle. |
| Untracked drift | **Audit Pass** (`Scaler-Workflows.md §8`) — 7 checks run on demand, surface drift, auto-draft remediation INTERNAL runs. |

---

## The 5-phase flow

```
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │ 1. Discovery │ →  │ 2. Mapping & │ →  │ 3. Capability│ →  │ 4. Architect │ →  │ 5. Integrate │
   │   /Delivery  │    │   Tracking   │    │ Engineering  │    │   & Plan     │    │   (Execute)  │
   └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        │                     │                    │                  │                    │
   Gateway delivery    Strategic           Build helper       Draft planning       Apply changes,
   from inboxing/      Interrogation +     logic in            run in               sync routers,
   researching →       Cluster-First +     scratch.            <PROFILE>-           archive run.
   gateway pillars     Aspect mapping.                        PLANNING_runs/
                       Mode-aware gate.
```

Full prose lives in [`scaler-runbooks/Scaler-Workflows.md`](scaler-runbooks/Scaler-Workflows.md).

---

## Three execution profiles

### INTERNAL — fixing the OS itself
The Scaler audits its own substrate (OS prompts, runbooks, sync engines, schemas, toolboxes) and drafts **planning runs** in `INTERNAL-PLANNING_runs/` to fix what it finds. This is how the Scaler evolves *itself* — through the same run lifecycle it uses for external work.

### INBOX — assimilating user-dropped files
Items land in `entity-scaler-runtime/INBOX-inboxing/` (user drops). The agent delivers (copies) items into `INBOX-gateway/<Pillar>/` subfolders, then runs the **Cluster Intake Protocol** (`Scaler-Discovery-Logic.md §3`):
1. **Classification** — resolves which pillar(s) the item benefits. Single utility → COPY to one pillar's gateway; orthogonal utilities → COPY into N pillars (multi-pillar fan-out per P-LAW-021). Strong-source-identity items (>5 items / structural complexity / size / cross-reference coherence) get rejected to `entity-scaler-runtime/.complex_inboxes/<source-name>/` for human triage (P-LAW-022).
2. **Categorisation** — drops each pillar-resolved item into a **functional group** inside the gateway pillar folder. Groups are functional (named by what items DO), same-pillar-only, with optional unbounded sub-grouping.
3. **Drafts a planning run** in `INBOX-PLANNING_runs/<run_name>/`. Bounded by **DNA Preservation** (`Scaler-Discovery-Logic.md §7`): Foundational_Integrity is strict-preservation (Tier 1); Operational_Muscles and Value_Generation are permissive growth zones (Tier 2).
4. **Match-to-Pending** check (P-LAW-023): if a pending run already covers the same target, fold the new item via `MERGE_WITH_PENDING` and re-audit under DNA Preservation.
5. Either auto-integrates (EXECUTION mode) or queues for review (PLANNING mode), per the active profile's `action_gates`.

### RESEARCH — assimilating agent web research
Agent proactively researches and writes results into `entity-scaler-runtime/RESEARCH-researching/`, then delivers copies into `RESEARCH-gateway/<Pillar>/`. Same flow as INBOX from there.

---

## The granular gateway (P-LAW-018)

Most pipelines have one big "auto vs ask" toggle. The Scaler has **per-integration-type profiles** in `system-board.yaml` under `pipelines.scaler.profiles`:

```yaml
pipelines:
  scaler:
    profiles:
      INTERNAL:    # scanning internal project ledgers and os_prompts
        runs:
          PLANNING:
            action_gates: [FULL]
          EXECUTION:
            action_gates: [FULL]
      INBOX:       # user-dropped files
        gateway_delivery:
          status: on
        runs:
          PLANNING:
            action_gates: []
          EXECUTION:
            action_gates: []
      RESEARCH:    # agent web research
        gateway_delivery:
          status: on
        researching:
          status: on
        runs:
          PLANNING:
            action_gates: []
          EXECUTION:
            action_gates: []
```

This means an internal sync-engine fix runs autonomously while an external skill ingestion always asks first — same agent, same cycle, different risk profile.

---

## The 7 integration types

| Type | When it fires |
|---|---|
| `INJECT_INTO_EXISTING` | Discovery adds content into an existing file. Smallest footprint. |
| `REPLACE_OR_UPGRADE` | Discovery is a strictly superior version of something that already exists. Triggers DNA Preservation Laws. |
| `BUILD_NEW_COMPONENT` | No matching target exists; a brand-new file/folder is created. |
| `EXTEND_EXISTING_SYSTEM` | Adds a sibling component to an existing system without touching the existing one. |
| `RESTRUCTURE_ARCHITECTURE` | Reorganizes folder structure or naming. **Always requires user approval, regardless of mode.** |
| `MIGRATE_AND_REPOSITION` | Content is in the wrong place; move it. |
| `MERGE_WITH_PENDING` | A pending run already exists; extend it instead of duplicating. |

Tie-breaking when two types are equally plausible follows a strict order — see [`Scaler-Discovery-Logic.md §3.4`](scaler-runbooks/Scaler-Discovery-Logic.md).

---

## Inside the brain

The Scaler's logic lives in `_shared/.shared-pipelines/Scaler/scaler-runbooks/`:

```
scaler-runbooks/
├── SCALER_CONTRACTS.yaml         # pre/post-flight gates
├── Scaler-Architecture.md        # Structural rules & runtime layout
├── Scaler-Discovery-Logic.md     # Intake protocol (Classification + Categorisation)
├── Scaler-Event-Vocabulary.md    # Event structure
├── Scaler-Gateway.md             # Run lifecycle (gateway)
├── Scaler-Operational-Rules.md   # 23 P-LAWs
└── Scaler-Workflows.md           # 5-Phase execution flow
```

---

## Runtime folder structure (per entity)

When the Scaler executes inside an entity (system or project), it uses **one named runtime folder**:

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

> **Key Rules:**
> - **COPY, never move** from `INBOX-inboxing/` or `RESEARCH-researching/` to gateway — source files are immutable in landing zones
> - **Gateway drives planning** — Runs are generated from gateway pillar content, never directly from inboxing/researching
> - **One run = one folder** — Each run has its own named folder with `<run_name>.yaml` + optional artifacts
> - **Board + folder in sync** — Every status change updates BOTH the board and moves the folder
> - **Archive header** — `run_name:` key promoted to top of run file before archiving
> - **Archived runs leave the board** — Only PLANNING, EXECUTION, and completed runs appear in board

---

## The 14 aspects

Every Run carries a `focused_pillars[]` and targets specific `aspects`. The 14 aspects are the OS's structural vocabulary:

`routing_and_syncing` · `identity_rules` · `identity_architecture` · `identity_capabilities` · `identity_operational` · `core_toolbox` · `extended_toolbox_business` · `extended_toolbox_engineering` · `extended_toolbox_life` · `extended_toolbox_studio` · `mission_board` · `controller` · `pipeline_scaler` · `pipeline_hustler`

A run that touches both `routing_and_syncing` AND `pipeline_scaler` is required to declare both. Single-aspect runs are reserved for genuinely single-aspect work.

---

## The 23 P-LAWs (in plain English)

The Scaler is governed by 23 numbered prevention laws (P-LAW-001 through P-LAW-023). The most important to know:

- **P-LAW-001** — Atomic Ledger Update. Run creation and tracker entry happen in the same operation, or neither happens.
- **P-LAW-008** — Mandatory Runbook Immersion. The agent reads all 6 runbooks before any cycle. No exceptions.
- **P-LAW-011** — Mandatory Archiving. Archived runs move to `.archived_runs/<PROFILE>-archived_runs/` immediately. The active gateway holds only pending work.
- **P-LAW-018** — Mode-Specific Configuration Profile. The action gate is per-integration-type, not global. Default is PLANNING when in doubt.
- **P-LAW-019** — Atomic Trio Recovery. If any of the 3 atomic writes fails, abort and roll back the others. Never leave half-state.
- **P-LAW-020** — Artifact Provenance Markers. Every file the Scaler creates carries a `<!-- Generated by: RUN-... -->` header. Provenance survives run archival.
- **P-LAW-021** — Multi-Pillar Fan-Out. A source with orthogonal utilities copies into N pillars, each with its own `extracted_concern`. Single-utility items copy (source stays).
- **P-LAW-022** — Strong-Source-Identity Rejection. Coherent ecosystem bundles (>5 items / structural complexity / size) get rejected to `.complex_inboxes/` for human triage.
- **P-LAW-023** — Match-to-Pending Folding. Before drafting a new run, check if a pending run covers the same target — fold via `MERGE_WITH_PENDING` instead of duplicating.

Full text in [`Scaler-Operational-Rules.md`](scaler-runbooks/Scaler-Operational-Rules.md).

---

## 🚀 Triggering a Scaler cycle

```bash
# 1. Make sure the workspace is healthy
python .infra/backend/engine.py --sync

# 2. Drop your discovery into the inbox
cp my_new_skill.md _system/.system-pipelines_runtime/entity-scaler-runtime/INBOX-inboxing/

# 3. Set the Scaler profile to INBOX in system-board.yaml
#    The Scaler runs the next cycle and routes the item via Utility-First Classification.
```

---

## Multi-session safety

The Scaler inherits the OS-level concurrency model (sync engine v5.4):

- **Advisory file locking** — `.stash/pids/engine.pid` with stale-detection. No two agents write to shared state simultaneously.
- **Atomic YAML writes** — all state mutations use `tmp + os.replace` via `safe_write.py`. No half-written files.
- **Freshness contracts & Ledger Sync** — every board and index is stamped with `last_synced` on every sync. Deep tracking uses localized ledgers that enforce a strict **State vs Metadata** split: the daemon forces the `state` to match physical files exactly (Zero Drift), while using `metadata.metrics` to bounce telemetry up to the OS board.
- **Progress provenance** — `last_progress_at` only stamps when progress actually changes, preventing false-freshness from engine rewrites.
- **Schema allow-list** — board keys not in `board.schema.yaml` are swept on every cycle. The Scaler's telemetry rollup is engine-derived and never hand-edited.

---

<div align="center">
  <p><em>"Assimilation without corruption. Evolution through strategy. Drift caught, never ignored."</em></p>
</div>