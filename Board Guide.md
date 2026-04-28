# 🛡️ Board Master Guide: Operational Hub (`board.yaml`)

The `board.yaml` is the **Unified Source of Truth** for the workspace's state. it is the primary interface between the Human Operator (Vision/Director) and the AI Agent (Execution).

---

## ⚡ 1. Core Operating Principles
- **Real-Time Sync**: The board must be updated immediately as goals progress. No batching.
- **Structured Precision**: YAML enables the agent to parse goals, modes, and notes with 100% reliability.
- **Visual Flair**: Use emojis to indicate status, priority, and focus areas.
- **Audit-First**: The agent MUST read the `board.yaml` (especially `session_status` and `user_notes_to_agent`) at the start of every turn.

---

## 🕹️ 2. Mode-Specific Board Behaviors
Mode dictates how the agent interacts with the board and the user.

| Mode | Indicator | address User | Board Edit Rule |
| :--- | :--- | :--- | :--- |
| **NORMAL** 🔴 | `NORMAL 🔴` | "Director ..." | **Do not edit** the board unless explicitly told. Defer all decisions. |
| **COLLAB** 🟡 | `COLLAB 🟡` | "We ..." | **Propose edits** or update progress. Present intent before acting. |
| **AUTO** 🟢 | `AUTO 🟢` | "I ..." | **Edit freely.** Act decisively, update goals, and document all decisions for review. |

---

## 🎯 3. Goal Management Standards
All **Active Goals** must follow this strict schema to ensure continuity across sessions and agents.

### A. Categorization (Focus Areas)
Goals are grouped by focus area to prevent logic fragmentation:
- `system_level`: Structural changes, core logic, architecture, or workspace-wide rules.
- `pipeline_level`: Workflow improvements, tool/agent integrations, or skill refinements.
- `project_level`: Specific revenue-generating builds, research tasks, or content production.
- *(Add more custom categories as the workspace evolves)*

### B. Required Fields for Active Goals
Every goal in `active_goals` MUST contain:
- `goal`: A clear, emoji-enhanced title (e.g., `Transition to Nexus-AGI 🏛️`).
- `status`: Current state (`IN PROGRESS ⏳`, `BLOCKER 🛑`, `PAUSED ⏸️`).
- `notes`: **Mandatory.** Use block scalars (`|`) for findings, context, or technical notes. Can be empty but the key must exist.
- `sub_tasks`: **Mandatory.** A list of atomic, checkable steps.
  - Each task must have a `task` description and a `status` (`pending ⚪`, `done ✅`).

---

## 🔄 4. The Orchestration Loop
1. **Detect**: Read `session_status` to identify the active mode and current focus.
2. **Consult**: Check `active_goals` to see what is already in progress.
3. **Execute**: Work on sub-tasks. If a failure occurs, document the blocker in the goal's `notes`.
4. **Transition**: When a goal is finished:
   - Move it to `completed_goals`.
   - **Continuous Learning**: Add a summary of specific strategies, approach shifts, and rules derived during execution to the `notes`.

---

## 💬 5. Communication & Scratchpad
- **Agent Notes (`agent_notes_to_user`)**: Leave questions, complex findings, or status reports here.
- **User Notes (`user_notes_to_agent`)**: The agent **MUST** read this section first every turn for new directions.
- **Scratchpad (`scratchpad`)**: A free-form drafting area using a block scalar (`|`). Use this for raw ideas, code snippets, or temporary data that doesn't fit into a goal yet.

---

## 🛑 6. Escalation & Failures
- **When Information is Missing**: Ask (NORMAL/COLLAB) or assume and document (AUTO).
- **When Something Fails**: Analyze the root cause and document it in the goal's `notes`.
- **After 3 Failures**: Change strategy entirely, mark the goal as `BLOCKER 🛑`, and escalate to the User.
