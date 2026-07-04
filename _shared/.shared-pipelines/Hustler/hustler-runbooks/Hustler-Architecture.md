# 🏗️ Hustler Architecture

## Objective
Cascading Product Discovery. The Hustler pipeline is the **product-discovery and requirements engine** of the Agentic OS. It ingests raw market signals (videos, articles, screenshots, PDFs, scraped pages), cascades them through a Focus → Product → Feature hierarchy, processes them into structured definitions and needs, and surfaces validated product opportunities ready for monetization.

> **No separate Gateway runbook by design.** Unlike the Scaler (which uses proposal runs through its gateway), the Hustler's gating mechanism IS the cascade itself — threshold checks at Focus / Product / Feature levels. Self-evolution of the Hustler runbooks flows OUT via the Scaler `INTERNAL` pipeline (see `Hustler-Operational-Rules.md` §5).

---

## 1. Pipeline Execution Layers

### Global Always-On Layers (used for EVERY task)
- `_system/.system-meta/.system-os_prompts/` — Core identity, routing rules, and execution laws
- `index.yaml` — All paths; never guess paths, always read from here
- `system-board.yaml` — The control plane: modes, profiles, pipeline state, run tracking
- `_shared/.shared-toolboxes/` — Core agentic and extended capabilities. **Use specific toolboxes for analytics, planning, content extraction.**

### Localized Pipeline Layers (paths from index)
- `_shared/.shared-pipelines/Hustler/hustler-runbooks/` — Operational rules and workflows (read before any execution)
- `entity-hustler-runtime/` — The Hustler's physical execution runtime (all folders below live here)

---

## 2. Runtime Folder Structure

The Hustler's execution state lives inside one named runtime folder per entity:

```
entity-hustler-runtime/
│
├── INTERNAL-PLANNING_runs/        # Runs in PLANNING phase (INTERNAL profile)
├── INTERNAL-EXECUTION_runs/       # Runs in EXECUTION phase (INTERNAL profile)
│
├── INBOX-inboxing/                # 📥 User drops market signals here (raw — agent does NOT process directly)
├── INBOX-gateway/                 # 📦 Agent COPIes from INBOX-inboxing/ into pillar/focus subfolders
│   ├── <focus_or_pillar_A>/
│   ├── <focus_or_pillar_B>/
│   └── ...
├── INBOX-PLANNING_runs/           # Runs in PLANNING phase (INBOX profile)
├── INBOX-EXECUTION_runs/          # Runs in EXECUTION phase (INBOX profile)
├── INBOX-tracker.yaml             # Tracks all items in INBOX-inboxing/ and INBOX-gateway/
│
├── RESEARCH-researching/          # 🔬 Agent writes web research results here
├── RESEARCH-gateway/              # 📦 Agent COPIes from RESEARCH-researching/ into focus subfolders
│   ├── <focus_or_pillar_A>/
│   └── ...
├── RESEARCH-PLANNING_runs/        # Runs in PLANNING phase (RESEARCH profile)
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
> These are independent. A cascading cycle (Phases 1-5) does not create "runs" in the run folders — it builds the hierarchy directly. Runs are created when the Hustler needs to plan and propose larger strategic actions (e.g., re-scoping a Focus, planning a productization push).

---

## 2.1 Folder Purposes

| Folder | Owner | Purpose |
|--------|-------|---------|
| `INBOX-inboxing/` | **User** | Drop raw market signals (videos, PDFs, screenshots, transcripts). Agent does NOT scan this directly. |
| `RESEARCH-researching/` | **Agent** | Agent deposits web research, scraped content, synthesis notes. |
| `INBOX-gateway/<focus_or_pillar>/` | **Agent** | Copies (never moves) from `INBOX-inboxing/` routed per focus/pillar. Planning runs are generated from here. |
| `RESEARCH-gateway/<focus_or_pillar>/` | **Agent** | Copies (never moves) from `RESEARCH-researching/` per focus/pillar. |
| `*-PLANNING_runs/` | **Agent** | Fully planned strategic runs awaiting user decision. One folder per run. |
| `*-EXECUTION_runs/` | **Agent** | Approved strategic runs being executed. |
| `.archived_runs/` | **Agent** | Rejected and completed+archived runs. Permanent storage. |
| `[focus-name]/` | **Agent (cascade)** | The live cascade workspace where validated Focus/Product/Feature trees are built. |

> **COPY, never move.** Source files always stay in `INBOX-inboxing/` or `RESEARCH-researching/`. Only copies go into gateway subfolders. The tracker records delivery.

> **Standard cascading (Phases 1-5) does NOT create run folders** — it builds directly into the `[focus-name]/` hierarchy. Run folders are only for strategic planning actions above the cascade level.

---

## 3. Profiles and Execution (auto_mode + plan_first)

Hustler operations are controlled by the active profile in `system-board.yaml`:

1. **INTERNAL** — Scans internal Hustler state (ledgers, focus trackers, architecture) to identify gaps and propose strategic changes. Runs in `INTERNAL-PLANNING_runs/` and `INTERNAL-EXECUTION_runs/`.
2. **INBOX** — The standard product discovery profile. Agent reads from `INBOX-inboxing/`, delivers to `INBOX-gateway/`, then cascades through the Focus → Product → Feature hierarchy. Strategic planning runs (if needed) go in `INBOX-PLANNING_runs/`.
3. **RESEARCH** — Agent proactively researches external markets/signals, writes to `RESEARCH-researching/`, delivers to `RESEARCH-gateway/`. Strategic runs go in `RESEARCH-PLANNING_runs/`.

Execution relies on `control.auto_mode` and `control.plan_first`. When `auto_mode` is enabled and `plan_first` is off, actions permitted by `action_gates` proceed immediately. Otherwise, explicit user approval is required.

---

## 4. Run Lifecycle (for Strategic Runs)

Strategic Hustler runs follow the same lifecycle as Scaler runs:

```
[Agent completes planning]
        │
        ▼
    PLANNING
(folder in *-PLANNING_runs/, board entry under profile.runs.PLANNING.PLANNING_runs)
        │
  User sets "approve" or "reject"
        │
   ┌────┴────┐
 reject    approve
   │          │
   ▼          ▼
rejected   EXECUTION → completed → archive → archived
(archived)  (follows same lifecycle as Scaler runs)
```

See `Pipelines_Architecture.md` §3 for the full status vocabulary and board ↔ folder movement rules.

---

## 5. The Three-Tier Cascade Hierarchy

### 5.1 Focus
A validated *market segment* worth pursuing. Created when raw signals consistently point to a coherent niche.
- Threshold: ≥ N signals matching the same proto-focus before validation (configurable in cascading logic)
- Lives at: `entity-hustler-runtime/[focus-name]/`
- Example: `algerian-ecommerce/`

### 5.2 Product
A validated *deliverable concept* within a Focus.
- Threshold: ≥ N signals for the same product-shape inside an existing Focus
- Lives at: `entity-hustler-runtime/[focus-name]/[product-name]/`

### 5.3 Feature
A validated *atomic capability* within a Product. The unit of execution work.
- Threshold: ≥ N signals for the same feature-shape inside an existing Product
- Lives at: `entity-hustler-runtime/[focus-name]/[product-name]/[feature-name]/`

---

## 6. The Tracker System

| Tracker | Tracks | Location |
|---------|--------|----------|
| `INBOX-tracker.yaml` | All items in `INBOX-inboxing/` and `INBOX-gateway/` | `entity-hustler-runtime/` root |
| `RESEARCH-tracker.yaml` | All items in `RESEARCH-researching/` and `RESEARCH-gateway/` | `entity-hustler-runtime/` root |
| `[focus]-PRODUCTS.yaml` | All validated Products under a Focus | `entity-hustler-runtime/[focus]/` |
| `[focus].focus_ledger.yaml` | Per-focus strategic rollup — products/features + market context | `index.yaml` path |
| `[focus].sources_ledger.yaml` | Per-focus anti-duplication tracker for inbound cascades | `index.yaml` path |
| `.hustler_mixed_inbox.ledger.yaml` | Legacy — Items awaiting cascade from old inbox model | Deprecated; use `INBOX-tracker.yaml` |
| `[product]-FEATURES.yaml` | All validated Features under a Product | `entity-hustler-runtime/[focus]/[product]/` |
| `[feature].yaml` | Feature-specific definitions, needs, tags | `entity-hustler-runtime/[focus]/[product]/[feature]/` |

The global engine (`engine.py`) aggregates totals from per-focus ledger files into `index.yaml` rollups.

---

## 7. Tracker YAML Schemas

### 7.1 INBOX-tracker.yaml

```yaml
tracker:
  pipeline: hustler
  last_updated: timestamp
  total_items: integer
  items:
    "<item_name>":
      source_folder: INBOX-inboxing/
      delivered_to:
        - focus_or_pillar: string
          gateway_path: string
          delivered_at: timestamp
      status: pending | delivered | cascaded
      cascaded_to:           # where the item ended up in the hierarchy
        level: focus | product | feature
        path: string
      quality_score: 0..5    # from H-LAW-015 scoring
      quality_verdict: PASS | BORDERLINE | REJECTED
      action_gate_used: string
```

### 7.2 RESEARCH-tracker.yaml

Same schema as `INBOX-tracker.yaml`, with `source_folder: RESEARCH-researching/`.

### 7.3 `[focus]-PRODUCTS.yaml` — Focus-level tracker

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
      validated_at: "<ISO 8601>"
      sources_count: <int>
      tags: []
  history: []
  summary:
    total: 0
    pending: 0
    validated: 0
```

### 7.4 `[product]-FEATURES.yaml` — Product-level tracker

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
      tags: []
      data_files_count: <int>
      requirements_count: <int>
  history: []
  summary:
    total: 0
    pending: 0
    validated: 0
    has_new_def: 0
    has_new_needs: 0
```

### 7.5 `[feature].yaml` — Feature-level tracker

```yaml
name: [feature_id]
metadata:
  type: feature
  focus_id: [focus_id]
  product_id: [product_id]
  feature_id: [feature_id]
  description: "<concise feature description>"
  schema_version: "1.0"
  last_updated: "<ISO 8601>"

definitions:
  - def_id: def-001
    text: "<the definition body>"
    tag: "[new-def]"
    derived_from: ["00-data/<file1>"]
    created_at: "<ISO 8601>"

needs:
  - need_id: need-001
    def_id: def-001
    text: "<what logic/tools/knowledge this need requires>"
    tag: "[new-needs]"
    fulfillment:
      kind: EXTRACT | SCRAPE | EXTERNAL_TOOL
      source_files: ["00-data/<processed-data-file>"]
      scraped_files: ["00-data/<new-scraped-file>"]
      requirement_assets: ["01-requirements/<asset>"]
    created_at: "<ISO 8601>"

data_inventory:
  - file: "00-data/<filename>"
    tag: "[new-data]" | "[processed-data]" | "[new-scraped]"
    scraped_for: "need-XXX"
    last_status_change: "<ISO 8601>"

status_summary:
  has_new_data: 0
  has_processed_data: 0
  has_new_scraped: 0
  has_new_def: 0
  has_new_needs: 0
  productization_ready: false
```

---

## 8. Atomic Update Cross-Reference

Per H-LAW-006, a single cascade or processing operation touches multiple trackers atomically:

| Operation | Trackers updated atomically |
|-----------|----------------------------|
| New source delivered to gateway | `INBOX-tracker.yaml` or `RESEARCH-tracker.yaml` delivery record |
| Cascade source into existing feature | tracker → `[feature].yaml.data_inventory` → `[product]-FEATURES.yaml` |
| Validate new Focus | tracker → CREATE `[focus]/`, `[focus]-PRODUCTS.yaml`, `[focus].focus_ledger.yaml`, `[focus].sources_ledger.yaml` |
| Validate new Product | `[focus].sources_ledger.yaml` → CREATE `[focus]/[product]/`, `[product]-FEATURES.yaml` → `[focus]-PRODUCTS.yaml` |
| Validate new Feature | source ledger → CREATE `[feature]/`, `[feature].yaml`, `00-data/`, `01-requirements/` → `[product]-FEATURES.yaml` |
| Phase 3 tag transition | `[feature].yaml.definitions[].tag` → `[product]-FEATURES.yaml.tags` → source file tag |
| Phase 4.1 needs creation | `[feature].yaml.needs[]` + definition tag bump + `[product]-FEATURES.yaml` |
| Phase 4.2 fulfillment | `[feature].yaml.needs[].fulfillment` → asset in `01-requirements/` → `[product]-FEATURES.yaml.requirements_count` |

---

## 9. Lineage Graph

Every focus ledger carries a `lineage_graph` block recording the full source → feature → product → productization path:

```yaml
lineage_graph:
  metadata:
    schema_version: "1.0"
    last_updated: "<ISO 8601>"
    edge_count: <int>
  nodes:
    sources:
      - id: SRC-<hash-prefix>
        path: "<workspace-relative path>"
        ingested_at: "<ISO 8601>"
        quality_score: <0..5>
    features:
      - id: FEAT-<feature_id>
        path: "entity-hustler-runtime/[focus]/[product]/[feature]/"
        status: PENDING | VALIDATED | RETIRED
    products:
      - id: PROD-<product_id>
        path: "entity-hustler-runtime/[focus]/[product]/"
        status: PENDING | VALIDATED | RETIRED
    productizations:
      - id: HUST-<market>-<id>
        opened_at: "<ISO 8601>"
        product_ref: PROD-<product_id>
  edges:
    - {from: SRC-..., to: FEAT-..., kind: CASCADED_INTO}
    - {from: FEAT-..., to: PROD-..., kind: BELONGS_TO}
    - {from: PROD-..., to: HUST-..., kind: PRODUCTIZED_AS}
    - {from: FEAT-old, to: FEAT-new, kind: SUPERSEDED_BY, coverage_map: "..."}
```

---

## 10. Brain ↔ Runtime Separation

| Zone | Location | Contains |
|------|----------|---------|
| **Brain (Logic)** | `_shared/.shared-pipelines/Hustler/hustler-runbooks/` | All runbooks — Architecture, Workflows, Operational-Rules, Cascading-Logic, Tagging-System. Read-only during execution. |
| **Runtime (State)** | `entity-hustler-runtime/` | Active runs, gateway content, inboxes, trackers, archives, and the validated Focus/Product/Feature cascade workspace. |

---

## 11. Automation Boundaries

### Deterministic Sync (Engine-Managed)
- `system-board.yaml` pipeline state and run tracking
- `index.yaml` rollups for pipeline metrics
- `[focus].focus_ledger.yaml` and `[focus].sources_ledger.yaml` aggregation

### Cognitive Mapping (Agent-Managed — Scripts MUST NOT touch)
- `INBOX-inboxing/` — user-managed staging
- `RESEARCH-researching/` — agent research deposits
- `*-gateway/` contents — agent routing decisions
- Run folders in `*-PLANNING_runs/` and `*-EXECUTION_runs/`
- `[focus]/[product]/[feature]/` cascade workspace

---

## 12. Hard Rules

1. **No paths in board** — All folder paths live in `index.yaml` only
2. **COPY never move** — From inboxing/researching to gateway; source files immutable in landing zones
3. **Gateway drives planning** — Never generate runs directly from `INBOX-inboxing/` or `RESEARCH-researching/`
4. **Standard cascade ≠ runs** — Phase 1-5 cascading builds the hierarchy directly; run folders are for strategic planning only
5. **Board + folder in sync** — Every status change updates both simultaneously
6. **Archive header** — `"run_name":` key promoted to top of run file before archiving
7. **Archived runs leave the board** — Only PLANNING, EXECUTION, and completed runs in board
8. **Atomic tracker updates** — H-LAW-006 — never partial state
9. **Anti-duplication** — Consult `INBOX-tracker.yaml` / `RESEARCH-tracker.yaml` before delivering a second copy of the same item
10. **USER-SPACE forbidden** — Agent never scans or processes `.hustler_USER-SPACE/`
