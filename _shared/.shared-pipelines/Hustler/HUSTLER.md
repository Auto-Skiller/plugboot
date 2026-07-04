<div align="center">
  <h1>💼 Hustler — The Product Discovery Engine</h1>
  <p><em>The pipeline that turns raw market signals into validated products.</em></p>

  <p>
    <a href="#"><img alt="Pipeline" src="https://img.shields.io/badge/Pipeline-Hustler-purple"></a>
    <a href="#"><img alt="Hierarchy" src="https://img.shields.io/badge/Hierarchy-Focus%20%E2%86%92%20Product%20%E2%86%92%20Feature-blue"></a>
    <a href="#"><img alt="Laws" src="https://img.shields.io/badge/H--LAWs-15-success"></a>
    <a href="#"><img alt="Quality" src="https://img.shields.io/badge/Quality--bar-Agent%20judged-orange"></a>
  </p>
</div>

---

## What the Hustler does

You drop raw market signals into an inbox — YouTube transcripts, ad screenshots, PDF reports, blog posts, scraped pages — and the Hustler **cascades them down a hierarchy** until they land where they belong:

```
   Focus  →  Product  →  Feature
  (market    (deliverable    (atomic
   segment)   concept)       capability)
```

Each level has a **threshold check** (default: 5/3/2 sources). Single-source signals never validate a Focus. Five low-credibility ads can't unlock a Product. Quality is agent-judged, not regex-matched. By the time something becomes a `[feature]/` folder with a `[feature].yaml`, you have evidence — not vibes.

Full processing then happens **inside the feature**: raw data becomes definitions, definitions become needs, needs become extracted assets, and the feature exits into a productization run.

---

## Why you'd use it

| Without Hustler | With Hustler |
|---|---|
| 23 random files in a folder named "ideas" | A focus folder per market with strategic context (currency, language, payment, delivery) and a per-focus lineage graph |
| Three competing "winning product finder" notes nobody connects | One validated Product folder with all 5 supporting sources, threshold-counted and quality-bar-checked |
| Forgetting which file is processed and which isn't | Every file in `00-data/` carries exactly one of `[new-data]` / `[processed-data]` / `[new-scraped]`. Tag transitions are atomic and irreversible |
| "Was this fact already learned?" "Probably?" | Anti-duplication via content-hash on every cascade move |
| Productization based on hunches | A Productization phase that demands ROI projection (H-LAW-002), market sanity check (H-LAW-003), and DNA preservation when re-scoping (H-LAW-014) |

---

## The cascading decision tree

The Hustler's gating mechanism **is** the cascade — there's no separate gateway runbook. Threshold checks at each tier are the gate.

```
Item lands in entity-hustler-runtime/INBOX-inboxing/
        │
        ▼
1. Gateway Delivery → COPY into INBOX-gateway/<focus_or_pillar>/
   Anti-duplication check (content hash via INBOX-tracker.yaml)
   Quality scoring (H-LAW-015 — agent-judged 5 criteria)
   ≥4 PASS · =3 BORDERLINE · ≤2 REJECTED
        │
        ▼ (PASS or BORDERLINE)
2. Match to existing Focus? (via index.yaml rollups from per-focus ledgers)
   ├── YES → 3. Match Product? ── YES → 4. Match Feature? ── YES → drop into 00-data/ as [new-data]
   │                              │                          │
   │                              │                          NO  → hold in _[product]-discovery/
   │                              │                                until threshold (2 default)
   │                              NO  → hold in _[focus]-discovery/
   │                                    until threshold (3 default)
   NO  → hold in INBOX-gateway/ (or RESEARCH-gateway/)
         until threshold (5 default)
```

Every move is atomic with the source tracker and the level tracker — see H-LAW-006.

---

## The 5 boundary signals (C1–C5)

When deciding where a source belongs, the agent reads it and matches against:

| Signal | Test |
|---|---|
| **C1 — Direct Focus Match** | Source mentions an existing focus by name |
| **C2 — Product Hint** | Source describes an existing product or product category |
| **C3 — Feature Hint** | Source describes an existing atomic capability |
| **C4 — Thematic Group** | Same ecosystem/author/region as accumulating siblings — holds for cluster maturity |
| **C5 — Functional Affinity** | Same product-shape (e.g., "winning-product-finder") regardless of author/region — the strongest signal for cluster-first promotion |

Routing decisions resolve **C5 first, then C4** — functional affinity outranks ecosystem affinity for threshold counting.

---

## The 5-phase flow

| # | Phase | What happens |
|---|---|---|
| 1 | **Ingestion** | Gateway delivery from `INBOX-inboxing/` → `INBOX-gateway/` + quality scoring + anti-duplication |
| 2 | **Cascading Discovery** | Apply the decision tree; promote when thresholds are met; hold when they aren't |
| 3 | **Definition** | `[new-data]` → `[new-def]`. Read raw data, extract definitions into `[feature].yaml` |
| 4 | **Needs Fulfillment** | `[new-def]` → `[new-needs]` → assets. Either EXTRACT from existing data or SCRAPE (gated) |
| 5 | **Productization** | Validated feature → ROI projection → market research → `HUSTLE-[Market]-[ID]` session |

Full prose in [`hustler-runbooks/Hustler-Workflows.md`](hustler-runbooks/Hustler-Workflows.md).

---

## The granular gateway (H-LAW-013)

The Hustler doesn't have one big "auto vs ask" gate — it has **per-transition profiles** in `system-board.yaml` under `pipelines.hustler.profiles`:

```yaml
pipelines:
  hustler:
    profiles:
      INTERNAL:    # scanning internal project ledgers and os_prompts
        runs:
          PLANNING:
            action_gates: []
          EXECUTION:
            action_gates: []
      INBOX:       # user-dropped market signals
        gateway_delivery:
          status: on
        runs:
          PLANNING:
            action_gates: []
          EXECUTION:
            action_gates:
              - cascade_into_existing_feature
              - cascade_into_existing_product
              - definition_extraction
              - tag_transition_new_data_to_processed
              - extract_need_from_processed_data
      RESEARCH:    # agent web research
        gateway_delivery:
          status: on
        researching:
          status: on
        runs:
          PLANNING:
            action_gates: []
          EXECUTION:
            action_gates:
              - cascade_into_existing_feature
              - cascade_into_existing_product
              - definition_extraction
              - tag_transition_new_data_to_processed
              - extract_need_from_processed_data
```

Auto-cascading one source into an existing feature is low-risk and runs autonomously. Auto-validating a brand-new Focus is a strategic decision that always queues for review, regardless of `auto_mode`. Default for unlisted actions: **PLANNING** (safety default).

---

## The 15 H-LAWs (in plain English)

The Hustler is governed by 15 numbered laws. The most important to know:

- **H-LAW-001** — Hustle sessions follow the pattern `HUSTLE-[Market]-[ID]`.
- **H-LAW-002** — No campaign execution without a documented ROI projection. (Value-First Protocol.)
- **H-LAW-003** — Every hustle performs a market research step before building final assets.
- **H-LAW-004** — Cascading thresholds are non-negotiable. No Focus from a single source. Never.
- **H-LAW-006** — Atomic Tracker Update. Every cascade move updates the tracker + ledger + status in one transaction. Failure = explicit rollback (no half-state).
- **H-LAW-013** — Granular per-transition action-gate profiles (the table above).
- **H-LAW-014** — DNA Preservation in Re-Scoping. Retiring a Product preserves dependent features' lineage. Superseding a definition documents what was dropped.
- **H-LAW-015** — **Source Quality Bar (agent-judged).** Sources score against 5 criteria — Recency, Authority, Specificity, Relevance, Completeness. The agent reads the source and judges semantically. Regex/keyword scoring is forbidden.

Full text in [`Hustler-Operational-Rules.md`](hustler-runbooks/Hustler-Operational-Rules.md).

---

## Inside the brain

The Hustler's logic lives in `_shared/.shared-pipelines/Hustler/hustler-runbooks/`:

```
hustler-runbooks/
├── HUSTLER_CONTRACTS.yaml          # pre/post-flight gates
├── Hustler-Architecture.md         # Layout, tracker schemas, lineage graph
├── Hustler-Workflows.md            # 5-Phase flow + Audit Pass
├── Hustler-Operational-Rules.md    # 15 H-LAWs
├── Hustler-Cascading-Logic.md      # Decision tree + validation checklist
├── Hustler-Tagging-System.md       # Tag taxonomy + transitions
└── Hustler-Event-Vocabulary.md     # Hustler-private event names
```

---

## Runtime folder structure (per entity)

When the Hustler executes inside an entity (system or project), it uses **one named runtime folder**:

```
entity-hustler-runtime/
│
├── INTERNAL-PLANNING_runs/        # Runs in PLANNING phase (INTERNAL profile)
├── INTERNAL-EXECUTION_runs/       # Runs in EXECUTION phase (INTERNAL profile)
│
├── INBOX-inboxing/                # 📥 User drops market signals here (raw — agent does NOT process directly)
├── INBOX-gateway/                 # 📦 Agent COPIes from INBOX-inboxing/ into focus/pillar subfolders
│   ├── <focus_or_pillar_A>/
│   ├── <focus_or_pillar_B>/
│   └── ...
├── INBOX-PLANNING_runs/           # Runs in PLANNING phase (INBOX profile) — strategic runs only
├── INBOX-EXECUTION_runs/          # Runs in EXECUTION phase (INBOX profile)
├── INBOX-tracker.yaml             # Tracks all items in INBOX-inboxing/ and INBOX-gateway/
│
├── RESEARCH-researching/          # 🔬 Agent writes web research results here
├── RESEARCH-gateway/              # 📦 Agent COPIes from RESEARCH-researching/ into focus subfolders
│   ├── <focus_or_pillar_A>/
│   └── ...
├── RESEARCH-PLANNING_runs/        # Runs in PLANNING phase (RESEARCH profile) — strategic runs only
├── RESEARCH-EXECUTION_runs/       # Runs in EXECUTION phase (RESEARCH profile)
├── RESEARCH-tracker.yaml          # Tracks all items in RESEARCH-researching/ and RESEARCH-gateway/
│
├── .archived_runs/                # Terminal resting place for rejected and archived runs
│   ├── INTERNAL-archived_runs/
│   ├── INBOX-archived_runs/
│   └── RESEARCH-archived_runs/
│
└── [focus-name]/                  # ✅ Validated Focus folder (CASCADE workspace — built here)
    ├── [focus-name]-PRODUCTS.yaml
    ├── _[focus-name]-discovery/   # Holding for product candidates
    └── [product-name]/            # ✅ Validated Product folder
        ├── [product-name]-FEATURES.yaml
        ├── _[product-name]-discovery/
        └── [feature-name]/        # ✅ Validated Feature folder
            ├── [feature-name].yaml
            ├── 00-data/           # Raw + scraped data (tagged)
            └── 01-requirements/   # Extracted assets ready for build
```

> **Two separate concerns co-exist in `entity-hustler-runtime/`:**
> 1. **Profile-based Runs** — INTERNAL/INBOX/RESEARCH runs using the planning/execution folder model.
> 2. **Cascade Workspace** — The validated Focus → Product → Feature hierarchy built through the cascading discovery process.
>
> These are independent. A cascading cycle (Phases 1-5) does not create "runs" in the run folders — it builds the hierarchy directly. Run folders are only for strategic planning actions above the cascade level (e.g., re-scoping a Focus, planning a productization push).
>
> **Key Rules:**
> - **COPY, never move** from `INBOX-inboxing/` or `RESEARCH-researching/` to gateway — source files immutable in landing zones
> - **Gateway drives planning** — Strategic runs are generated from gateway content, never directly from inboxing/researching
> - **Standard cascade ≠ runs** — Phase 1-5 cascading builds hierarchy directly; run folders are for strategic planning only
> - **Board + folder in sync** — Every status change updates both simultaneously
> - **Archive header** — `run_name:` key promoted to top of run file before archiving
> - **Archived runs leave the board** — Only PLANNING, EXECUTION, and completed runs in board

---

## The lineage graph (Architecture §9)

Every focus carries a `lineage_graph` block recording the full source → feature → product → productization path. Per-focus only — no cross-focus edges. When a `[new-def]` contradicts an old one, you can trace back to the original source files. When a Focus is retired, you know exactly which Products inherit from which sources.

```yaml
# Inside [focus].focus_ledger.yaml
lineage_graph:
  nodes:
    sources: [...]           # ingested files with quality scores
    features: [...]          # validated atomic capabilities
    products: [...]          # validated deliverable concepts
    productizations: [...]   # opened HUSTLE-* sessions
  edges:
    - {from: SRC-..., to: FEAT-..., kind: CASCADED_INTO, ...}
    - {from: FEAT-..., to: PROD-..., kind: BELONGS_TO, ...}
    - {from: FEAT-old, to: FEAT-new, kind: SUPERSEDED_BY, coverage_map: ...}
    - {from: PROD-..., to: HUST-..., kind: PRODUCTIZED_AS, ...}
```

---

## The audit pass (Workflows §8)

The Hustler can audit its own state on demand. Six checks run; findings are categorized as `INFO` / `WARN` / `DRIFT`. Real drift surfaces a remediation message in `hustler_hub.messages`. Runbook fixes escalate to the Scaler INTERNAL pipeline.

| # | Check |
|---|---|
| 1 | Tracker-to-disk consistency |
| 2 | Tag consistency (00-data/ tags match `[product]-FEATURES.yaml`) |
| 3 | Atomic-trio integrity (every cascade move has matching tracker entries) |
| 4 | Provenance integrity (`[new-scraped]` files carry `<!-- Scraped for: ... -->` headers) |
| 5 | Lineage graph completeness (no orphan features) |
| 6 | Stale focus detection (90+ days idle) |

The Hustler audit is **strictly Hustler-internal**. It never reads from or writes to Scaler ledgers.

---

## 🚀 Triggering a Hustler cycle

```bash
# 1. Make sure the workspace is healthy
python .infra/backend/engine.py --sync

# 2. Drop your sources into the inbox
cp ~/transcripts/*.txt _system/.system-pipelines_runtime/entity-hustler-runtime/INBOX-inboxing/

# 3. Set the Hustler profile to INBOX in system-board.yaml
#    The agent reads the inbox on the next cycle, scores each source, and cascades.
```

The first time a new market accumulates 5 quality-passing sources, a Focus folder appears at the pipeline root with a populated focus_ledger and an empty product holding. From there it's pure flow.

---

## Multi-session safety

The Hustler inherits the OS-level concurrency model (sync engine v5.4):

- **Advisory file locking** — `.stash/pids/engine.pid` with stale-detection. No two agents write to shared state simultaneously.
- **Atomic YAML writes** — all state mutations use `tmp + os.replace` via `safe_write.py`. No half-written files.
- **Freshness contracts & Ledger Sync** — every board and index is stamped with `last_synced` on every sync. Deep tracking uses localized ledgers that enforce a strict **State vs Metadata** split: the daemon forces the `state` to match physical files exactly (Zero Drift), while using `metadata.metrics` to bounce telemetry up to the OS board.
- **Progress provenance** — `last_progress_at` only stamps when progress actually changes, preventing false-freshness from engine rewrites.
- **Schema allow-list** — board keys not in `board.schema.yaml` are swept on every cycle. The Hustler's telemetry rollup is engine-derived and never hand-edited.

---

## Isolation contract

The Hustler **never reaches into the Scaler.** No shared state, no shared event bus, no shared queues. The only thing it borrows from the Scaler is structural pattern (split ledgers, gateway lifecycle, audit pass). Even the event vocabulary is private (`Hustler-Event-Vocabulary.md`).

Self-evolution flows the other way: Hustler discovers a need to change its own runbooks → routes the proposal **out** through the Scaler INTERNAL pipeline. The Hustler does not self-modify.

---

<div align="center">
  <p><em>"Cascade or hold. Quality bar before count. The hierarchy is law."</em></p>
</div>