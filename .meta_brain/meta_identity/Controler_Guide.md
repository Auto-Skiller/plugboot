The `CONTROLER.yaml` is the **Central Command State** for Agentic OS v5. It provides a high-level, real-time snapshot of the system's active operations. 

## 🛡️ Rule 0: Permanent Layout Markers
- **Section & Note Comments:** The `# section: [NAME]` and `# note: [CONTENT]` markers are permanent structural anchors. 
- **CRITICAL:** These comments MUST NEVER be removed or altered by any agent, script, or automated tool. They provide human-readable grounding and structural indexing for the substrate.

## ⚖️ Rule 1: Strict Session Hierarchy
Unlike previous versions of the OS, there are no loose global goals. **Every single goal must be strictly nested inside a Session.**

---

## ⚡ Rule 2: State Thresholds (Anti-Bloat)
To prevent the Controller from becoming unreadable or exceeding context limits, the following thresholds are strictly enforced:
- **`system_hub.recent_events`:** Capped at **3** entries (FIFO).
- **`telemetry.health_history`:** Capped at **3** entries (FIFO).
- **Automation:** Any script updating these fields must prune old entries to maintain these limits.

---

## 🏗️ Rule 3: Array-Based Action Gates
The `action_gate` field is no longer a string. It is an **Array** of allowed integration types.
- **`action_gate: ["EXECUTION 🟢"]`**: Inherits execution permissions from the pipeline profile.
- **`FULL` Token:** If `["FULL"]` is present in a pipeline's `EXECUTION` block, it grants permission for ALL integration types defined in that pipeline's runbook.
- **Mutual Exclusivity:** If a profile has `FULL` in `EXECUTION`, the `PLANNING` block MUST be empty `[]` (and vice versa).

---

## The Automated Synchronization Protocol (Sync Engine v5)

To ensure the OS never hallucinates its state, Agents are strictly bound to the **Sync Engine v5 Protocol**. `CONTROLER.yaml` (the high-level state) and `.meta_brain/milestones/` (the physical reality) MUST be kept in perfect synchronization.

While Agents must perform atomic updates during execution, the **Sync Engine v5** (`meta_sync.py`) acts as the authoritative truth-maker.

Whenever an Agent takes an action, they must write to both locations simultaneously, and then trigger the sync:

### 1. Creating Sessions & Goals
- **Naming Rule:** Sessions and Goals MUST be named by their functional objective (e.g., `SES-SCALER-GROWTH`). NEVER use numeric suffixes.
- **Controler Action:** Add to `active_sessions`.
- **Session Tracking:** Include `goals_summary` (e.g., "0 Done / 3 Pending") and `round` (current vs max) in the session block.
- **Milestones Action:** Immediately create the corresponding physical structure in `.meta_brain/milestones/`.

### 2. Status Updates
- **Controler Action:** When a goal transitions (pending -> in-progress -> done), update its `status` field in `CONTROLER.yaml`.
- **Milestones Action:** You MUST open the corresponding `GOAL.yaml` file and apply the exact same `status` update. 

### 3. Artifacts and Tracking
- **Milestones Action (The Heavy Lifting):** All physical markdown files, reports, code outputs, and deep contextual tracking MUST be stored inside the specific goal directory (`.meta_brain/milestones/[SESSION_NAME]/[GOAL_NAME]/`).
- **Controler Action (The Summary):** You must add a short summary or file path reference into the `artifacts` array of that goal in `CONTROLER.yaml`. Do not bloat the Controler with full file contents.

### 4. Conflict Resolution
If an Agent detects a mismatch between `CONTROLER.yaml` and `.meta_brain/milestones/`:
- **The Physical Files Win:** `.meta_brain/milestones/` is always the ultimate source of truth. 
- **Self-Healing Action:** The Agent must immediately correct `CONTROLER.yaml` to reflect the physical reality of the milestones before proceeding with execution.

### 5. Engine-Owned Rollups (v5.3)
The following CONTROLER fields are now **derived** by `meta_sync.py`. Agents MUST NOT hand-edit them; the engine rebuilds them from disk on every cycle:
- `archived_sessions` ← scanned from `.milestones_archive/` + `milestones_history.yaml`.
- `telemetry.pipelines.{name}` ← rolled up from each pipeline's `*_state.yaml.health_signals.last_sync` (with `status: stale` when older than `constants.pipeline_status_stale_seconds`).
- `communication_hubs.scaler_hub.scaler_review_queue` ← projected from `scaler_state.gateway_metrics.active_proposals`.
- `telemetry.pending_evolutions` ← derived from `.meta_brain/meta_identity/.pending_evolutions.yaml` queue sizes.

If you find yourself wanting to edit one of these, the right action is to update the **source of truth** (the milestone folder, the pipeline state file, the pending-evolutions queue) and rerun the master sync.

---

## Engine Anti-Recurrence Patterns (v5.3)

| Pattern that broke before | What now prevents recurrence |
|---|---|
| Pipeline `last_sync` rotted at 2-day-old timestamps | Master sync rolls up each pipeline's `health_signals.last_sync` and tags `status: stale` past the threshold (no human action needed). |
| `archived_sessions` stayed empty despite 2 archived sessions on disk | Engine scans `.milestones_archive/` + `milestones_history.yaml` and rebuilds the list every cycle. |
| Persistence-exhausted sessions wrote `status: pended` (not in vocab) | Vocabulary Discipline Law (§12) — the engine writes `paused` + `metadata.persistence.exhausted: true`. |
| Progress staleness was masked because the engine rewrites the goal file | Progress Provenance Law (§14) — `execution.state.last_progress_at` only stamps when progress actually changes. |
| Numeric-suffix names slipped through as `[WARN]` only | The milestones engine now sets `warnings_found=True` and exits non-zero. |
| Two parallel agents could race on `meta_router.yaml` | Master sync runs under `.meta_routing/.sync.lock` (advisory, stale-tolerant). |

---

### Writing to the Controler (Checklist)
1. Ensure you are updating the goal *under the correct session*.
2. Update the `tracking` and `artifacts` fields with brief summaries.
3. If all goals in a session are completed, move the session from `active_sessions` to `archived_sessions` in the `CONTROLER.yaml`.
4. Ensure the `.meta_brain/milestones/[SESSION_NAME]/SESSION.yaml` status reflects `completed`.
