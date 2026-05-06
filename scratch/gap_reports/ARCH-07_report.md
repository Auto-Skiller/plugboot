# ARCH-07: Performance & Concurrency Structure Audit

## Executive Summary
This report analyzes the Agentic OS v5 Substrate's structural ability to handle parallel execution, task concurrency, and state locking mechanisms efficiently. As multiple agents (or concurrent agent instances) operate simultaneously within the workspace, maintaining data integrity and system stability is paramount.

## Findings: Structural Gaps and Bottlenecks

### 1. Race Conditions in Goal Selection (Step 3: Task Resolution)
**Gap:** The current Task Resolution flow in `Orchestration_And_Flow.md` (Step 3) lacks a mechanism to prevent multiple agents from picking the same `pending` goal simultaneously in AUTO or STRICT/COLLAB modes.
**Impact:** Redundant work, duplicated outputs, and potential state conflicts when both agents attempt to transition the goal to `in-progress` or `done` at Step 10.
**Proposed Fix:** Introduce an atomic "claim" mechanism during Step 3. An agent must transition the goal's status from `pending ⚪` to `in-progress 🟡` and append its session ID to the goal's context (or `active_sessions`) within the *same* locked `BOARD.yaml` write operation before proceeding to Step 4.

### 2. Incomplete Lock Scopes (Knowledge and Context Data)
**Gap:** `Rules_And_Considerations.md` mandates Atomic Lock Files (`.lock`) for `BOARD.yaml` and `.catalog.yaml` files. However, operational data scopes, particularly knowledge distillation files (e.g., `.scope/.core/.knowledge/knowledge.md`, `workflows.md`) updated during Step 10, lack structural locking mechanisms.
**Impact:** Concurrent agents running Post-Mission Distillation (Step 10) could overwrite each other's learnings, leading to lost intelligence.
**Proposed Fix:** Extend the Atomic Lock Files rule in `Rules_And_Considerations.md` to cover all shared state files that are programmatically updated, specifically all `.md` and `.yaml` files within `.scope/` that are not purely read-only for a given phase.

### 3. Deadlock Vulnerabilities (Zombie Locks)
**Gap:** The atomic lock rule states: "If a lock exists, wait and retry. Delete the lock after writing." There is no structural fallback for a lock that is never released (e.g., if an agent crashes mid-write).
**Impact:** Complete system halt. Any process requiring `BOARD.yaml` or a catalog will wait indefinitely.
**Proposed Fix:** Implement a structural timeout/stale-lock recovery mechanism. Modify `Rules_And_Considerations.md` and `Board_Guide.md` to dictate that locks older than a specific threshold (e.g., 2 minutes) should be considered "stale" and can be aggressively overridden by the waiting agent, provided the overriding agent logs the event in `recent_events`.

### 4. Boot Performance Bottlenecks (Full Catalog Refresh)
**Gap:** `Rules_And_Considerations.md` and `Orchestration_And_Flow.md` state: "At boot: Refresh ALL catalogs via `context_control.engine`". In a concurrent system where instances spin up frequently, a full refresh is an O(N) operation blocking Step 1.
**Impact:** Significant delay in boot time (Step 1 -> 2 transition), degrading overall system responsiveness and increasing compute costs unnecessarily.
**Proposed Fix:** Optimize the boot sequence. Transition from a mandatory "full refresh" to a "dirty check" driven refresh. Agents should verify the workspace delta (e.g., via git status or a central timestamp registry) against the catalog's `last_modified` metadata, and only trigger the Navigator/Cataloger chain for mutated directories.

## Proposed System-Level Code Fixes

### 1. `Orchestration_And_Flow.md` Modifications
- **Step 3 (Task Resolution):** Update Gate to mandate: "Goal status transitioned to `in-progress 🟡` under an atomic lock to prevent concurrent claims."
- **Catalog Refresh Protocol:** Change "At boot: Refresh ALL catalogs..." to "At boot: Verify catalog integrity via fast delta-check. Refresh ONLY stale or mutated catalogs via `context_control.engine`."

### 2. `Rules_And_Considerations.md` Modifications
- **Atomic Lock Files:** Expand the scope: "Before modifying `BOARD.yaml`, any `.catalog.yaml`, **or any shared state file (e.g., `.scope/` knowledge files)**, create a `.lock` file."
- **Deadlock Recovery (New Rule):** "If a lock exists, verify its timestamp. If older than 120 seconds (Zombie Lock), log to `recent_events`, delete the lock, and proceed."

### 3. `Board_Guide.md` Modifications
- **Atomic Locks:** Add the Zombie Lock recovery instructions: "If a `.lock` file persists beyond standard execution time (>120s), it is considered stale and must be aggressively overridden, with the event logged."
- **Concurrency Tracking:** Clarify that `active_sessions` must be updated atomically when transitioning a goal to `in-progress`.