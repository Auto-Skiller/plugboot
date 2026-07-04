---
metadata:
  name: hustler-cascading-logic
  class: system/runbook
  type: runbook
  version: '2.0'
  schema_version: '2.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-07-04T00:00:00'
credentials:
  description: Hustler cascading decision tree, threshold definitions, cluster-first rule, and validation checklist (aligned with Pipelines_Architecture.md v2.0)
  when_to_use: Read when deciding whether to cascade a signal into an existing focus/product/feature via the INBOX/RESEARCH gateway
  contains: decision_tree, thresholds, cluster_rule, gateway_delivery
---

# 🔍 Hustler Cascading Logic

## Objective
**Purpose:** Consistently route raw market signals through the Focus → Product → Feature hierarchy via cascading threshold checks. This document is the prescriptive decision tree for **Phase 2 (Cascading Discovery)** of every Hustler execution cycle, aligned with the standard pipeline runtime architecture (`entity-hustler-runtime/`).

> **Architecture Alignment**: This runbook aligns with `Pipelines_Architecture.md` and `Hustler-Architecture.md` — the standard runtime layout (`entity-hustler-runtime/`) with profile-based zones (INTERNAL, INBOX, RESEARCH), gateway delivery, and run-based execution. The old `.hustler_runtime/`, `.hustler_mixed_inbox/`, `_HUSTLER-EXTERNAL_SOURCES/` paths are deprecated.

---

## 1. The 5 Boundary Signals (Cascading Inputs)

When evaluating an item in `entity-hustler-runtime/INBOX-gateway/` (or `RESEARCH-gateway/`), apply these 5 signals to determine its routing destination. **Read all 5 together — no single signal is conclusive alone.**

| Signal | What to Look For | What It Means |
|---|---|---|
| **C1 — Direct Focus Match** | Item's content explicitly mentions an existing focus (e.g., "Algeria e-commerce") | ✅ Route to that focus's `_focus-discovery/` |
| **C2 — Product Hint** | Item describes a product or product category that maps to an existing focus's product list | ✅ Route to that product's `_product-discovery/` |
| **C3 — Feature Hint** | Item describes an atomic capability matching an existing feature | ✅ Route directly to that feature's `00-data/` as `[new-data]` |
| **C4 — Thematic Group** | Item shares ecosystem/author/region with multiple unprocessed items but doesn't yet match a validated focus | 🔁 Holding pattern: keep in gateway but tag for clustering with siblings |
| **C5 — Functional Affinity** | Item shares a specific *functional product-shape* with multiple other items (e.g., all are "winning-product-finder" tutorials, all describe "facebook-pixel-setup" workflows), regardless of author/region/ecosystem overlap | 🎯 Treat the affinity cluster as a single proto-Focus / proto-Product / proto-Feature for threshold counting (Cluster-First per §7) |

> **C4 vs C5 Distinction (Matters for Cascade Decisions):**
> Two sources from the same Algerian e-commerce influencer share **C4** (ecosystem/region) but may differ entirely in **C5**: one might be about pricing strategy, the other about ad-creative iteration. Conversely, two sources from totally different authors/regions can share **C5** if they describe the same product-shape (e.g., both are "winning-product-finder" walkthroughs in different markets). **C5 is what justifies merging signals into one threshold count; C4 is what justifies holding them in the same cluster while you wait for more data.** Routing decisions resolve C5 first, then C4.

---

## 2. The Cascading Decision Tree

For every item encountered during **Phase 1 Ingestion → Phase 2 Cascading Discovery** (gateway delivery already complete per `Hustler-Workflows.md §2-3`):

```
Item delivered to INBOX-gateway/ or RESEARCH-gateway/ (tracker status: delivered)
│
├── Check INBOX-tracker.yaml / RESEARCH-tracker.yaml for anti-duplication (H-LAW-006)
│   │
│   ├── YES (hash already logged) → SKIP. Already cascaded. Do nothing.
│   │
│   └── NO → continue:
│       │
│       ├── 1. Check for Matching Focus (in central index.yaml rollups from per-focus ledgers)
│       │   │
│       │   ├── No Matching Focus → check Focus threshold:
│       │   │   ├── Threshold reached → VALIDATE & CREATE new Focus folder at runtime root + trackers + per-focus ledgers
│       │   │   └── Threshold not yet reached → KEEP in gateway focus subfolder (note in tracker)
│       │   │
│       │   └── Matching Focus found → 2. Proceed to Product check:
│       │       │
│       │       ├── No Matching Product → MOVE item to _[focus]-discovery/, then check threshold:
│       │       │   ├── Threshold reached → VALIDATE & CREATE new Product folder + tracker
│       │       │   └── Threshold not yet reached → KEEP in _[focus]-discovery/
│       │       │
│       │       └── Matching Product found → 3. Proceed to Feature check:
│       │           │
│       │           ├── No Matching Feature → MOVE item to _[product]-discovery/, then check threshold:
│       │           │   ├── Threshold reached → VALIDATE & CREATE new Feature folder + 00-data/ + 01-requirements/ + [feature].yaml
│       │           │   └── Threshold not yet reached → KEEP in _[product]-discovery/
│       │           │
│       │           └── Matching Feature found → MOVE item directly into [feature]/00-data/ tagged [new-data]
```

> **Key Difference from Old Model**: Items enter via **gateway subfolders** (`INBOX-gateway/<focus_or_pillar>/`), not from a mixed inbox. The tracker (`INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`) is the single source of truth for delivery status and cascade routing.

---

## 3. Threshold Definitions

The cascading thresholds prevent the directory tree from thrashing. Default thresholds (configurable per Hustler invocation via board profile):

| Level | Default Threshold | Rationale |
|---|---|---|
| **Focus** | 5 distinct sources targeting the same proto-focus | A market segment worth opening folder structure for needs evidence from multiple angles. |
| **Product** | 3 distinct sources within a Focus targeting the same proto-product | Less stringent than Focus — once we trust the segment, we trust narrower product hypotheses faster. |
| **Feature** | 2 distinct sources within a Product targeting the same proto-feature | Lowest threshold — features are the unit of execution; we want to start gathering data quickly. |

> **Quality Bar (H-LAW-015)**: Thresholds are **lower bounds**, not hard maxima. Only sources scoring **≥3/5** on the 5-criteria quality bar (H-LAW-015) count toward thresholds. The Hustler may use semantic-similarity scoring above the quality bar to validate earlier, but **never below the count threshold**.

---

## 4. Anti-Thrashing Rule (H-LAW-004 Enforcement)

The Hustler MUST NEVER:
- Create a Focus from a single source (even if the source seems definitive)
- Skip Product validation by jumping straight from Focus to Feature
- Promote items above their cascade level (e.g., a feature-level signal cannot create a Focus)

**Violation = directory tree fragmentation.** Fragmented hierarchies break the Phase 4 needs-fulfillment workflow because related signals get scattered across unrelated folders.

---

## 5. Selection Criteria — When Match Is Ambiguous

When a signal could plausibly belong to multiple existing focuses/products/features, apply this resolution order:

1. **Specificity wins**: Route to the most specific existing match (Feature > Product > Focus).
2. **Recency wins**: If equally specific, route to the most recently updated tracker (`[focus]-PRODUCTS.yaml` or `[product]-FEATURES.yaml` `last_updated`).
3. **Ambiguous → human gate**: If specificity AND recency tie, hold in gateway subfolder and post a review request in board `review_queue` per H-LAW-013 / H-LAW-011.

---

## 6. Validation & Promotion (Threshold Met)

### 6.0 Cascade-Validation Checklist (Run BEFORE the Promotion Procedure)

Before any of Steps 1–5 below execute, the Hustler MUST tick every box in this checklist. A single unchecked item blocks the promotion.

- [ ] **Threshold count met** for the level being validated (5 / 3 / 2 default per §3).
- [ ] **Quality bar met** (H-LAW-015): at least the threshold count of sources score ≥3/5 on quality criteria.
- [ ] **Signals coherent**: a semantic re-read of all matching sources confirms they truly target the same proto-focus/product/feature (not just keyword overlap).
- [ ] **Atomic trio prepared**: the source tracker update, the level tracker update, and the parent rollup update are staged as one transaction (per `Hustler-Architecture.md §8` Atomic Update Cross-Reference).
- [ ] **Tracker schemas valid**: the new tracker file conforms to the schema in `Hustler-Architecture.md §7`.
- [ ] **No naming conflict**: the proposed focus/product/feature name does not collide with any existing or recently-retired entry (H-LAW-014 lookback).
- [ ] **Action-gate profile evaluated** (H-LAW-013): the `validate_new_focus` / `validate_new_product` / `validate_new_feature` action is in `EXECUTION` for the active phase, OR a review request is staged for `PLANNING`.
- [ ] **Board phase update prepared**: `state.current_phase` will reflect Phase 2 cascade completion atomically with the writes.
- [ ] **Pending review queue acknowledged**: `hustler_hub.messages` for the same focus has no unanswered DRIFT-severity items that block this promotion.
- [ ] **Lineage edge prepared**: the source(s) that triggered the threshold are listed for inclusion in `[focus].focus_ledger.yaml.lineage_graph` (per `Hustler-Architecture.md §9`).

If a box cannot be ticked, the promotion is **deferred**. The sources stay in their current holding folder; a `WARN` entry is added to board `review_queue` describing which check blocked.

### 6.1 Promotion Procedure (Executed Only After Checklist Passes)

When a threshold is met:

1. **Validate** by reading all matching signals end-to-end and confirming the proto-focus/product/feature is coherent.
2. **Create** the folder structure (per `Hustler-Architecture.md §2`):
   - **New Focus**: `[focus-name]/` at the pipeline runtime root + `[focus-name]-PRODUCTS.yaml` (in focus folder); `[focus-name].focus_ledger.yaml` + `[focus-name].sources_ledger.yaml` (in `index.yaml` path); `_[focus-name]-discovery/` (in focus folder); gateway focus subfolder already exists.
   - **New Product**: `[focus]/[product-name]/`, `[product-name]-FEATURES.yaml`, `_[product-name]-discovery/`
   - **New Feature**: `[focus]/[product]/[feature-name]/`, `[feature-name].yaml`, `00-data/`, `01-requirements/`
3. **Move** all matching signals out of holding into the new home (tagged `[new-data]` for feature-level items).
4. **Update** all ledgers atomically per H-LAW-006:
   - The relevant focus's `[focus].sources_ledger.yaml` (the cascade-in record)
   - The relevant focus's `[focus].focus_ledger.yaml` (if a new product/feature was promoted under this focus)
   - The level tracker (`-PRODUCTS.yaml` or `-FEATURES.yaml`)
   - For a brand-new Focus: also create the per-focus split ledger pair
   - **Source tracker** (`INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`): update item `status: cascaded` with `cascaded_to` details
5. **Trigger sync**: Run `engine.py` so central `index.yaml` rollups reflect new totals.

---

## 7. Cluster-First Rule (Cross-Folder Affinity)

When `INBOX-gateway/` or `RESEARCH-gateway/` accumulates many items, cluster them by **functional affinity** before evaluating thresholds:

1. Group items sharing language, market, source platform (e.g., Facebook ads videos in Arabic targeting Algeria).
2. Treat the cluster as a single proto-focus/product/feature for threshold counting.
3. The cluster cascades together as one unit; this prevents related signals from scattering.

This rule mirrors `Scaler-Discovery-Logic.md §4.1` (Cluster-First Rule for Collections) adapted to product-discovery context.

---

## 8. Tracker Integration (Mandatory)

Per `Hustler-Architecture.md §6-7` and `Hustler-Workflows.md §5`, every cascade move MUST update the tracker atomically:

**Source Tracker** (`INBOX-tracker.yaml` or `RESEARCH-tracker.yaml`):
```yaml
items:
  "<item_name>":
    status: cascaded
    cascaded_to:
      level: focus | product | feature
      path: string  # e.g., "algerian-ecommerce/winning-product-finder/facebook-pixel-setup/"
```

**Level Tracker** (`[focus]-PRODUCTS.yaml` or `[product]-FEATURES.yaml`):
- New focus/product/feature entry added with `status: PENDING` → `VALIDATED`

**Focus Ledger** (`[focus].focus_ledger.yaml`):
- Lineage graph edges appended per `Hustler-Architecture.md §9`

**All three updates are a single atomic operation** (H-LAW-006). Partial failure triggers the H-LAW-006 recovery procedure (ABORT → leave source → roll back → log → surface → never auto-retry).