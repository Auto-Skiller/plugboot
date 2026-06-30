---
metadata:
  name: evolution-protocol
  class: system/identity
  type: identity
  version: '1.0'
  schema_version: '1.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-06-27T00:00:00'
credentials:
  description: Defines the recursive self-improvement cycle and how the OS processes
    evolution proposals via the evolution queue in .core.yaml.
  when_to_use: Consult when you have identified a systemic improvement or structural
    flaw and need to propose an architectural change.
  contains: evolution_rules, modification_protocol
---
contains: evolution_rules, modification_protocol, self_repair, boot_sequence
---
# 🧬 Evolution Protocol

## 1. The Evolution Trigger (Proactivity Law)
The agent is PROHIBITED from waiting for a user prompt to initiate an evolution. If a task results in a new structural pattern, a new logic preference, or a systemic refinement, the agent MUST proactively record an evolution proposal.

**Proposals go into `.db/.system.board.yaml`** under `runtime.evolution_queue`.
Do NOT edit `.meta/.os/.system.identity/` files directly during normal operation. The evolution queue is the only safe, auditable path for structural changes.

## 2. Proposal Structure
Every proposal appended to the evolution queue MUST conform to the schema defined in `.db/.schemas/system_schemas.yaml` under `runtime.evolution_queue`.

## 3. Proposal Lifecycle
```
pending → accepted  → apply change to target_file, move entry to queues.applied
       → rejected  → annotate with rejection reason, move entry to queues.rejected
```

1. **Agent appends** proposal to `queues.pending` with `status: pending`.
2. **Reviewer** (user or Orchestrator Daemon in AUTO mode) reads `queues.pending`.
3. **If accepted:** apply the change to the `target_file`, move the entry to `queues.applied` as the audit trail.
4. **If rejected:** annotate with a rejection reason, move the entry to `queues.rejected`.

## 4. The Evolution Loop (When Executing an Accepted Proposal)
1. **Detect Logic Shifts:** Confirm the accepted proposal's rationale still holds.
2. **Target Selection:** Identify which `.db/meta_identity/` files or pipeline runbooks need updating.
3. **Apply Logic Preservation:** Merge new logic carefully. Do NOT destructively overwrite old logic unless directly contradicted.
4. **The Anti-Recurrence Law:** Whenever fixing a bug or logical gap, ask *"How do I ensure this NEVER happens again?"* and immediately codify the preventive logic into the relevant identity file or runbook. A fix is not complete until the system's DNA has been hardened against recurrence.

## 5. Documentation Requirements
Every applied evolution must be logged in `.db/.system.board.yaml` under the `system` content block's `hub.recent_events`.
Format: `[DATE] EVOLUTION: Updated [File Path] with new logic — [Brief Description].`
