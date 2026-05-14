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
- **Zero-Drift Sync**: Never manually update the global `meta.router.yaml` from within the Scaler workspace. All changes must be routed through the relevant pillar's `. [Pillar]_proposals/` folder or `INTERNAL/solutions/` and synced via the Root OS protocols.
- **Atomic State**: Every operation must be preceded by a state update in `SCALER-STATE.yaml`. You MUST explicitly synchronize `SCALER-STATE.yaml` (`active_mode` block) with `CONTROLER.yaml` prior to acting to prevent configuration drift.
- **Anti-Duplication**: Consult the `EXTERNAL-LEDGER.yaml` or `INTERNAL-LEDGER.yaml` inside `scaler.tracker/` before initiating any analysis to prevent processing duplicates.
- **No Scope Creation Without Approval**: The Scaler MUST NOT create new scopes (aspects) autonomously. New scope suggestions must be posted in the `CONTROLER.yaml` communication block. Integration only proceeds after explicit user approval — regardless of the active `action_gate` mode.
- **Mandatory Gateway**: Every single Scaler output — whether from EXTERNAL or INTERNAL execution — MUST be materialized as a Proposal Card (in the relevant pillar's `. [Pillar]_proposals/` folder) or a Solution Card (in `INTERNAL/solutions/`) **before** any integration into a target scope. Direct integration without a gateway card is a protocol violation.

---

## 3. Self-Evolution Protocol
The Scaler is a self-improving system. Any discoveries or ideas for enhancing the Scaler's own logic, speed, or accuracy must be converted into proposals and routed strictly to:
- **`INTERNAL/solutions/pipeline_scaler/Foundational_Integrity/`** (Self-Refactoring path, as the scaler itself falls under the `pipeline_scaler` aspect).

---

## 4. Conflict Resolution
In cases of mismatch between a discovery and the current architecture:
1. **Pillar Dominance**: The Brain Pillar (`.brain/`) rules always take precedence. You can adopt the discovery to become compatible with the current architecture.
2. **Deterministic Precedence**: The Master Index (`meta.router.yaml`) is the final authority. If a proposal contradicts the Index without a plan for a safe migration, it must be rejected. We need an adopting plan for a safe migration.

---

## 5. Architectural Portability Laws
When adapting external capabilities (especially Python tools, libraries, or SDKs) into the Agentic OS, you MUST force the adaptation into the **True Portability** framework:
- **Centralized Engine:** Never create isolated `.venv` folders for new capabilities. All dependencies must route to the master `open-workspace/.venv`.
- **Relative Execution:** Eradicate all instances of `Activate.ps1` or global commands (like `notebooklm login`). Rewrite all instructions and commands to use absolute relative paths (e.g., `.\.venv\Scripts\python.exe -m module_name`) so the OS remains clone-and-play across machines.
- **Manifest Tracking:** Before adopting a new pip package, check the root `requirements.txt`. If adding a new dependency, the proposal MUST include the command to freeze it: `.\.venv\Scripts\python.exe -m pip freeze > requirements.txt`.
- **Git State:** Acknowledge that the repo is private and fully portable. Do not strip `.env` secrets or active caches (like `.notebooklm/`) in your architecture proposals, as they are intentionally pushed to Git.

---

## 6. Mode-Aware Integration Rules

The `action_gate` setting in `CONTROLER.yaml` governs Scaler behavior AFTER the gateway checkpoint:

### EXECUTION Mode
- After drafting a Proposal/Solution Card in the gateway folder, the Scaler performs self-review and proceeds directly to integration.
- `user_decision` in the card is auto-set to `APPROVED` by the Scaler after self-review.
- The CONTROLER.yaml communication block is updated post-integration to inform the user.
- **Exception — Architecture Audits & New Scopes**: Even in EXECUTION mode, `ARCHITECTURE_AUDIT` type proposals and new scope creation suggestions ALWAYS require explicit user approval. Post in `CONTROLER.yaml` and halt integration until approved.

### PLANNING Mode
- After drafting a Proposal/Solution Card in the gateway folder, the Scaler STOPS and posts a review request in the `CONTROLER.yaml` communication block.
- The `user_decision` field must remain blank until the user fills it.
- Integration only proceeds after the user sets `user_decision: APPROVED`.
- If the user provides `NOTES:` → apply the notes, update the card, and re-post a review request.

---

## 7. Proposal & Solution Card Schema

### Proposal Card (v3.1) (. [Pillar]_proposals/PROPOSAL-[ID].yaml)
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

### Internal Action Card (v4.0 Mega-YAML) (INTERNAL/[target_pillar]/MEGA-INT-[ID].yaml)
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

**For EXTERNAL discoveries — two-ledger update (mandatory order):**
1. **Sub-ledger first**: Update the relevant `[Pillar].ledger.yaml` inside the pillar folder (e.g., `_Foundational_Integrity/Foundational_Integrity.ledger.yaml`). This is the anti-duplication source — if the item is already logged here, do NOT process it again.
2. **Master second**: Update `scaler.tracker/EXTERNAL-LEDGER.yaml` — increment sub-ledger summary counts, and for D-level discoveries, add or update the entry in `tracked_discoveries[]`.

**For INTERNAL actions:** Update `INTERNAL-LEDGER.yaml` atomically with the Internal Action Card (Mega-YAML) creation.

> Never reverse the order. Never update master before sub-ledger. Never create a card without both updates completing in the same operation.
> ALWAYS verify that you have successfully updated the corresponding ledgers after generating proposals or any discoveries.

### P-LAW-002 — Double-Entry Sync After Every Action (prevents mission board desync)
After EVERY Scaler operation (card creation, integration, phase change), the agent MUST update BOTH:
1. `CONTROLER.yaml` — session goal status, tracking, artifacts, last_sync, recent_events.
2. `.runtime/.mission_board/[SESSION]/[GOAL]/[GOAL].yaml` — matching status and artifacts.
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

### P-LAW-007 — SCALER-STATE Updated Before Each Cycle (prevents stale operational state)
`SCALER-STATE.yaml` MUST be read and updated at the START of every operation cycle. This includes synchronizing the `state: active_mode` fields (`action_gate`, `input_mode`, `output_level`) to mirror the current `CONTROLER.yaml` scaler scope values. This prevents acting on stale or desynced parameters.

### P-LAW-008 — Mandatory Runbook Immersion (prevents partial knowledge errors)
Before ANY Scaler execution cycle or providing ANY simulation, the agent MUST confirm it has fresh context from all **five** runbook files. This requires performing a full `view_file` call for each: `Scaler-Architecture.md`, `Scaler-Workflows.md`, `Scaler-Operational-Rules.md`, `Scaler-Gateway.md`, `Scaler-Discovery-Logic.md`. Providing answers based on memory or summary without verification is a protocol violation.

### P-LAW-009 — Minimal Proposal Cohesion (prevents fragmentation)
The Scaler is prohibited from generating shallow, single-item proposals when a functional cluster exists. All items must pass through a Functional Affinity (S5) check and Cluster-First audit before card creation. Any violation results in immediate "Rejected: Fragmentation" status by self-audit.

### P-LAW-010 — Documentation Evolution & Logic Preservation
No existing operational logic should be deleted if it does not conflict with new logic. Foundational logic (e.g., Step-by-Step Analysis) must be **modernized** and integrated into new complex models (e.g., Hierarchical Models) to ensure the system remains grounded in deterministic basics.

### P-LAW-011 — Mandatory Archiving (Fresh Start Law)
1. **Cards**: Once marked `INTEGRATED` or `REJECTED`, move to `_archive/` immediately.
2. **External Discoveries**: A source discovery (D/SD) MUST ONLY be moved to `EXTERNAL/_archive/discoveries/` when **ALL associated proposals** (across all aspects and types) are marked `INTEGRATED`.
3. **Persistence**: If a discovery still has a single pending proposal or "benefit potential" for another aspect, it must remain in the active discovery folder.

### P-LAW-012 — The Utility-First Law (Modernized)
Classification MUST distinguish between the OS structure (Architecture), OS skills (Capabilities), and OS value (Business) using a **Utility-First** approach. It doesn't matter if a discovery is a skill, an agent, a script, or a photo:
- **Foundational_Integrity**: Core systems (toolbox_library system, identity, routers, mission_board, pipelines, projects). Classification is for anything that helps, enhances, or defines these systems.
- **Operational_Muscles**: Items destined for toolboxes in `.toolbox_library`. Classification is for anything that can be placed or converted into a skill or tool.
- **Value_Generation**: Market value and monetization. Classification is for anything that makes money for our systems and architecture.

### P-LAW-013 — The Two-Layered Organization Protocol
Classification and organization MUST proceed in two distinct phases:
1. **Utility-First Routing**: For cross-top-folder moves or `.mixed_inbox` routing. Classify based on the system domain it benefits (Foundational_Integrity, Operational_Muscles, Value_Generation) regardless of file type.
2. **Relevance-First Grouping**: For moving items from hub-specific inboxes into the hub root or within residency folders. Group by functional/topic similarity since the utility is already established.

### P-LAW-014 — The Zero Loose Files Law
Discovery hub roots (`_Foundational_Integrity/`, `_Operational_Muscles/`, `_Value_Generation/`) MUST NOT contain any loose files. Every single discovery item — regardless of count — MUST be grouped into a relevance-based folder (e.g., `hub/group_name/item.md`). A folder can contain a single item if necessary to maintain logical grouping.

### P-LAW-015 — The Strict Approval Gate
Items residing in `complex_systems/` and `mixed_others/` are strictly locked. No Phase 2 Mapping, Phase 3 Analysis, or Phase 4 Proposal generation can proceed for these items without explicit, separate user approval for the specific discovery unit.

### P-LAW-016 — The No-Inbox Processing Law
No proposal card, solution card, or gap report can be drafted from an item while it resides in an `_inbox/` staging folder. Items MUST be moved and grouped into their parent hub/residency folder before any formal processing begins.
