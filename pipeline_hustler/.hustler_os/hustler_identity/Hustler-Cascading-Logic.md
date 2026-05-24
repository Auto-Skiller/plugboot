# 🔍 Hustler Cascading Logic

## Objective
**Purpose:** Consistently route raw signals through the Focus → Product → Feature hierarchy via cascading threshold checks. This document is the prescriptive decision tree for Phase 2 of every Hustler execution cycle.

---

## 1. The 5 Boundary Signals (Cascading Inputs)

When evaluating an item in `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/`, apply these 5 signals to determine its routing destination. Read all 5 together — no single signal is conclusive alone.

| Signal | What to Look For | What It Means |
|---|---|---|
| **C1 — Direct Focus Match** | Item's content explicitly mentions an existing focus (e.g., "Algeria e-commerce") | ✅ Route to that focus's discovery holding |
| **C2 — Product Hint** | Item describes a product or product category that maps to an existing focus's product list | ✅ Route to that product's `_[product]-discovery/` |
| **C3 — Feature Hint** | Item describes an atomic capability matching an existing feature | ✅ Route directly to that feature's `00-data/` as `[new-data]` |
| **C4 — Thematic Group** | Item shares ecosystem/author/region with multiple unprocessed items but doesn't yet match a validated focus | 🔁 Holding pattern: keep in `.hustler_mixed_inbox/` but tag for clustering with siblings |
| **C5 — Functional Affinity** | Item shares a specific *functional product-shape* with multiple other items (e.g., all are "winning-product-finder" tutorials, all describe "facebook-pixel-setup" workflows), regardless of author/region/ecosystem overlap | 🎯 Treat the affinity cluster as a single proto-Focus / proto-Product / proto-Feature for threshold counting (Cluster-First per §7) |

> **C4 vs C5 distinction (matters for cascade decisions):** Two sources from the same Algerian e-commerce influencer share **C4** (ecosystem/region) but may differ entirely in **C5**: one might be about pricing strategy, the other about ad-creative iteration. Conversely, two sources from totally different authors/regions can share **C5** if they describe the same product-shape (e.g., both are "winning-product-finder" walkthroughs in different markets). C5 is what justifies merging signals into one threshold count; C4 is what justifies holding them in the same cluster while you wait for more data. Routing decisions resolve C5 first, then C4.

---

## 2. The Cascading Decision Tree

For every item encountered during Phase 1 ingestion (preserved from the original `discovery.md` with explicit branch labels):

```
Is item already in .hustler_mixed_inbox.ledger.yaml? (anti-duplication via H-LAW-007)
│
├── YES → SKIP. Already cascaded. Do nothing.
│
└── NO → continue:
    │
    ├── 1. Check for Matching Focus (in central .db/ rollups)
    │   │
    │   ├── No Matching Focus → check threshold:
    │   │   ├── Threshold reached → VALIDATE & CREATE new Focus folder at pipeline root + tracker + per-focus split ledgers in .hustler_db/
    │   │   └── Threshold not yet reached → KEEP in _HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/ (note in ledger)
    │   │
    │   └── Matching Focus found → 2. Proceed to Product check:
    │       │
    │       ├── No Matching Product → MOVE item to _[focus]-discovery/, then check threshold:
    │       │   ├── Threshold reached → VALIDATE & CREATE new Product folder + tracker
    │       │   └── Threshold not yet reached → KEEP in _[focus]-discovery/
    │       │
    │       └── Matching Product found → 3. Proceed to Feature check:
    │           │
    │           ├── No Matching Feature → MOVE item to _[product]-discovery/, then check threshold:
    │           │   ├── Threshold reached → VALIDATE & CREATE new Feature folder + 00-data/ + 01-requirements/ + [feature].yaml
    │           │   └── Threshold not yet reached → KEEP in _[product]-discovery/
    │           │
    │           └── Matching Feature found → MOVE item directly into [feature]/00-data/ tagged [new-data]
```

---

## 3. Threshold Definitions

The cascading thresholds prevent the directory tree from thrashing. Default thresholds (configurable per Hustler invocation):

| Level | Default Threshold | Rationale |
|---|---|---|
| **Focus** | 5 distinct sources targeting the same proto-focus | A market segment worth opening folder structure for needs evidence from multiple angles. |
| **Product** | 3 distinct sources within a Focus targeting the same proto-product | Less stringent than Focus — once we trust the segment, we trust narrower product hypotheses faster. |
| **Feature** | 2 distinct sources within a Product targeting the same proto-feature | Lowest threshold — features are the unit of execution; we want to start gathering data quickly. |

> Thresholds are **lower bounds**, not hard maxima. The Hustler may also use semantic-similarity scoring above a quality bar to validate earlier, but never below the count threshold.

---

## 4. Anti-Thrashing Rule (H-LAW-004 enforcement)

The Hustler MUST NEVER:
- Create a Focus from a single source (even if the source seems definitive)
- Skip Product validation by jumping straight from Focus to Feature
- Promote items above their cascade level (e.g., a feature-level signal cannot create a Focus)

Violation = directory tree fragmentation. Fragmented hierarchies break the Phase 4 needs-fulfillment workflow because related signals get scattered across unrelated folders.

---

## 5. Selection Criteria — When Match is Ambiguous

When a signal could plausibly belong to multiple existing focuses/products/features, apply this resolution order:

1. **Specificity wins**: Route to the most specific existing match (Feature > Product > Focus).
2. **Recency wins**: If equally specific, route to the most recently updated tracker.
3. **Ambiguous → human gate**: If specificity AND recency tie, hold in `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/` and post a review request in `communication_hubs.hustler_hub.messages` per H-LAW-011.

---

## 6. Validation & Promotion (Threshold Met)

### 6.0 Cascade-Validation Checklist (run BEFORE the promotion procedure)

Before any of Steps 1-5 below execute, the Hustler MUST tick every box in this checklist. A single unchecked item blocks the promotion. (Conceptual mirror of `Scaler-Gateway.md §3 Card Validation Checklist`, adapted to the cascade model.)

- [ ] **Threshold count met** for the level being validated (5 / 3 / 2 default per §3).
- [ ] **Quality bar met** (H-LAW-015): at least the threshold count of sources score ≥3/5 on quality criteria.
- [ ] **Signals coherent**: a semantic re-read of all matching sources confirms they truly target the same proto-focus/product/feature (not just keyword overlap).
- [ ] **Atomic trio prepared**: the source ledger update, the level tracker update, and the parent rollup update are staged as one transaction (per `Hustler-Architecture.md §7.4`).
- [ ] **Tracker schemas valid**: the new tracker file conforms to the schema in `Hustler-Architecture.md §7.1 / §7.2 / §7.3`.
- [ ] **No naming conflict**: the proposed focus/product/feature name does not collide with any existing or recently-retired entry (H-LAW-014 lookback).
- [ ] **Action-gate profile evaluated** (H-LAW-013): the `validate_new_focus` / `validate_new_product` / `validate_new_feature` action is in EXECUTION for the active phase, OR a review request is staged for PLANNING.
- [ ] **`.meta_os/meta_db/pipeline_hustler_os.yaml` phase update prepared**: `state.current_phase` will reflect Phase 2 cascade completion atomically with the writes.
- [ ] **Pending review queue acknowledged**: `hustler_hub.messages` for the same focus has no unanswered DRIFT-severity items that block this promotion.
- [ ] **Lineage edge prepared**: the source(s) that triggered the threshold are listed for inclusion in `[focus].focus_ledger.yaml.lineage_graph` (per `Hustler-Architecture.md §7.5`).

If a box cannot be ticked, the promotion is **deferred**. The sources stay in their current holding folder; a `WARN` entry is added to `hustler_hub.messages` describing which check blocked.

### 6.1 Promotion Procedure (executed only after the checklist passes)

When a threshold is met:
1. **Validate** by reading all matching signals end-to-end and confirming the proto-focus/product/feature is coherent.
2. **Create** the folder structure (per `Hustler-Architecture.md` §2):
   - For a new Focus: `[focus-name]/` at the pipeline root + `[focus-name]-PRODUCTS.yaml` (in focus folder); `[focus-name].focus_ledger.yaml` + `[focus-name].sources_ledger.yaml` (in `.hustler_db/`); `_[focus-name]-discovery/` (in focus folder); `_[focus-name]_inbox/` (in `_HUSTLER-EXTERNAL_SOURCES/`).
   - For a new Product: `[focus]/[product-name]/`, `[product-name]-FEATURES.yaml`, `_[product-name]-discovery/`
   - For a new Feature: `[focus]/[product]/[feature-name]/`, `[feature-name].yaml`, `00-data/`, `01-requirements/`
3. **Move** all matching signals out of holding into the new home (tagged `[new-data]` for feature-level items).
4. **Update** all ledgers atomically per H-LAW-006:
   - The relevant focus's `[focus].sources_ledger.yaml` (the cascade-in record)
   - The relevant focus's `[focus].focus_ledger.yaml` (if a new product/feature was promoted under this focus)
   - The level tracker (`-PRODUCTS.yaml` or `-FEATURES.yaml`)
   - For a brand-new Focus: also create the per-focus split ledger pair
5. **Trigger sync**: Run `.meta/engine/meta_sync.py` so central `.db/` rollups reflect new totals.

---

## 7. Cluster-First Rule (Cross-Folder Affinity)

When `.hustler_mixed_inbox/` accumulates many items, cluster them by **functional affinity** before evaluating thresholds:
1. Group items sharing language, market, source platform (e.g., Facebook ads videos in Arabic targeting Algeria).
2. Treat the cluster as a single proto-focus/product/feature for threshold counting.
3. The cluster cascades together as one unit; this prevents related signals from scattering.

This rule mirrors Scaler-Discovery-Logic.md §4.1 (Cluster-First Rule for Collections) adapted to product-discovery context.
