---
metadata:
  pipeline_role: "Systemic Growth Engine: Evolves the OS itself via external assimilation and internal audits."
---

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

Every output of the Scaler — without exception — passes through a **Proposal Card** or an **Internal Action Card** before it touches anything. There is no direct path from "I see something interesting" to "I changed the workspace." The gateway is the law.

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
| Logic erasure | **DNA Preservation Laws** (Discovery-Logic §3.3) — UPGRADEs must merge, not replace. Old logic moves to `_archive/`, never deleted. |
| Sync half-state | **Atomic Trio Recovery** (P-LAW-019) — every operation writes 3 stores in one transaction. Partial failures roll back automatically. |
| Lost discoveries | **Per-pillar split ledgers** (`sources_ledger` for anti-duplication, `proposals_ledger` for audit trail). Plus `.scaler_mixed_inbox.ledger.yaml` for items en route. |
| Stale router | **Sync engine v5.4** rebuilds `meta_router.yaml` from disk on every run. Freshness contracts on every router (including inner pipeline files) catch drift at the next cycle. |
| Untracked drift | **Audit Pass** (Workflows §7) — 6 checks run on demand, surface drift, auto-draft remediation Mega-YAMLs. |

---

## The 5-phase flow

```
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │ 1. Discovery │ →  │ 2. Mapping & │ →  │ 3. Capability│ →  │ 4. Proposing │ →  │ 5. Integrate │
   │              │    │    Tracking  │    │  Engineering │    │  (Gateway)   │    │              │
   └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        │                     │                    │                  │                    │
   Scan inbox &        Strategic           Build helper       Draft Proposal       Apply changes,
   typed hubs          Interrogation +     logic in            or Action Card      sync routers,
   for new items.      Cluster-First +     scratch.            via gateway.        archive card.
                       Aspect mapping.                         Mode-aware gate.
```

Full prose lives in [`pipeline_scaler/.scaler_identity/Scaler-Workflows.md`](./.scaler_identity/Scaler-Workflows.md).

---

## Two execution paths

### EXTERNAL — assimilating new things
Items land in `_SCALER-EXTERNAL_SOURCES/` (via `.scaler_mixed_inbox/` or typed `_[Pillar]_inbox/` folders). The Scaler runs the **Cluster Intake Protocol** (`Scaler-Discovery-Logic.md §3`):

1. **Classification** — resolves which pillar(s) the item benefits. Single utility → MOVE to one pillar; orthogonal utilities → COPY into N pillars (multi-pillar fan-out per P-LAW-021). Strong-source-identity items (>5 items / structural complexity / size / cross-reference coherence) get rejected to `.scaler_USER-SPACE/.complex_inboxes/<source-name>/` for human triage (P-LAW-022).
2. **Categorisation** — drops each pillar-resolved item into a **functional group** inside `<Pillar>_discoveries/`. Groups are functional (named by what items DO), same-pillar-only, with optional unbounded sub-grouping. Group folders are scaffolded lazily on first item.
3. **Drafts a Proposal Card** in `[Pillar]_external_proposals/`. Bounded by **LAW-005 DNA Preservation** (External-only, two-tier): Foundational_Integrity is strict-preservation; Operational_Muscles and Value_Generation are permissive growth zones.
4. **Match-to-Pending** check (P-LAW-023): if a pending proposal already covers the same target, fold the new item via `MERGE_WITH_PENDING` and re-audit under LAW-005.
5. Either auto-integrates (EXECUTION mode) or queues for review (PLANNING mode), per the active CONTROLER profile.

### INTERNAL — fixing the OS itself
The Scaler can audit its own substrate and draft **Internal Action Cards** (Mega-YAMLs) in `[Pillar]_internal_proposals/` to fix what it finds. This is how the Scaler evolves *itself* — runbooks, sync engines, schemas, identity files — through the same gateway it uses for external work.

---

## The granular gateway (P-LAW-018)

Most pipelines have one big "auto vs ask" toggle. The Scaler has **per-integration-type profiles** in `CONTROLER.yaml.modes.scaler`:

```yaml
scaler:
  profiles:
    INTERNAL:
      action_gate:
        EXECUTION: [FULL]      # internal audits run autonomously
        PLANNING: []
    EXTERNAL:
      action_gate:
        EXECUTION: []
        PLANNING: [FULL]       # external work always queues for review
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
| `MERGE_WITH_PENDING` | A pending proposal already exists; extend it instead of duplicating. |

Tie-breaking when two types are equally plausible follows a strict order — see [`Scaler-Discovery-Logic.md §3.4`](./.scaler_identity/Scaler-Discovery-Logic.md).

---

## Inside the brain

```
pipeline_scaler/
├── .scaler_identity/                             # 🧠 logic, routing, runbooks
│   ├── SCALER_CONTRACTS.yaml                     # pre/post-flight gates
│   ├── Scaler-Architecture.md                    # Structural rules
│   ├── Scaler-Discovery-Logic.md                 # Intake protocol
│   ├── Scaler-Event-Vocabulary.md                # Event structure
│   ├── Scaler-Gateway.md                         # Proposal checks
│   ├── Scaler-Operational-Rules.md               # Pipeline laws
│   └── Scaler-Workflows.md                       # Execution flow
│
├── .scaler_db/                                   # 🗃️ tracking databases
│   ├── .scaler_db_shemas_db/                     # Strict schema definitions
│   └── *.sources.yaml / *.proposals.yaml         # per-pillar ledger state
│
├── .scaler_milestones/                           # 🎯 active and completed goals
│
├── .scaler_runtime/                              # 🔋 ephemeral
│   ├── .scaler_archive/YYYY-QQ/                  # integrated cards, date-bucketed
│   └── .scaler_scratch/                          # transient drafts
│
├── _SCALER-EXTERNAL_SOURCES/                     # 📥 inbound
│   ├── _Foundational_Integrity_inbox/
│   ├── _Operational_Muscles_inbox/
│   ├── _Value_Generation_inbox/
│   ├── .scaler_mixed_inbox/                      # untyped drops
│   ├── Foundational_Integrity_discoveries/
│   ├── Operational_Muscles_discoveries/
│   ├── Value_Generation_discoveries/
│   └── .scaler_USER-SPACE/                       # user-only — Scaler never scans
│
├── Foundational_Integrity_external_proposals/    # 🚪 gateway folders (flat, at root)
├── Foundational_Integrity_internal_proposals/
├── Operational_Muscles_external_proposals/
├── Operational_Muscles_internal_proposals/
├── Value_Generation_external_proposals/
└── Value_Generation_internal_proposals/
```

---

## The 14 aspects

Every Proposal/Action Card carries a `primary_aspect` and a list of all `aspects` it touches. The 14 aspects are the OS's structural vocabulary:

`routing_and_syncing` · `identity_rules` · `identity_architecture` · `identity_capabilities` · `identity_operational` · `core_toolbox` · `extended_toolbox_business` · `extended_toolbox_engineering` · `extended_toolbox_life` · `extended_toolbox_studio` · `mission_board` · `controller` · `pipeline_scaler` · `pipeline_hustler`

A discovery that touches both `routing_and_syncing` AND `pipeline_scaler` is required to declare both. Single-aspect cards are reserved for genuinely single-aspect work.

---

## The 23 P-LAWs (in plain English)

The Scaler is governed by 23 numbered prevention laws (P-LAW-001 through P-LAW-023). The most important to know:

- **P-LAW-001** — Atomic Ledger Update. Card creation and ledger entry happen in the same operation, or neither happens.
- **P-LAW-008** — Mandatory Runbook Immersion. The agent reads all 6 runbooks before any cycle. No exceptions.
- **P-LAW-011** — Mandatory Archiving. Integrated cards move to `.scaler_archive/YYYY-QQ/` immediately. The active gateway holds only pending work.
- **P-LAW-018** — Mode-Specific Configuration Profile. The action gate is per-integration-type, not global. Default is PLANNING when in doubt.
- **P-LAW-019** — Atomic Trio Recovery. If any of the 3 atomic writes fails, abort and roll back the others. Never leave half-state.
- **P-LAW-020** — Artifact Provenance Markers. Every file the Scaler creates carries a `<!-- Generated by: PROP-... -->` header. Provenance survives card archival.
- **P-LAW-021** — Multi-Pillar Fan-Out. A source with orthogonal utilities copies into N pillars, each with its own `extracted_concern`. Single-utility items move.
- **P-LAW-022** — Strong-Source-Identity Rejection. Coherent ecosystem bundles (>5 items / structural complexity / size) get rejected to `.complex_inboxes/` for human triage.
- **P-LAW-023** — Match-to-Pending Folding. Before drafting a new card, check if a pending proposal covers the same target — fold via `MERGE_WITH_PENDING` instead of duplicating.

Full text in [`Scaler-Operational-Rules.md`](./.scaler_identity/Scaler-Operational-Rules.md).

---

## 🚀 Triggering a Scaler cycle

```bash
# 1. Make sure the workspace is healthy
./_os/venv/meta_run.sh _os/engine/meta_sync.py
# → "[!] Sync Complete." Health: 100%

# 2. Drop your discovery into the right inbox
cp my_new_skill.md pipeline_scaler/_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/

# 3. Open CONTROLER.yaml and set the goal
#    The Scaler runs the next cycle and routes the item via Utility-First.
```

---

## Multi-session safety

The Scaler inherits the OS-level concurrency model (sync engine v5.4):

- **Advisory file locking** — `.sync.lock` with stale-detection (`sync_lock_stale_seconds: 120`). No two agents write to shared state simultaneously.
- **Atomic YAML writes** — all state mutations use `tmp + os.replace` via the shared `atomic_io.py` module. No half-written files.
- **Freshness contracts** — every inner routing file (`.scaler_routing/scaler_state.yaml`, `scaler_ledgers.yaml`, `scaler_runtime.yaml`) is stamped with `last_synced / fresh_until / status` on every sync. `master --validate` audits them.
- **Progress provenance** — `last_progress_at` only stamps when progress actually changes, preventing false-freshness from engine rewrites.
- **Schema allow-list** — CONTROLER keys not in `BOOT_CONTRACTS.controler_schema` are swept on every cycle. The Scaler's telemetry rollup (`CONTROLER.telemetry.pipelines.scaler`) is engine-derived and never hand-edited.

---

<div align="center">
  <p><em>"Assimilation without corruption. Evolution through strategy. Drift caught, never ignored."</em></p>
</div>
