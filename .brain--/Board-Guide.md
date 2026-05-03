
## Board Guide

## Board Guide

The `core_missions.yaml` (located in `.missions/.core_missions/`) is the **Unified Source of Truth** for the workspace's runtime state. It is the primary interface between the Human Operator (Vision/Direction) and the AI Agent (Execution).

### ⚡ Core Operating Principles
- **Audit-First**: The agent MUST read `core_missions.yaml` (especially `session_status` and `communication`) at the start of every turn.
- **Real-Time Sync**: The board must be updated immediately as goals progress. No batching updates.
- **Structured Precision**: YAML enables the agent to parse goals, modes, and messages with 100% reliability.
- **Visual Flair**: Use emojis to indicate status, priority, and focus areas.

### 🎯 Goal Management Standards
All **Active Goals** must follow this strict schema to ensure continuity across sessions and agents.

#### A. Categorization (Focus Areas)
Goals are grouped by focus area to prevent logic fragmentation:
- `system_level` — Structural changes, core logic, architecture, or workspace-wide rules.
- `pipeline_level` — Workflow improvements, tool/agent integrations, or skill refinements.
- `project_level` — Specific project builds, research tasks, or content production.
- `autoskiller_level` — Specialized automation and skilling tasks.

#### B. Required Fields for Every Active Goal
Every goal in `active_goals` MUST contain:
- `goal` — A clear, emoji-enhanced title.
- `status` — Current state: `pending ⚪` | `in-progress 🟡` | `BLOCKER 🛑` | `PAUSED ⏸️` | `done ✅`
- `notes` — **Mandatory.** Use block scalars (`|`) or strings for findings, context, or technical notes.

### 💬 Communication Hub
- **Messages (`communication.messages`)** — Structured messaging between agents and user.
- **Backlog (`backlog`)** — Future goals and ideas to be prioritized.
- **Scratchpad (`scratchpad`)** — Free-form drafting area using a block scalar (`|`). Use for raw ideas, code snippets, or temporary data that doesn't fit into a goal yet.

