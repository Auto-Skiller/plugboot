
---

## Board Guide

The `board.yaml` is the **Unified Source of Truth** for the workspace's runtime state. It is the primary interface between the Human Operator (Vision/Direction) and the AI Agent (Execution).

### ⚡ Core Operating Principles
- **Audit-First**: The agent MUST read `board.yaml` (especially `session_status` and `user_notes_to_agent`) at the start of every turn.
- **Real-Time Sync**: The board must be updated immediately as goals progress. No batching updates.
- **Structured Precision**: YAML enables the agent to parse goals, modes, and notes with 100% reliability.
- **Visual Flair**: Use emojis to indicate status, priority, and focus areas.

### 🎯 Goal Management Standards
All **Active Goals** must follow this strict schema to ensure continuity across sessions and agents.

#### A. Categorization (Focus Areas)
Goals are grouped by focus area to prevent logic fragmentation:
- `system_level` — Structural changes, core logic, architecture, or workspace-wide rules.
- `pipeline_level` — Workflow improvements, tool/agent integrations, or skill refinements.
- `project_level` — Specific revenue-generating builds, research tasks, or content production.
- *(Add more custom categories as goals evolve)*

#### B. Required Fields for Every Active Goal
Every goal in `active_goals` MUST contain:
- `goal` — A clear, emoji-enhanced title (e.g., `Transition to Nexus-AGI 🏛️`).
- `status` — Current state: `pending ⚪` | `IN PROGRESS ⏳` | `BLOCKER 🛑` | `PAUSED ⏸️` | `done ✅`
- `notes` — **Mandatory.** Use block scalars (`|`) for findings, context, or technical notes. Can be empty but the key must exist.
- `sub_tasks` — **Mandatory.** A list of atomic, checkable steps.
  - Each task must have a `task` description and a `status` (`pending ⚪` or `done ✅`).

### 💬 Communication & Scratchpad
- **Agent Notes (`agent_notes_to_user`)** — Leave questions, complex findings, or status reports here for the user to review.
- **User Notes (`user_notes_to_agent`)** — The agent **MUST** check this first every turn. This is where the user leaves new directions between sessions.
- **Scratchpad (`scratchpad`)** — Free-form drafting area using a block scalar (`|`). Use for raw ideas, code snippets, or temporary data that doesn't fit into a goal yet.