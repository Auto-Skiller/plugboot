# 📋 Board Guide

`BOARD.yaml` (located at the workspace root) is the **Unified Source of Truth** for the workspace's runtime state. It acts as Central Command.

## ⚡ Core Operating Principles
- **Audit-First**: The agent MUST read `BOARD.yaml` at the start of every turn (Step 2 of Execution Flow).
- **Atomic Locks**: You MUST create `BOARD.yaml.lock` before modifying the file, and delete it immediately after saving.
- **Real-Time Sync**: Update immediately as goals progress. No batching updates.
- **Structured Precision**: YAML enables 100% reliable parsing.
- **Scope Awareness**: The `scopes` section defines valid operational zones.

## 🎯 Goal Management Standards

Goals are grouped by layer: `system_level`, `pipeline_level`, and `project_level`.

Every goal in `active_goals` MUST contain:
- `id` — A unique identifier (e.g., `HSL-01`, `PRJ-03`).
- `goal` — A clear, emoji-enhanced title.
- `status` — Current state: `pending ⚪` | `in-progress 🟡` | `persistent ♾️` | `BLOCKER 🛑` | `PAUSED ⏸️` | `done ✅`
- `depends_on` — Array of goal IDs this goal waits for.
- `mission_ref` — Relative path to the `.scope/[scope]/.missions/definitions/` file.
- `current_phase` — The currently active phase of the mission.

**Blocker Fields:** (Required if status is `BLOCKER 🛑`)
- `blocker_reason` — String describing why the goal is blocked.
- `blocked_since` — Timestamp of when the blocker started.

## 📡 Monitoring
- `active_sessions`: Array of currently operating agents to track multi-agent concurrency.
- `recent_events`: Log major milestone completions, engine runs, and **conflict resolutions**.

## 💬 Communication Hub
- `messages`: Structured messaging.
- `scratchpad`: Free-form drafting area using a block scalar (`|`). Use for raw ideas or temporary data.
