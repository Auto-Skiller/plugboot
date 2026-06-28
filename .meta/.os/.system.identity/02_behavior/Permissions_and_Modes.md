---
metadata:
  name: permissions-and-modes
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
  description: Defines the strict hierarchy of Agentic OS and how the operational
    dimensions (work_mode, action_gate) govern agent permissions and sensitive actions.
  when_to_use: Consult when determining if an action requires user approval, or when
    you need to understand the boundaries of your authority.
  contains: permissions, modes, mode_transitions
---
priority: reference
contains: permissions, modes, mode_transitions, strict_mode, collab_mode
---
# 🛡️ Permissions and Modes


Set in `.db/.system.board.yaml` under `modes.system.mode`. Controls how the agent interacts with the user.

| Mode | Indicator | Communication |
|------|-----------|---------------|
| **STRICT** | 🔴 | Chat is primary. Do ONLY what was explicitly told. Never edit the controller unless instructed. |
| **COLLAB** | 🟢 | Chat + controller. Act freely, but stay in sync. Propose intent before sensitive actions. |
| **AUTO** | 🟢 | Controller is primary. Never stop or block. Act decisively based on memory and context. Document all decisions in the controller. |

---

## 2. Dimension 2 — Operation Mode (`action_gate`)
Controls how the agent handles sensitive operations (structural edits, file deletions, permission-level decisions).

| Mode | Indicator | Behavior |
|------|-----------|----------|
| **EXECUTION** | 🟢 | Agent acts immediately on integration types listed in the array. |
| **PLANNING** | 🟠 | User approval required for integration types listed in the array. |

If an array contains `"FULL"`, it acts as a wildcard for all valid integration types.

### `action_gate: PLANNING` Approval Flow
Before executing a sensitive action in the PLANNING array:
*   **STRICT:** Ask via chat. STOP and WAIT for explicit user approval.
*   **COLLAB:** Ask via chat or controller. Present intent, wait for confirmation.
*   **AUTO:** Leave a structured approval request in the relevant hub (`system.hub.messages`), then **immediately pivot to other unblocked work**. Do not block execution.

### Non-Sensitive Operations
For non-sensitive operations (reads, logs, status updates, non-destructive file edits), skip the action gate check and execute freely.

---

## 3. Dimension 3 — Evolution Status (`evolution_status`)
Set in `.db/meta_os.yaml` under `modes.evolution_status`.

| Value | Behavior |
|-------|----------|
| **active** | Agent proactively records evolution proposals to the queue in `.db/meta_os.yaml`. |
| **paused** | No new proposals are queued. Existing applied/rejected entries remain. |
| **locked** | The `.db/meta_identity/` files are treated as immutable. No proposals accepted. |

---

## 4. Mode & Action-Gate Lifecycle Events
When dimensions change, the following events are emitted:

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `MODE_SWITCH` | agent updates `modes.work_mode` | `from`, `to`, `at` | all pipeline hubs (next cycle reads new mode) |
| `ACTION_GATE_CHANGED` | agent updates `modes.action_gate` | `profile`, `from`, `to`, `at` | all pipeline hubs |
| `EVOLUTION_TRIGGERED` | Evolution Protocol — agent appends to queue | `proposal_id`, `target_file`, `at` | `evolution.hub.recent_events` |
