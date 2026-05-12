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
- **Zero-Drift Sync**: Never manually update the global `meta.router.yaml` from within the Scaler workspace. All changes must be routed through `EXTERNAL/proposals/` or `INTERNAL/solutions/` and synced via the Root OS protocols.
- **Atomic State**: Every operation must be preceded by a state update in `SCALER-STATE.yaml`.
- **Anti-Duplication**: Consult the `EXTERNAL-LEDGER.yaml` or `INTERNAL-LEDGER.yaml` inside `scaler.tracker/` before initiating any analysis to prevent processing duplicates.
- **No Scope Creation Without Approval**: The Scaler MUST NOT create new scopes (aspects) autonomously. New scope suggestions must be posted in the `CONTROLER.yaml` communication block. Integration only proceeds after explicit user approval — regardless of the active `action_gate` mode.
- **Mandatory Gateway**: Every single Scaler output — whether from EXTERNAL or INTERNAL execution — MUST be materialized as a Proposal Card (in `EXTERNAL/proposals/`) or a Solution Card (in `INTERNAL/solutions/`) **before** any integration into a target scope. Direct integration without a gateway card is a strict protocol violation.

---

## 3. Self-Evolution Protocol
The Scaler is a self-improving system. Any discoveries or ideas for enhancing the Scaler's own logic, speed, or accuracy must be converted into proposals and routed strictly to:
- **`INTERNAL/solutions/pipeline_scaler/`** (Self-Refactoring path, as the scaler itself falls under the `pipeline_scaler` aspect).

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

### Proposal Card (EXTERNAL/proposals/[aspect]/[level]/PROPOSAL-[ID].yaml)
```yaml
proposal_id: string          # e.g., PROP-EXT-001
schema_version: "2.0"
source: string               # path in EXTERNAL/discoveries/
target_scope: string         # aspect and destination path
integration_type: string     # DIRECT_MOVE | ADAPT_AND_INTEGRATE | PARTIAL_EXTRACT | ARCHITECTURE_AUDIT | MERGE_WITH_PENDING
description: string          # what will be done and why
files_involved:
  - path: string
    action: string           # MOVE | COPY | ADAPT | DELETE
pending_proposal_ref: string # if MERGE_WITH_PENDING, reference the existing proposal
user_decision: string        # APPROVED | REJECTED | NOTES: [text] | PENDING
action_gate_at_creation: string  # EXECUTION | PLANNING
integration_status: string   # PENDING | PENDING_INTEGRATION | INTEGRATED | REJECTED
integrated_at: string        # timestamp
scaler_notes: string         # Scaler's self-review notes
```

### Solution Card (INTERNAL/solutions/[aspect]/[level]/SOLUTION-[ID].yaml)
```yaml
solution_id: string          # e.g., SOL-INT-001
schema_version: "2.0"
gap_ref: string              # path to gap report in INTERNAL/gaps/
target_scope: string         # aspect and files that will change
change_type: string          # FILE_EDIT | STRUCTURAL_REFACTOR | NEW_FILE | ARCHITECTURE_AUDIT
description: string          # what will be changed and why
files_involved:
  - path: string
    action: string           # EDIT | CREATE | DELETE | RESTRUCTURE
pending_proposal_ref: string # if extending an existing solution, reference it
user_decision: string        # APPROVED | REJECTED | NOTES: [text] | PENDING
action_gate_at_creation: string  # EXECUTION | PLANNING
integration_status: string   # PENDING | PENDING_INTEGRATION | INTEGRATED | REJECTED
integrated_at: string        # timestamp
scaler_notes: string         # Scaler's self-review notes
```

### Gap Report (INTERNAL/gaps/[aspect]/[level]/GAP-[ASPECT]-[NNN].yaml)
```yaml
gap_id: string               # e.g., GAP-SCALER-001
schema_version: "2.0"
aspect: string
output_level: string
description: string
files_involved:
  - path: string
    action: string
solution_ref: string         # links to Solution Card
user_decision: string        # APPROVED | REJECTED | NOTES: [text] | PENDING
action_gate_at_creation: string
integration_status: string
integrated_at: string
scaler_notes: string
```

> **PREVENTION**: All cards are `.yaml` files ONLY. Markdown (`.md`) card format is permanently deprecated. Legacy `.md` cards must be migrated immediately on discovery.

---

## 8. Prevention Laws
These laws exist to structurally prevent the gaps identified in the 2026-05-12 internal audit from ever recurring.

### P-LAW-001 — Atomic Ledger Update (prevents stale ledgers)
A card MUST NEVER be created without simultaneously updating the corresponding ledger (`EXTERNAL-LEDGER.yaml` or `INTERNAL-LEDGER.yaml`). Card creation and ledger update are a single atomic operation. Failure = anti-duplication violation.

### P-LAW-002 — Double-Entry Sync After Every Action (prevents mission board desync)
After EVERY Scaler operation (card creation, integration, phase change), the agent MUST update BOTH:
1. `CONTROLER.yaml` — session goal status, tracking, artifacts, last_sync, recent_events.
2. `.runtime/.mission_board/[SESSION]/[GOAL]/[GOAL].yaml` — matching status and artifacts.
These writes are non-negotiable and cannot be deferred.

### P-LAW-003 — YAML Cards Only (prevents legacy schema drift)
All gap reports, proposal cards, and solution cards MUST be `.yaml` files using `schema_version: "2.0"`. Markdown card format is permanently forbidden. Any legacy `.md` card found must be immediately migrated and the `.md` file deleted.

### P-LAW-004 — Four Levels Per Aspect (prevents missing auto/ folders)
Every aspect folder in `EXTERNAL/proposals/`, `INTERNAL/solutions/`, and `INTERNAL/gaps/` MUST contain exactly 4 level subfolders: `architecture/`, `capabilitys/`, `bussiness/`, `auto/`. When a new aspect folder is created, all 4 subfolders and their `.gitkeep` files must be created in the same operation.

### P-LAW-005 — Router Sync After Runbook Changes (prevents stale router)
Whenever ANY runbook file is modified (name, description, added, or removed), `scaler.router.yaml` descriptions and routing_instructions MUST be updated in the same operation.

### P-LAW-006 — last_sync Update Is Mandatory (prevents stale sync timestamp)
`CONTROLER.yaml → system_status.last_sync` MUST be updated to the current timestamp in every post-integration sync (Step 6 of `Scaler-Gateway.md`). A sync that does not update `last_sync` is incomplete.

### P-LAW-007 — SCALER-STATE Updated Before Each Cycle (prevents stale operational state)
`SCALER-STATE.yaml` MUST be read and updated at the START of every operation cycle. The `active_mode` fields must mirror the current `CONTROLER.yaml` scaler scope values.

### P-LAW-008 — Full Runbook Read Before Execution (prevents partial knowledge errors)
Before any Scaler execution cycle, the agent MUST confirm it has fresh context from all four runbook files: `Scaler-Architecture.md`, `Scaler-Workflows.md`, `Scaler-Operational-Rules.md`, `Scaler-Gateway.md`.
