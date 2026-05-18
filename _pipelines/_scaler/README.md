<div align="center">
  <h1>⚖️ Scaler — The Systemic Growth Engine</h1>
  <p><em>The pipeline that evolves the OS itself.</em></p>

  <p>
    <a href="#"><img alt="Pipeline" src="https://img.shields.io/badge/Pipeline-Scaler-blue"></a>
    <a href="#"><img alt="Phases" src="https://img.shields.io/badge/Phases-5--phase-purple"></a>
    <a href="#"><img alt="Laws" src="https://img.shields.io/badge/P--LAWs-20-success"></a>
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
| Stale router | **Sync engine v5.3** rebuilds `meta_router.yaml` from disk on every run. Drift gets caught at the next cycle. |
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

Full prose lives in [`_pipelines/_scaler/.scaler_brain/scaler_runbooks/Scaler-Workflows.md`](./.scaler_brain/scaler_runbooks/Scaler-Workflows.md).

---

## Two execution paths

### EXTERNAL — assimilating new things
Items land in `_SCALER-EXTERNAL_SOURCES/` (via `.scaler_mixed_inbox/` or typed `_[Pillar]_inbox/` folders). The Scaler:

1. Routes them to the correct typed discovery hub.
2. Applies **Discovery Boundary Logic** (5 signals — entry file, sub-folders, sibling similarity, thematic grouping, functional affinity) to decide depth (D / SD / SSD).
3. Maps them to the right pillar via **Utility-First Routing**.
4. Drafts a **Proposal Card** in `[Pillar]_external_proposals/`.
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

Tie-breaking when two types are equally plausible follows a strict order — see [`Scaler-Discovery-Logic.md §3.4`](./.scaler_brain/scaler_runbooks/Scaler-Discovery-Logic.md).

---

## Inside the brain

```
_pipelines/_scaler/
├── .scaler_brain/                                # 🧠 logic, routing, runbooks, ledgers
│   ├── SCALER_CONTRACTS.yaml                     # pre/post-flight gates
│   ├── scaler_router.yaml                        # localized index
│   ├── scaler_sync.py                            # master substrate sync
│   ├── scaler_runbooks/                          # 6 runbooks (Architecture, Workflows,
│   │                                             #  Operational-Rules, Gateway,
│   │                                             #  Discovery-Logic, Event-Vocabulary)
│   ├── scaler_ledgers/                           # split ledgers per pillar:
│   │                                             #  sources_ledger (anti-dup) +
│   │                                             #  proposals_ledger (gateway audit)
│   └── .scaler_routing/                          # auto-generated component routers
│       ├── scaler_state.yaml                     # live operational state (single source)
│       ├── scaler_ledgers.yaml                   # rollup of per-pillar ledgers
│       ├── scaler_runtime.yaml                   # runtime infrastructure index
│       └── scaler_sync_engines/                  # sub-syncs
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

## The 20 P-LAWs (in plain English)

The Scaler is governed by 20 numbered prevention laws. The most important to know:

- **P-LAW-001** — Atomic Ledger Update. Card creation and ledger entry happen in the same operation, or neither happens.
- **P-LAW-008** — Mandatory Runbook Immersion. The agent reads all 5 (now 6) runbooks before any cycle. No exceptions.
- **P-LAW-011** — Mandatory Archiving. Integrated cards move to `.scaler_archive/YYYY-QQ/` immediately. The active gateway holds only pending work.
- **P-LAW-018** — Mode-Specific Configuration Profile. The action gate is per-integration-type, not global. Default is PLANNING when in doubt.
- **P-LAW-019** — Atomic Trio Recovery. If any of the 3 atomic writes fails, abort and roll back the others. Never leave half-state.
- **P-LAW-020** — Artifact Provenance Markers. Every file the Scaler creates carries a `<!-- Generated by: PROP-... -->` header. Provenance survives card archival.

Full text in [`Scaler-Operational-Rules.md`](./.scaler_brain/scaler_runbooks/Scaler-Operational-Rules.md).

---

## 🚀 Triggering a Scaler cycle

```bash
# 1. Make sure the workspace is healthy
./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py
# → "[!] Sync Complete." Health: 100%

# 2. Drop your discovery into the right inbox
cp my_new_skill.md _pipelines/_scaler/_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/

# 3. Open CONTROLER.yaml and set the goal
#    The Scaler runs the next cycle and routes the item via Utility-First.
```

---

<div align="center">
  <p><em>"Assimilation without corruption. Evolution through strategy. Drift caught, never ignored."</em></p>
</div>
