# ⚙️ Hustler Workflows

## Objective
**Purpose:** Implement a structured **5-Phase execution approach** for the Hustler pipeline, with mandatory cascading discovery, atomic tracker updates, and mode-aware integration behavior.

## 1. The 5-Phase Hustler Approach

All Hustler execution strictly adheres to this sequence. Phases 1-2 are routing; phases 3-5 are content processing.

### Phase 1: Ingestion
- **Gateway Delivery (FIRST PRIORITY)**: Before processing any cascade work, check `INBOX-inboxing/` for items the user has dropped (tracked in `INBOX-tracker.yaml` with `status: pending`). For each pending item:
  1. Compute content hash; check `INBOX-tracker.yaml` for anti-duplication.
  2. If new: COPY (never move) item into `INBOX-gateway/<focus_or_pillar>/` subfolder and log delivery in tracker.
  3. Queue item for Phase 2 (Cascading Discovery) from the gateway location.
- **RESEARCH Delivery**: Check `RESEARCH-researching/` for items the agent has researched (tracked in `RESEARCH-tracker.yaml` with `status: pending`). For each pending item:
  1. Compute content hash; check `RESEARCH-tracker.yaml` for anti-duplication.
  2. If new: COPY (never move) item into `RESEARCH-gateway/<focus_or_pillar>/` subfolder and log delivery in tracker.
- **Direct-drop Scan**: Items the user dropped directly into a feature's `00-data/` are tagged `[new-data]` per Hustler-Tagging-System.md and proceed to Phase 3.

### Phase 2: Cascading Discovery
- Read queued items from `INBOX-gateway/` and `RESEARCH-gateway/` subfolders (NOT from `INBOX-inboxing/` or `RESEARCH-researching/` directly).
- Apply the cascading decision tree in `Hustler-Cascading-Logic.md`:
  1. **Focus check** against the central `index.yaml` rollups (rolled up from per-focus `[focus].focus_ledger.yaml` files).
  2. **Product check** against the matched focus's `[focus]-PRODUCTS.yaml`.
  3. **Feature check** against the matched product's `[product]-FEATURES.yaml`.
- At each level: matched → cascade down. No match → check threshold:
  - Threshold reached → validate & promote (create the new Focus/Product/Feature folder).
  - Threshold not reached → keep in the appropriate `_*-discovery/` holding folder.
- **MANDATORY (H-LAW-006)**: Update the relevant ledger at the same moment as the move. Atomic.
- **Update tracker**: Once an item from the gateway is cascaded, update `INBOX-tracker.yaml` or `RESEARCH-tracker.yaml` with `status: cascaded` and `cascaded_to` details.

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

## 2. INBOX Execution Path
**Objective**: Deliver user-dropped sources from `INBOX-inboxing/` through the gateway into the Focus → Product → Feature hierarchy via the mandatory anti-duplication gate.

1. **Gateway Delivery (FIRST)**: For each pending item in `INBOX-inboxing/` (per `INBOX-tracker.yaml`):
   - Compute content hash; check `INBOX-tracker.yaml` for anti-duplication.
   - COPY into `INBOX-gateway/<focus_or_pillar>/`; update tracker with `status: delivered`.
2. **Cascading Discovery**: For each item in the gateway, apply Phase 2 logic above.
3. **Atomic move**: Source file cascaded in hierarchy → tracker updated with `status: cascaded` + `cascaded_to`. All in one operation per H-LAW-006.
4. **Mode-Aware Integration**:
   - `action_gates` permit → cascade autonomously.
   - Action NOT in `action_gates` → leave the proposed cascade in board `review_queue`.

---

## 3. RESEARCH Execution Path
**Objective**: Deposit web research results in `RESEARCH-researching/`, deliver to gateway, cascade.

1. **Research deposit**: Write research output (web scrapes, synthesis, market analysis) into `RESEARCH-researching/`. Log each item in `RESEARCH-tracker.yaml` with `status: pending`.
2. **Delivery**: COPY items into `RESEARCH-gateway/<focus_or_pillar>/` subfolders. Update tracker `status: delivered`.
3. **Cascading Discovery**: Same as INBOX path, but reads from `RESEARCH-gateway/`.
4. **Mode-Aware Integration**: Same rules as INBOX profile.

---

## 4. PROCESSING Execution Path
**Objective**: Convert cascaded raw data into validated feature requirements.

1. **Definition pass**: Phase 3.
2. **Needs pass**: Phase 4.1.
3. **Fulfillment pass**: Phase 4.2.
4. **Status update**: Reflect tag transitions in `[feature].yaml` AND `[product]-FEATURES.yaml` (per H-LAW-006 atomic tracker rule).

---

## 5. The Execution & Tracking Rule
- **Milestones vs. Hustler Ledgers**: Milestones (`.milestones/`) track High-Level Goals. Hustler ledgers track granular state — per-focus split into `focus_ledger` (strategic) + `sources_ledger` (anti-duplication), plus the dedicated `INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`.
- **Anti-Duplication**: When ingesting from inbox, append the content hash to the relevant tracker. The Hustler MUST NOT cascade the same source file twice. When cascading INTO a focus, also log in `[focus].sources_ledger.yaml`.
- **Toolbox Usage (Dynamic Detection)**: The Hustler MUST invoke toolboxes from `_shared/.shared-toolboxes/` for all analysis/extraction work (PDF parsing, web scraping, content classification, ranking, summarization, etc.). **There is no static mapping of phase → toolbox.** The agent detects the relevant toolbox per task by consulting the live toolbox catalog and the auto-generated toolbox router (`system-board.yaml`). This keeps the pipeline forward-compatible: as new toolboxes are added, the Hustler picks them up automatically without runbook changes.
- **Atomic Tracker Updates**: A cascade move MUST NEVER be committed without simultaneous updates to:
  1. The source tracker (`INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`)
  2. The target tracker (`[focus]-PRODUCTS.yaml` or `[product]-FEATURES.yaml` or `[feature].yaml`)
  3. The target focus's `focus_ledger` (strategic rollup) if a new product/feature was promoted

---

## 6. Mode-Aware Behavior

The `board.schema.yaml` profile block controls Hustler behavior:

```yaml
pipelines:
  hustler:
    profiles:
      INTERNAL:
        status: on | off
          EXECUTION:
            status: on | off
            action_gates: all | [string]
          PLANNING:
            status: on | off
            action_gates: []
      INBOX:
        ...
      RESEARCH:
        ...
```

| Setting | Behavior |
|---|---|
| `plan_first: off` | Agents execute directly per `auto_mode` and the active profile's `action_gates`. |
| `plan_first: on` | Agents MUST create a plan before executing any action. |
| `action_gates` | If the action is listed in the active phase's array, it is executed. If missing, it defaults to PLANNING. |
| `auto_mode: true` | Act decisively; document in board for async review. |
| `auto_mode: false` | Chat is primary. Wait for explicit approval. |

---

## 7. Per-Phase Reference Cards (Inputs / Outputs / Error Recovery / Hard Rules)

The narrative phases in §1 describe the *logic*. This section gives each phase a compact reference card so an agent can quickly locate (a) what data the phase consumes, (b) what it must produce, (c) what to do when something fails, and (d) the non-negotiable constraints. Prose stays in §1; this section is the lookup grid.

### 7.1 Phase 1 — Ingestion
- **Inputs**:
  - `entity-hustler-runtime/INBOX-inboxing/` (untyped staging)
  - `entity-hustler-runtime/RESEARCH-researching/` (agent research deposits)
  - Direct-drop files in any feature's `00-data/` (already past cascade)
  - `INBOX-tracker.yaml` / `RESEARCH-tracker.yaml` (anti-duplication)
- **Outputs**:
  - Per-source content hash logged in relevant tracker (delivery record).
  - 5-criteria `quality_scoring` block on the tracker entry (per H-LAW-015).
  - Source handed off to Phase 2 with its quality verdict (PASS / BORDERLINE / REJECTED).
  - Direct-drop items tagged `[new-data]` and forwarded to Phase 3.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | File appears in inbox but is locked / unreadable | Skip; log to `hustler_hub.messages` with `phase: 1, reason: read_failure` |
  | Hash collision (same content, different filename) | Treat as duplicate per H-LAW-006; log the alias and skip cascade |
  | Bundle folder dropped: nested files of unsupported types | Apply Bundle Completeness rule; record unread items in `unread_assets[]` |
  | Source fails ≤2 of the 5 quality criteria | Tag `quality: REJECTED`; archive to `.archived_runs/RESEARCH-archived_runs/REJECTED-quality/`; do NOT count toward thresholds |
- **Hard Rules**:
  - Staging scan precedes any other Phase 1 work (INBOX-inboxing → RESEARCH-researching).
  - Items in `entity-hustler-runtime/.complex_inboxes/` are NEVER scanned.
  - No source is logged in tracker without its quality scoring (H-LAW-015).
  - Bundle Completeness: no skipping by extension (Constraints §2).

### 7.2 Phase 2 — Cascading Discovery
- **Inputs**:
  - Sources passed from Phase 1 with quality verdict.
  - Central `index.yaml` rollups (auto-rolled from per-focus ledgers).
  - For each existing focus: `[focus]-PRODUCTS.yaml`.
  - For each existing product: `[product]-FEATURES.yaml`.
  - Active board `pipelines.hustler.profiles.[ACTIVE_PROFILE].runs.[ACTIVE_PHASE].action_gates` (per H-LAW-013).
- **Outputs**:
  - Sources moved into the correct level home (feature `00-data/` if matched; `_[product]-discovery/` or `_[focus]-discovery/` if held).
  - Validated Focus / Product / Feature folders + trackers when thresholds are met (per `Hustler-Cascading-Logic.md §3`).
  - Atomic update of source tracker + level tracker + parent rollup (per `Hustler-Architecture.md §7.4`).
  - Lineage edges appended to `[focus].focus_ledger.yaml.lineage_graph` (per `Hustler-Architecture.md §7.5`).
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Two existing focuses are equally plausible matches | Apply selection criteria from `Hustler-Cascading-Logic.md §5`: specificity → recency → human gate |
  | Threshold met but cluster is incoherent under semantic re-read | Reset cluster; do NOT validate; keep items in `_*-discovery/` with a flag |
  | Atomic trio write fails mid-transaction | Trigger H-LAW-006 recovery procedure (ABORT → leave source → roll back → log → surface → never auto-retry) |
  | Action is missing from action_gates list of active profile but auto_mode is true | Still respect the missing action_gates block (H-LAW-013 supersedes auto_mode for write actions) |
- **Hard Rules**:
  - Cluster-First Rule precedes per-item threshold counting (`Hustler-Cascading-Logic.md §7`).
  - Anti-thrashing: no Focus from a single source; no Feature without prior Product validation (`Hustler-Cascading-Logic.md §4`).
  - Quality bar (H-LAW-015): only sources with ≥3/5 score count toward thresholds.
  - Action gate (H-LAW-013): default to PLANNING when transition type is missing from both lists.

### 7.3 Phase 3 — Definition (`[new-data]` → `[new-def]`)
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

### 7.4 Phase 4 — Needs Fulfillment
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

### 7.5 Phase 5 — Productization
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

## 8. Audit Pass (Periodic Maintenance Workflow)

**Purpose:** A periodic, on-demand workflow that scans the Hustler's own state for drift between live disk and what its ledgers/state files claim. Outputs a remediation message in `hustler_hub.messages` (which the user may convert to a Scaler INTERNAL Mega-YAML if it touches Hustler runbooks). **The Audit Pass is Hustler-internal only — it scans Hustler artifacts only and never touches the Scaler pipeline.**

### 8.1 When the Audit Pass Runs
- **Manual trigger**: User sets `system-board.yaml.modes.hustler.audit_request: true`. The Hustler picks it up at the next cycle start.
- **Goal-completion trigger**: When a Hustler-related goal is marked `done` in `.milestones/`, the Hustler MAY queue an Audit Pass for the next cycle (configurable via `system-board.yaml.audit_policy`).
- **Drift-suspected trigger**: If H-LAW-006 recovery fired more than 2 times in a session, the next cycle automatically runs an Audit Pass.
- **Quarter rotation trigger**: Optional sweep when `.archived_runs/` rolls to a new quarter, to verify no archived feature references files that no longer exist.

### 8.2 Audit Scope
The Audit Pass is **read-mostly**: it scans, compares, and reports. It writes only to:
- `system-board.yaml.state.last_audit` + `audit_findings[]`
- A remediation message in `system-board.yaml.communication_hubs.hustler_hub.messages` IF drift is detected.
- `system-board.yaml.communication_hubs.hustler_hub.recent_events` with the audit summary.

The Audit Pass does NOT auto-fix drift. Any operational fix is queued for the next cascade/processing cycle. Any runbook fix is escalated to the Scaler INTERNAL pipeline (per `Hustler-Operational-Rules.md §5 Self-Evolution Protocol`).

### 8.3 The 6 Audit Checks
| # | Check | What it verifies |
|---|---|---|
| 1 | **Tracker-to-disk consistency** | Every `tracked_focus` / `tracked_product` / `tracked_feature` entry points to a folder that exists on disk. Every existing `[focus]/[product]/[feature]/` folder has a tracker entry. |
| 2 | **Tag consistency** | Every file in any `00-data/` carries a valid tag (`[new-data]`, `[processed-data]`, `[new-scraped]`). Every section in `[feature].yaml` carries a valid tag (`[new-def]`, `[new-needs]`, or no tag). The tag in the file matches the corresponding entry in `[product]-FEATURES.yaml.state.tracked_features[].tags`. |
| 3 | **Atomic-trio integrity** | For each cascade move recorded in any `sources_ledger`, verify the source file is at the destination and the level tracker reflects it. Orphans on either side indicate an H-LAW-006 partial-failure that wasn't fully rolled back. |
| 4 | **Provenance integrity** | Every `[new-scraped]` file carries the `<!-- Scraped for: ... -->` provenance header (`Hustler-Tagging-System.md §6`). Every retired focus/product/feature in `.archived_runs/RETIRED-*/` has a `retired_reason` and `successor_id` (or explicit `null`) per H-LAW-014. |
| 5 | **Lineage graph completeness** | Every validated feature has at least one inbound edge in `[focus].focus_ledger.yaml.lineage_graph` connecting it to a source. Orphan features (no source lineage) are flagged for review. |
| 6 | **Stale focus detection** | Focuses whose `last_updated` is > 90 days AND have no active `[new-data]` / `[new-def]` / `[new-needs]` tags are surfaced for re-evaluation (NOT auto-retired — that's a user decision via H-LAW-014 Deprecation Bridge). |

### 8.4 Audit Pass Procedure
1. **Pre-flight**: Confirm H-LAW-010 runbook immersion is fresh; lock `system-board.yaml.state.audit_in_progress: true` to prevent concurrent cycles.
2. **Run all 6 checks in order** (1 → 6). Each check produces a structured finding object: `{check_id, severity: INFO|WARN|DRIFT, target, observed, expected, suggested_action}`.
3. **Aggregate findings**: append to `system-board.yaml.state.audit_findings[]` with the run timestamp.
4. **Decision**:
   - All findings `INFO` or empty → mark `last_audit.outcome: CLEAN`. Log to `hustler_hub.recent_events`. No further action.
   - Any `WARN` (e.g., stale focus, borderline quality survivor) → mark `last_audit.outcome: WARN`. Surface in `hustler_hub.messages` with `severity: WARN`. No card created unless user requests.
   - Any `DRIFT` (checks 1-5) → mark `last_audit.outcome: DRIFT`. Post a remediation message in `hustler_hub.messages` with `severity: DRIFT` listing each finding and the suggested action (operational fix queued for next cycle, OR runbook fix escalated to Scaler INTERNAL).
5. **Release lock**: `audit_in_progress: false`, update `last_audit.completed_at`.

### 8.5 Hard Rules for the Audit Pass
- The Audit Pass **never directly modifies** validated artifacts, ledgers, trackers, or feature data. Drift remediation flows through the next cascade/processing cycle, or through the Scaler INTERNAL pipeline for runbook changes.
- The Audit Pass is **bounded in time**: if any check exceeds the `audit_check_timeout` configured in `system-board.yaml` (default 5 minutes per check), it is logged as `INCOMPLETE` and the cycle continues.
- Findings remain in `system-board.yaml.state.audit_findings[]` for at least 1 quarter (rotates with `.archived_runs/`) for traceability.
- The Audit Pass MUST NOT scan `entity-hustler-runtime/.complex_inboxes/`.
- Audit Pass operates strictly within Hustler scope. It does not read from or write to Scaler ledgers, Scaler runbooks, or Scaler runtime under any circumstance.