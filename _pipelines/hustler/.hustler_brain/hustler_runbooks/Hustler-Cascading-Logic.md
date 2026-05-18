# 🔍 Hustler Cascading Logic

## Objective
**Purpose:** Consistently route raw signals through the Focus → Product → Feature hierarchy via cascading threshold checks. This document is the prescriptive decision tree for Phase 2 of every Hustler execution cycle.

---

## 1. The 4 Boundary Signals (Cascading Inputs)

When evaluating an item in `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/`, apply these 4 signals to determine its routing destination. Read all 4 together — no single signal is conclusive alone.

| Signal | What to Look For | What It Means |
|---|---|---|
| **C1 — Direct Focus Match** | Item's content explicitly mentions an existing focus (e.g., "Algeria e-commerce") | ✅ Route to that focus's discovery holding |
| **C2 — Product Hint** | Item describes a product or product category that maps to an existing focus's product list | ✅ Route to that product's `_[product]-discovery/` |
| **C3 — Feature Hint** | Item describes an atomic capability matching an existing feature | ✅ Route directly to that feature's `00-data/` as `[new-data]` |
| **C4 — Thematic Group** | Item shares ecosystem/author/region with multiple unprocessed items but doesn't yet match a validated focus | 🔁 Holding pattern: keep in `.hustler_mixed_inbox/` but tag for clustering with siblings |

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
    ├── 1. Check for Matching Focus (in .hustler_routing/hustler_ledgers.yaml.discoveries.focuses)
    │   │
    │   ├── No Matching Focus → check threshold:
    │   │   ├── Threshold reached → VALIDATE & CREATE new Focus folder at pipeline root + tracker + per-focus split ledgers in .hustler_brain/hustler_ledgers/
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

When a threshold is met:
1. **Validate** by reading all matching signals end-to-end and confirming the proto-focus/product/feature is coherent.
2. **Create** the folder structure (per `Hustler-Architecture.md` §2):
   - For a new Focus: `[focus-name]/` at the pipeline root + `[focus-name]-PRODUCTS.yaml` (in focus folder); `[focus-name].focus_ledger.yaml` + `[focus-name].sources_ledger.yaml` (in `.hustler_brain/hustler_ledgers/`); `_[focus-name]-discovery/` (in focus folder).
   - For a new Product: `[focus]/[product-name]/`, `[product-name]-FEATURES.yaml`, `_[product-name]-discovery/`
   - For a new Feature: `[focus]/[product]/[feature-name]/`, `[feature-name].yaml`, `00-data/`, `01-requirements/`
3. **Move** all matching signals out of holding into the new home (tagged `[new-data]` for feature-level items).
4. **Update** all ledgers atomically per H-LAW-006:
   - The relevant focus's `[focus].sources_ledger.yaml` (the cascade-in record)
   - The relevant focus's `[focus].focus_ledger.yaml` (if a new product/feature was promoted under this focus)
   - The level tracker (`-PRODUCTS.yaml` or `-FEATURES.yaml`)
   - For a brand-new Focus: also create the per-focus split ledger pair
5. **Trigger sync**: Run `hustler_sync.py` so `.hustler_routing/hustler_ledgers.yaml` rollup reflects new totals.

---

## 7. Cluster-First Rule (Cross-Folder Affinity)

When `.hustler_mixed_inbox/` accumulates many items, cluster them by **functional affinity** before evaluating thresholds:
1. Group items sharing language, market, source platform (e.g., Facebook ads videos in Arabic targeting Algeria).
2. Treat the cluster as a single proto-focus/product/feature for threshold counting.
3. The cluster cascades together as one unit; this prevents related signals from scattering.

This rule mirrors Scaler-Discovery-Logic.md §4.1 (Cluster-First Rule for Collections) adapted to product-discovery context.
