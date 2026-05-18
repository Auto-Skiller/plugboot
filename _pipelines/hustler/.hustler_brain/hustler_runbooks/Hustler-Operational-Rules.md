# 📜 Hustler Operational Rules

## Objective
**Purpose:** Define the operational rules and constraints for the Hustler pipeline. This document codifies all 12 H-LAWs governing the pipeline's behavior. The original H-LAW-001 / H-LAW-002 / H-LAW-003 are preserved verbatim from v1.0 (Logic Preservation Law). H-LAW-004 through H-LAW-012 are additions inspired by Scaler P-LAWs and adapted to Hustler's product-discovery domain.

---

## 1. Core Principles

### Cascading Integrity
The Focus → Product → Feature hierarchy is a strict ordering. Sources cascade *down* through threshold checks, never sideways or up. A signal that doesn't pass a Focus threshold stays in the discovery holding folder until it does.

### Tag Lifecycle Preservation
Every file in a feature's `00-data/` carries a tag indicating its state. Every section in a feature's `[feature].yaml` carries a status tag. Tags are immutable except via the documented transitions in `Hustler-Tagging-System.md`.

---

## 2. Constraints & Prohibitions

- **No Premature Validation**: A new Focus, Product, or Feature MUST NOT be created without the cascading threshold being met. This prevents the directory tree from thrashing on every inbound signal.
- **Anti-Duplication via Ledger**: The same source file MUST NEVER be cascaded twice. Anti-duplication is enforced via `.hustler_mixed_inbox.ledger.yaml` content hashes for items in the mixed inbox, plus `[focus].sources_ledger.yaml` for items already cascaded into a focus.
- **Mandatory Tracker Updates**: Every cascade move MUST update the source ledger AND the target tracker AND the relevant focus ledger atomically.
- **No `.USER-SPACE` Touching**: Items inside `_HUSTLER-EXTERNAL_SOURCES/.hustler_USER-SPACE/` are user-managed staging — the Hustler MUST NOT scan, route, or process these files.
- **Mandatory Gateway**: Every cascade decision in `PLANNING` mode MUST be materialized as a review request in `CONTROLER.yaml.communication_hubs.hustler_hub.messages` before any move is committed.

---

## 3. Governance: The 12 H-LAWs

### Original Foundation (preserved verbatim from v1.0)

#### H-LAW-001 — Hustle Naming Standard
All Hustle sessions must follow the pattern: `HUSTLE-[Market]-[ID]`.
**Enforced:** true.

#### H-LAW-002 — Value-First Protocol (ROI Verification)
No campaign execution can begin without a documented ROI projection in the session goal.
**Enforced:** true.

#### H-LAW-003 — Market Sanity Check
Every hustle must perform a market research step before building final assets.
**Enforced:** true.

---

### Integrity Invariants (added in v2.0 — codify behaviors the system already depends on)

#### H-LAW-004 — Cascading Threshold Integrity
A new Focus / Product / Feature MUST NEVER be created (Focus folder at pipeline root, or product/feature folders inside it) until the cascading threshold (defined per-level in `Hustler-Cascading-Logic.md`) has been met. Premature validation creates folder thrashing and fragments the audit trail.
**Enforced:** true.

#### H-LAW-005 — Tag Lifecycle Preservation
Every file inside a feature's `00-data/` MUST carry exactly one of `[new-data]`, `[processed-data]`, `[new-scraped]`. Every section in `[feature].yaml` MUST carry one of `[new-def]`, `[new-needs]`, or no tag (validated). Tag transitions follow the documented Step 2.1/2.2/2.3 sequence in `Hustler-Tagging-System.md` and may not skip steps.
**Enforced:** true.

#### H-LAW-006 — Atomic Tracker Update
A cascade or processing operation MUST NEVER be committed without simultaneous updates to the relevant ledger (sub-ledger first, then master), the target tracker, and the source's status. Card-and-ledger or move-and-tracker pairs are a single atomic operation. Failure = anti-duplication violation.
**Enforced:** true.

##### Recovery from Partial Failure (H7 closure)
If any write in the atomic trio fails (disk error, schema validation, race with another agent, etc.), the Hustler MUST:
1. **ABORT the entire operation immediately.** No partial state is committed.
2. **Leave the source file untouched in its origin folder** (e.g., `.hustler_mixed_inbox/` or upstream `_[focus]_inbox/`). The source ledger entry MUST NOT be written if the move did not complete.
3. **Roll back any successful writes from the same operation.** If `[feature].yaml` was updated but `[product]-FEATURES.yaml` failed, revert the `[feature].yaml` change to its pre-operation state. The atomic trio is all-or-nothing.
4. **Log the failure** to `CONTROLER.yaml.communication_hubs.hustler_hub.messages` with:
   - the operation type (cascade move | feature validation | tag transition)
   - which writes succeeded vs failed
   - the underlying error
   - the reverted target state
5. **Surface to the user** in `STRICT` or `COLLAB` work_mode. In `AUTO` mode, log and continue with the next item.
6. **Never re-attempt automatically.** A partial-failure operation is queued for human review unless the runbook explicitly authorizes retry (none currently do).

This rule prevents the failure mode where anti-duplication is broken by a half-cascaded source: the source file landed in the focus folder but the ledger never recorded the hash, so the next cascade pass would try to move it again.

#### H-LAW-007 — Anti-Duplication via Ledger
Before cascading any item out of `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/`, the Hustler MUST consult `.hustler_mixed_inbox.ledger.yaml.state.tracked_items` for a matching content hash. When cascading INTO a focus, the Hustler MUST also log the hash in the target focus's `[focus].sources_ledger.yaml`. The same source file MUST NEVER be cascaded twice.
**Enforced:** true.

#### H-LAW-008 — Logic Preservation
No existing operational logic in the Hustler runbooks may be deleted during evolution if it does not directly conflict with new logic. Foundational step-by-step instructions (e.g., the Phase 3 Step 2.1 / 2.2 / 2.3 processing playbook) MUST be modernized rather than replaced. The system's "DNA" remains intact across iterations. (Mirror of the workspace-level Evolution Protocol §1 Non-Loss Principle.)
**Enforced:** true.

#### H-LAW-009 — Cross-OS Launcher Execution
All Python tooling for the Hustler MUST be invoked via the workspace cross-OS launcher (`.meta_runtime/venv/meta_run.{ps1,sh}`). Direct `.venv/Scripts/python.exe` calls are prohibited because they break cross-OS portability. (Mirror of Scaler-Operational-Rules §5.)
**Enforced:** true.

#### H-LAW-010 — Mandatory Runbook Immersion
Before ANY Hustler execution cycle or providing ANY simulation, the agent MUST confirm it has fresh context from all **five** runbook files in `hustler_runbooks/`: `Hustler-Architecture.md`, `Hustler-Workflows.md`, `Hustler-Operational-Rules.md`, `Hustler-Cascading-Logic.md`, `Hustler-Tagging-System.md`.

> **Known limitation (audit-acknowledged).** Like Scaler P-LAW-008, this rule is currently honor-system: no programmatic gate verifies the read. A future enhancement could store per-session runbook acknowledgements (timestamp + content-hash) in `hustler_state.yaml.runbook_readiness` and enforce pre-flight refusal on missing/stale acks. Until enforced, agents are bound by H-LAW-010 on trust.

**Enforced:** false (honor-system; see caveat).

#### H-LAW-011 — Mode-Aware Action Gate
The Hustler MUST consult `CONTROLER.yaml.modes.hustler.action_gate` before any cascade or processing action. If `action_gate: EXECUTION`, the Hustler proceeds autonomously. If `action_gate: PLANNING` (default), the Hustler MUST post the proposed action to `communication_hubs.hustler_hub.messages` and wait. (Mirror of Scaler P-LAW-018.)
**Enforced:** true.

#### H-LAW-012 — Mandatory Sync Engine Execution
All agents MUST execute the master Hustler sync at the start and end of every session, via the cross-OS launcher:
- Windows: `.\.meta_runtime\venv\meta_run.ps1 _pipelines\hustler\.hustler_brain\hustler_sync.py`
- Linux/macOS: `./.meta_runtime/venv/meta_run.sh _pipelines/hustler/.hustler_brain/hustler_sync.py`

This ensures `hustler_runtime.yaml`, `hustler_state.yaml`, `hustler_ledgers.yaml`, and the master `hustler_router.yaml` reflect the absolute truth of the on-disk state. The master meta_sync.py automatically triggers this via `pipelines_sync.py`.
**Enforced:** true.

---

## 4. Conflict Resolution
1. **Pillar Dominance**: The Brain Pillar (`.meta_brain/`) rules always take precedence. Hustler logic adapts; system laws do not.
2. **Deterministic Precedence**: The Master Index (`.meta_brain/meta_router.yaml`) is the final authority. If a Hustler operation contradicts the master index, the operation is rejected pending an Internal Action Card via the Scaler.

---

## 5. Self-Evolution Protocol
The Hustler is a self-improving system. Discoveries that reveal new patterns in product-discovery (e.g., new tag types, new cascading dimensions, new monetization vectors) must be converted into Internal Action Cards routed via the **Scaler INTERNAL pipeline** to `Foundational_Integrity_internal_proposals/`. The Hustler does not self-modify its own runbooks — that is Scaler territory.
