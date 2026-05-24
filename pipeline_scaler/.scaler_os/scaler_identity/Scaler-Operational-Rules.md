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
- **Atomic State**: Every operation must be preceded by a state update in `.meta_os/meta_db/pipeline_scaler_os.yaml`. You MUST explicitly synchronize `.meta_os/meta_db/pipeline_scaler_os.yaml` (`active_mode` block) with `CONTROLER.yaml` prior to acting to prevent configuration drift.
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
1. **Pillar Dominance**: The identity context (`_context/.meta_os/meta_identity/`) rules always take precedence. You can adopt the discovery to become compatible with the current architecture.
2. **Deterministic Precedence**: The Master DB Index (`.meta_os/meta_db/meta_os.yaml`) is the final authority. If a proposal contradicts the Index without a plan for a safe migration, it must be rejected. We need an adopting plan for a safe migration.

---

## 5. Architectural Portability Laws
When adapting external capabilities (especially Python tools, libraries, or SDKs) into the Agentic OS, you MUST force the adaptation into the **True Portability** framework:
- **Centralized Engine:** Never create isolated `.venv` folders for new capabilities. All dependencies must route to the master `_os/venv/.venv`.
- **Cross-OS Launcher Execution:** Eradicate all instances of `Activate.ps1`, global commands (like `notebooklm login`), AND direct interpreter calls (`.venv\Scripts\python.exe`). All execution MUST flow through the cross-OS launcher in `_os/venv/`:
  - Windows: `.\_os\venv\meta_run.ps1 -m module_name`
  - Linux/macOS: `./_os/venv/meta_run.sh -m module_name`
  The launcher auto-bootstraps the venv on first boot, loads `.env`, and forwards args to the host's correct interpreter so the OS remains clone-and-play across Windows, Linux, and macOS.
- **Manifest Tracking:** Before adopting a new pip package, check `_os/venv/requirements.txt`. If adding a new dependency, the proposal MUST include the command to freeze it via the launcher: `.\_os\venv\meta_run.ps1 -m pip freeze > _os/venv/requirements.txt` (Windows) or `./_os/venv/meta_run.sh -m pip freeze > _os/venv/requirements.txt` (Unix).
- **Git State:** Acknowledge that the repo is private and fully portable. Do not strip `.env` secrets or active caches (like `_os/auth/notebooklm/`) in your architecture proposals — they are intentionally pushed to Git. Note: the compiled `.venv` itself is NOT pushed (OS-specific binaries) — only the recipe (`requirements.txt`, `bootstrap.{ps1,sh}`, `meta_run.{ps1,sh}`) is committed; the venv rebuilds locally per host on first boot.

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

### P-LAW-001 — Atomic Ledger Updates (prevents stale state)
Every critical state change MUST be atomic. There are distinct atomic ledger operations for the EXTERNAL and INTERNAL lifecycles to prevent double-logging and anti-duplication failures.

**1. Phase 1 — EXTERNAL Discovery Ingestion (Atomic with the Move):**
When an item is moved into a typed discovery hub (via Cluster Intake or direct drop), the agent MUST atomically append a NEW entry to `[Pillar].sources_ledger.yaml.state.tracked_discoveries[]` with its content hash + `group_path`. This establishes the anti-duplication lock immediately.

**2. Phase 4 — Gateway Card Creation (Atomic with the Draft):**
A Proposal or Solution card MUST NEVER be created without simultaneously linking it in the ledger. Card creation and ledger update are a single atomic operation.
- **EXTERNAL**: Update the EXISTING entry in `[Pillar].sources_ledger.yaml` (using its content hash). Append the new card ID to `proposal_ids[]` and set `integration_status: PENDING`.
- **INTERNAL**: Update the EXISTING gap entry in `[Pillar].proposals_ledger.yaml.state.tracked_gaps[]` to link the new Mega-YAML's `action_id` and set `integration_status: PENDING`.

**3. INTERNAL Gap Logging (Phase 2):**
When an internal gap is identified during Phase 2 Mapping, append a NEW entry to `[Pillar].proposals_ledger.yaml.state.tracked_gaps[]` with a generated `gap_id`. This entry is later linked to the action card in Phase 4.

> Never reverse the order. Never update master before sub-ledger. Never create a card without the corresponding ledger update completing in the same operation.
> ALWAYS verify that you have successfully updated the corresponding ledgers after generating proposals or routing discoveries.

> **Recovery from partial failure → see P-LAW-019 for the mandatory abort/rollback procedure if any write in the atomic trio fails.**

### P-LAW-002 — Double-Entry Sync After Every Action (prevents mission board desync)
After EVERY Scaler operation (card creation, integration, phase change), the agent MUST update BOTH:
1. `CONTROLER.yaml` — session goal status, tracking, artifacts, last_sync, recent_events.
2. `.milestones/[SESSION]/[GOAL]/GOAL.yaml` — matching status and artifacts.
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
`.meta_os/meta_db/pipeline_scaler_os.yaml` MUST be read and updated at the START of every operation cycle. This includes synchronizing the `state: active_mode` fields (`action_gate`, `input_mode`, `output_level`) to mirror the current `CONTROLER.yaml` scaler scope values. This prevents acting on stale or desynced parameters.

### P-LAW-008 — Mandatory Runbook Immersion (prevents partial knowledge errors)
Before ANY Scaler execution cycle or providing ANY simulation, the agent MUST confirm it has fresh context from all **five** runbook files. This requires performing a full `view_file` call for each: `Scaler-Architecture.md`, `Scaler-Workflows.md`, `Scaler-Operational-Rules.md`, `Scaler-Gateway.md`, `Scaler-Discovery-Logic.md`. Providing answers based on memory or summary without verification is a protocol violation.

> **Known limitation (audit-acknowledged).** This rule is currently honor-system: no programmatic gate verifies the read. A future enhancement could store per-session runbook acknowledgements (timestamp + content-hash) in `.meta_os/meta_db/pipeline_scaler_os.yaml.runbook_readiness` and enforce pre-flight refusal on missing/stale acks. Carved out of the 2026-05-18 substrate audit (Cluster D — deferred). Until enforced, agents are bound by P-LAW-008 on trust.

### P-LAW-009 — Minimal Proposal Cohesion (prevents fragmentation)
The Scaler is prohibited from generating shallow, single-item proposals when a functional cluster exists. All items must pass through a Functional Affinity check and the Cluster Intake Protocol (`Scaler-Discovery-Logic.md §3`) before card creation. Any violation results in immediate "Rejected: Fragmentation" status by self-audit.

### P-LAW-010 — Documentation Evolution & Logic Preservation
No existing operational logic should be deleted if it does not conflict with new logic. Foundational logic (e.g., Step-by-Step Analysis) must be **modernized** and integrated into new complex models (e.g., Hierarchical Models) to ensure the system remains grounded in deterministic basics.

### P-LAW-011 — Mandatory Archiving (Fresh Start Law)
1. **Cards**: Once marked `INTEGRATED` or `REJECTED`, move to `.scaler_runtime/.scaler_archive/YYYY-QQ/` immediately, named as `[TYPE]-[Pillar]-[CardID].yaml` (e.g. `INTERNAL-Foundational_Integrity-MEGA-INT-LEDGERS.yaml`, `EXTERNAL-Operational_Muscles-PROPOSAL-KARPATHY-GUIDELINES.yaml`). Quarter buckets are auto-created on first card per quarter.
2. **External Discoveries**: A source discovery (a functional group, per `Scaler-Discovery-Logic.md §2`) MUST ONLY be moved to `.scaler_runtime/.scaler_archive/YYYY-QQ/EXTERNAL-discoveries-[name].yaml` when **ALL associated proposals** (across all aspects and types, including all multi-pillar siblings if any) are marked `INTEGRATED`.
3. **Persistence**: If a discovery still has a single pending proposal or "benefit potential" for another aspect, it must remain in the active discovery folder.

### P-LAW-012 — The Utility-First Law (Modernized)
Classification MUST distinguish between the OS structure (Architecture), OS skills (Capabilities), and OS value (Business) using a **Utility-First** approach. It doesn't matter if a discovery is a skill, an agent, a script, or a photo:
- **Foundational_Integrity**: Core systems (toolbox_library system, identity, routers, mission_board, pipelines, projects). Classification is for anything that helps, enhances, or defines these systems.
- **Operational_Muscles**: Items destined for toolboxes in `.toolbox_library`. Classification is for anything that can be placed or converted into a skill or tool.
- **Value_Generation**: Market value and monetization. Classification is for anything that makes money for our systems and architecture.

### P-LAW-013 — The Two-Layered Organisation Protocol (Classification + Categorisation)
Classification and organisation MUST proceed in two distinct phases:
1. **Layer 1 — Classification (Utility-First Routing)**: For untyped items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/`. Resolve which pillar(s) the item benefits — Foundational_Integrity, Operational_Muscles, Value_Generation — regardless of file format. Run the strong-source-identity check (P-LAW-022) BEFORE pillar resolution. Single-utility items MOVE to one pillar; orthogonal-multi-utility items COPY into N pillars per P-LAW-021.
2. **Layer 2 — Categorisation (Functional Grouping)**: For items already pillar-resolved (typed inboxes or post-classification routing). Place each item into a **functional group** inside the matching `_SCALER-EXTERNAL_SOURCES/<Pillar>_discoveries/` hub. Groups are named by what items DO (functional), not by source ecosystem. Sub-grouping is optional and unbounded — used only when items inside a group naturally separate. Same-pillar grouping only.

> **Replaces** the legacy "Utility-First Routing + Relevance-First Grouping" naming with the explicit Classification/Categorisation distinction. Algorithm details live in `Scaler-Discovery-Logic.md §3` (Cluster Intake Protocol) and §7 (Two-Layered Organisation Protocol). Logic preservation: every old constraint (utility-first, group-by-functional-similarity, hub residency) survives the rename.

### P-LAW-014 — The Zero Loose Files Law
Discovery hub roots (`_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`, `..._Operational_Muscles_discoveries/`, `..._Value_Generation_discoveries/`) MUST NOT contain any loose files. Every single discovery item — regardless of count — MUST live inside a **functional group folder** (e.g., `<hub>/<group_name>/<item>`). A functional group may contain a single item if necessary. Sub-grouping inside a group is optional and unbounded.

### P-LAW-015 — The Strict User-Space Exclusion Law
Items, folders, or scripts residing inside `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/` (which contains `complex_systems/`, `others/`, and `.complex_inboxes/`) are strictly user-space zones. The Scaler (both scripts and agents) MUST NEVER look at, scan, or process this directory tree.

**Single narrow exception**: Scaler MAY **write** into `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/.complex_inboxes/<source-name>/` from the External path when the strong-source-identity signature triggers (P-LAW-022). This is write-only — the Scaler never reads back from `.complex_inboxes/`. Items moved there await human triage and are out of Scaler's scope until the user re-routes them.

### P-LAW-016 — The No-Inbox Processing Law
No proposal card, solution card, or gap report can be drafted from an item while it resides in an `_inbox/` staging folder. Items MUST be moved and grouped into their parent hub/residency folder before any formal processing begins.

### P-LAW-017 — Mandatory Sync Engine v5 Execution
All agents MUST execute the master sync via the cross-OS launcher at the start and end of every session:
- Windows: `.\_os\venv\meta_run.ps1 _os\engine\meta_sync.py`
- Linux/macOS: `./_os/venv/meta_run.sh _os/engine/meta_sync.py`

This ensures that the global sync workers have updated their respective YAMLs and that `MASTER_INDEX.yaml` and `CONTROLER.yaml` reflect the absolute truth of the on-disk state. Direct interpreter invocation (`.venv\Scripts\python.exe`) is prohibited per the cross-OS portability law.

**Verification Protocols:**
- **Pre-Flight Check**: Verify `.meta_os/meta_db/pipeline_scaler_os.yaml` exists and has a valid phase before initiating sync.
- **Post-Flight Check**: Confirm `.meta_os/meta_db/meta_os.yaml` is dynamically re-assembled and verified by the master sync engine.

### P-LAW-018 — Mode-Specific Configuration Profile
The Scaler MUST load the active configuration profile from `CONTROLER.yaml` matching the source of the operation (`INTERNAL` or `EXTERNAL`).
- **Target Pillar Resolution**: If `target_pillars` is set to `AUTO`, the Scaler resolves pillars per discovery. If a list is provided, the Scaler is restricted to those pillars.
- **Action Gate Resolution**: The Scaler MUST check if the `integration_type` is present in the `EXECUTION` list of the active profile. If yes, it auto-integrates. If present in `PLANNING` or **missing from both lists**, it MUST wait for manual approval.
- **AUTO Input Mode**: When `input_mode` is `AUTO`, the Scaler dynamically switches between `INTERNAL` and `EXTERNAL` profiles based on the specific task context.

### P-LAW-019 — Atomic Trio Recovery (prevents half-committed state)
P-LAW-001 mandates atomic writes; P-LAW-019 mandates the recovery procedure when an atomic write fails. Every Scaler operation that writes to multiple stores in a single transaction (the "atomic trio") — typically `card file` + `[Pillar].sources_ledger.yaml` or `[Pillar].proposals_ledger.yaml` + `.meta_os/meta_db/pipeline_scaler_os.yaml` — MUST treat the trio as all-or-nothing.

If any write in the trio fails (disk error, schema validation, race with another agent, sync engine conflict, etc.), the Scaler MUST:
1. **ABORT the entire operation immediately.** No partial state is committed.
2. **Leave the source artifact untouched in its origin location.** For EXTERNAL discoveries, the source file in `_SCALER-EXTERNAL_SOURCES/` MUST NOT be moved. The ledger entry MUST NOT be written if the card file did not finalize (and vice versa). Anti-duplication depends on this — a half-cascaded source whose hash was never logged will be re-cascaded on the next pass.
3. **Roll back any successful writes from the same operation.** Examples:
   - If the card file was written but `[Pillar].sources_ledger.yaml` failed to update → delete the card file. Revert `.meta_os/meta_db/pipeline_scaler_os.yaml.gateway_metrics` increments. Revert `scaler_review_queue` posting if any.
   - If both card and ledger succeeded but `.meta_os/meta_db/pipeline_scaler_os.yaml` failed → delete the card, remove the ledger entry, revert any review-queue posting. The trio is all-or-nothing.
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

When processing any functional group discovery (per `Scaler-Discovery-Logic.md §2`), every file inside the group folder (and any sub-groups) MUST be either read into the analysis OR explicitly logged as deferred with a reason. Skipping a file purely because of its extension (`.json`, `.csv`, `.png`, `.svg`, `.zip`, etc.) is forbidden.

**Rules:**
- If a file cannot be parsed by the available toolboxes (e.g., a binary asset for which no tool exists), log it under the discovery's sub-ledger entry as `unread_assets[]` with the reason (`unsupported_format`, `tool_missing`, `binary_blob`, etc.).
- A discovery whose `unread_assets[]` count > 0 MUST be flagged in `.meta_os/meta_db/pipeline_scaler_os.yaml.state.deferred_assets_count`. The Scaler MAY still draft a Proposal Card from the readable subset, but the card MUST list the deferred assets in `scaler_notes`.
- This rule complements P-LAW-014 (Zero Loose Files Law): zero loose files at the hub root, zero unaccounted files inside a discovery folder.

**Why:** Real failure modes today include skipping `.svg` icon bundles inside an interface_design discovery, or skipping a `.csv` data file inside a domain skill. Those skipped files often carry critical functional signal (e.g., an icon set IS the deliverable for a UI skill).

**Enforced:** true.


### P-LAW-021 — Multi-Pillar Fan-Out (orthogonal utilities → one item per pillar)

A single source can carry **orthogonal utilities** that fit different pillars. Example: a "business strategy advisor" markdown file may contain both a reusable skill (Operational_Muscles) AND market ideas (Value_Generation). When this happens, the Scaler MUST fan the item out into the relevant pillars rather than forcing it into one.

**Rule:**
- **Single-utility item** (one pillar serves the whole item's value) → **MOVE** to that pillar's discoveries hub. Original removed from inbox after the move.
- **N orthogonal-utility item** (genuinely useful in N pillars in different ways) → **COPY** the item into N pillars, each tagged with its `extracted_concern`. After all copies land, **remove the original from the inbox**. Inboxes stay clean.

**Tracking (mandatory):**
- All fan-out copies share a single `multi_pillar_ref_id: <uuid>` in the sources_ledger.
- Each copy carries `extracted_concern: <one-line>` describing the utility extracted FOR THAT PILLAR.
- Each copy lists `multi_pillar_siblings: [<other ledger entry IDs>]` so a reviewer reading any one entry can find the rest.
- The same content_hash is logged in N pillar ledgers — that is by design; the per-pillar `extracted_concern` differentiates them.

**Anti-fragmentation guard:** copying without orthogonal utility is a P-LAW-009 fragmentation violation. The agent MUST be able to articulate, per pillar, what is being extracted there that is NOT served by the other pillars' copies. If two pillars would extract the same concern, the item is single-utility — pick the dominant pillar and MOVE.

**Algorithm details:** `Scaler-Discovery-Logic.md §1.2`.

**Enforced:** true.

### P-LAW-022 — Strong-Source-Identity Rejection (`.complex_inboxes/`)

Some external drops are coherent pieces of a single named ecosystem (Claude Code extensions, Hermes Agent bundles, a specific tool's plugin pack, etc.). External cannot cleanly classify these into our pillars without losing the source's coherence — they need human triage before any per-item extraction.

**Detection signature** (count + complexity-based, NOT percentage):

A drop triggers rejection if **any** of the following is true. Thresholds are tuneable via `Scaler-Operational-Rules.md#10. Tuneable Constants` so the law text doesn't have to change with the workspace's complexity.

| Signal | Default threshold (constant key) |
|---|---|
| **Count** | More than `complex_inbox_item_count_threshold` items (default **5**) share the same source-ecosystem signature (folder named after a tool, header references one tool, vocabulary dominated by one ecosystem) |
| **Structural complexity** | Drop has internal structure (sub-folders + contract files like `SKILL.md` / `AGENT.md` / `package.json`) AND is bound to one named ecosystem — even with fewer than the count threshold |
| **Size** | Single file > `complex_inbox_single_file_size_kb` (default **50 KB**) OR folder total > `complex_inbox_folder_size_kb` (default **200 KB**), AND content is one ecosystem's coherent piece |
| **Cross-reference coherence** | Items share an internal cross-reference graph (file A → file B → file C) AND all references resolve to the same external system |

**Action when triggered:**
1. Move the cluster whole to `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/.complex_inboxes/<source-name>/`. This is the single narrow exception to P-LAW-015 — write-only, no read-back.
2. Write a rejection marker `.complex_inboxes/<source-name>/.rejection.yaml` containing: source signature, trigger signal, item count, total size, agent reasoning, ISO timestamp.
3. Annotate the originating ledger entry (mixed_inbox.ledger.yaml or `_<Pillar>_inbox` source ledger) with `rejected_to_complex_inboxes: true` + the rejection marker path.

**What `.complex_inboxes/` is NOT:**
- NOT a Scaler discovery hub (no `sources_ledger` entry except the rejection marker)
- NOT an auto-extraction destination (Scaler never re-reads from here)
- NOT a permanent home (the user re-routes individual concerns back into mixed_inbox or typed inboxes for normal processing)

**Algorithm details:** `Scaler-Discovery-Logic.md §1.3`.

**Enforced:** true.

### P-LAW-023 — Match-to-Pending Folding (LAW-005-aware)

When a NEW item is being analysed in Phase 2/3, before drafting a fresh card the Scaler MUST scan pending proposals (`integration_status: PENDING`) under the same pillar for a matching candidate. If a match is found AND the proposal is **not yet integrated**, the new item folds into the existing card via `MERGE_WITH_PENDING` rather than spawning a new card.

**Matching criteria** (in order — first match wins):
1. Same `target_path` in `files_involved[]`.
2. ≥50% overlap in `aspects[]`.
3. Functional similarity in the proposed change (toolbox call: keyword/embedding match).

**Re-audit on merge** (LAW-005 enforcement):
- After folding, the merged proposal is re-audited under LAW-005.
- For Foundational_Integrity (Tier 1 strict): if the merged card now proposes anything that would replace existing DNA, **split the new item back out** and post both cards in `scaler_review_queue` with `status: merge_violates_dna` for human resolution.
- For Operational_Muscles / Value_Generation (Tier 2 permissive): the merge proceeds; the merged card's `merge_history[]` records what was folded and when.

**No-touch rule for integrated proposals:** if the matching pending proposal is already INTEGRATED, do NOT modify it. The new item starts a fresh proposal cycle (it can extend the integrated work via a new INJECT or EXTEND card per Phase 4 logic).

**`merge_history[]` schema** (added to Proposal Card v3.1+):
```yaml
merge_history:
  - merged_at: <ISO timestamp>
    folded_discovery_id: <the new item's ledger ID>
    folded_content_hash: <sha256>
    re_audit_outcome: clean | violations_resolved | violations_pending
    merge_notes: <one-line rationale>
```

**Algorithm details:** `Scaler-Discovery-Logic.md §10.2`.

**Enforced:** true.

---

## 10. Tuneable Constants

Threshold values used across the operational laws. Tuning these here lets the law text stay stable while the workspace's complexity floor adjusts over time.

```yaml
# Strong-Source-Identity Rejection (P-LAW-022)
complex_inbox_item_count_threshold: 5         # > N items sharing one ecosystem → rejection
complex_inbox_single_file_size_kb: 50         # single file > N KB AND ecosystem-bound → rejection
complex_inbox_folder_size_kb: 200             # folder total > N KB AND ecosystem-bound → rejection

# Match-to-Pending Folding (P-LAW-023)
match_to_pending_aspects_overlap_min: 50      # ≥ N% aspect overlap → merge candidate
match_to_pending_max_pending_age_days: 30     # if pending > N days old, auto-promote to scaler_review_queue
                                              #  for human attention before considering merge

# Multi-Pillar Fan-Out (P-LAW-021)
multi_pillar_max_pillars_per_item: 3          # cap fan-out at the 3 known pillars; future pillars require law update

# Discovery Archiving (P-LAW-011)
discovery_archive_grace_period_days: 7        # how long an integrated discovery sits in the active hub
                                              #  before being moved to .scaler_archive/
```

**How to tune:**
- Edits to this block are an INTERNAL Mega-YAML (`change_type: PATCH_FILE`) targeting this section.
- The Audit Pass (`Scaler-Workflows.md §7`) re-reads constants on every cycle; no engine restart needed.
- Sub-engines that consume these constants MUST read them from this block, not hardcode them.

**Why:** the audit history shows that magic numbers in operational laws drift across edits and lose their authority. Centralising them here gives each constant one home, one law citation, one tuning point.

**Enforced:** true.

---

## 11. Pipeline Routing Instructions

These mandatory routing rules govern how agents navigate and operate within the Scaler pipeline:

1. The Scaler pipeline has strict Input Modes (INTERNAL, EXTERNAL, AUTO) and 3 Target Pillars (Foundational_Integrity, Operational_Muscles, Value_Generation). Target pillar always mirrors the resolved discovery type.

2. When executing an OS architectural audit, the scaler operates in INTERNAL mode. The identity documents (`_context/.meta_os/meta_identity/`) serve as the runbook for structural changes.

3. **MANDATORY:** Read all FIVE runbook files before any Scaler execution — Architecture, Workflows, Operational-Rules, Gateway, Discovery-Logic.

4. **MANDATORY:** Every Scaler output must pass through the gateway (`[Pillar]_external_proposals/` or `[Pillar]_internal_proposals/` at the pipeline root) before integration.

5. **MANDATORY:** For EXTERNAL operations — consult the relevant `[Pillar].sources_ledger.yaml` (anti-duplication via content hash) BEFORE starting. Items in `.scaler_mixed_inbox/` also gate against `.scaler_mixed_inbox.ledger.yaml`. The auto-sync rolls all per-pillar split files into the central `.meta_os/meta_db/` rollups.

6. **MANDATORY:** For INTERNAL operations — consult the relevant `[Pillar].proposals_ledger.yaml` under `tracked_gaps` before starting.

7. **MANDATORY:** Update `.meta_os/meta_db/pipeline_scaler_os.yaml` at the start AND end of every operation cycle.

8. **MANDATORY:** Check `_SCALER-EXTERNAL_SOURCES/` inboxes (`.scaler_mixed_inbox/`, `_[Pillar]_inbox/`) FIRST in Phase 1 before scanning `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/`. Route staged items before processing discoveries.

9. Cards use `primary_aspect` (folder location) + `aspects` list (all applicable). 14 valid aspects — see `Scaler-Architecture.md` §3.

10. **CRITICAL:** Never guess file paths. Always use the absolute paths explicitly provided within DB files or directory listings.
