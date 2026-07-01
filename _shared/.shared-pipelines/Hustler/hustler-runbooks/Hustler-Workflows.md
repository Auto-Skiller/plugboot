---
metadata:
  name: hustler-workflows
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
  description: 5-phase execution approach — ingestion, cascading discovery, definition,
    needs fulfillment, productization, and audit pass
  when_to_use: Read during each Hustler execution cycle or when reviewing the audit
    pass procedure
  contains: workflows, audit_pass, reference_cards
---

# ⚙️ Hustler Workflows

## Objective
**Purpose:** Implement a structured **5-Phase execution approach** for the Hustler pipeline, with mandatory cascading discovery, atomic tracker updates, and mode-aware integration behavior.

---

## 1. The 5-Phase Hustler Approach

All Hustler execution strictly adheres to this sequence. Phases 1-2 are routing; phases 3-5 are content processing.

### Phase 1: Ingestion
- **Staging Scan (FIRST PRIORITY)**: Before scanning any validated focus folder at pipeline root, check `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/` and `_HUSTLER-EXTERNAL_SOURCES/_[focus]_inbox/` for unrouted sources.
- For each item found:
  1. Compute content hash; consult `.hustler_mixed_inbox.ledger.yaml` (or relevant focus `sources_ledger`) for anti-duplication.
  2. If new: log to the relevant ledger with timestamp + hash.
  3. Pass to Phase 2 (Cascading Discovery) for routing.
- **Direct-drop Scan**: Items the user dropped directly into a feature's `00-data/` are tagged `[new-data]` per Hustler-Tagging-System.md and proceed to Phase 3.

### Phase 2: Cascading Discovery
- Apply the cascading decision tree in `Hustler-Cascading-Logic.md`:
  1. **Focus check** against the central `index.yaml` rollups (rolled up from per-focus `[focus].focus_ledger.yaml` files).
  2. **Product check** against the matched focus's `[focus]-PRODUCTS.yaml` (in the focus folder at pipeline root).
  3. **Feature check** against the matched product's `[product]-FEATURES.yaml`.
- At each level: matched → cascade down. No match → check threshold:
  - Threshold reached → validate & promote (create the new Focus/Product/Feature folder).
  - Threshold not reached → keep in the appropriate `_*-discovery/` holding folder.
- **MANDATORY (H-LAW-007)**: Update the relevant ledger at the same moment as the move. Atomic.

### Phase 3: Definition (`[new-data]` → `[new-def]`)
- For every feature with `00-data/` containing `[new-data]` files:
  1. Process them ONE BY ONE.
  2. Read the data; identify opportunities and logic specific to the feature.
  3. Update `[feature-name].yaml` with definitions; tag the added section `[new-def]` and list the source data files.
  4. Reflect the feature's `[new-def]` status in `[product]-FEATURES.yaml`.
  5. Change the source file's tag in `00-data/` from `[new-data]` to `[processed-data]`.

Full Step 2.1 logic preserved in `Hustler-Tagging-System.md`.

### Phase 4: Needs Fulfillment (`[new-def]` → `[new-needs]` → assets)
- **Step 4.1**: For every feature marked `[new-def]`, identify what logic/tools/knowledge each definition needs. Write needs into `[feature-name].yaml` and tag them `[new-needs]`. Bump the feature's status from `[new-def]` to `[new-needs]`.
- **Step 4.2**: For every `[new-needs]` part:
  - If extractable from existing `[processed-data]`: copy the asset into `01-requirements/`.
  - If not extractable (Data Gap): scrape the internet, save raw output to `00-data/` tagged `[new-scraped]`, mark which need it was scraped for, then extract to `01-requirements/`, and transition the file tag to `[processed-data]`.

Full Steps 2.2 and 2.3 logic preserved in `Hustler-Tagging-System.md`.

### Phase 5: Productization
- **Validate readiness**: Feature has all `[new-needs]` fulfilled; `01-requirements/` is populated; tracker shows clean status.
- **Surface for monetization**: Update `[focus]-PRODUCTS.yaml` to mark the feature ready for campaign execution.
- **Pre-execution gate**: Per H-LAW-002 (Value-First Protocol), no campaign can begin without a documented ROI projection. Per H-LAW-003 (Market Sanity Check), perform market research before building final assets.
- **Hustle session**: A productization run becomes a `HUSTLE-[Market]-[ID]` session per H-LAW-001.

---

## 2. INGESTION Execution Path
**Objective**: Cascade unrouted sources into the Focus → Product → Feature hierarchy via the mandatory anti-duplication gate.

1. **Anti-duplication check**: Compute hash of each item in `.hustler_mixed_inbox/`. Skip items already logged in `.hustler_mixed_inbox.ledger.yaml`.
2. **Cascading Discovery**: Apply Section 1 Phase 2 logic.
3. **Atomic move**: Move source file → log in `.hustler_mixed_inbox.ledger.yaml` history → log in target focus's `sources_ledger` (anti-duplication for that focus). All in one operation per H-LAW-007.
4. **Mode-Aware Integration**:
   - `EXECUTION` mode → cascade autonomously.
   - `PLANNING` mode → leave the proposed cascade in scratch with a review request in `system-board.yaml.communication_hubs.hustler_hub`.

---

## 3. PROCESSING Execution Path
**Objective**: Convert cascaded raw data into validated feature requirements.

1. **Definition pass**: Phase 3.
2. **Needs pass**: Phase 4.1.
3. **Fulfillment pass**: Phase 4.2.
4. **Status update**: Reflect tag transitions in `[feature].yaml` AND `[product]-FEATURES.yaml` (per H-LAW-006 atomic tracker rule).

---

## 4. The Execution & Tracking Rule

- **Milestones vs. Hustler Ledgers**: Milestones (`.milestones/`) track High-Level Goals. `hustler_ledgers/` track granular state — per-focus split into `focus_ledger` (strategic) + `sources_ledger` (anti-duplication), plus the dedicated `.hustler_mixed_inbox.ledger.yaml`.
- **Anti-Duplication**: When ingesting from `.hustler_mixed_inbox/`, append the content hash to `.hustler_mixed_inbox.ledger.yaml.state.tracked_items`. The Hustler MUST NOT cascade the same source file twice. When cascading INTO a focus, also log in `[focus].sources_ledger.yaml`.
- **Toolbox Usage (Dynamic Detection)**: The Hustler MUST invoke toolboxes from `_shared/.shared-toolboxes/` for all analysis/extraction work (PDF parsing, web scraping, content classification, ranking, summarization, etc.). **There is no static mapping of phase → toolbox.** The agent detects the relevant toolbox per task by consulting the live toolbox catalog (`_shared/.shared-toolboxes/`) and the auto-generated toolbox router (`system-board.yaml`). This keeps the pipeline forward-compatible: as new toolboxes are added, the Hustler picks them up automatically without runbook changes.
- **Atomic Tracker Updates**: A cascade move MUST NEVER be committed without simultaneous updates to:
  1. The source ledger (`.hustler_mixed_inbox.ledger.yaml` or upstream `[focus].sources_ledger.yaml`)
  2. The target tracker (`[focus]-PRODUCTS.yaml` or `[product]-FEATURES.yaml` or `[feature].yaml`)
  3. The target focus's `focus_ledger` (strategic rollup) if a new product/feature was promoted

---

## 5. Mode-Aware Behavior

The `system-board.yaml.modes.hustler` block controls Hustler behavior:

```yaml
hustler:
  work_mode: STRICT 🟢 | COLLAB 🟡 | AUTO 🟢
  action_gate:
    - PLANNING 🟢 | EXECUTION 🟢
```

| Setting | Behavior |
|---|---|
| `action_gate: EXECUTION` | Cascading and processing run autonomously. Update .system.board `recent_events` post-action. |
| `action_gate: PLANNING` | Cascade and processing proposals are drafted but await user approval via `system-board.yaml.communication_hubs.hustler_hub.messages`. |
| `work_mode: STRICT` | Address user as "Director ..."; wait for explicit approval on every plan. |
| `work_mode: COLLAB` | Address user as "We ..."; propose intent before sensitive actions. |
| `work_mode: AUTO` | Address user as "I ..."; act decisively; document in .system.board for async review. |

Today's default in .system.board is `STRICT 🟢 / PLANNING 🟢` — meaning the Hustler proposes cascades and processing decisions but does not auto-execute. Change the .system.board block to flip the gate.


---

## 6. Per-Phase Reference Cards (Inputs / Outputs / Error Recovery / Hard Rules)

The narrative phases in §1 describe the *logic*. This section gives each phase a compact reference card so an agent can quickly locate (a) what data the phase consumes, (b) what it must produce, (c) what to do when something fails, and (d) the non-negotiable constraints. Prose stays in §1; this section is the lookup grid.

### 6.1 Phase 1 — Ingestion
- **Inputs**:
  - `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/` (untyped staging)
  - `_HUSTLER-EXTERNAL_SOURCES/_[focus]_inbox/` (focus-staged drops)
  - Direct-drop files in any feature's `00-data/` (already past cascade)
  - `.hustler_mixed_inbox.ledger.yaml` (anti-duplication)
- **Outputs**:
  - Per-source content hash logged in `.hustler_mixed_inbox.ledger.yaml` (or focus-level `[focus].sources_ledger.yaml` when arriving via `_[focus]_inbox/`).
  - 5-criteria `quality_scoring` block on the ledger entry (per H-LAW-015).
  - Source handed off to Phase 2 with its quality verdict (PASS / BORDERLINE / REJECTED).
  - Direct-drop items tagged `[new-data]` and forwarded to Phase 3.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | File appears in inbox but is locked / unreadable | Skip; log to `hustler_hub.messages` with `phase: 1, reason: read_failure` |
  | Hash collision (same content, different filename) | Treat as duplicate per H-LAW-007; log the alias and skip cascade |
  | Bundle folder dropped: nested files of unsupported types | Apply Bundle Completeness rule; record unread items in `unread_assets[]` |
  | Source fails ≤2 of the 5 quality criteria | Tag `quality: REJECTED`; archive to `.hustler_runtime/.hustler_archive/YYYY-QQ/REJECTED-quality/`; do NOT count toward thresholds |
- **Hard Rules**:
  - Staging scan precedes any other Phase 1 work (`.hustler_mixed_inbox/` → `_[focus]_inbox/`).
  - Items in `_HUSTLER-EXTERNAL_SOURCES/.hustler_USER-SPACE/` are NEVER scanned.
  - No source is logged in `.hustler_mixed_inbox.ledger.yaml` without its quality scoring (H-LAW-015).
  - Bundle Completeness: no skipping by extension (Constraints §2).

### 6.2 Phase 2 — Cascading Discovery
- **Inputs**:
  - Sources passed from Phase 1 with quality verdict.
  - Central `index.yaml` rollups (auto-rolled from per-focus ledgers).
  - For each existing focus: `[focus]-PRODUCTS.yaml`.
  - For each existing product: `[product]-FEATURES.yaml`.
  - Active .system.board `hustler.profiles.INGESTION.action_gate` (per H-LAW-013).
- **Outputs**:
  - Sources moved into the correct level home (feature `00-data/` if matched; `_[product]-discovery/` or `_[focus]-discovery/` if held; `.hustler_mixed_inbox/` if no focus matched yet).
  - Validated Focus / Product / Feature folders + trackers when thresholds are met (per `Hustler-Cascading-Logic.md §3`).
  - Atomic update of source ledger + level tracker + parent rollup (per `Hustler-Architecture.md §7.4`).
  - Lineage edges appended to `[focus].focus_ledger.yaml.lineage_graph` (per §7.5 of `Hustler-Architecture.md`).
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Two existing focuses are equally plausible matches | Apply selection criteria from `Hustler-Cascading-Logic.md §5`: specificity → recency → human gate |
  | Threshold met but cluster is incoherent under semantic re-read | Reset cluster; do NOT validate; keep items in `_*-discovery/` with a flag |
  | Atomic trio write fails mid-transaction | Trigger H-LAW-006 recovery procedure (ABORT → leave source → roll back → log → surface → never auto-retry) |
  | Action falls in PLANNING list of active profile but work_mode is AUTO | Still respect the action_gate (H-LAW-013 supersedes work_mode for write actions) |
- **Hard Rules**:
  - Cluster-First Rule precedes per-item threshold counting (`Hustler-Cascading-Logic.md §7`).
  - Anti-thrashing: no Focus from a single source; no Feature without prior Product validation (`Hustler-Cascading-Logic.md §4`).
  - Quality bar (H-LAW-015): only sources with ≥3/5 score count toward thresholds.
  - Action gate (H-LAW-013): default to PLANNING when transition type is missing from both lists.

### 6.3 Phase 3 — Definition (`[new-data]` → `[new-def]`)
- **Inputs**:
  - All `00-data/[file]` tagged `[new-data]` across validated features.
  - Existing `[feature].yaml.definitions[]` (to detect supersession per H-LAW-014).
  - Toolboxes for content-extraction, summarization, classification (dynamic detection per §4 Toolbox Usage).
- **Outputs**:
  - New `definitions[]` entries in `[feature].yaml`, each tagged `[new-def]` and listing `derived_from: [00-data/<files>]`.
  - Tag transition on source files: `[new-data]` → `[processed-data]`.
  - `[product]-FEATURES.yaml.state.tracked_features[].tags` reflects active `[new-def]`.
  - For supersession of an existing definition: `supersedes` block with explicit coverage map (per H-LAW-014 No Logic Loss).
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Toolbox extraction returns garbage (low signal) | Re-attempt with a different toolbox via meta_routing; if still failing, leave `[new-data]` tag intact and log `extraction_failed` |
  | A new definition contradicts an existing one without `supersedes` block | H-LAW-014 violation — refuse the write; surface to `hustler_hub.messages` |
  | Atomic trio fails (file tag + `[feature].yaml` + `[product]-FEATURES.yaml`) | Trigger H-LAW-006 recovery |
  | Definition would be the only one for the feature AND fragmentation suspected | Re-audit cohesion before writing (H-LAW-014 Modular Merging) |
- **Hard Rules**:
  - Process files ONE BY ONE (`Hustler-Tagging-System.md §4 Step 2.1`).
  - Tag transitions are atomic: source-file tag + `[feature].yaml` + `[product]-FEATURES.yaml` in one operation.
  - Toolbox usage is dynamic — no static phase→toolbox map (§4).

### 6.4 Phase 4 — Needs Fulfillment
- **Inputs**:
  - Features tagged `[new-def]` in their `[product]-FEATURES.yaml.tags[]`.
  - For Step 4.2 EXTRACT branch: `[processed-data]` files referenced by the `[new-def]` derived_from.
  - For Step 4.2 SCRAPE branch: internet access via toolboxes; .system.board profile permissions.
- **Outputs**:
  - **Step 4.1**: `[feature].yaml.needs[]` entries tagged `[new-needs]`; feature-level tag bumped from `[new-def]` to `[new-needs]`.
  - **Step 4.2 EXTRACT**: assets copied/extracted into `01-requirements/`; need's `fulfillment.kind: EXTRACT` + `requirement_assets[]` populated; need tag cleared.
  - **Step 4.2 SCRAPE**: new `00-data/[file]` tagged `[new-scraped]` with `<!-- Scraped for: ... -->` provenance header; need's `fulfillment.kind: SCRAPE` + `scraped_files[]` + `requirement_assets[]` populated; need tag cleared; file tag transitioned to `[processed-data]`.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | EXTRACT path: referenced `[processed-data]` file no longer exists | Trigger Audit Pass (§7) to check for drift; queue need for re-fulfillment |
  | SCRAPE path: action sits in PLANNING per H-LAW-013 profile | Pause the need; post review request to `hustler_hub.messages`; do not scrape autonomously |
  | SCRAPE produces low-quality output (fails H-LAW-015 ≥3 criteria) | Discard; mark need `fulfillment_attempted: true` with reason; do NOT save the source |
  | Atomic trio fails mid-fulfillment | H-LAW-006 recovery |
- **Hard Rules**:
  - Step 4.1 must complete (all `[new-def]` mapped to `[new-needs]`) before Step 4.2 begins for that feature.
  - SCRAPE provenance markers are mandatory (`Hustler-Tagging-System.md §6`).
  - Double-Processing Prevention: never reuse a `[new-scraped]` file for the same need twice.

### 6.5 Phase 5 — Productization
- **Inputs**:
  - Features whose `[feature].yaml.status_summary.productization_ready: true`.
  - Per H-LAW-002 (Value-First): documented ROI projection.
  - Per H-LAW-003 (Market Sanity): completed market research step.
- **Outputs**:
  - `[focus]-PRODUCTS.yaml` entry updated with `monetization_ready: true` for the parent product.
  - A `HUSTLE-[Market]-[ID]` session opened per H-LAW-001.
  - Lineage graph closure: edge added in `[focus].focus_ledger.yaml.lineage_graph` connecting validated feature → productization session.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Feature flagged ready but `01-requirements/` is empty | Re-audit Step 4.2 fulfillment; do NOT mark productization_ready |
  | ROI projection missing | H-LAW-002 violation — block; surface to `hustler_hub.product_gaps_queue` |
  | Market research step skipped | H-LAW-003 violation — block; surface to `hustler_hub.product_gaps_queue` |
  | Profile says PLANNING for `productization_marking` (H-LAW-013) | Draft + post review; never auto-promote to monetization |
- **Hard Rules**:
  - Productization is the only phase that opens a `HUSTLE-` session.
  - H-LAW-001/002/003 are all enforced: naming standard + ROI + market sanity gate the entire phase.
  - DNA Preservation (H-LAW-014): retiring a productized feature follows the Deprecation Bridge — never delete.

---

## 7. Audit Pass (Periodic Maintenance Workflow)

**Purpose:** A periodic, on-demand workflow that scans the Hustler's own state for drift between live disk and what its ledgers/state files claim. Outputs a remediation message in `hustler_hub.messages` (which the user may convert to a Scaler INTERNAL Mega-YAML if it touches Hustler runbooks). **The Audit Pass is Hustler-internal only — it scans Hustler artifacts only and never touches the Scaler pipeline.**

### 7.1 When the Audit Pass Runs
- **Manual trigger**: User sets `system-board.yaml.modes.hustler.audit_request: true`. The Hustler picks it up at the next cycle start.
- **Goal-completion trigger**: When a Hustler-related goal is marked `done` in `.milestones/`, the Hustler MAY queue an Audit Pass for the next cycle (configurable via `system-board.yaml.audit_policy`).
- **Drift-suspected trigger**: If H-LAW-006 recovery fired more than 2 times in a session, the next cycle automatically runs an Audit Pass.
- **Quarter rotation trigger**: Optional sweep when `.hustler_archive/` rolls to a new quarter, to verify no archived feature references files that no longer exist.

### 7.2 Audit Scope
The Audit Pass is **read-mostly**: it scans, compares, and reports. It writes only to:
- `system-board.yaml.state.last_audit` + `audit_findings[]`
- A remediation message in `system-board.yaml.communication_hubs.hustler_hub.messages` IF drift is detected.
- `system-board.yaml.communication_hubs.hustler_hub.recent_events` with the audit summary.

The Audit Pass does NOT auto-fix drift. Any operational fix is queued for the next cascade/processing cycle. Any runbook fix is escalated to the Scaler INTERNAL pipeline (per `Hustler-Operational-Rules.md §5 Self-Evolution Protocol`).

### 7.3 The 6 Audit Checks
| # | Check | What it verifies |
|---|---|---|
| 1 | **Tracker-to-disk consistency** | Every `tracked_focus` / `tracked_product` / `tracked_feature` entry points to a folder that exists on disk. Every existing `[focus]/[product]/[feature]/` folder has a tracker entry. |
| 2 | **Tag consistency** | Every file in any `00-data/` carries a valid tag (`[new-data]`, `[processed-data]`, `[new-scraped]`). Every section in `[feature].yaml` carries a valid tag (`[new-def]`, `[new-needs]`, or no tag). The tag in the file matches the corresponding entry in `[product]-FEATURES.yaml.state.tracked_features[].tags`. |
| 3 | **Atomic-trio integrity** | For each cascade move recorded in any `sources_ledger`, verify the source file is at the destination and the level tracker reflects it. Orphans on either side indicate an H-LAW-006 partial-failure that wasn't fully rolled back. |
| 4 | **Provenance integrity** | Every `[new-scraped]` file carries the `<!-- Scraped for: ... -->` provenance header (`Hustler-Tagging-System.md §6`). Every retired focus/product/feature in `.hustler_archive/RETIRED-*/` has a `retired_reason` and `successor_id` (or explicit `null`) per H-LAW-014. |
| 5 | **Lineage graph completeness** | Every validated feature has at least one inbound edge in `[focus].focus_ledger.yaml.lineage_graph` connecting it to a source. Orphan features (no source lineage) are flagged for review. |
| 6 | **Stale focus detection** | Focuses whose `last_updated` is > 90 days AND have no active `[new-data]` / `[new-def]` / `[new-needs]` tags are surfaced for re-evaluation (NOT auto-retired — that's a user decision via H-LAW-014 Deprecation Bridge). |

### 7.4 Audit Pass Procedure
1. **Pre-flight**: Confirm H-LAW-010 runbook immersion is fresh; lock `system-board.yaml.state.audit_in_progress: true` to prevent concurrent cycles.
2. **Run all 6 checks in order** (1 → 6). Each check produces a structured finding object: `{check_id, severity: INFO|WARN|DRIFT, target, observed, expected, suggested_action}`.
3. **Aggregate findings**: append to `system-board.yaml.state.audit_findings[]` with the run timestamp.
4. **Decision**:
   - All findings `INFO` or empty → mark `last_audit.outcome: CLEAN`. Log to `hustler_hub.recent_events`. No further action.
   - Any `WARN` (e.g., stale focus, borderline quality survivor) → mark `last_audit.outcome: WARN`. Surface in `hustler_hub.messages` with `severity: WARN`. No card created unless user requests.
   - Any `DRIFT` (checks 1-5) → mark `last_audit.outcome: DRIFT`. Post a remediation message in `hustler_hub.messages` with `severity: DRIFT` listing each finding and the suggested action (operational fix queued for next cycle, OR runbook fix escalated to Scaler INTERNAL).
5. **Release lock**: `audit_in_progress: false`, update `last_audit.completed_at`.

### 7.5 Hard Rules for the Audit Pass
- The Audit Pass **never directly modifies** validated artifacts, ledgers, trackers, or feature data. Drift remediation flows through the next cascade/processing cycle, or through the Scaler INTERNAL pipeline for runbook changes.
- The Audit Pass is **bounded in time**: if any check exceeds the `audit_check_timeout` configured in `system-board.yaml` (default 5 minutes per check), it is logged as `INCOMPLETE` and the cycle continues.
- Findings remain in `system-board.yaml.state.audit_findings[]` for at least 1 quarter (rotates with `.hustler_archive/`) for traceability.
- The Audit Pass MUST NOT scan `_HUSTLER-EXTERNAL_SOURCES/.hustler_USER-SPACE/`.
- Audit Pass operates strictly within Hustler scope. It does not read from or write to Scaler ledgers, Scaler runbooks, or Scaler runtime under any circumstance.
