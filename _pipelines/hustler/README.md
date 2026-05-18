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
Item lands in .hustler_mixed_inbox/
        │
        ▼
1. Anti-duplication check (content hash) ─── already cascaded? → SKIP
        │
        ▼
2. Quality scoring (H-LAW-015 — agent-judged 5 criteria)
   ≥4 PASS · =3 BORDERLINE · ≤2 REJECTED
        │
        ▼ (PASS or BORDERLINE)
3. Match to existing Focus?
   ├── YES → 4. Match Product? ── YES → 5. Match Feature? ── YES → drop into 00-data/
   │                              │                          │
   │                              │                          NO  → hold in _[product]-discovery/
   │                              │                                until threshold (2 default)
   │                              NO  → hold in _[focus]-discovery/
   │                                    until threshold (3 default)
   NO  → hold in .hustler_mixed_inbox/
         until threshold (5 default)
```

Every move is atomic with the source ledger and the level tracker — see H-LAW-006.

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
| 1 | **Ingestion** | Anti-duplication check + quality scoring + cluster assignment |
| 2 | **Cascading Discovery** | Apply the decision tree; promote when thresholds are met; hold when they aren't |
| 3 | **Definition** | `[new-data]` → `[new-def]`. Read raw data, extract definitions into `[feature].yaml` |
| 4 | **Needs Fulfillment** | `[new-def]` → `[new-needs]` → assets. Either EXTRACT from existing data or SCRAPE (gated) |
| 5 | **Productization** | Validated feature → ROI projection → market research → `HUSTLE-[Market]-[ID]` session |

Full prose in [`Hustler-Workflows.md`](./.hustler_brain/hustler_runbooks/Hustler-Workflows.md).

---

## The granular gateway (H-LAW-013)

The Hustler doesn't have one big "auto vs ask" gate — it has **per-transition profiles** in `CONTROLER.yaml.modes.hustler`:

```yaml
hustler:
  profiles:
    INGESTION:
      action_gate:
        EXECUTION:                          # safe: do them autonomously
          - cascade_into_existing_feature
          - cascade_into_existing_product
        PLANNING:                           # risky: queue for review
          - validate_new_feature
          - validate_new_product
          - validate_new_focus
          - cluster_first_audit
    PROCESSING:
      action_gate:
        EXECUTION:
          - definition_extraction           # Phase 3 Step 2.1
          - tag_transition_new_data_to_processed
          - extract_need_from_processed_data
        PLANNING:
          - scrape_for_data_gap             # Phase 4 SCRAPE — internet write
          - productization_marking          # Phase 5 promotion
```

Auto-cascading one source into an existing feature is low-risk and runs autonomously. Auto-validating a brand-new Focus is a strategic decision that always queues for review, regardless of `work_mode`. Default for unlisted actions: **PLANNING** (safety default).

---

## The 15 H-LAWs (in plain English)

The Hustler is governed by 15 numbered laws. The most important to know:

- **H-LAW-001** — Hustle sessions follow the pattern `HUSTLE-[Market]-[ID]`.
- **H-LAW-002** — No campaign execution without a documented ROI projection. (Value-First Protocol.)
- **H-LAW-003** — Every hustle performs a market research step before building final assets.
- **H-LAW-004** — Cascading thresholds are non-negotiable. No Focus from a single source. Never.
- **H-LAW-006** — Atomic Tracker Update. Every cascade move updates the ledger + tracker + status in one transaction. Failure = explicit rollback (no half-state).
- **H-LAW-013** — Granular per-transition action-gate profiles (the table above).
- **H-LAW-014** — DNA Preservation in Re-Scoping. Retiring a Product preserves dependent features' lineage. Superseding a definition documents what was dropped.
- **H-LAW-015** — **Source Quality Bar (agent-judged).** Sources score against 5 criteria — Recency, Authority, Specificity, Relevance, Completeness. The agent reads the source and judges semantically. Regex/keyword scoring is forbidden.

Full text in [`Hustler-Operational-Rules.md`](./.hustler_brain/hustler_runbooks/Hustler-Operational-Rules.md).

---

## Inside the brain

```
_pipelines/hustler/
├── .hustler_brain/                                # 🧠 logic, routing, runbooks, ledgers
│   ├── HUSTLER_CONTRACTS.yaml                     # pre/post-flight gates
│   ├── hustler_router.yaml                        # localized index
│   ├── hustler_sync.py                            # master substrate sync
│   ├── hustler_runbooks/                          # 6 runbooks:
│   │   ├── Hustler-Architecture.md                #  layout, tracker schemas, lineage graph
│   │   ├── Hustler-Workflows.md                   #  5-phase flow + audit pass
│   │   ├── Hustler-Operational-Rules.md           #  15 H-LAWs
│   │   ├── Hustler-Cascading-Logic.md             #  decision tree + checklist
│   │   ├── Hustler-Tagging-System.md              #  tag taxonomy + transitions
│   │   └── Hustler-Event-Vocabulary.md            #  Hustler-private event names
│   ├── hustler_ledgers/                           # split ledger model:
│   │   ├── [focus].focus_ledger.yaml              #  strategic rollup + market context
│   │   ├── [focus].sources_ledger.yaml            #  per-focus anti-duplication
│   │   └── .hustler_mixed_inbox.ledger.yaml       #  inbox anti-duplication
│   └── .hustler_routing/                          # auto-generated routers
│       ├── hustler_state.yaml                     # live operational state
│       ├── hustler_ledgers.yaml                   # rollup of per-focus ledgers
│       ├── hustler_runtime.yaml                   # runtime infra index
│       └── hustler_sync_engines/                  # sub-syncs
│
├── .hustler_runtime/                              # 🔋 ephemeral
│   ├── .hustler_archive/YYYY-QQ/                  # retired focuses/products/features
│   └── .hustler_scratch/                          # transient drafts
│
├── _HUSTLER-EXTERNAL_SOURCES/                     # 📥 inbound
│   ├── .hustler_mixed_inbox/                      # untyped drops (you put files here)
│   ├── _[focus]_inbox/                            # typed staging per focus
│   ├── [focus]_discoveries/                       # post-cascade typed hubs
│   └── .hustler_USER-SPACE/                       # user-only — Hustler never scans
│
└── [focus-name]/                                  # ✅ a validated Focus folder
    ├── [focus-name]-PRODUCTS.yaml                 # focus-level tracker
    ├── _[focus-name]-discovery/                   # holding for product candidates
    │
    └── [product-name]/                            # ✅ a validated Product folder
        ├── [product-name]-FEATURES.yaml           # product-level tracker
        ├── _[product-name]-discovery/             # holding for feature candidates
        │
        └── [feature-name]/                        # ✅ a validated Feature folder
            ├── [feature-name].yaml                # definitions + needs + tags
            ├── 00-data/                           # raw + scraped data, all tagged
            └── 01-requirements/                   # extracted assets ready for build
```

---

## The lineage graph (Architecture §7.5)

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

## The audit pass (Workflows §7)

The Hustler can audit its own state on demand. Six checks run; findings are categorized as `INFO` / `WARN` / `DRIFT`. Real drift surfaces a remediation message in `hustler_hub.messages`. Runbook fixes escalate to the Scaler INTERNAL pipeline.

| # | Check |
|---|---|
| 1 | Tracker-to-disk consistency |
| 2 | Tag consistency (00-data/ tags match `[product]-FEATURES.yaml`) |
| 3 | Atomic-trio integrity (every cascade move has matching ledger + tracker entries) |
| 4 | Provenance integrity (`[new-scraped]` files carry `<!-- Scraped for: ... -->` headers) |
| 5 | Lineage graph completeness (no orphan features) |
| 6 | Stale focus detection (90+ days idle) |

The Hustler audit is **strictly Hustler-internal**. It never reads from or writes to Scaler ledgers.

---

## 🚀 Triggering a Hustler cycle

```bash
# 1. Make sure the workspace is healthy
./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py

# 2. Drop your sources into the inbox
cp ~/transcripts/*.txt _pipelines/hustler/_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/

# 3. Open CONTROLER.yaml, find the Hustler block, set work_mode + profile
#    The agent reads the inbox on the next cycle, scores each source, and cascades.
```

The first time a new market accumulates 5 quality-passing sources, a Focus folder appears at the pipeline root with a populated focus_ledger and an empty product holding. From there it's pure flow.

---

## Isolation contract

The Hustler **never reaches into the Scaler.** No shared state, no shared event bus, no shared queues. The only thing it borrows from the Scaler is structural pattern (split ledgers, gateway lifecycle, audit pass). Even the event vocabulary is private (`Hustler-Event-Vocabulary.md`).

Self-evolution flows the other way: Hustler discovers a need to change its own runbooks → routes the proposal **out** through the Scaler INTERNAL pipeline. The Hustler does not self-modify.

---

<div align="center">
  <p><em>"Cascade or hold. Quality bar before count. The hierarchy is law."</em></p>
</div>
