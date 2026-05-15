# 🎛️ Operations Protocol (Agentic Sync)
> **Schema Version:** 1.0 | Canonical source of truth: `CONTROLER.yaml`

**Role:** Synchronize `CONTROLER.yaml` session state, telemetry, and OS-wide health signals.

## When to Execute
- Always via: `.\.venv\Scripts\python.exe .brain\meta.router\.sync_engine\sync_engine.py`

## Execution Steps

### 1. Rebuild Active Sessions List
The sync engine reads all physical `SESSION.yaml` and `GOAL.yaml` files inside `.brain/.mission_board/`.
These physical files are the **ultimate source of truth**.
The engine mirrors this state into the `active_sessions` block of `CONTROLER.yaml`.
**RULE:** Never manually edit the `active_sessions` list in `CONTROLER.yaml`. It will be overwritten on the next sync.

### 2. Update System Health
The engine calculates global OS health based on:
- Number of `blocked` goals (deduct 10% each).
- Number of stale sessions (>7 days with no active goals, deduct 5% each).
It writes this to `system_status.overall_health`.

### 3. Track Telemetry
The engine appends the latest sync event to the `telemetry.health_history` rolling list (capped at 10 entries).
It updates `telemetry.sync_count` and tracks `peak_session_count` and `peak_goal_count`.
