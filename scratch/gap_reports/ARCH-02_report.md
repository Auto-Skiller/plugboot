# ARCH-02: Central Command & State Integrity Audit Report

## 1. Goal Lifecycles & State Drift
**Finding:** Currently, `BOARD.yaml` defines a clear structure for `active_goals`, categorizing them by layers (`system_level`, `pipeline_level`, `project_level`) and explicitly listing goal states (`pending`, `in-progress`, `persistent`, etc.). However, there is no enforcement mechanism outside the agent's goodwill to prevent invalid state transitions or lingering statuses. A blocked goal (`BLOCKER 🛑`) might have missing `blocker_reason` or `blocked_since` metadata because the YAML doesn't intrinsically reject partial updates.

**Proposed System-Level Code Fixes:**
- Introduce a strict JSON Schema or OpenAPI specification for `BOARD.yaml` validation inside `.brain/`. The execution flow (Step 10: Sync) should automatically run this validation before confirming an atomic save.
- Create an automated daemon or engine script (e.g., `state_auditor.engine`) to periodically flag/clean goals that sit in `in-progress` or `BLOCKER` for an unreasonable amount of time without updates.

## 2. Event Tracking & Context Bloat
**Finding:** The `recent_events` section in `BOARD.yaml` operates as a simple YAML list. Without a strict retention policy or truncation mechanism, this list will grow indefinitely over multiple execution cycles. This directly leads to context bloat, slowing down prompt parsing and increasing costs, as every step (Step 2: State) reads this entire file.

**Proposed System-Level Code Fixes:**
- Enforce a maximum queue size (e.g., `max_recent_events: 20`) within the `BOARD.yaml` processing step.
- Update `Board_Guide.md` and Sync logic (Step 10) to automatically archive older events into an append-only `.scope/.core/.knowledge/events_archive.md` file or similar structured log.

## 3. Concurrency Deadlocks & BOARD.yaml.lock
**Finding:** `.brain/Board_Guide.md` dictates creating a `BOARD.yaml.lock` file before modifying state. If an agent crashes or hits a token limit while holding the lock, the entire system deadlocks.

**Proposed System-Level Code Fixes:**
- Implement lock expiration logic. The lock file should contain a timestamp of its creation. If the lock is older than a specified threshold (e.g., 2 minutes), subsequent processes can forcefully claim it.
- Modify the Board lock procedure to be process/agent-ID aware, enabling lock re-entry or targeted timeouts.

## 4. Multi-Agent Goal Conflict & Locking
**Finding:** `BOARD.yaml` tracks `active_sessions`, but lacks granular concurrency control on individual goals. Multiple agents may read a `pending` goal simultaneously, resulting in duplicate work and race conditions.

**Proposed System-Level Code Fixes:**
- Add `claimed_by` field to each goal in `active_goals`.
- Update the Goal Management protocol (Step 5) to atomically update the `BOARD.yaml` setting `claimed_by` and `status: in-progress` before proceeding to execution.

## Conclusion
The conceptual architecture of `BOARD.yaml` is strong, but relies too heavily on agent compliance rather than system-level constraints. Implementing robust schema validation, lock timeouts, event truncation, and goal claiming will prevent silent state drift and deadlock scenarios in multi-agent runs.
