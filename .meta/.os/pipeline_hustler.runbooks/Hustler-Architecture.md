---
metadata:
  name: hustler-architecture
  class: system/runbook
  type: runbook
  version: '1.0'
  schema_version: '1.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-06-27T00:00:00'
credentials:
  description: Three-tier Focus-Product-Feature hierarchy, tracker system, automation
    boundaries, and brain/runtime/workspace separation
  when_to_use: Read to understand the Hustler pipeline structure, hierarchy, and placement
    rules
  contains: hierarchy, tracker_system, automation
---

# 🏗️ Hustler Architecture

## Objective
**Purpose:** Cascading Product Discovery. The Hustler pipeline is the **product-discovery and requirements engine** of the Agentic OS. It ingests raw market signals (videos, articles, screenshots, PDFs, scraped pages), cascades them through a Focus → Product → Feature hierarchy, processes them into structured definitions and needs, and surfaces validated product opportunities ready for monetization.

> **No separate Gateway runbook by design.** Unlike the Scaler (which uses `Scaler-Gateway.md` to gate every output through a Proposal/Internal Action card), the Hustler's gating mechanism IS the cascade itself — threshold checks at Focus / Product / Feature levels. Self-evolution of the Hustler runbooks flows OUT via the Scaler `INTERNAL` pipeline (see `Hustler-Operational-Rules.md` §5).

---

## 1. Pipeline Execution Layers

The Hustler pipeline strictly utilizes the global "Always-On" top-layer alongside localized pipeline layers:

### Global Always-On Layers (used for EVERY task)
- `.meta/.os/.system.identity/`: Core identity, routing rules, and execution flow.
- `index.yaml`: Central nervous system maps — all execution paths start here.
- `.db/.system.board.yaml`: High-level configuration, scope modes, and session tracking.
- `.meta/milestones/`: Active session and goal operation tracking.
- `.db/pipeline_hustler.board.yaml`: The localized DB configuration file in `.db/` — absolute tracking point for the pipeline state.
- `.meta/toolboxes/`: Core agentic and extended capabilities. Use specific toolboxes for analytics, planning, content extraction.

### Localized Pipeline Layers (Mapped via meta_router)
- `hustler_runbooks/`: Operational rules, workflows, cascading logic, tagging system. Strictly read before any Hustler execution.
- `.hustler_runtime/`: Local execution environment, scratch files, and archive for the Hustler.
- `hustler_ledgers/`: Centralized tracking ledgers — state, master discoveries rollup, anti-duplication.

---

## 2. Directory Architecture

```
pipeline_hustler/
├── .hustler_os/hustler_identity/                                # 🧠 LOGIC, ROUTING & RUNBOOKS
│   ├── `HUSTLER_CONTRACTS.yaml`                   # (deprecated - merged into identity)
│   │
│   ├── hustler_runbooks/                          # 📚 Operational identity (5 files)
│   │   ├── Hustler-Architecture.md                # Layout, hierarchy (this file)
│   │   ├── Hustler-Workflows.md                   # 5-Phase execution approach
│   │   ├── Hustler-Operational-Rules.md           # 12 H-LAWs
│   │   ├── Hustler-Cascading-Logic.md             # Cascading discovery decision tree
│   │   └── Hustler-Tagging-System.md              # Tag taxonomy + processing playbook
│   │
│   ├── hustler_ledgers/                           # 📋 Centralized state tracking (split-ledger model)
│   │   ├── [focus].focus_ledger.yaml              # Per-focus strategic rollup (products/features + market context)
│   │   ├── [focus].sources_ledger.yaml            # Per-focus anti-duplication for inbound cascades
│   │   └── .hustler_mixed_inbox.ledger.yaml       # Anti-duplication for .hustler_mixed_inbox/
│   │
│   └── .hustler_os/hustler_db/                             # 🗂️ Centralized tracking ledgers
│       ├── `[focus].focus_ledger.yaml`              # Per-focus strategic rollup
│       ├── `[focus].sources_ledger.yaml`            # Per-focus anti-duplication
│       └── `.hustler_mixed_inbox.ledger.yaml`       # Anti-duplication for .hustler_mixed_inbox/
│
├── .hustler_runtime/                              # 🔋 EPHEMERAL RUNTIME
│   ├── .hustler_archive/                          # Integrated cards by quarter: YYYY-QQ/[TYPE]-[Pillar]-[CardID].yaml
│   └── .hustler_scratch/                          # Temporary working files
│
├── _HUSTLER-EXTERNAL_SOURCES/                     # 📥 INCOMING DATA (holding only)
│   ├── .hustler_mixed_inbox/                      # User-drop holding (23 sources await cascade)
│   │   └── [unprocessed-source-1.txt, ...]
│   ├── _[focus]_inbox/                            # Focus-specific staging inboxes
│   └── .hustler_USER-SPACE/                       # User-only zone (Hustler MUST NOT scan)
│
└── [focus-name]/                                  # ✅ A VALIDATED Focus folder (sibling to .hustler_os/hustler_identity/)
    ├── [focus-name]-PRODUCTS.yaml                 # Focus-level tracker of all products
    ├── _[focus-name]-discovery/                   # Focus product discovery & ranking holding
    │
    └── [product-name]/                            # ✅ A VALIDATED Product folder
        ├── [product-name]-FEATURES.yaml           # Product-level tracker of all features
        ├── _[product-name]-discovery/             # Product feature discovery & ranking holding
        │
        └── [feature-name]/                        # ✅ A VALIDATED Feature folder
            ├── [feature-name].yaml                # Feature-level definitions, needs, tracking
            ├── 00-data/                           # Phase 1: Storage for raw/scraped data
            └── 01-requirements/                   # Phase 4: Extracted assets/files for needs
```

> **Lazy scaffolding (H12 closure).** A focus folder at the pipeline root starts as `.gitkeep` only. Its sub-trees (`[focus]-PRODUCTS.yaml`, `_[focus]-discovery/`, validated `[product]/` subfolders, `[feature]/` subfolders, `00-data/`, `01-requirements/`) are scaffolded **lazily** by the cascade engine as thresholds validate. An empty focus folder is the valid baseline state. The brain's per-focus split ledgers (`[focus].focus_ledger.yaml` + `[focus].sources_ledger.yaml`) exist BEFORE the focus is populated, so the rollup can already track the focus during Phase 2 cascade.

> **Note on the layout:** The validated focus folder lives **at the pipeline root** (sibling to `.hustler_os/hustler_identity/`). All Phase 3-5 build work happens here. Tracking lives separately in `.hustler_os/hustler_db/[focus].focus_ledger.yaml` (strategic) + `[focus].sources_ledger.yaml` (anti-duplication). The brain tracks; the root focus folder builds.

---

## 3. The Three-Tier Hierarchy: Focus → Product → Feature

### 3.1 Focus
A validated *market segment* worth pursuing. Created when raw signals consistently point to a coherent niche.
- Threshold: cascading discovery sees ≥ N (configurable per Hustler) signals matching the same proto-focus before validation.
- Example: `algerian-ecommerce/` represents the Algeria-region e-commerce market segment.

### 3.2 Product
A validated *deliverable concept* within a Focus. Created when signals within a Focus consistently point to a specific product idea.
- Threshold: ≥ N signals for the same product-shape inside an existing Focus.
- Example: `algerian-ecommerce/winning-product-finder/` would be a product idea inside that focus.

### 3.3 Feature
A validated *atomic capability* within a Product. The unit of execution work. Holds raw data (`00-data/`), extracted requirements (`01-requirements/`), and the per-feature tracker.
- Threshold: ≥ N signals for the same feature-shape inside an existing Product.
- Example: `winning-product-finder/facebook-ads-pixel-setup/` would be one feature.

---

## 4. The Tracker System

The system uses `.yaml` files at multiple levels (the original `.yalm` typo from v1.0 is corrected). Each tracker surfaces status tags so higher-level routers can detect work pending below.

| Tracker | Tracks | Surfaces |
|---|---|---|
| The global `.meta/engine/meta_sync.py` engine aggregates totals into central `.db/` rollups | All validated focuses + master aggregates | Total focuses/products/features counts, pending in `.hustler_mixed_inbox/` |
| `[focus]-PRODUCTS.yaml` (in focus folder at pipeline root) | All validated Products under a Focus | Focus-level tags; flags pending product validation |
| `[focus].focus_ledger.yaml` (in `.hustler_os/hustler_db/`) | Per-focus strategic rollup — products/features + market context | Products + features per focus, currency/language/delivery/payment context |
| `[focus].sources_ledger.yaml` (in `.hustler_os/hustler_db/`) | Per-focus anti-duplication tracker for inbound cascades | Content hashes of sources cascaded into the focus |
| `.hustler_mixed_inbox.ledger.yaml` | Items in `.hustler_mixed_inbox/` awaiting cascade | Pending count, cascaded count |
| `[product]-FEATURES.yaml` | All validated Features under a Product | Feature-level status tags `[new-def]`, `[new-needs]` |
| `[feature].yaml` | Feature-specific definitions, needs, tags | Item-level tags |

---

## 5. Brain ↔ Runtime ↔ Workspace Separation

| Layer | Purpose | Contains | Does NOT contain |
|---|---|---|---|
| `.hustler_os/hustler_identity/` | **Logic, routing, runbooks** | Runbooks, state configurations | Active discoveries, scraped data, ephemeral files |
| `.hustler_runtime/` | **Ephemeral runtime** | `.hustler_archive/`, `.hustler_scratch/` | System rules, mission tracking, market data |
| `_HUSTLER-EXTERNAL_SOURCES/` | **Inbound holding** | Inboxes, user-space zone | Validated focuses, build work |
| `[focus]/` (at pipeline root) | **Active build workspace** | Validated focus folder where products/features get built | System rules, raw inboxes, sync engines |

---

## 6. Lifecycle of a Source

```
1. User drops file in _HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/
        ↓
2. .hustler_mixed_inbox.ledger.yaml records content hash (anti-duplication)
        ↓
3. Phase 1 Ingestion → Hustler reads source, prepares for cascade
        ↓
4. Phase 2 Cascading Discovery → Focus check → Product check → Feature check
        ↓
5. Source lands in [focus]/[product]/[feature]/00-data/ tagged [new-data]
        (validated focus folder lives at pipeline root)
        ↓
6. Phase 3 Definition → [new-data] → [new-def] in [feature].yaml
        ↓
7. Phase 4 Needs Fulfillment → [new-def] → [new-needs] → assets in 01-requirements/
        ↓
8. Phase 5 Productization → validated feature → ready for monetization
```

Full phase logic lives in `Hustler-Workflows.md`. Cascading rules in `Hustler-Cascading-Logic.md`. Tag transitions in `Hustler-Tagging-System.md`.

---

## 7. Tracker Schemas (H5 closure)

When the cascade engine validates a Focus / Product / Feature and creates its tracker, it MUST produce these exact YAML shapes. The Hustler-Cascading-Logic.md §6 promotion procedure references this section as the canonical schema source.

### 7.1 `[focus]-PRODUCTS.yaml` — Focus-level tracker
Lives at the focus folder root: `pipeline_hustler/[focus]/[focus]-PRODUCTS.yaml`.

```yaml
name: [focus_id]_products
metadata:
  type: focus_products
  focus_id: [focus_id]
  description: "Focus-level tracker of all products under [focus_id]."
  schema_version: "1.0"
  last_updated: "<ISO 8601>"

state:
  tracked_products:
    - product_id: [product-name]
      status: PENDING | VALIDATED | RETIRED
      created_at: "<ISO 8601>"
      validated_at: "<ISO 8601>"  # null if not yet validated
      sources_count: <int>         # how many cascaded signals support this product
      tags: []                     # propagated feature-level tags ([new-def], [new-needs])
  history: []                      # retired products
  summary:
    total: 0
    pending: 0
    validated: 0
```

### 7.2 `[product]-FEATURES.yaml` — Product-level tracker
Lives at the product folder root: `pipeline_hustler/[focus]/[product]/[product]-FEATURES.yaml`.

```yaml
name: [product_id]_features
metadata:
  type: product_features
  focus_id: [focus_id]
  product_id: [product_id]
  description: "Product-level tracker of all features under [product_id]."
  schema_version: "1.0"
  last_updated: "<ISO 8601>"

state:
  tracked_features:
    - feature_id: [feature-name]
      status: PENDING | VALIDATED | RETIRED
      created_at: "<ISO 8601>"
      validated_at: "<ISO 8601>"
      sources_count: <int>
      tags: []                     # [new-def] | [new-needs] | (no tag = validated)
      data_files_count: <int>      # raw items in 00-data/
      requirements_count: <int>    # assets in 01-requirements/
  history: []
  summary:
    total: 0
    pending: 0
    validated: 0
    has_new_def: 0                 # features with active [new-def] tags
    has_new_needs: 0               # features with active [new-needs] tags
```

### 7.3 `[feature].yaml` — Feature-level tracker
Lives at the feature folder root: `pipeline_hustler/[focus]/[product]/[feature]/[feature].yaml`.

```yaml
name: [feature_id]
metadata:
  type: feature
  focus_id: [focus_id]
  product_id: [product_id]
  feature_id: [feature_id]
  description: "<concise feature description, set on validation>"
  schema_version: "1.0"
  last_updated: "<ISO 8601>"

definitions:
  - def_id: def-001
    text: "<the definition body>"
    tag: "[new-def]"               # transitions to no-tag when needs fulfilled
    derived_from: ["00-data/<file1>", "00-data/<file2>"]
    created_at: "<ISO 8601>"

needs:
  - need_id: need-001
    def_id: def-001
    text: "<what logic/tools/knowledge this need requires>"
    tag: "[new-needs]"             # transitions to no-tag when fulfilled
    fulfillment:
      kind: EXTRACT | SCRAPE | EXTERNAL_TOOL
      source_files: ["00-data/<processed-data-file>"]   # for EXTRACT
      scraped_files: ["00-data/<new-scraped-file>"]      # for SCRAPE (Data Gap path)
      requirement_assets: ["01-requirements/<asset>"]    # output of fulfillment
    created_at: "<ISO 8601>"

data_inventory:                    # mirrored summary of 00-data/ for fast scan
  - file: "00-data/<filename>"
    tag: "[new-data]" | "[processed-data]" | "[new-scraped]"
    scraped_for: "need-XXX"        # only for [new-scraped] files (provenance)
    last_status_change: "<ISO 8601>"

status_summary:
  has_new_data: 0
  has_processed_data: 0
  has_new_scraped: 0
  has_new_def: 0
  has_new_needs: 0
  productization_ready: false      # true when all needs have no tag and 01-requirements/ is populated
```

### 7.4 Atomic Update Cross-Reference
Per H-LAW-006 (Atomic Tracker Update), a single cascade or processing operation touches multiple trackers in one transaction:

| Operation | Trackers updated atomically |
|---|---|
| Cascade source into existing feature | `.hustler_mixed_inbox.ledger.yaml` (or `[focus].sources_ledger.yaml`) → `[feature].yaml.data_inventory` → `[product]-FEATURES.yaml.state.tracked_features[].data_files_count` |
| Validate new Focus | `.hustler_mixed_inbox.ledger.yaml` → CREATE `[focus]/`, `[focus]-PRODUCTS.yaml`, `[focus].focus_ledger.yaml`, `[focus].sources_ledger.yaml` |
| Validate new Product under existing Focus | `[focus].sources_ledger.yaml` → CREATE `[focus]/[product]/`, `[product]-FEATURES.yaml` → `[focus]-PRODUCTS.yaml.state.tracked_products` → `[focus].focus_ledger.yaml.state.tracked_products` |
| Validate new Feature under existing Product | source ledger → CREATE `[feature]/`, `[feature].yaml`, `00-data/`, `01-requirements/` → `[product]-FEATURES.yaml.state.tracked_features` → `[focus].focus_ledger.yaml.state.tracked_features` |
| Phase 3 Definition tag transition | `[feature].yaml.definitions[].tag: [new-def]` → `[product]-FEATURES.yaml.state.tracked_features[].tags` → tag rewrite on the source file in `00-data/` ([new-data]→[processed-data]) |
| Phase 4 Step 4.1 needs creation | `[feature].yaml.needs[]` + tag bump on definition + `[product]-FEATURES.yaml.state.tracked_features[].tags` |
| Phase 4 Step 4.2 fulfillment | `[feature].yaml.needs[].fulfillment` → asset moved/extracted into `01-requirements/` → `[product]-FEATURES.yaml.state.tracked_features[].requirements_count` |

Any operation that fails mid-transaction MUST follow the recovery procedure documented in `Hustler-Operational-Rules.md` after H-LAW-006.

### 7.5 `[focus].focus_ledger.yaml.lineage_graph` — Per-Focus Source→Feature→Product Graph

Every focus ledger carries a `lineage_graph` block recording the cascade path from raw sources to validated features to productized outputs. The graph is **per-focus only** — it never crosses focus boundaries (each focus is a self-contained product-discovery domain).

```yaml
# Inside [focus].focus_ledger.yaml
lineage_graph:
  metadata:
    schema_version: "1.0"
    last_updated: "<ISO 8601>"
    edge_count: <int>
  nodes:
    sources:                            # raw sources that fed this focus
      - id: SRC-<hash-prefix>
        ledger_entry: ".hustler_mixed_inbox.ledger.yaml#<hash>" | "[focus].sources_ledger.yaml#<hash>"
        path: "<workspace-relative path or archived ref>"
        ingested_at: "<ISO 8601>"
        quality_score: <0..5>           # from H-LAW-015 scoring
    features:
      - id: FEAT-<feature_id>
        path: "pipeline_hustler/[focus]/[product]/[feature]/"
        validated_at: "<ISO 8601>"
        status: PENDING | VALIDATED | RETIRED
    products:
      - id: PROD-<product_id>
        path: "pipeline_hustler/[focus]/[product]/"
        validated_at: "<ISO 8601>"
        status: PENDING | VALIDATED | RETIRED
    productizations:                    # opened HUSTLE-* sessions per H-LAW-001
      - id: HUST-<market>-<id>
        opened_at: "<ISO 8601>"
        product_ref: PROD-<product_id>
        roi_projection_ref: "<path to ROI doc>"
  edges:
    - from: SRC-<hash-prefix>
      to: FEAT-<feature_id>
      kind: CASCADED_INTO
      created_at: "<ISO 8601>"
    - from: SRC-<hash-prefix>
      to: PROD-<product_id>
      kind: COUNTED_TOWARD_THRESHOLD
      created_at: "<ISO 8601>"
    - from: FEAT-<feature_id>
      to: PROD-<product_id>
      kind: BELONGS_TO
      created_at: "<ISO 8601>"
    - from: PROD-<product_id>
      to: HUST-<market>-<id>
      kind: PRODUCTIZED_AS
      created_at: "<ISO 8601>"
    - from: FEAT-<old_feature_id>
      to: FEAT-<new_feature_id>
      kind: SUPERSEDED_BY              # H-LAW-014 No Logic Loss
      created_at: "<ISO 8601>"
      coverage_map: "<inline note or path to migration doc>"
```

#### Maintenance Rules

| Cascade Event | Edge appended |
|---|---|
| Source moved into existing feature `00-data/` | `SRC → FEAT` (`CASCADED_INTO`) |
| Source counted toward Focus / Product / Feature threshold (cluster level) | `SRC → PROD` or `SRC → FEAT` (`COUNTED_TOWARD_THRESHOLD`) |
| Feature validated under a product | `FEAT → PROD` (`BELONGS_TO`) |
| HUSTLE session opened on a product | `PROD → HUST` (`PRODUCTIZED_AS`) |
| Feature retired in favor of a successor (H-LAW-014) | `FEAT_old → FEAT_new` (`SUPERSEDED_BY`) with `coverage_map` |

#### Invariants

1. **Per-focus isolation**: a `lineage_graph` lives inside its `[focus].focus_ledger.yaml` and only references node IDs from that same focus. Cross-focus edges are forbidden — focuses are self-contained product-discovery domains.
2. **Source IDs**: derived from the source's content hash prefix (matches `.hustler_mixed_inbox.ledger.yaml` or `[focus].sources_ledger.yaml` keys). This guarantees stable references after archival.
3. **Atomic with cascade writes**: every edge is appended in the same transaction as the underlying cascade move (per `Hustler-Architecture.md §7.4` Atomic Update Cross-Reference).
4. **Audit consumer**: the Audit Pass (`Hustler-Workflows.md §7`) Check #5 scans the graph for orphan features (no inbound edges) and surfaces them for review.
5. **Retired nodes stay in the graph**: when a feature/product is retired (H-LAW-014 Deprecation Bridge), its node persists with `status: RETIRED` and a `SUPERSEDED_BY` edge to its successor (or no outbound edge if explicitly retired without successor). Nodes are NEVER deleted.

---

## 8. Automation Boundaries

The Hustler Pipeline enforces strict automation boundaries to define what can be dynamically re-assembled by the global engine versus what requires agentic/human cognitive mapping.

### 8.1 Deterministic Sync
Components governed by structured schemas and synced via automated python engines (`.meta/engine/meta_sync.py`):
- **`pipeline_hustler_state`**: State management housed in `.db/pipeline_hustler_os.yaml`.
- **`hustler_ledgers`**: Granular per-focus sub-ledgers in `pipeline_hustler/.hustler_os/hustler_db/`, which are automatically aggregated into central `.db/` rollups.

### 8.2 Cognitive Mapping
Unstructured market discovery zones that MUST NOT be auto-organized by scripts:
- **`external_sources`**: `pipeline_hustler/_HUSTLER-EXTERNAL_SOURCES/`
- **`mixed_inbox`**: `pipeline_hustler/_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/`
- **`focus_inbox`**: `pipeline_hustler/_HUSTLER-EXTERNAL_SOURCES/_[focus]_inbox/`
- **`user_space`**: `pipeline_hustler/_HUSTLER-EXTERNAL_SOURCES/.hustler_USER-SPACE/`

**Restrictions:**
- Discoveries inside the validated focus folders at pipeline root MUST be updated strictly by the agent following `Hustler-Cascading-Logic.md`.
- Direct script automation is permanently prohibited from re-organizing or re-cataloging Focus → Product → Feature trees.
- **Prohibition**: The Hustler (both scripts and agents) MUST NEVER look at, scan, or auto-route items inside `_HUSTLER-EXTERNAL_SOURCES/.hustler_USER-SPACE/` — this is a strictly user-only zone.
