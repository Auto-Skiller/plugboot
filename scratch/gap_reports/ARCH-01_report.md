# ARCH-01: Orchestration & Flow Architecture Audit Report

## Audit Scope
Analyze the 10-step execution flow (`.brain/Orchestration_And_Flow.md`) for broken handoffs, transition gaps, or logical dead-ends.

## Findings

1.  **Step 3 (Task Resolution) to Step 4 (Context Scan) Gap:**
    -   **Issue:** If `task.topic` is empty and there are no existing goals, the system falls back to waiting for user input or blocker triage. However, if blocker triage creates a new task, the flow doesn't explicitly restart or guarantee the new task is passed effectively to Step 4. The transition logic is implicit.
    -   **Analysis:** The "create/pick" action in Step 3 on failure mode (AUTO) needs to explicitly output a populated `task{}` object to ensure the Step 4 gate (`task{}` + `.catalogs.index.yaml`) is met smoothly.

2.  **Step 5 (Goal Mgmt) Edge Case Dead-End:**
    -   **Issue:** The Step 5 gate requires "Goal exists in `BOARD.yaml` AND (status != done OR is persistent needing re-evaluation)". If a goal is marked `status: done` and is NOT persistent, what happens?
    -   **Analysis:** If the current task maps to a non-persistent completed goal, the gate technically fails. The "On Fail" action is "RETRY goal creation. After 2 fails → ESCALATE". Retrying goal creation for a completed task might lead to infinite loops or incorrect escalations. There should be a specific branch for "Task maps to already completed goal" (e.g., return "Goal already achieved" to user or pick next goal).

3.  **Step 9 (Execute) to Step 10 (Sync) Partial Failure Handoff:**
    -   **Issue:** Step 9 requires "All `outputs` produced after run". If an execution partially succeeds (produces some but not all expected outputs), and retries are exhausted, it blocks the goal.
    -   **Analysis:** There's no mechanism to pass partial success state to Step 10. A complete failure blocks the goal, but a partial success might just need a follow-up phase instead of complete blocking.

4.  **Persistent Goal Cycle Ambiguity (Step 10 to Next Loop):**
    -   **Issue:** The document notes: "Persistent goals with completed missions require explicit evaluation and phase reset for the next cycle to prevent blindly reprocessing them."
    -   **Analysis:** This logic is not formally encoded in the 10-step table. Step 10 says "If goal is `persistent ♾️`, do NOT mark done, log cycle." But it doesn't mention phase reset. This creates a logical dead-end where the next cycle might just repeat the completed phase of the persistent goal.

## Proposed Code Fixes (System-Level)

### 1. Update `.brain/Orchestration_And_Flow.md` Table

**Modify Step 3 (Task Resolution) "On Fail" column:**
- Current: `If prompt empty + no goals + not AUTO → ⏳ WAIT for user. If AUTO → run **Blocker Triage**, then create/pick.`
- Proposed: `If prompt empty + no goals + not AUTO → ⏳ WAIT for user. If AUTO → run **Blocker Triage**, then create/pick and restart Step 3.`

**Modify Step 5 (Goal Mgmt) "On Fail" column:**
- Current: `❌ RETRY goal creation. After 2 fails → ESCALATE`
- Proposed: `If goal is 'done', ✅ SOFT PASS (Mark task complete). Else ❌ RETRY goal creation. After 2 fails → ESCALATE`

**Modify Step 10 (Sync) "Sync actions" column:**
- Current: `BOARD.yaml` write succeeded. If goal is `persistent ♾️`, do NOT mark done, log cycle. Distillation applied.
- Proposed: `BOARD.yaml` write succeeded. If goal is `persistent ♾️`, do NOT mark done, log cycle, and reset phase. Distillation applied.

### 2. Update Persistent Goal Handling Section in `.brain/Orchestration_And_Flow.md`

- Replace the sentence "Persistent goals with completed missions require explicit evaluation and phase reset for the next cycle to prevent blindly reprocessing them." with "Persistent goals with completed missions require explicit evaluation and phase reset during Step 10 (Sync) for the next cycle to prevent blindly reprocessing them. The phase state in `BOARD.yaml` must be cleared or advanced."