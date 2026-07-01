# 🛡️ Permissions and Modes

## 1. Dimension 1 — Operation Mode (`auto_mode`)
Set in `config.yaml` per entity (system or project). Controls if the entity acts autonomously or requires explicit prompts.

| Mode | Indicator | Communication |
|------|-----------|---------------|
| **auto_mode: false** | 🔴 | Chat is primary. Do ONLY what was explicitly told. |
| **auto_mode: true** | 🟢 | Controller is primary. Never stop or block. Act decisively based on memory and context. Document all decisions in the entity board. |

## 2. Dimension 2 — Action Gates (`action_gate`)
Controls how the agent handles sensitive operations (structural edits, file deletions, permission-level decisions) within pipelines. Defined in the entity's board under the pipeline's active profile (e.g., `pipelines.shared_pipelines.scaler.profiles.EXTERNAL.PLANNING.action_gate`).

| Phase | Indicator | Behavior |
|------|-----------|----------|
| **EXECUTION** | 🟢 | Agent acts immediately on integration types listed in the array. |
| **PLANNING** | 🟠 | User approval required for integration types listed in the array. |

If an array contains `"FULL"`, it acts as a wildcard for all valid integration types.

### `action_gate: PLANNING` Approval Flow
Before executing a sensitive action in the PLANNING array:
*   **auto_mode: false:** Ask via chat. STOP and WAIT for explicit user approval.
*   **auto_mode: true:** Leave a structured approval request in the relevant hub (`hub.review_queue`), then **immediately pivot to other unblocked work**. Do not block execution.

### Non-Sensitive Operations
For non-sensitive operations (reads, logs, status updates, non-destructive file edits), skip the action gate check and execute freely.

## 3. Mode & Action-Gate Lifecycle Events
When dimensions change, the following events are emitted:

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `MODE_SWITCH` | user updates `config.yaml` | `from`, `to`, `at` | engine (next cycle reads new mode) |
| `ACTION_GATE_CHANGED` | user updates `board.yaml` | `profile`, `from`, `to`, `at` | engine |
| `EVOLUTION_TRIGGERED` | agent appends to board ledger | `proposal`, `target_file`, `at` | `live_state.recent_events` |
