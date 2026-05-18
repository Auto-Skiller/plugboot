# ⚙️ Scaler Workflows

## Objective
Implement a structured 5-phase execution approach for the Scaler pipelines, with mandatory gateway routing, discovery intelligence, and mode-aware integration behavior.

---

## 1. The 5-Phase Scaler Approach
All Scaler execution strictly adheres to the 5-phase system approach for systems scaling.

### Phase 1: Discovery
- **EXTERNAL — Staging Scan (FIRST PRIORITY)**: Before scanning any typed discovery hub, check the corresponding inboxes inside `_SCALER-EXTERNAL_SOURCES/`. For each item found:
  1. Apply Discovery Boundary Logic to determine what it is and where it belongs.
  2. **GROUP AND MOVE**: Move it out of the inbox and into the correct, logically grouped folder strictly inside the parent matching `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` hub. **We NEVER draft proposals directly from an inbox.** Items from the inboxes MUST be grouped into the relevant typed discovery hub first. The mapping is absolute:
     - Items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` MUST be resolved and moved to `_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`, `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`, or `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/` (NEVER routed into `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/`).
     - Items in `_SCALER-EXTERNAL_SOURCES/_Foundational_Integrity_inbox/` MUST be grouped into new folders inside `_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`.
     - Items in `_SCALER-EXTERNAL_SOURCES/_Value_Generation_inbox/` MUST be grouped into new folders inside `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/`.
     - Items in `_SCALER-EXTERNAL_SOURCES/_Operational_Muscles_inbox/` MUST be grouped into new folders inside `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`.
  3. Log the routing in the relevant pillar `sources_ledger` (atomic with the move) before proceeding. Items from `.scaler_mixed_inbox/` are first logged in `.scaler_mixed_inbox.ledger.yaml` for anti-duplication.
- **EXTERNAL — Discovery Scan**: After clearing staging, scan the typed discovery hubs (`_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`, `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`, `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/`) for new, unprocessed discoveries. Apply **Discovery Boundary Logic** (see Section 5) to determine Discovery / Sub-Discovery / Sub-Sub-Discovery depth — never assume, always scan. **NEVER scan `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/`** (per P-LAW-015).
- **INTERNAL**: Audit the top-layer OS components (`meta_identity/`, `meta_router.yaml`, `toolboxes/`, etc.) to identify structural, capability, or business gaps.

### Phase 2: Mapping & Tracking (The Double-Scan Protocol)
Mandatory pre-drafting logic to determine the Integration Type after identifying targets.
- **Step 1: Strategic Interrogation (Identify Targets)**: Resolve the target Pillar and specific target files using meta-routing. **MANDATORY:** Perform a full read of target files to establish the "Base State."
- **Step 2: Source Scan**: Analyze the discovery logic, structure, and technical maturity.
- **Step 3: Cluster-First Audit**: Group standalone files and flat collection items by functional affinity (S5). Actively apply **Cross-Folder Clustering** to merge related items from disparate folders into cohesive domain groups.
- **Step 4: Resolve Type**: Read the Selection Criteria in `Scaler-Discovery-Logic.md`. Compare Target (Ground Truth) vs. Source (Discovery) to decide the best-fit `Integration_Type` (INJECT, UPGRADE, BUILD_NEW, EXTEND).
- **Step 5: Map ALL Aspects**: Identify every OS aspect this discovery enhances. Assign `primary_aspect` and populate the full `aspects` list.
- **Step 6: Track (sources_ledger first)**: Log in `[Pillar].sources_ledger.yaml` (anti-duplication via content hash). The auto-sync re-aggregates the `.scaler_routing/scaler_ledgers.yaml` rollup.

### Phase 3: Capability Engineering
- **Assess**: Determine if new or enhanced agentic skills, tools, or toolboxes from `.meta_brain/toolboxes/` are required to architect the solution.
- **Build**: Draft temporary or foundational logic in `.scaler_runtime/.scaler_scratch/` before finalizing the architecture.

### Phase 4: Architecting & Proposing (Strategic Gateway Phase)
- **Formulate**: Draft the permanent, deterministic solution using the resolved Integration Type and Workflow.
- **Multi-Target Logic**: A single discovery can route to multiple Integration Types with different targets in the same Proposal Card (v3.1). Grouped discoveries should have grouped proposals.
- **Gateway**: ALL outputs MUST be routed through the gateway:
  - External outputs → relevant pillar's proposals folder as a **Proposal Card (v3.1)**.
  - Internal outputs → `INTERNAL/[Pillar]/` as an **Internal Action Card**.
- **Review**: Address all cross-aspect requirements.
- **Mode Behavior**: Apply planning/execution mode rules from `Scaler-Architecture.md` Section 5.

### Phase 5: Integration
- **Gate Check**: Verify the proposal/solution has passed the gateway (is present in the proposals folder or `INTERNAL/` with `APPROVED` user_decision).
- **Merge**: Implement the drafted proposals and solutions directly into the Agentic OS Substrate.
- **Sync**: Update `.meta_brain/meta_router.yaml` and all needed scaler related files (e.g. scaler_state.yaml) and trigger `meta_sync.py` to self-heal the system map.

---

## 2. EXTERNAL Execution Path
**Objective**: Scan external data to draft system-enhancing proposals via the mandatory gateway.

1. **Staging Scan (FIRST)**: Check `_inbox/` folders. Route each item to its correct discovery folder using Discovery Boundary Logic. Log routing in sub-ledger before proceeding.
2. **Discovery Scan**: Scan typed pillar folders for new, unprocessed items. Apply Discovery Boundary Logic (Section 5) to determine D / SD / SSD depth — always scan, never assume.
3. **Analysis & Mapping**: Read scoped architectures first, then actual discovery content. Resolve `discovery_type`. Map ALL applicable aspects. Check pending proposals for merge candidates.
4. **Tracking (sources_ledger first)**: Log the discovery in the relevant `[Pillar].sources_ledger.yaml` (inside `scaler_ledgers/`) for anti-duplication. The auto-sync re-aggregates `.scaler_routing/scaler_ledgers.yaml` rollup. D-level discoveries also get an entry in the master `tracked_discoveries` list inside the pillar's `sources_ledger`.
5. **Capability Engineering**: Utilize `.meta_brain/toolboxes/` tools for analysis.
6. **Gateway — Proposal Card**: Generate Proposal Card in the pillar's proposals folder with all required fields. Do NOT copy blindly — always adapt, extract, or restructure to match Agentic OS systems.
7. **Mode-Aware Integration**:
   - `EXECUTION` mode → Directly integrate after self-review. Set `user_decision: APPROVED`.
   - `PLANNING` mode → Post review request in `CONTROLER.yaml` communication block. Await user approval.

---

## 3. INTERNAL Execution Path
**Objective**: Scan internal systems to identify gaps and propose permanent solutions via the mandatory gateway.

1. **Discovery**: Identify gaps in top-layer OS components.
    - **INTERNAL PROMPT**: If `scaler.input_mode: INTERNAL` (or `AUTO` resolving to `INTERNAL`), the agent MUST follow the active `system.action_gate`. If `EXECUTION`, run the analysis prompt immediately. If `PLANNING`, the executing agent MUST first ask the user for explicit approval (via direct prompt or CONTROLER.yaml). Once approved (or if in EXECUTION mode), the agent MUST run the following internal analysis prompt to begin discovery:
     > "Perform a comprehensive architectural audit of the Agentic OS Substrate. **Look at everything related** to the target pillar — every file, router, ledger, sync engine, identity doc, runbook, and CONTROLER field that touches it. Analyze all core pillars, systems, and logic structures to **identify gaps and enhancement opportunities**. For each gap surfaced, **figure out what caused it** (drift in a hand-edited field, missing schema, race condition, dead path, hardcoded value, etc.) and produce a fix that addresses both the gap **and its root cause**, so the same class of gap can never reappear. Ensure all components (milestones, CONTROLER, toolboxes, routing maps, pipeline state, ledgers) are **correctly linked** end-to-end with no orphan references and no broken paths. Simulate full end-to-end continuous workflows under **multi-session, multi-hour autonomous operation** to detect execution blockages, state-management gaps, lock contention, atomic-write failures, or any field that rots when two agents run in parallel. Aligned with v5.2 standard."

    - **EVOLVE PROMPT**: If `system.evolution_mode: EVOLVE`, the agent MUST perform a post-interaction evaluation to identify logical shifts, pattern emergences, or system gaps. The agent MUST run the following evolution prompt verbatim to drive the evaluation:
     > "Re-read every artifact related to the prompt, decision, or change just observed — runbooks, identity docs, sync engines, CONTROLER fields, routers, ledgers — and **look at everything related** to it before concluding. **Look for gaps and enhancement opportunities** the interaction surfaced or implied. For each gap, **figure out what caused it** at the system level (a missing law, an unenforced rule, a hand-edited field with no allow-list, a doc and code disagreeing, a race condition, a hardcoded value, a dead path) and produce an evolution patch that fixes both the gap **and its root cause**, so the same class of gap can never reappear. Ensure every cross-reference is **correctly linked** after the patch lands — no orphan paths, no schema drift between docs and engines. Simulate the change under **multi-session, multi-hour autonomous operation** before declaring it stable, then apply the Evolution Protocol to document and merge the findings into the relevant runbooks, identity docs, or `meta_identity/.pending_evolutions.yaml` queue."
   - **Constraint Enforcement**: This prompt MUST always be executed considering the `scaler.work_mode`, the `target_pillar`, and the global `system.action_gate`. The Scaler MUST explicitly **IGNORE** `scaler.action_gate` during this specific run, relying entirely on the system-level action gate.
2. **Mapping & Tracking**: Update the relevant pillar's `proposals_ledger` (`[Pillar].proposals_ledger.yaml` under `state.tracked_gaps`). Check for pending proposals that this gap connects to.
3. **Capability Engineering**: Utilize `.meta_brain/toolboxes/` tools for planning and logic engineering.
4. **Gateway — Internal Action Card**: Generate an Internal Action Card (Mega-YAML) in `INTERNAL/[target_pillar]/` with all required fields (action_id, gap, solution, user_decision).
5. **Mode-Aware Integration**:
   - `EXECUTION` mode (via global `system.action_gate`) → Directly implement solution after self-review. Set `user_decision: APPROVED`.
   - `PLANNING` mode (via global `system.action_gate`) → Post review request in `CONTROLER.yaml` communication block. Await user approval.

---

## 4. The Execution & Tracking Rule
- **Milestones vs. Scaler Ledgers**: The milestones (in `.meta_brain/milestones/`) track the High-Level Goal. The `scaler_ledgers/` inside `.scaler_brain/` act as the deep, granular ledgers mapping out those actual files, their current paths, and processing states.
- **Anti-Duplication**: When logging an external file, append its content hash to the relevant `[Pillar].sources_ledger.yaml.state.tracked_discoveries[]`, plus the `processed_matrix` for aspect+level tracking. The scaler MUST NOT process the exact same file for the exact same aspect and level twice. Items in `.scaler_mixed_inbox/` are first checked against `.scaler_mixed_inbox.ledger.yaml` before any cascade.
- **Toolbox Usage**: The `toolboxes` must be STRICTLY used during every action in the pipeline execution via meta routing (e.g., using a specific analysis or planning skill).
- **Gateway Compliance**: EVERY output must pass through the relevant pillar's proposals folder or `INTERNAL/[Pillar]/` before any integration. No exceptions. Direct integration without a gateway card is a protocol violation.

---

## 5. Discovery Analysis Intelligence
When analyzing items found in `_SCALER-EXTERNAL_SOURCES/`, the Scaler must apply intelligent analysis — **never blind copying**. The following decision tree governs how discoveries are handled:

### 5.1 Integration Decision Options
The Scaler evaluates each discovery and chooses one of the following integration strategies based on **how the enhancement is applied to the target aspect(s)**:

| Integration Type | When to Use | Example |
|---|---|---|
| **INJECT_INTO_EXISTING** | Discovery adds content INTO an existing file or structure without replacing it. The target already exists and is being enriched. | Adding a behavioral rule to `Rules_And_Considerations.md`; adding a new skill entry to an existing toolbox |
| **REPLACE_OR_UPGRADE** | Discovery is a direct, superior replacement or complete upgrade of an existing system, file, or tool. The old version is deprecated or superseded. | Replacing an existing agent with a better version; upgrading a skill to a new schema |
| **BUILD_NEW_COMPONENT** | Discovery provides a complete foundation to create a brand-new system component (file, toolbox, skill folder, engine) that does not currently exist. | Creating `karpathy_guidelines.md` in `.identity/`; adding a completely new domain toolbox |
| **EXTEND_EXISTING_SYSTEM** | Discovery expands an existing system by adding a new sub-component, branch, or feature while keeping the existing structure fully intact. | Adding a new sub-toolbox under `extended.toolbox/`; adding a new sync protocol to `.sync_engine/` |
| **RESTRUCTURE_ARCHITECTURE** | Discovery reveals that existing folder structure, naming, or system relationships need reorganization. **Always requires explicit user approval in ALL modes.** Post in `CONTROLER.yaml` before proceeding. | Splitting `identity` into sub-aspects; reorganizing the toolbox hierarchy |
| **MIGRATE_AND_REPOSITION** | Discovery is content that currently exists in the wrong location and must be moved to its correct OS home (with or without adaptation). | Moving a file to `hustler/` discoveries; repositioning a misrouted toolbox |
| **MERGE_WITH_PENDING** | Discovery directly extends or matches an existing pending proposal that is not yet fully implemented. Extend and update that proposal rather than creating a new one. | Adding a newly found agent to an existing PROP-EXT-AUTO-AGENTS card |

### 5.2 Core Analysis Rules
- **Assess before acting**: Always read the full discovery context before deciding on a strategy.
- **Check pending proposals first**: Before creating a new proposal, scan all existing gateway folders (the proposals folder inside pillars, `INTERNAL/[Pillar]/`) for pending items the discovery can extend.
- **Never copy blindly**: If taking a full file, it must be confirmed compatible with OS schema. If in doubt, use ADAPT_AND_INTEGRATE.
- **Multi-discovery synthesis**: It is valid and encouraged to synthesize parts from multiple discoveries into a single coherent proposal card.
- **Architecture changes need approval**: If the analysis concludes that the OS architecture itself must change to accommodate the discovery (`ARCHITECTURE_AUDIT`), this ALWAYS requires explicit user approval regardless of `action_gate` mode. Post in `CONTROLER.yaml` communication block.



---

## 6. Per-Phase Reference Cards (Inputs / Outputs / Error Recovery / Hard Rules)

The narrative phases in §1 describe the *logic*. This section gives each phase a compact reference card so an agent can quickly locate (a) what data the phase consumes, (b) what it must produce, (c) what to do when something fails, and (d) the non-negotiable constraints. Prose stays in §1; this section is the lookup grid.

### 6.1 Phase 1 — Discovery
- **Inputs**:
  - `_SCALER-EXTERNAL_SOURCES/_[Pillar]_inbox/` (typed staging)
  - `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` (untyped staging)
  - `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` (already-typed hubs)
  - For INTERNAL: `.meta_brain/meta_identity/`, `.meta_brain/meta_router.yaml`, `.meta_brain/toolboxes/`, `CONTROLER.yaml`
- **Outputs**:
  - Items routed from staging into the correct typed discovery hub (with new functional groups created when needed per P-LAW-014).
  - Sub-ledger entries in the relevant `[Pillar].sources_ledger.yaml.tracked_discoveries[]` (atomic with the move; no entry without a move and no move without an entry).
  - For INTERNAL: a list of identified gaps queued for Phase 2 mapping.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | File appears in staging but is locked / unreadable | Skip; log to `scaler_hub.messages` with `phase: 1, reason: read_failure`; never silent-skip |
  | Routing target hub unclear (mixed-pillar content) | Apply Cluster-First Rule first; if still unclear, post to `scaler_review_queue` with `status: routing_undecided` |
  | Atomic move + ledger update fails mid-write | Trigger P-LAW-019 rollback; leave file in origin |
  | Staging folder still non-empty after Phase 1 completes | Phase 2 MUST NOT begin (see Hard Rules) |
- **Hard Rules**:
  - Staging scan precedes the typed-hub scan. Always.
  - Items in `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/` are NEVER scanned (P-LAW-015).
  - No proposal drafting from inbox content (P-LAW-016).
  - Discovery Boundary Logic (`Scaler-Discovery-Logic.md §3`) is the only valid depth-resolver — never assume D / SD / SSD without scanning.

### 6.2 Phase 2 — Mapping & Tracking (Double-Scan Protocol)
- **Inputs**:
  - Items routed by Phase 1 into typed hubs.
  - Target file contents (from full-read of `target_files` resolved via Strategic Interrogation §2.3 of `Scaler-Architecture.md`).
  - Pending proposal cards in `[Pillar]_external_proposals/` and `[Pillar]_internal_proposals/` (for `MERGE_WITH_PENDING` resolution).
- **Outputs**:
  - Resolved `Integration_Type` per item (one of the 7 EXTERNAL types or 6 INTERNAL change types).
  - `primary_aspect` + populated `aspects[]` list.
  - Cluster groupings via Cluster-First audit (S5 Functional Affinity).
  - Updated `[Pillar].sources_ledger.yaml` with `processed_matrix` reflecting the aspect+level pair.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Two integration types are equally plausible | Apply tie-breaking order from `Scaler-Discovery-Logic.md §3.4` |
  | Target file not found in interrogated pillar | Default to `BUILD_NEW_COMPONENT`; flag in card's `scaler_notes` |
  | Source contradicts existing pending proposal | Stop; post in `scaler_review_queue` with both card IDs and the contradiction; do NOT auto-merge |
  | Aspect resolution exceeds 5 aspects on a single card | Re-audit for fragmentation (P-LAW-009); if genuinely multi-aspect, proceed |
- **Hard Rules**:
  - Ground Truth (target file full read) precedes Source analysis. Never invert.
  - Cluster-First audit MUST run before drafting (P-LAW-009 fragmentation prevention).
  - Sub-ledger first, master rollup auto-syncs (P-LAW-001).

### 6.3 Phase 3 — Capability Engineering
- **Inputs**:
  - Resolved `Integration_Type` from Phase 2.
  - Toolbox catalog `.meta_brain/toolboxes/` and router `.meta_brain/.meta_routing/toolboxes.yaml`.
  - Existing skill / agent inventory of the target toolbox.
- **Outputs**:
  - Draft logic in `.scaler_runtime/.scaler_scratch/` (foundational sketches, not yet finalized).
  - For Operational_Muscles INJECT/BUILD/EXTEND: a fully-formed `toolbox_target` block per `Scaler-Gateway.md §5.1`.
  - Identified missing capabilities (gaps that will themselves become INTERNAL Mega-YAMLs).
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Required toolbox capability is missing | Spawn an INTERNAL Mega-YAML (`change_type: CREATE_MISSING_COMPONENT`); pause the EXTERNAL card until the dependency is integrated |
  | Scratch drafts grow > 5 files for a single discovery | Re-audit fragmentation; reconsider whether this should be a multi-card hierarchy (Master + Sub-Proposals per `Scaler-Discovery-Logic.md §5`) |
  | Scratch leak risk (file accidentally modified outside `.scaler_scratch/`) | Trigger P-LAW-019 rollback; restore target |
- **Hard Rules**:
  - All temporary work happens in `.scaler_runtime/.scaler_scratch/`. Never draft in target files directly.
  - Toolbox usage is mandatory via meta_routing — no ad-hoc inline scripts.

### 6.4 Phase 4 — Architecting & Proposing (Strategic Gateway Phase)
- **Inputs**:
  - Resolved type + drafted logic from Phases 2-3.
  - Active CONTROLER profile (`INTERNAL` or `EXTERNAL`).
  - Card schema from `Scaler-Operational-Rules.md §7` and lifecycle from `Scaler-Gateway.md`.
- **Outputs**:
  - One `.yaml` Proposal Card or Internal Action Card (Mega-YAML) at the appropriate `[Pillar]_external_proposals/` or `[Pillar]_internal_proposals/` location.
  - Atomic ledger write per `Scaler-Gateway.md §6` (Atomic Update Cross-Reference).
  - Provenance marker on any newly-created artifact (P-LAW-020) once integration runs in Phase 5.
  - Review-queue entry in `CONTROLER.yaml.communication_hubs.scaler_hub.scaler_review_queue` if PLANNING.
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | Card schema validation fails | P-LAW-019 rollback; do NOT leave a malformed card on disk |
  | Ledger write succeeds but card write fails (or vice versa) | P-LAW-019 rollback; revert the successful side |
  | Card spans more aspects than scoped | Split into Master + Sub-Proposals (`Scaler-Discovery-Logic.md §5.2`); each gets its own atomic write |
  | Auto-set `user_decision: APPROVED` (EXECUTION) but self-review reveals a contradiction with a pending card | Flip to PLANNING; post in `scaler_review_queue` |
- **Hard Rules**:
  - All cards are `.yaml` only (P-LAW-003).
  - `RESTRUCTURE_ARCHITECTURE` and new-scope suggestions ALWAYS require user approval regardless of action_gate mode.
  - Card ID uses descriptive names, never numeric sequences (per `Scaler-Gateway.md §1`).

### 6.5 Phase 5 — Integration
- **Inputs**:
  - A card with `user_decision: APPROVED` (set by user or auto-set in EXECUTION mode).
  - All `files_involved` actions resolved with absolute paths.
- **Outputs**:
  - Target files modified per `execution_plan.steps`.
  - Provenance markers written on CREATE actions (P-LAW-020).
  - Card `integration_status: INTEGRATED` + `integrated_at` timestamp.
  - Ledger entry `integration_status: INTEGRATED` (or `tracked_gaps[]` → `history[]` for INTERNAL).
  - Post-integration sync: `scaler_state.yaml`, `CONTROLER.yaml.last_sync` + `recent_events`, `meta_router.yaml` re-assembly via `meta_sync.py`.
  - Card archived per Step 7 of `Scaler-Gateway.md` (date-bucketed quarter folder).
- **Error Recovery**:
  | Failure mode | Action |
  |---|---|
  | A `MOVE` / `CREATE` / `EDIT` step fails mid-way | P-LAW-019 reverse-order rollback; auto-draft a Remediation Action Card (Step 5.4 of `Scaler-Gateway.md`) |
  | Verification scan post-integration shows drift from `execution_plan` | Trigger Audit Pass (§7); do NOT mark `INTEGRATED` |
  | `meta_sync.py` fails after integration | Card stays `PENDING_INTEGRATION`; surface to scaler_hub.messages; never claim INTEGRATED with broken router |
  | `last_sync` not updated | Step 5 + Step 6 are not separable (P-LAW-006); rerun the post-sync block |
- **Hard Rules**:
  - Steps 5 and 6 of `Scaler-Gateway.md` are atomic in spirit (P-LAW-019 enforces); never claim integration without `last_sync` update.
  - Archiving (Step 7) is mandatory once integrated (P-LAW-011 Fresh Start Law).
  - For Operational_Muscles cards: post-integration health-status check is mandatory (`Scaler-Gateway.md §5.2`).

---

## 7. Audit Pass (Periodic Maintenance Workflow)

**Purpose:** A periodic, on-demand workflow that scans the Scaler's own state for drift between the live workspace and what its ledgers/state files claim. Outputs an INTERNAL Mega-YAML if drift is detected. **The Audit Pass is Scaler-internal only — it scans Scaler artifacts only and never touches the Hustler pipeline.**

### 7.1 When the Audit Pass Runs
- **Manual trigger**: User sets `CONTROLER.yaml.modes.scaler.audit_request: true`. The Scaler picks it up at the next cycle start.
- **Goal-completion trigger**: When a Scaler-related goal is marked `done` in `.meta_brain/milestones/`, the Scaler MAY queue an Audit Pass for the next cycle (configurable via `scaler_state.yaml.audit_policy`).
- **Drift-suspected trigger**: If P-LAW-019 rollback fired more than 2 times in a session, the next cycle automatically runs an Audit Pass to verify nothing leaked through partial recoveries.
- **Quarter rotation trigger**: Optional sweep when `.scaler_archive/` rolls to a new quarter, to verify no archived card references files that no longer exist.

### 7.2 Audit Scope
The Audit Pass is **read-mostly**: it scans, compares, and reports. It writes only to:
- `scaler_state.yaml.state.last_audit` + `audit_findings[]`
- A new INTERNAL Mega-YAML in `[Pillar]_internal_proposals/` IF drift is detected (named `MEGA-INT-AUDIT-REMEDIATION-[timestamp]`).
- `CONTROLER.yaml.communication_hubs.scaler_hub.recent_events` with the audit summary.

The Audit Pass does NOT auto-fix drift. Remediation flows through the standard gateway (the Mega-YAML it creates).

### 7.3 The 6 Audit Checks
| # | Check | What it verifies |
|---|---|---|
| 1 | **Card-to-file consistency** | Every card with `integration_status: INTEGRATED` has its `files_involved` actions reflected on disk (CREATE→file exists; DELETE→file absent; MOVE→file at new location not old). |
| 2 | **Ledger-to-disk consistency** | Every entry in each `[Pillar].sources_ledger.yaml.tracked_discoveries[]` has its `source_path` still present in the workspace OR an `archived_at` timestamp explaining its absence. |
| 3 | **Atomic-trio integrity** | For each card in a gateway folder, verify the matching ledger entry exists. For each ledger entry with a `proposal_ids[]`, verify the cards exist in either the active gateway or `.scaler_archive/`. Orphans on either side indicate a P-LAW-019 partial-failure that wasn't fully rolled back. |
| 4 | **Provenance integrity (P-LAW-020)** | For every artifact whose first commit was authored by the Scaler (heuristic: file matches a `files_involved.action: CREATE` from any archived card), verify it carries a provenance marker. Missing markers are flagged. |
| 5 | **Router freshness** | Compare `.scaler_routing/scaler_ledgers.yaml` and `.scaler_routing/scaler_runtime.yaml` against live disk state. Any mismatch indicates a missed `meta_sync.py` run after a recent integration. |
| 6 | **Pending-queue staleness** | Scan `scaler_review_queue` for entries older than 14 days with `status: PENDING`. Stale entries surface to `scaler_hub.messages` for user attention (no auto-action). |

### 7.4 Audit Pass Procedure
1. **Pre-flight**: Confirm P-LAW-008 runbook immersion is fresh; lock `scaler_state.yaml.state.audit_in_progress: true` to prevent concurrent cycles from conflicting.
2. **Run all 6 checks in order** (1 → 6). Each check produces a structured finding object: `{check_id, severity: INFO|WARN|DRIFT, target, observed, expected, suggested_action}`.
3. **Aggregate findings**: append to `scaler_state.yaml.state.audit_findings[]` with the run timestamp.
4. **Decision**:
   - All findings `INFO` or empty → mark `last_audit.outcome: CLEAN`. No card created.
   - Any `WARN` (e.g., stale pending) → mark `last_audit.outcome: WARN`. Surface in `scaler_hub.messages`. No card created unless user requests.
   - Any `DRIFT` (checks 1-5) → mark `last_audit.outcome: DRIFT`. Auto-draft an INTERNAL Mega-YAML with `change_type: AUDIT_AND_REMEDIATE` listing each drift finding under `solution.execution_plan.steps`. The card flows through the standard gateway lifecycle in `Scaler-Gateway.md`.
5. **Release lock**: `audit_in_progress: false`, update `last_audit.completed_at`.

### 7.5 Hard Rules for the Audit Pass
- The Audit Pass **never directly modifies** integrated artifacts or ledgers. Drift is fixed only via the standard gateway (Mega-YAML it produces).
- The Audit Pass is **bounded in time**: if any check exceeds the `audit_check_timeout` configured in `scaler_state.yaml` (default 5 minutes per check), it is logged as `INCOMPLETE` and the cycle continues to the next check.
- Findings remain in `scaler_state.yaml.state.audit_findings[]` for at least 1 quarter (rotates with `.scaler_archive/`) for traceability.
- The Audit Pass MUST NOT scan `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/` (P-LAW-015 still applies).
- Audit Pass operates strictly within Scaler scope. It does not read from or write to Hustler ledgers, Hustler runbooks, or Hustler runtime under any circumstance.
