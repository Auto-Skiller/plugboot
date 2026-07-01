# 🧬 Evolution Protocol

## 1. The Evolution Trigger (Proactivity Law)
The agent is PROHIBITED from waiting for a user prompt to initiate an evolution. If a task results in a new structural pattern, a new logic preference, or a systemic refinement, the agent MUST proactively record an evolution proposal.

**Proposals go into the entity's board file** (e.g., `_system/system-board.yaml`) under the appropriate pipeline profile ledger (e.g., `pipelines.shared_pipelines.scaler.profiles.EXTERNAL.ledgers.fi_proposals`).
Do NOT edit `_system/.system-meta/.system-os_prompts/` files directly during normal operation without a formal proposal. The board's control plane is the only safe, auditable path for proposing structural changes.

## 2. Proposal Structure
Every proposal appended to the ledgers MUST conform to the schema defined for that specific pipeline ledger (e.g., Scaler's FI proposals).

## 3. Proposal Lifecycle
```
pending → accepted  → apply change to target_file, move entry to applied
       → rejected  → annotate with rejection reason, move entry to rejected
```

1. **Agent appends** proposal to the ledger with `status: pending`.
2. **Reviewer** (user or Orchestrator Daemon in AUTO mode) reads the pending entries.
3. **If accepted:** apply the change to the `target_file`, update the ledger entry to `applied` as the audit trail.
4. **If rejected:** annotate with a rejection reason, update the ledger entry to `rejected`.

## 4. The Evolution Loop (When Executing an Accepted Proposal)
1. **Detect Logic Shifts:** Confirm the accepted proposal's rationale still holds.
2. **Target Selection:** Identify which OS prompt files, runbooks, or schemas need updating.
3. **Apply Logic Preservation:** Merge new logic carefully. Do NOT destructively overwrite old logic unless directly contradicted.
4. **The Anti-Recurrence Law:** Whenever fixing a bug or logical gap, ask *"How do I ensure this NEVER happens again?"* and immediately codify the preventive logic into the relevant OS prompt file or runbook. A fix is not complete until the system's DNA has been hardened against recurrence.

## 5. Documentation Requirements
Every applied evolution must be logged in the entity's board file (`system-board.yaml` or `<project>-board.yaml`) under `live_state.recent_events`.
Format: `[DATE] EVOLUTION: Updated [File Path] with new logic — [Brief Description].`
