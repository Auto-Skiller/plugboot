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
- `archived_sessions` ← scanned from `.milestones_archive/` + `milestones_history.yaml`. If the history log has no event for a folder (legacy archives), the engine falls back to the date suffix in the folder name (`<name>_<YYYYMMDD>`) so `archived_at` is never null.
- `telemetry.pipelines.{name}` ← rolled up from each pipeline's `*_state.yaml.health_signals.last_sync` (with `status: stale` when older than `constants.pipeline_status_stale_seconds`).
- `communication_hubs.scaler_hub.scaler_review_queue` ← projected from `scaler_state.gateway_metrics.active_proposals`.
- `telemetry.pending_evolutions` ← derived from `.meta_brain/meta_identity/.pending_evolutions.yaml` queue sizes.
- `telemetry.peak_session_count` / `telemetry.peak_goal_count` ← monotonic max across every sync.
- `telemetry.toolbox_readiness` ← projected from `toolboxes.yaml.readiness_summary` (single source — no duplicate count).

If you find yourself wanting to edit one of these, the right action is to update the **source of truth** (the milestone folder, the pipeline state file, the pending-evolutions queue, the toolbox manifest) and rerun the master sync.

### 6. Schema Allow-List (v5.4)
The set of valid keys in `CONTROLER.yaml` is declared in `BOOT_CONTRACTS.yaml#controler_schema`. Every master sync sweeps any key not on the allow-list — both at the top level and inside `telemetry`. This is the law that prevents legacy fields like `system_health`, top-level `last_sync`, `telemetry.mission_board`, or `telemetry.generated_at` from rotting in place across hour-long autonomous runs.

To add a new field, extend the allow-list in `BOOT_CONTRACTS.yaml#controler_schema` first, then write the field. The sweep won't touch it once it's declared.

### 7. Freshness Block (v5.5)
`CONTROLER.yaml` carries the same `freshness:` contract every router uses (last_synced / fresh_until / status / threshold_seconds). Agents reading the controller mid-session can call `is_fresh()` against it and detect a stale state file the same way they detect a stale router. The block is engine-managed — the master sync stamps it on every cycle. Do not hand-edit.

`master --validate` audits CONTROLER's freshness as part of the workspace-wide router sweep. A stale controller block fails validation with [ERR], the same severity as any other stale router.

### 8. BOOT_CONTRACTS Self-Maintenance (v5.5)
`.meta_brain/BOOT_CONTRACTS.yaml` carries the same `freshness:` contract as every router. Three formerly hand-edited fields are now engine-managed and refreshed on every master sync:
- `last_updated` — stamped from system time. Hand-edits are overwritten.
- `freshness:` — last_synced / fresh_until / status / threshold_seconds, identical to every router.
- `steps[BOOT-00].validation` — the literal "Must read all N files…" string is rebuilt from the live disk count on every cycle, so adding or removing an identity doc keeps the contract truthful without a code change.

The shared loader is `_shared/boot_contracts.py`. Engines that need a constant call `boot_contracts.constant(workspace_root, name, default)`; nobody hardcodes the path or duplicates the reader anymore (root-cause fix for GAP-BOOT-PATH-DRIFT and GAP-BOOT-LOADER-DUPLICATE).

`master --validate` now also walks every `BOOT-NN.target` that points at a concrete disk path and audits it (skipping conditional steps and globs already covered elsewhere). Closes GAP-BOOT-STEPS-PATH.

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
| Sub-engine soft warnings aborted entire master cycle | Master sync uses 3-tier severity (RC_OK / RC_WARN / RC_FAIL); only hard failures abort, warnings aggregate and surface at the end of the cycle. |
| Schema lookup silently disabled by a key rename | `validators.load_schema_from_yaml` now warns when the requested key is missing AND accepts `alt_keys` for known historical names. |
| Inner pipeline routing files (state / ledgers / runtime) had no freshness contract | All 6 inner files now stamp `freshness:` every cycle; master `--validate` walks `_pipelines/*/.{*}_brain/.{*}_routing/` dynamically so any new pipeline is audited automatically. |
| Lock path hardcoded in 9+ files | Single source of truth is `engine_bootstrap.workspace_lock_path(workspace_root)`. |
| BOOT_CONTRACTS had no freshness contract — could rot for hours unnoticed | `.meta_brain/BOOT_CONTRACTS.yaml` now stamps `freshness:` + auto-refreshes `last_updated` on every master sync; `--validate` audits it the same way as every router. |
| BOOT-00 validation said "all 18 files" forever (magic number) | The engine rewrites the count from the live disk scan in lock-step with the identity catalog, so adding an identity doc refreshes the contract automatically. |
| `goal_progress_stale_days` constant declared but unused — silent drift potential | Removed from BOOT_CONTRACTS; the only stale-pending threshold is `pending_goal_stale_days`. |
| Lock orphans (`<lock>.<pid>.tmp`) accumulated when no sync ran | `--validate` now sweeps stale tmp files and reports any held lock via `inspect()`. |
| `BOOT_CONTRACTS_PATH` literal hardcoded in 6 files | Single source of truth is `engine_bootstrap.boot_contracts_path(workspace_root)` + `_shared/boot_contracts.py`. |
| `prune_old_logs` duplicated across 3 engines | Hoisted into `_shared/log_retention.py`; every engine delegates. |
| `update_pipeline_telemetry_passthrough` rewrote state files without re-stamping freshness | Passthrough now re-stamps in lock-step with the write, so the contract cannot fall behind file mtime. |
| Engine version vs BOOT_CONTRACTS could drift silently | `BOOT_CONTRACTS.constants.required_sync_engine_version` declared; `--validate` flags any mismatch. |

---

### Writing to the Controler (Checklist)
1. Ensure you are updating the goal *under the correct session*.
2. Update the `tracking` and `artifacts` fields with brief summaries.
3. If all goals in a session are completed, move the session from `active_sessions` to `archived_sessions` in the `CONTROLER.yaml`.
4. Ensure the `.meta_brain/milestones/[SESSION_NAME]/SESSION.yaml` status reflects `completed`.
