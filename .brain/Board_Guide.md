# 📋 Board Guide

`BOARD.yaml` (located at the workspace root) is the **Unified Source of Truth** for the workspace's runtime state. It acts as Central Command.

## ⚡ Core Operating Principles
- **Audit-First**: The agent MUST read `BOARD.yaml` at the start of every turn (Step 2 of Execution Flow).
- **Atomic Locks**: You MUST create `BOARD.yaml.lock` before modifying the file, and delete it immediately after saving. The lock file MUST contain a creation timestamp. **Zombie Lock Recovery:** If a `.lock` file persists beyond 120 seconds, it is considered stale — log the override event to `recent_events`, delete the stale lock, and proceed.
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
- `claimed_by` — Session ID of the agent currently executing this goal (set atomically when transitioning to `in-progress 🟡` to prevent concurrent claims).
- `progress` — Integer 0–100 representing completion percentage of the current round (or overall for non-persistent goals).

**Persistent Goal Fields:** (Required if status is `persistent ♾️`)
- `round` — Integer tracking the current/last completed cycle number.
- `round_history` — Array of completed round records, each containing:
  - `round` — Round number.
  - `completed_at` — ISO 8601 timestamp.
  - `artifacts_path` — Relative path to `.scope/.core/.missions/runs/[GOAL-ID]/round-[NNN]/`.
  - `summary` — One-line summary of findings/outcomes.

**Blocker Fields:** (Required if status is `BLOCKER 🛑`)
- `blocker_reason` — String describing why the goal is blocked.
- `blocked_since` — Timestamp of when the blocker started.

## 📡 Monitoring
- `active_sessions`: Array of currently operating agents to track multi-agent concurrency. **Must be updated atomically** (under a lock) when transitioning a goal to `in-progress`, alongside setting `claimed_by` on the goal.
- `recent_events`: Log major milestone completions, engine runs, and **conflict resolutions**. **Max queue size: 20 entries.** When this limit is reached, the oldest entries MUST be archived to `.scope/.core/.knowledge/events_archive.md` (append-only) before adding new entries.
- `goals_progress`: Board-level aggregate tracking `total`, `done`, `persistent_active`, and `overall_completion` percentage. Updated during Step 10 (Sync).

## 📂 Mission Artifacts Placement

All structured outputs (analyses, plans, reports, proposals) MUST be stored in:
`.scope/.core/.missions/runs/[GOAL-ID]/round-[NNN]/` — **never in `scratch/`**. `scratch/` is reserved for raw, temporary, throwaway data only.

```
.scope/.core/.missions/runs/
└── [GOAL-ID]/
    └── round-[NNN]/
        ├── run.log.md         # Execution trace
        └── gap_report.md      # Plans, analyses, reports
```

When a persistent goal completes a cycle:
1. Set `progress: 100` on the goal.
2. Append a `round_history` entry with `completed_at`, `artifacts_path`, and `summary`.
3. When the next cycle begins, increment `round`, reset `progress: 0`, and create a new `round-[NNN]/` directory.

## 💬 Communication Hub
- `messages`: Structured messaging.
- `scratchpad`: Free-form drafting area using a block scalar (`|`). Use for raw ideas or temporary data.

## 🔄 Session Management

The `sessions` section in `BOARD.yaml` tracks agent work sessions to enable continuity across conversations.

### Session Schema

Every session in `sessions.active` MUST contain:
- `id` — Unique incrementing identifier (e.g., `SES-001`, `SES-002`).
- `agent` — Persona name of the operating agent.
- `started_at` — ISO 8601 timestamp of session start.
- `goals_in_focus` — Array of goal IDs actively being worked during this session.
- `last_action` — One-line description of the most recent action taken. Updated during Step 10 (Sync).
- `status` — Current state: `active` | `paused`

Sessions in `sessions.history` additionally require:
- `ended_at` — ISO 8601 timestamp of session completion.
- `summary` — One-line summary of what was accomplished.

### Session Rules
- `session_status.active_sessions` is a **computed field** — always derived from `sessions.active[].id`.
- `max_history: 10` — When exceeded, oldest history entries are archived to `.scope/.core/.knowledge/sessions_archive.md`.
- **Stale session recovery:** If a session in `active` has no updates for >24 hours, move it to `history` with `status: abandoned`.
- Sessions are managed under atomic locks alongside all other `BOARD.yaml` modifications.
