# ⚙️ Scaler Workflows

## Objective
Implement a structured 5-phase execution approach for the Scaler pipeline, with mandatory run-based delivery, discovery intelligence, and mode-aware integration behavior.

---

## 1. The 5-Phase Scaler Approach

All Scaler execution strictly adheres to this sequence.

### Phase 1: Discovery

**INBOX / RESEARCH profile — Gateway Delivery (FIRST PRIORITY):**
Before generating any runs, the agent MUST first check `INBOX-inboxing/` (for INBOX profile) or `RESEARCH-researching/` (for RESEARCH profile) for undelivered items. Each item must be:
1. Read and analyzed to determine which pillar(s) it belongs to
2. **Copied** (never moved) into the matching `INBOX-gateway/<Pillar>/` or `RESEARCH-gateway/<Pillar>/` subfolder
3. Logged in `INBOX-tracker.yaml` or `RESEARCH-tracker.yaml` with delivery record and pillar routing

After delivery is complete, scan the gateway pillar subfolders for unprocessed content — this is what drives planning runs.

**INTERNAL profile — Internal Audit:**
Audit the top-layer OS components (`_system/.system-meta/.system-os_prompts/`, `system-board.yaml`, `_shared/.shared-toolboxes/`, runbooks) to identify structural, capability, or business gaps. Runs are generated from gap findings.

> **Rule:** Never generate planning runs from `INBOX-inboxing/` or `RESEARCH-researching/` directly. Always deliver to gateway first.

### Phase 2: Mapping & Tracking (The Double-Scan Protocol)
Mandatory pre-run logic to determine the Integration Type and target files.
- **Step 1: Strategic Interrogation**: Resolve the target pillar and specific target files using meta-routing via `index.yaml`. **Perform a full read of target files** to establish the "Base State."
- **Step 2: Source Scan**: For INBOX/RESEARCH runs, read the full gateway pillar subfolder as a single unit. Analyze discovery logic, structure, and technical maturity.
- **Step 3: Existing Run Check**: Before drafting a new planning run, scan existing runs in `<PROFILE>-PLANNING_runs/` and `<PROFILE>-EXECUTION_runs/`. If a pending run already covers this content, extend it rather than creating a duplicate.
- **Step 4: Resolve Integration Type**: Compare Target (Ground Truth) vs. Source (Discovery) to decide the best-fit `integration_type`. See §5 for the selection table.
- **Step 5: Map ALL Pillars and Objectives**: Identify every pillar this run targets. Set `focused_pillars`, `focused_objective`, and `action_gates`.
- **Step 6: Update Tracker**: Update `INBOX-tracker.yaml` or `RESEARCH-tracker.yaml` with `processed_by_runs` reference once a run is created.

### Phase 3: Capability Engineering
- **Assess**: Determine if new or enhanced agentic skills, tools, or toolboxes from `_shared/.shared-toolboxes/` are required.
- **Build**: Draft temporary logic in a run's artifact files inside the run folder before finalizing.

### Phase 4: Architecting & Planning the Run (Strategic Gateway Phase)
- **Formulate**: Draft the complete planning run — the `<run_name>.yaml` file — inside the correct `<PROFILE>-PLANNING_runs/<run_name>/` folder.
- **Board Entry**: Immediately add the run to the board under `pipelines.<pipeline_name>.profiles.<PROFILE>.runs.PLANNING.PLANNING_runs` with `status: PLANNING`.
- **Run content**: Must include `run_summary`, `focused_pillars`, `focused_objective`, `action_gates`, `source_gateway_items` (for INBOX/RESEARCH), and `target_files` (for INTERNAL).
- **Mode Behavior**: Apply planning/execution mode rules from `Scaler-Architecture.md §2.1` and §7 of `Pipelines_Architecture.md`.

### Phase 5: Integration (Execution)
- **Gate Check**: Verify the run has `status: EXECUTION` (user approved or auto-approved per `action_gates`). Do NOT begin without this.
- **Execute**: Implement the changes defined in the run YAML against the target files.
- **Update**: Change run status to `completed` in board. Run folder stays in `EXECUTION_runs/` folder.
- **Sync**: Update `system-board.yaml` state fields, `recent_events`, and trigger `engine.py` to resync the index.
- **Archive signal**: Wait for user to set `archive` → then set `archived`, move run folder to `.archived_runs/<PROFILE>-archived_runs/`, and remove from board.

---

## 2. INBOX Profile Execution Path

**Objective:** Ingest content from `INBOX-inboxing/` through gateway delivery into planning runs.

1. **Delivery check**: Read `INBOX-tracker.yaml` — find items with `status: pending`.
2. **Per-item delivery**: For each pending item, analyze pillar assignment (use `Scaler-Architecture.md §5` pillar definitions). COPY into `INBOX-gateway/<Pillar>/`. Update tracker `status: delivered`.
3. **Gateway scan**: After delivery, scan `INBOX-gateway/` subfolders for unprocessed content (items with no `processed_by_runs` entry in tracker).
4. **Analysis prompt**: Before planning any run, read `pipelines.scaler.pillars.active_pillars` from the board to understand each pillar's `description`, `examples`, `why`, and `objective`. Then apply the following analysis contract:

   > "An external item has been delivered into a gateway pillar folder. Drive the analysis with this contract. **Read order is strict**: OS identity files first (especially `01_architecture-Hard_Laws.md` and `01_architecture-Evolution_Protocol.md`), then the relevant runbooks, then the **existing pillar architecture** (current capabilities, schemas, vocabulary), then the gateway content itself — never the content first. **DNA Preservation has two tiers** determined by the target pillar:
   >
   > **Tier 1 — Foundational_Integrity (STRICT preservation).** Architectural DNA is immutable. Existing laws, schemas, vocabularies, routing contracts, and the three-pillar hierarchy MUST remain. Adopt the discovery into our DNA, not our DNA into the discovery. If the content cannot be adopted without replacing existing DNA, propose the closest enhancement alternative; otherwise do not create a run for it.
   >
   > **Tier 2 — Operational_Muscles and Value_Generation (permissive).** These pillars are open to additive change. Add toolboxes, business features, and value-generation strategies freely under existing schema contracts. The only floors are: (a) honor the toolbox/run schema; (b) don't contradict an active law.
   >
   > Always check what already exists before drafting. Skip anything already covered by a pending or active run. Map every aspect this content touches. Anti-blind-copy mandate: if the content cannot be placed into the workspace vocabulary, archive it with rationale — do not create a run."

5. **Run creation**: Draft a planning run for each coherent unit of gateway content. Create the run folder in `INBOX-PLANNING_runs/<run_name>/`, write the run YAML, add board entry.
6. **Mode-Aware Integration**:
   - **Autonomous Execution** (action type in `action_gates` + `plan_first` off) → Auto-approve: move run to `INBOX-EXECUTION_runs/`, update board to `EXECUTION`, begin Phase 5.
   - **Planning Mode** (action type missing from `action_gates` OR `plan_first` on) → Leave in `INBOX-PLANNING_runs/`, post review request in board `review_queue`. Await user `approve`.

---

## 3. RESEARCH Profile Execution Path

**Objective:** Deposit web research results in `RESEARCH-researching/`, deliver to gateway, generate runs.

1. **Research deposit**: Write research output (web scrapes, synthesis, market analysis) into `RESEARCH-researching/`. Log each item in `RESEARCH-tracker.yaml` with `status: pending`.
2. **Delivery**: COPY items into `RESEARCH-gateway/<Pillar>/` subfolders. Update tracker `status: delivered`.
3. **Gateway scan + analysis**: Same as INBOX path (§2 steps 3–5), but reads from `RESEARCH-gateway/`.
4. **Run creation**: Create run folder in `RESEARCH-PLANNING_runs/<run_name>/`.
5. **Mode-Aware Integration**: Same rules as INBOX profile.

---

## 4. INTERNAL Profile Execution Path

**Objective:** Audit internal systems to identify gaps and generate runs to fix them.

1. **Discovery**: Audit OS components following the INTERNAL analysis prompt:

   > "Perform a wide proactive audit of the Agentic OS for the target pillar. **Read order is strict**: identity files and relevant runbooks first, then every system file that touches the target pillar (boards, index, toolboxes, pipelines, engine scripts, schemas). Skip archive contents and raw inbox contents — read the systems, not the data they hold. For each gap: identify the underlying mechanism (drift, missing schema, race condition, dead path, hardcoded value, doc/code disagreement, unenforced rule). For each enhancement: identify what makes it valuable (which law it strengthens, which friction it removes). Produce fixes that address root causes so the same class cannot recur. Logic preservation applies (`01_architecture-Evolution_Protocol.md`): existing operational logic must be modernized, not deleted — mark obsolete rules deprecated with a successor. Verify everything is correctly linked end-to-end. Simulate under multi-hour autonomous operation with multiple agents in parallel to surface any field that rots under contention."

   **EVOLVE PROMPT** (when `evolution.status: on`): After any significant interaction, also run:

   > "A change has landed — evolve the system around it. Identify what was observed: the user's intent, the surface area, the implicit logic shift. Look at everything related to that specific change: every artifact, runbook, board field, router, schema, and contract the change touches. **Surgical replacement first** — minimum precise edit needed. Then ripple-effect detection: walk every cross-reference outward one hop. For every gap surfaced, fix both the visible gap and its root cause. Logic preservation applies. Verify all cross-references resolve cleanly after the patch."

2. **Mapping**: Check `INTERNAL-PLANNING_runs/` and `INTERNAL-EXECUTION_runs/` for existing runs that already cover the gap. If found, extend that run rather than creating a duplicate.
3. **Capability Engineering**: Use `_shared/.shared-toolboxes/` for analysis and logic engineering.
4. **Run creation**: Create run folder in `INTERNAL-PLANNING_runs/<run_name>/`. Write run YAML with all `target_files` and `action_gates`.
5. **Mode-Aware Integration**: Same rules — `action_gates` + `plan_first` determine autonomous vs. planning mode.

---

## 5. Integration Decision Options

When resolving what a run will do to target files, the agent chooses one of these `integration_type` values:

| Integration Type | When to Use |
|------------------|-------------|
| `INJECT_INTO_EXISTING` | Adds content INTO an existing file without replacing it |
| `REPLACE_OR_UPGRADE` | Direct superior replacement or complete upgrade of an existing system |
| `BUILD_NEW_COMPONENT` | Creates a brand-new file/toolbox/folder that does not currently exist |
| `EXTEND_EXISTING_SYSTEM` | Expands an existing system by adding a sub-component while keeping the existing structure |
| `RESTRUCTURE_ARCHITECTURE` | Reorganizes folder structure, naming, or system relationships. **Always requires explicit user approval regardless of action_gates.** |
| `MIGRATE_AND_REPOSITION` | Moves content from a wrong location to its correct home |
| `MERGE_WITH_PENDING` | Extends an existing pending run rather than creating a new one |

### Core Analysis Rules
- **Assess before acting**: Always read the full source and target context before resolving type.
- **Check existing runs first**: Before creating a new run, scan `*-PLANNING_runs/` and `*-EXECUTION_runs/`.
- **Never copy blindly**: Content must be adapted into the workspace vocabulary and schema.
- **Restructure requires approval**: `RESTRUCTURE_ARCHITECTURE` always requires explicit user approval.

---

## 6. The Execution & Tracking Rule

- **Board is the control plane**: Every run's status lives in the board. Disk folder location must always match board status.
- **Tracker accuracy**: Every gateway delivery and every run that consumes a gateway item must be logged in `INBOX-tracker.yaml` or `RESEARCH-tracker.yaml`.
- **Toolbox usage**: Toolboxes from `_shared/.shared-toolboxes/` MUST be used during every analysis and planning action.
- **Anti-duplication**: Before delivering an item to the gateway, check the relevant tracker for duplicate content. Same item delivered twice is a protocol error.

---

## 7. Per-Phase Reference Cards

### 7.1 Phase 1 — Discovery / Delivery
- **Inputs**:
  - `INBOX-inboxing/` items with `status: pending` in `INBOX-tracker.yaml` (INBOX profile)
  - `RESEARCH-researching/` items with `status: pending` in `RESEARCH-tracker.yaml` (RESEARCH profile)
  - Internal OS files and system-board.yaml (INTERNAL profile)
- **Outputs**:
  - Items copied into `INBOX-gateway/<Pillar>/` or `RESEARCH-gateway/<Pillar>/` with tracker updated
  - For INTERNAL: a list of identified gaps queued for Phase 2 mapping
- **Error Recovery**:

  | Failure mode | Action |
  |---|---|
  | Item in inboxing is unreadable/locked | Skip; log to board `review_queue` with `phase: 1, reason: read_failure` |
  | Pillar assignment unclear | Post to board `review_queue` with `status: routing_undecided`; do not deliver until resolved |
  | Tracker write fails after copy | Roll back the copy; leave item with `status: pending`; log error |
- **Hard Rules**:
  - COPY never move from inboxing/researching to gateway
  - Never generate runs before delivery is complete
  - Update tracker atomically with the copy

### 7.2 Phase 2 — Mapping & Tracking
- **Inputs**: Gateway pillar subfolder content; target file contents from full read; existing runs in `*-PLANNING_runs/` and `*-EXECUTION_runs/`
- **Outputs**: Resolved `integration_type`; `focused_pillars`; `focused_objective`; `action_gates`; tracker updated with `processed_by_runs` reference
- **Error Recovery**:

  | Failure mode | Action |
  |---|---|
  | Two integration types equally plausible | Prefer the less destructive type; note reasoning in run summary |
  | Target file not found | Default to `BUILD_NEW_COMPONENT`; flag in run summary |
- **Hard Rules**: Read target files before source content (ground truth first); check existing runs before creating new ones

### 7.3 Phase 3 — Capability Engineering
- **Inputs**: Resolved type; toolbox catalog
- **Outputs**: Draft logic as artifact files inside the run folder
- **Hard Rules**: All temporary logic stays as run artifact files, never written to target files directly

### 7.4 Phase 4 — Architecting & Planning the Run
- **Inputs**: Resolved type + drafted logic; active board profile
- **Outputs**: `<run_name>.yaml` in the correct `<PROFILE>-PLANNING_runs/<run_name>/` folder; board entry with `status: PLANNING`
- **Error Recovery**:

  | Failure mode | Action |
  |---|---|
  | Run YAML schema validation fails | Do not create board entry; fix and re-draft |
  | Board write succeeds but folder creation fails (or vice versa) | Roll back both sides |
- **Hard Rules**: Run folder and board entry created atomically; `RESTRUCTURE_ARCHITECTURE` always posts to `review_queue` regardless of `action_gates`

### 7.5 Phase 5 — Integration
- **Inputs**: Run with `status: EXECUTION`; all target file paths resolved from `index.yaml`
- **Outputs**: Target files modified; run `status: completed` in board; tracker items marked `status: processed`
- **Error Recovery**:

  | Failure mode | Action |
  |---|---|
  | A modification step fails mid-way | Roll back completed steps in reverse order; set run status back to `EXECUTION` with error note in run YAML |
  | engine.py fails after integration | Surface to board `review_queue`; never mark `completed` until index is synced |
- **Hard Rules**: Never begin Phase 5 without `status: EXECUTION`; archiving is user-triggered (via `archive` signal), not automatic

---

## 8. Audit Pass (Periodic Maintenance Workflow)

**Purpose:** A periodic, on-demand workflow that scans the Scaler's own state for drift. Outputs an INTERNAL planning run if drift is detected. **Scaler-internal only — never touches Hustler state.**

### 8.1 When the Audit Pass Runs
- **Manual trigger**: User sets `pipelines.scaler.pipeline_state.audit_request: true` in board.
- **Drift-suspected trigger**: If Phase 5 rollback fired more than 2 times in a session.
- **Quarter rotation trigger**: Optional sweep when `.archived_runs/` fills with a new quarter's runs.

### 8.2 The 7 Audit Checks

| # | Check | What it verifies |
|---|---|---|
| 1 | **Run-to-folder consistency** | Every run in board exists on disk; every run folder has a board entry |
| 2 | **Status-to-location consistency** | PLANNING runs are in `*-PLANNING_runs/`; EXECUTION runs are in `*-EXECUTION_runs/`; archived runs are in `.archived_runs/` |
| 3 | **Tracker accuracy** | Every item delivered to gateway has a tracker entry; every run references valid `processed_by_runs` items |
| 4 | **Board-tracker sync** | Board `run_name.focused_pillars` matches gateway content the tracker shows was routed to that run |
| 5 | **Index freshness** | `index.yaml` rollups match live disk state for pipeline metrics |
| 6 | **Pending-queue staleness** | Board `review_queue` entries older than 14 days are surfaced to user |
| 7 | **Empty gateway pruning** | Gateway pillar subfolders with no tracker-linked items are flagged for cleanup |

### 8.3 Audit Pass Procedure
1. **Pre-flight**: Lock `pipeline_state.audit_in_progress: true` in board.
2. **Run all 7 checks** (1 → 7). Each produces: `{check_id, severity: INFO|WARN|DRIFT, target, observed, expected, suggested_action}`.
3. **Aggregate**: Append to `pipeline_state.audit_findings[]`.
4. **Decision**:
   - All `INFO` or empty → `last_audit.outcome: CLEAN`. No run created.
   - Any `WARN` → `last_audit.outcome: WARN`. Surface in board `review_queue`.
   - Any `DRIFT` → `last_audit.outcome: DRIFT`. Create an INTERNAL planning run listing each drift finding and its suggested fix.
5. **Release lock**: `audit_in_progress: false`, update `last_audit.completed_at`.

### 8.4 Hard Rules for Audit Pass
- Never directly modify runs or tracker files — drift is fixed via a new INTERNAL run
- Bounded in time: each check has a 5-minute timeout; log `INCOMPLETE` and continue
- Findings remain in `audit_findings[]` for at least 1 quarter
- Audit pass MUST NOT scan `INBOX-inboxing/` directly as a content source — only trackers and run folders
