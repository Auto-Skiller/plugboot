# 📜 Scaler Operational Rules

## Objective
Define the operational rules and constraints for the Scaler pipeline.

---

## 1. Core Principles

### Strict System Assimilation
When processing external discoveries (plugins, repos, tools), the Scaler MUST strictly adopt the logic to match the current Agentic OS system.
- **Eradicate External Terms**: Completely replace all terms, names, and structural references from the external source with the native Agentic OS terminology (e.g., Aspects, Toolboxes, Mission Board).
- **Expand, Don't Bolt-On**: Do not just drop external folders into the workspace. Analyze the relationships (Correlation), rewrite the architecture to fit natively, and actively expand existing OS features (like utilizing the `artifacts` array in goals) rather than creating conflicting external structures.

### Copy over Warp
When integrating new external capabilities (after Assimilation is complete), prioritize **copying** the deterministic logic exactly as it exists. Only "turn" (refactor or modify) the functional logic if it is fundamentally incompatible with the Agentic OS architecture.

---

## 2. Constraints & Prohibitions

- **No Product Builds**: The Scaler pipeline is strictly for **System-Level** evolution. Do not build individual products or projects here; those belong in `projects/` or `pipelines/hustler/`.
- **Zero-Drift Sync**: Never manually update the global `meta_router.yaml` from within the Scaler workspace. All changes must be routed through the relevant pillar's proposals or `INTERNAL/` folder and synced via the Root OS protocols.
- **Atomic State**: Every operation must be preceded by a state update in `scaler_state.yaml`. You MUST explicitly synchronize `scaler_state.yaml` (`active_mode` block) with `CONTROLER.yaml` prior to acting to prevent configuration drift.
- **Anti-Duplication**: Consult the relevant `[Pillar].sources_ledger.yaml` inside `scaler_ledgers/` before initiating any analysis. For items in `.scaler_mixed_inbox/`, also consult `.scaler_mixed_inbox.ledger.yaml` for content-hash matches before cascading.
- **No Scope Creation Without Approval**: The Scaler MUST NOT create new scopes (aspects) autonomously. New scope suggestions must be posted in the `CONTROLER.yaml` communication block. Integration only proceeds after explicit user approval — regardless of the active `action_gate` mode.
- **Mandatory Gateway**: Every single Scaler output — whether from EXTERNAL or INTERNAL execution — MUST be materialized as a Proposal Card (in the relevant pillar's proposals) or a Solution Card (in `INTERNAL/[Pillar]/`) **before** any integration into a target scope. Direct integration without a gateway card is a protocol violation.

---

## 3. Self-Evolution Protocol
The Scaler is a self-improving system. Any discoveries or ideas for enhancing the Scaler's own logic, speed, or accuracy must be converted into proposals and routed strictly to:
- **`INTERNAL/Foundational_Integrity/`** (Self-Refactoring path, as the scaler itself falls under the `pipeline_scaler` aspect).

---

## 4. Conflict Resolution
In cases of mismatch between a discovery and the current architecture:
1. **Pillar Dominance**: The Brain Pillar (`.meta_brain/`) rules always take precedence. You can adopt the discovery to become compatible with the current architecture.
2. **Deterministic Precedence**: The Master Index (`meta_router.yaml`) is the final authority. If a proposal contradicts the Index without a plan for a safe migration, it must be rejected. We need an adopting plan for a safe migration.

---

## 5. Architectural Portability Laws
When adapting external capabilities (especially Python tools, libraries, or SDKs) into the Agentic OS, you MUST force the adaptation into the **True Portability** framework:
- **Centralized Engine:** Never create isolated `.venv` folders for new capabilities. All dependencies must route to the master `.meta_runtime/venv/.venv`.
- **Cross-OS Launcher Execution:** Eradicate all instances of `Activate.ps1`, global commands (like `notebooklm login`), AND direct interpreter calls (`.venv\Scripts\python.exe`). All execution MUST flow through the cross-OS launcher in `.meta_runtime/venv/`:
  - Windows: `.\.meta_runtime\venv\meta_run.ps1 -m module_name`
  - Linux/macOS: `./.meta_runtime/venv/meta_run.sh -m module_name`
  The launcher auto-bootstraps the venv on first boot, loads `.env`, and forwards args to the host's correct interpreter so the OS remains clone-and-play across Windows, Linux, and macOS.
- **Manifest Tracking:** Before adopting a new pip package, check `.meta_runtime/venv/requirements.txt`. If adding a new dependency, the proposal MUST include the command to freeze it via the launcher: `.\.meta_runtime\venv\meta_run.ps1 -m pip freeze > .meta_runtime/venv/requirements.txt` (Windows) or `./.meta_runtime/venv/meta_run.sh -m pip freeze > .meta_runtime/venv/requirements.txt` (Unix).
- **Git State:** Acknowledge that the repo is private and fully portable. Do not strip `.env` secrets or active caches (like `.meta_runtime/auth/notebooklm/`) in your architecture proposals — they are intentionally pushed to Git. Note: the compiled `.venv` itself is NOT pushed (OS-specific binaries) — only the recipe (`requirements.txt`, `bootstrap.{ps1,sh}`, `meta_run.{ps1,sh}`) is committed; the venv rebuilds locally per host on first boot.

---

## 6. Mode-Aware Integration Rules

The `action_gate` setting in `CONTROLER.yaml` governs Scaler behavior AFTER the gateway checkpoint:

### EXECUTION Mode
- After drafting a Proposal/Solution Card in the gateway folder, the Scaler performs self-review and proceeds directly to integration.
- `user_decision` in the card is auto-set to `APPROVED` by the Scaler after self-review.
- The CONTROLER.yaml communication block is updated post-integration to inform the user.
- **Architecture Audits & New Scopes**: These now follow the standard `action_gate` rules. If the `integration_type` (e.g., `RESTRUCTURE_ARCHITECTURE`) is in the `EXECUTION` list, the Scaler proceeds autonomously. If in `PLANNING` or missing, it awaits approval.

### PLANNING Mode
- After drafting a Proposal/Solution Card in the gateway folder, the Scaler STOPS and posts a review request in the `CONTROLER.yaml` communication block.
- The `user_decision` field must remain blank until the user fills it.
- Integration only proceeds after the user sets `user_decision: APPROVED`.
- If the user provides `NOTES:` → apply the notes, update the card, and re-post a review request.

---

## 7. Proposal & Solution Card Schema

### Proposal Card (v3.1) ([Pillar]_external_proposals/PROPOSAL-[ID].yaml — flat at pipeline root)
```yaml
proposal_id: string          # e.g., PROP-EXT-KARPATHY-GUIDELINES
schema_version: "3.1"
source: string               # path in EXTERNAL/
target_pillar: string        # Foundational_Integrity | Operational_Muscles | Value_Generation
integrations:
  - integration_type: string # INJECT | UPGRADE | BUILD_NEW | EXTEND | MIGRATE | MERGE
    primary_aspect: string   # aspect that determined the classification
    aspects: [string]        # ALL aspects this integration enhances
    target_files: [string]   # result of Strategic Interrogation
    integration_strategy:
      target_scan_results:
        current_state: string # Analytics from Target Scan (Ground Truth)
        delta_analysis: string # The gap identified between target and source
      integration_logic:
        rationale: string    # Why this Type and Pillar were chosen
        workflow_applied: string # The Workflow used for the draft
      execution_plan:
        steps: [string]      # Step-by-step execution
        verification: string  # Post-integration success check
    files_involved:
      - path: string
        action: string       # CREATE | EDIT | MOVE | COPY | ADAPT | DELETE
user_decision: string        # APPROVED | REJECTED | NOTES: [text] | PENDING
action_gate_at_creation: string  # EXECUTION | PLANNING
integration_status: string   # PENDING | PENDING_INTEGRATION | INTEGRATED | REJECTED
integrated_at: string        # timestamp
scaler_notes: string         # Scaler's self-review notes
```

### Internal Action Card (v4.0 Mega-YAML) ([target_pillar]_internal_proposals/MEGA-INT-[ID].yaml — flat at pipeline root)
```yaml
schema_version: "4.0"
action_id: string            # e.g., MEGA-INT-UPDATE-SYNC-ENGINE
primary_aspect: string       # primary aspect
aspects:                     # ALL aspects this solution touches
  - string
target_pillar: string        # Foundational_Integrity | Operational_Muscles | Value_Generation
description: string          # what will be changed and why

gap:
  gap_id: string             # e.g., GAP-SCALER-MISSING-SYNC-RULE
  description: string

solution:
  solution_id: string        # e.g., SOL-INT-UPDATE-SYNC-ENGINE
  change_type: string        # PATCH_FILE | ENRICH_FILE | REPLACE_SCHEMA | RESTRUCTURE_SYSTEM | CREATE_MISSING_COMPONENT | AUDIT_AND_REMEDIATE
  integration_strategy:
    target_scan_results:
      current_state: string
      delta_analysis: string
    execution_plan:
      steps: [string]
      verification: string
  files_involved:
    - path: string
      action: string         # EDIT | CREATE | DELETE | RESTRUCTURE

user_decision: string        # APPROVED | REJECTED | NOTES: [text] | PENDING
action_gate_at_creation: string  # EXECUTION | PLANNING
integration_status: string   # PENDING | PENDING_INTEGRATION | INTEGRATED | REJECTED
integrated_at: string        # timestamp
scaler_notes: string         # Scaler's self-review notes
```

> **PREVENTION**: All cards are `.yaml` files ONLY. Markdown (`.md`) card format is permanently deprecated. Separate Gap and Solution cards for INTERNAL operations are deprecated in favor of the v4.0 Internal Action Card (Mega-YAML).

---

## 8. Prevention Laws
These laws exist to structurally prevent the gaps identified in the 2026-05-12 internal audit from ever recurring.

### P-LAW-001 — Atomic Ledger Update (prevents stale ledgers)
A card MUST NEVER be created without simultaneously updating the corresponding ledger. Card creation and ledger update are a single atomic operation. Failure = anti-duplication violation.

**For EXTERNAL discoveries — sources_ledger update (atomic with the move):**
1. **Sources_ledger update**: Append entry to `[Pillar].sources_ledger.yaml.state.tracked_discoveries[]` with content hash + path. This is the anti-duplication source — if the item is already logged here, do NOT process it again.
2. **Auto-rollup**: The next `meta_sync.py` run aggregates all per-pillar split ledgers into the auto-generated `.scaler_routing/scaler_ledgers.yaml` rollup. No separate master file to update.

**For INTERNAL actions:** Update the relevant `[Pillar].proposals_ledger.yaml` (inside `scaler_ledgers/` under `state.tracked_gaps`) atomically with the Internal Action Card (Mega-YAML) creation. On integration, move the entry from `tracked_gaps[]` to `history[]`.

> Never reverse the order. Never update master before sub-ledger. Never create a card without both updates completing in the same operation.
> ALWAYS verify that you have successfully updated the corresponding ledgers after generating proposals or any discoveries.

> **Recovery from partial failure → see P-LAW-019 for the mandatory abort/rollback procedure if any write in the atomic trio fails.**

### P-LAW-002 — Double-Entry Sync After Every Action (prevents mission board desync)
After EVERY Scaler operation (card creation, integration, phase change), the agent MUST update BOTH:
1. `CONTROLER.yaml` — session goal status, tracking, artifacts, last_sync, recent_events.
2. `.meta_brain/milestones/[SESSION]/[GOAL]/GOAL.yaml` — matching status and artifacts.
These writes are non-negotiable and cannot be deferred.

### P-LAW-003 — YAML Cards Only (prevents legacy schema drift)
All gap reports, proposal cards, and solution cards MUST be `.yaml` files using `schema_version: "3.1"` (or `"4.0"` for INTERNAL mega-yamls). Markdown card format is permanently forbidden. Any legacy `.md` card found must be immediately migrated and the `.md` file deleted.

### P-LAW-004 — Consolidated Target Pillar Gateways (prevents structural nesting debt)
All internal outputs must route directly into one of the 3 target pillar root folders inside `INTERNAL/`: `Foundational_Integrity/`, `Operational_Muscles/`, or `Value_Generation/`. The `gaps/` and `solutions/` sub-directories are deprecated. Internal gaps and solutions are consolidated into a single Mega-YAML per action.

**Valid Aspects (14):** `routing_and_syncing` | `identity_rules` | `identity_architecture` | `identity_capabilities` | `identity_operational` | `core_toolbox` | `extended_toolbox_business` | `extended_toolbox_engineering` | `extended_toolbox_life` | `extended_toolbox_studio` | `mission_board` | `controller` | `pipeline_scaler` | `pipeline_hustler`

### P-LAW-005 — Router Sync After Runbook Changes (prevents stale router)
Whenever ANY runbook file is modified (name, description, added, or removed), `scaler.router.yaml` descriptions and routing_instructions MUST be updated in the same operation.

### P-LAW-006 — last_sync Update Is Mandatory (prevents stale sync timestamp)
`CONTROLER.yaml → system_status.last_sync` MUST be updated to the current timestamp in every post-integration sync (Step 6 of `Scaler-Gateway.md`). A sync that does not update `last_sync` is incomplete.

### P-LAW-007 — scaler_state Updated Before Each Cycle (prevents stale operational state)
`scaler_state.yaml` MUST be read and updated at the START of every operation cycle. This includes synchronizing the `state: active_mode` fields (`action_gate`, `input_mode`, `output_level`) to mirror the current `CONTROLER.yaml` scaler scope values. This prevents acting on stale or desynced parameters.

### P-LAW-008 — Mandatory Runbook Immersion (prevents partial knowledge errors)
Before ANY Scaler execution cycle or providing ANY simulation, the agent MUST confirm it has fresh context from all **five** runbook files. This requires performing a full `view_file` call for each: `Scaler-Architecture.md`, `Scaler-Workflows.md`, `Scaler-Operational-Rules.md`, `Scaler-Gateway.md`, `Scaler-Discovery-Logic.md`. Providing answers based on memory or summary without verification is a protocol violation.

> **Known limitation (audit-acknowledged).** This rule is currently honor-system: no programmatic gate verifies the read. A future enhancement could store per-session runbook acknowledgements (timestamp + content-hash) in `scaler_state.yaml.runbook_readiness` and enforce pre-flight refusal on missing/stale acks. Carved out of the 2026-05-18 substrate audit (Cluster D — deferred). Until enforced, agents are bound by P-LAW-008 on trust.

### P-LAW-009 — Minimal Proposal Cohesion (prevents fragmentation)
The Scaler is prohibited from generating shallow, single-item proposals when a functional cluster exists. All items must pass through a Functional Affinity (S5) check and Cluster-First audit before card creation. Any violation results in immediate "Rejected: Fragmentation" status by self-audit.

### P-LAW-010 — Documentation Evolution & Logic Preservation
No existing operational logic should be deleted if it does not conflict with new logic. Foundational logic (e.g., Step-by-Step Analysis) must be **modernized** and integrated into new complex models (e.g., Hierarchical Models) to ensure the system remains grounded in deterministic basics.

### P-LAW-011 — Mandatory Archiving (Fresh Start Law)
1. **Cards**: Once marked `INTEGRATED` or `REJECTED`, move to `.scaler_runtime/.scaler_archive/YYYY-QQ/` immediately, named as `[TYPE]-[Pillar]-[CardID].yaml` (e.g. `INTERNAL-Foundational_Integrity-MEGA-INT-LEDGERS.yaml`, `EXTERNAL-Operational_Muscles-PROPOSAL-KARPATHY-GUIDELINES.yaml`). Quarter buckets are auto-created on first card per quarter.
2. **External Discoveries**: A source discovery (D/SD) MUST ONLY be moved to `.scaler_runtime/.scaler_archive/YYYY-QQ/EXTERNAL-discoveries-[name].yaml` when **ALL associated proposals** (across all aspects and types) are marked `INTEGRATED`.
3. **Persistence**: If a discovery still has a single pending proposal or "benefit potential" for another aspect, it must remain in the active discovery folder.

### P-LAW-012 — The Utility-First Law (Modernized)
Classification MUST distinguish between the OS structure (Architecture), OS skills (Capabilities), and OS value (Business) using a **Utility-First** approach. It doesn't matter if a discovery is a skill, an agent, a script, or a photo:
- **Foundational_Integrity**: Core systems (toolbox_library system, identity, routers, mission_board, pipelines, projects). Classification is for anything that helps, enhances, or defines these systems.
- **Operational_Muscles**: Items destined for toolboxes in `.toolbox_library`. Classification is for anything that can be placed or converted into a skill or tool.
- **Value_Generation**: Market value and monetization. Classification is for anything that makes money for our systems and architecture.

### P-LAW-013 — The Two-Layered Organization Protocol
Classification and organization MUST proceed in two distinct phases:
1. **Utility-First Routing**: For cross-hub moves or `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` routing. Classify based on the system domain it benefits (Foundational_Integrity, Operational_Muscles, Value_Generation) regardless of file type.
2. **Relevance-First Grouping**: For moving items from typed inboxes into the matching `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` hub or within an existing residency group. Group by functional/topic similarity since the utility is already established.

### P-LAW-014 — The Zero Loose Files Law
Discovery hub roots (`_Foundational_Integrity/`, `_Operational_Muscles/`, `_Value_Generation/`) MUST NOT contain any loose files. Every single discovery item — regardless of count — MUST be grouped into a relevance-based folder (e.g., `hub/group_name/item.md`). A folder can contain a single item if necessary to maintain logical grouping.

### P-LAW-015 — The Strict User-Space Exclusion Law
Items, folders, or scripts residing inside `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/` (which currently contains `complex_systems/` and `others/`) are strictly user-space zones. The Scaler (both scripts and agents) MUST NEVER look at, scan, or process this directory tree. It is completely outside of the Scaler's domain and is reserved for user-space drafting.

### P-LAW-016 — The No-Inbox Processing Law
No proposal card, solution card, or gap report can be drafted from an item while it resides in an `_inbox/` staging folder. Items MUST be moved and grouped into their parent hub/residency folder before any formal processing begins.

### P-LAW-017 — Mandatory Sync Engine v5 Execution
All agents MUST execute the master sync via the cross-OS launcher at the start and end of every session:
- Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
- Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`

This ensures that the decentralized sync workers in `.meta_brain/.meta_routing/meta_sync_engines/` (`meta_runtime_sync`, `milestones_sync`, `toolboxes_sync`, `pipelines_sync`, `projects_sync`) have updated their respective YAMLs and that `meta_router.yaml` and `CONTROLER.yaml` reflect the absolute truth of the on-disk state. Direct interpreter invocation (`.venv\Scripts\python.exe`) is prohibited per the cross-OS portability law.

### P-LAW-018 — Mode-Specific Configuration Profile
The Scaler MUST load the active configuration profile from `CONTROLER.yaml` matching the source of the operation (`INTERNAL` or `EXTERNAL`).
- **Target Pillar Resolution**: If `target_pillars` is set to `AUTO`, the Scaler resolves pillars per discovery. If a list is provided, the Scaler is restricted to those pillars.
- **Action Gate Resolution**: The Scaler MUST check if the `integration_type` is present in the `EXECUTION` list of the active profile. If yes, it auto-integrates. If present in `PLANNING` or **missing from both lists**, it MUST wait for manual approval.
- **AUTO Input Mode**: When `input_mode` is `AUTO`, the Scaler dynamically switches between `INTERNAL` and `EXTERNAL` profiles based on the specific task context.

### P-LAW-019 — Atomic Trio Recovery (prevents half-committed state)
P-LAW-001 mandates atomic writes; P-LAW-019 mandates the recovery procedure when an atomic write fails. Every Scaler operation that writes to multiple stores in a single transaction (the "atomic trio") — typically `card file` + `[Pillar].sources_ledger.yaml` or `[Pillar].proposals_ledger.yaml` + `scaler_state.yaml` — MUST treat the trio as all-or-nothing.

If any write in the trio fails (disk error, schema validation, race with another agent, sync engine conflict, etc.), the Scaler MUST:
1. **ABORT the entire operation immediately.** No partial state is committed.
2. **Leave the source artifact untouched in its origin location.** For EXTERNAL discoveries, the source file in `_SCALER-EXTERNAL_SOURCES/` MUST NOT be moved. The ledger entry MUST NOT be written if the card file did not finalize (and vice versa). Anti-duplication depends on this — a half-cascaded source whose hash was never logged will be re-cascaded on the next pass.
3. **Roll back any successful writes from the same operation.** Examples:
   - If the card file was written but `[Pillar].sources_ledger.yaml` failed to update → delete the card file. Revert `scaler_state.yaml.gateway_metrics` increments. Revert `scaler_review_queue` posting if any.
   - If both card and ledger succeeded but `scaler_state.yaml` failed → delete the card, remove the ledger entry, revert any review-queue posting. The trio is all-or-nothing.
   - If the integration step (Step 5 of `Scaler-Gateway.md`) succeeded partially across `files_involved` (some `MOVE` succeeded, then a `CREATE` failed) → revert each successful sub-action in reverse order before logging the failure.
4. **Log the failure** to `CONTROLER.yaml → communication_hubs.scaler_hub.messages` with:
   - operation type (card creation | integration | post-integration sync | archiving)
   - which writes succeeded vs failed
   - the underlying error (exception, schema mismatch, file lock, etc.)
   - the reverted target state (so the user can trust the workspace is consistent)
5. **Surface to the user** when `scaler.work_mode` is `STRICT` or `COLLAB`. In `AUTO` mode, log and continue with the next discovery/gap.
6. **Never re-attempt automatically.** A partial-failure operation is queued for human review under `scaler_review_queue` with status `RECOVERED_PENDING_RETRY`. No runbook currently authorizes auto-retry; explicit user approval is required to re-run.

This rule prevents the failure mode where anti-duplication breaks because a card landed in `[Pillar]_external_proposals/` but the ledger never recorded the source's hash — the next discovery pass would draft a duplicate card. P-LAW-019 closes that gap by forcing rollback over partial commit.

**Enforced:** true.

### P-LAW-020 — Artifact Provenance Markers (prevents lost lineage on archived cards)
Every artifact created or substantially modified by the Scaler via `BUILD_NEW_COMPONENT`, `EXTEND_EXISTING_SYSTEM`, or `INJECT_INTO_EXISTING` (when injection adds a new file) MUST carry a provenance header so the link to the originating Proposal/Action Card survives card archiving (see P-LAW-011).

**Format (markdown / YAML / Python comment, choose by file type):**
```
<!-- Generated by: PROP-EXT-KARPATHY-GUIDELINES -->
<!-- Source: _SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/identity_and_laws/karpathy.md -->
<!-- Created at: 2026-05-18T14:33:00 -->
```

For YAML: use `# Generated by: ... | Source: ... | Created at: ...` at the top of the file.
For Python: use a triple-quoted module docstring with the same three lines.

**Rules:**
- The provenance marker is written in the same operation as the artifact creation (atomic with P-LAW-001).
- `Generated by` MUST reference the exact `proposal_id` or `action_id`.
- `Source` MUST be a workspace-relative path; `null` is permitted only for INTERNAL artifacts whose Mega-YAML did not consume an external source.
- `Created at` is ISO 8601, the same timestamp written in the card's `integrated_at`.
- Provenance markers are write-once. They are not updated by subsequent INJECT operations; instead, those operations append a new line: `<!-- Modified by: PROP-EXT-NEXT-CARD at 2026-05-19T... -->`.

This marker survives `.scaler_archive/` rotation, so any artifact in the workspace can be traced back to the card that created it without grepping the archive.

**Enforced:** true.

---

## 9. Bundle Completeness (no skipping by extension)

When processing any folder discovery (D, SD, or SSD per `Scaler-Discovery-Logic.md §2`), every file inside the folder MUST be either read into the analysis OR explicitly logged as deferred with a reason. Skipping a file purely because of its extension (`.json`, `.csv`, `.png`, `.svg`, `.zip`, etc.) is forbidden.

**Rules:**
- If a file cannot be parsed by the available toolboxes (e.g., a binary asset for which no tool exists), log it under the discovery's sub-ledger entry as `unread_assets[]` with the reason (`unsupported_format`, `tool_missing`, `binary_blob`, etc.).
- A discovery whose `unread_assets[]` count > 0 MUST be flagged in `scaler_state.yaml.state.deferred_assets_count`. The Scaler MAY still draft a Proposal Card from the readable subset, but the card MUST list the deferred assets in `scaler_notes`.
- This rule complements P-LAW-014 (Zero Loose Files Law): zero loose files at the hub root, zero unaccounted files inside a discovery folder.

**Why:** Real failure modes today include skipping `.svg` icon bundles inside an interface_design discovery, or skipping a `.csv` data file inside a domain skill. Those skipped files often carry critical functional signal (e.g., an icon set IS the deliverable for a UI skill).

**Enforced:** true.
