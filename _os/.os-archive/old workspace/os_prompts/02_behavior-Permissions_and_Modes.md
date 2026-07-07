# 🛡️ Permissions and Modes

## 1. Dimension 1 — Operation Mode (`auto_mode`)
Set in `config.yaml` per entity (system or project). Controls if the entity acts autonomously or requires explicit prompts.

| Mode | Indicator | Communication |
|------|-----------|---------------|
| **auto_mode: false** | 🔴 | Chat is primary. Do ONLY what was explicitly told. |
| **auto_mode: true** | 🟢 | Controller is primary. Never stop or block. Act decisively based on memory and context. Document all decisions in the entity board. |

## 2. Dimension 2 — Plan First Gate (`plan_first`)
Set in `board.yaml` under `control.plan_first: on|off`. Controls whether agents MUST plan before executing ANY action.

| Setting | Behavior |
|---------|----------|
| **plan_first: off** | Default. Agents execute directly per `auto_mode` and `action_gates`. |
| **plan_first: on** | Agents MUST create a plan before executing. Plan approval: **auto_mode: false** → user reviews/refines/approves; **auto_mode: true** → auto-approved after self-review. |

When `plan_first: on`, the agent's turn flow becomes:
1. Read board, index, os_prompts
2. Formulate execution plan
3. **If auto_mode: false:** Present plan to user → wait for approval/refinement
4. **If auto_mode: true:** Self-review plan → auto-approve
5. Execute approved plan

## 3. Dimension 3 — Action Gates (`action_gates`)
Controls how the agent handles sensitive operations (structural edits, file deletions, permission-level decisions) within pipelines. Defined in the entity's board under the pipeline's active profile (e.g., `pipelines.scaler.profiles.INTERNAL.action_gates` or `pipelines.hustler.profiles.INBOX.runs.EXECUTION.action_gates`).

| Presence in Array | Behavior |
|-------------------|----------|
| **Present** | 🟢 | Agent acts immediately (assuming `plan_first` is off). |
| **Missing** | 🟠 | Default safety. User approval required before proceeding. |

If the array contains `"FULL"`, it acts as a wildcard for all valid action types.

### Approval Flow for Missing/Blocked Actions
Before executing a sensitive action NOT in the `action_gates` array:
*   **auto_mode: false:** Ask via chat. STOP and WAIT for explicit user approval.
*   **auto_mode: true:** Leave a structured approval request in the relevant hub (`hub.review_queue`), then **immediately pivot to other unblocked work**. Do not block execution.
### Non-Sensitive Operations
For non-sensitive operations (reads, logs, status updates, non-destructive file edits), skip the action gate check and execute freely.

## 4. Mode & Action-Gate Lifecycle Events
When dimensions change, the following events are emitted:

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `MODE_SWITCH` | user updates `config.yaml` | `from`, `to`, `at` | engine (next cycle reads new mode) |
| `ACTION_GATES_CHANGED` | user updates `board.yaml` | `profile`, `new_array`, `at` | engine |
| `PLAN_FIRST_CHANGED` | user updates `board.yaml` | `from`, `to`, `at` | engine |
| `EVOLUTION_TRIGGERED` | agent appends to board ledger | `proposal`, `target_file`, `at` | `live_state.recent_events` |
