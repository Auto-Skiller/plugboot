# 🔄 Orchestration & Flow — 10-Step Execution

This document outlines the strict deterministic 10-step execution flow for the Agentic OS v5, with rigorous verification gates and step contracts.

---

## 10-Step Contracts & Gates

Every step declares what it needs (inputs), what it produces (outputs), and what must be true to proceed (gate). If a gate fails, the step must fallback or escalate.

| Step | Inputs | Outputs | Gate (must be true to proceed) | On Fail |
|------|--------|---------|-------------------------------|---------|
| **1. Boot** | `.brain/` directory | `identity{}` | `Persona.md` exists, `meta.router.yaml` is parsed. | ❌ HALT — brain broken |
| **2. State** | `CONTROLER.yaml` | `state{}` + `session{}` | `work_mode` valid, `action_gate` valid, `active_goals` exists. **Session resolved (resumed or new).** | ❌ HALT — no state |
| **3. Task Resolution** | User prompt OR `state.goals[]` | `task{}` | `task.topic` is not empty. **Goal status transitioned to `in-progress 🟡` under an atomic lock to prevent concurrent claims.** | If prompt empty + no goals + `work_mode≠AUTO` → ⏳ WAIT for user. If `work_mode=AUTO` → run **Blocker Triage**, then pick and restart. |
| **4. Context Scan** | `task{}` + `meta.router.yaml` | `context_scan[]` | — | ✅ PROCEED even if empty (log warning) |
| **5. Goal Mgmt** | `task{}` + `context_scan[]` | `goal{}` | Goal exists in `.runtime/.mission_board/` AND (status != done OR is persistent) | If goal is `done ✅` (non-persistent), ⚠️ SOFT PASS (mark task complete, pick next). Else ❌ RETRY creation. |
| **6. Context Deep** | `goal{}` | `context_deep[]` | Goal folder exists in `.runtime/.mission_board/[SESSION_ID]/[GOAL_ID]/` | ✅ PROCEED even if empty |
| **7. Planning** | `goal{}` + context | `execution_plan{}` | Execution plan is formulated | 📝 CREATE plan. If fail → ESCALATE |
| **8. Route** | `execution_plan{}` + maps | `route{}` | ≥1 toolbox or pipeline matched via `meta.router.yaml` | 🔍 EXPAND search. If 0 → NATIVE EXECUTION |
| **9. Execute** | `route{}` + context | `result{}` | All `inputs` present before run. **Two-dimension gate: if `action_gate=PLANNING`, approval required — method depends on `work_mode` (see `Decision_Making.md`).** | 🔄 RETRY. If 3 fails → block goal. |
| **10. Sync** | `result{}` | Sync actions | `CONTROLER.yaml` write succeeded. If goal is `persistent ♾️`, do NOT mark done, log cycle. **Update `sessions.active[].last_action`.** | ❌ RETRY. If fail → log to `.runtime/.mission_board/[SESSION]/[GOAL]/scratch.md` |

---

## Persistent Goal Handling

Persistent goals require explicit evaluation during Step 10 (Sync) for the next cycle to prevent blindly reprocessing them. The tracking state in `CONTROLER.yaml` must be updated before the goal re-enters the execution loop.

---

## Task Resolution Rules (Step 3)

| Scenario | work_mode | Action |
|----------|-----------|--------|
| User prompt → NEW task | Any | Create new goal in CONTROLER, continue |
| User prompt → matches existing goal | Any | Link to goal, update it, continue |
| User prompt → contradicts goal | Any | Update goal (prompt wins), LOG conflict in `recent_events`, continue. **Never ask.** |
| No user prompt | AUTO | **Blocker Triage first.** If no unblocked goals, analyze state, pick OR CREATE goals. If blocked by `action_gate=PLANNING` approval, skip and work on something else. |
| No user prompt | STRICT/COLLAB | Pick from existing goals only. If `action_gate=PLANNING` hit, ask user before proceeding. |

---

## Session Management & Sync Engine (Step 2 & 10)

At boot, after reading `CONTROLER.yaml` state, the agent MUST resolve its session and execute the **Sync Engine Protocols**:
- **Before Execution:** The agent MUST read and execute `.brain/.sync_engine/sync_mission_board.md`, `sync_toolbox.md`, and `sync_pipelines.md` to ensure the physical files and maps are healthy.

| Scenario | work_mode | Action |
|----------|-----------|--------|
| Active session exists | AUTO | **Auto-resume**: Load session context from `.runtime/.mission_board/`, continue |
| Active session exists | STRICT/COLLAB | **Ask**: "Continue SES-XXX or start new?" |
| No sessions exist | Any | **Start new**: Generate `SES-[NNN]`, register in `CONTROLER.yaml` and `.runtime/.mission_board/` |
| Stale session (> 24h idle) | Any | Mark `status: abandoned`, start new |

### Session Lifecycle & End-of-Session Sync
1. **START** → Generate `SES-[NNN]` (incrementing). Create `.runtime/.mission_board/[SES-NNN]/` and its `.yaml`.
2. **WORK** → Update progress and statuses during Step 10 (Sync). Whenever a YAML file is modified, instantly trigger `sync_mission_board.md` manually to sync the state.
3. **PAUSE** → Set `status: paused` in `CONTROLER.yaml`. Run a final `.sync_engine/` check.
4. **END** → Run a final `.sync_engine/` check. Move to history, clean up active trackers.

### Persistent Pipeline Execution Sessions
Pipeline execution (e.g., processing data in Hustler or Scaler) is governed by **permanent, always-active sessions** (e.g., `SES-EXECUTION-SCALER`, `SES-EXECUTION-HUSTLER`). 
- These sessions **never end**.
- They use the `mission_board` to track high-level execution goals (e.g., "Process 15 files").
- Granular tracking of exactly what happens to those files happens within the localized pipeline `.meta` tracker (e.g., `scaler.tracker/EXTERNAL-LEDGER.yaml`).
- Design/Architecture work for a pipeline MUST be done in a separate Core session (e.g., `SES-ARCHITECT-SCALER`), not in the execution session.

---

## Gate Logging & Output Placement

- **Events** → `CONTROLER.yaml` (`recent_events`)
- **Details & Artifacts** → Must be stored in the specific goal directory: `.runtime/.mission_board/[SESSION_ID]/[GOAL_ID]/`

All structured outputs (analyses, plans, reports, proposals) MUST be stored directly in the goal folder or its designated `extra_files`.

### Round System (Persistent Goals)
When a persistent goal completes a cycle:
1. Append a `round_history` entry in the goal's `.yaml` file.
2. Increment `round` and reset `progress_percentage`.

### Progress Tracking
After any goal status change, recalculate progress for the session in `CONTROLER.yaml` and update the `progress_percentage`.

