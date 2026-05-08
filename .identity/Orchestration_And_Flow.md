# 🔄 Orchestration & Flow — 10-Step Execution

This document outlines the strict deterministic 10-step execution flow for the Agentic OS v5, with rigorous verification gates and step contracts.

---

## 10-Step Contracts & Gates

Every step declares what it needs (inputs), what it produces (outputs), and what must be true to proceed (gate). If a gate fails, the step must fallback or escalate.

| Step | Inputs | Outputs | Gate (must be true to proceed) | On Fail |
|------|--------|---------|-------------------------------|---------|
| **1. Boot** | `.brain/` directory | `identity{}` | `Persona.md` exists, ≥1 engine protocol loaded | ❌ HALT — brain broken |
| **2. State** | `BOARD.yaml` | `state{}` + `session{}` | `active_mode` valid, `active_goals` exists. **Session resolved (resumed or new).** | ❌ HALT — no state |
| **3. Task Resolution** | User prompt OR `state.goals[]` | `task{}` | `task.topic` is not empty, `task.scope` is valid. **Goal status transitioned to `in-progress 🟡` under an atomic lock to prevent concurrent claims.** | If prompt empty + no goals + not AUTO → ⏳ WAIT for user. If AUTO → run **Blocker Triage**, then create/pick and restart Step 3. |
| **4. Context Scan** | `task{}` + `.catalogs.index.yaml` | `context_scan[]` | — | ✅ PROCEED even if empty (log warning) |
| **5. Goal Mgmt** | `task{}` + `context_scan[]` | `goal{}` | Goal exists in `BOARD.yaml` AND (status != done OR is persistent needing re-evaluation) | If goal is `done ✅` (non-persistent), ⚠️ SOFT PASS (mark task complete, pick next). Else ❌ RETRY goal creation. After 2 fails → ESCALATE |
| **6. Context Deep** | `goal{}` + scope | `context_deep[]` | — | ✅ PROCEED even if empty |
| **7. Mission** | `goal{}` + context | `mission{}` | Mission has ≥1 phase, `current_phase` is valid | 📝 CREATE mission. If fail → ESCALATE |
| **8. Route** | `mission.current_phase{}` + catalogs | `route{}` | ≥1 toolbox matched OR Native fallback | 🔍 EXPAND search. If 0 → NATIVE EXECUTION |
| **9. Execute** | `route{}` + context + mission | `result{}` | All `inputs` present before run. All `outputs` produced after run. **AND Mode allows execution (If STRICT/COLLAB, verify explicit user permission).** | 🔄 RETRY (different approach). If 3 fails → block goal. |
| **10. Sync** | `result{}` | Sync actions | `BOARD.yaml` schema validation passed. `BOARD.yaml` write succeeded. If goal is `persistent ♾️`, do NOT mark done, log cycle, and **reset phase**. Distillation applied. **Update `sessions.active[].last_action`.** | ❌ RETRY. If fail → log to `scratch/` |

---

## Persistent Goal Handling

Persistent goals with completed missions require explicit evaluation and phase reset during Step 10 (Sync) for the next cycle to prevent blindly reprocessing them. The phase state in `BOARD.yaml` must be cleared or advanced to the next logical phase before the goal re-enters the execution loop.

---

## Gate Results: Three Outcomes

| Result | Symbol | Meaning | Action |
|--------|--------|---------|--------|
| **PASS** | ✅ | Output valid, proceed to next step | Continue |
| **SOFT PASS** | ⚠️ | Output empty/partial but non-critical | Proceed with warning logged to `recent_events` |
| **FAIL** | ❌ | Output missing/invalid and critical | Retry → Fallback → Escalate (3-strike rule) |

---

## Task Resolution Rules (Step 3)

| Scenario | Mode | Action |
|----------|------|--------|
| User prompt → NEW task | Any | Create new goal in Board, continue |
| User prompt → matches existing goal | Any | Link to goal, update it, continue |
| User prompt → contradicts goal | Any | Update goal (prompt wins), LOG conflict in `recent_events`, continue. **Never ask.** |
| No user prompt | AUTO | **Blocker Triage first.** If no unblocked goals, Analyze board + workspace, pick OR CREATE goals |
| No user prompt | STRICT/COLLAB | Pick from existing goals only |
---

## Session Management (Step 2)

At boot, after reading `BOARD.yaml` state, the agent MUST resolve its session:

| Scenario | Mode | Action |
|----------|------|--------|
| Active session exists (same agent) | AUTO | **Auto-resume**: Load `goals_in_focus`, continue where left off |
| Active session exists (same agent) | STRICT/COLLAB | **Ask**: "Continue SES-XXX or start new?" |
| Active session exists (different agent) | Any | **Start new**: Create new session alongside existing one |
| Paused session exists | Any | Present as resumable option. If resumed, set `status: active` |
| No sessions exist | Any | **Start new**: Generate `SES-[NNN]`, register in `sessions.active` |
| Stale session (active > 24h with no updates) | Any | Move to `sessions.history` with `status: abandoned`, start new |

### Session Lifecycle
1. **START** → Generate `SES-[NNN]` (incrementing), set `started_at`, `goals_in_focus`, `status: active`. Update `session_status.active_sessions`.
2. **WORK** → Update `last_action` during Step 10 (Sync) after each goal cycle.
3. **PAUSE** → Set `status: paused` when user explicitly pauses or conversation ends naturally without completing goals.
4. **END** → Move to `sessions.history` with `ended_at`, `summary`, final `goals_in_focus`. Remove from `session_status.active_sessions`. Enforce `max_history: 10` (archive older entries).

---

## Gate Logging

- **Events** → `BOARD.yaml` `recent_events`
- **Details** → `.scope/[scope]/.missions/runs/`

---

## Catalog Refresh Protocol

- **At boot:** Verify catalog integrity via fast delta-check (e.g., `git status` or timestamp registry). Refresh ONLY stale or mutated catalogs via `context_control.engine` (Navigator → Cataloger chain).
- **After execution (Step 10):** Mark affected scope catalogs as `status: stale`
- **Next boot:** Stale catalogs get refreshed via targeted delta-check, not full rebuild.

---

## Post-Mission Distillation Protocol (Step 10)

When a mission is marked `completed`:
1. The agent reads the mission's execution logs in `.scope/[scope]/.missions/runs/`.
2. The agent identifies any reusable learnings (e.g., undocumented API behaviors, reusable workflows, domain insights).
3. The agent appends these learnings to `.scope/.core/.knowledge/knowledge.md` or `.scope/.core/.knowledge/workflows.md`.
4. This ensures local pipeline knowledge elevates to global system intelligence automatically.

### Artifact Placement Rule
All structured outputs (analyses, plans, reports, proposals) MUST be stored in:
`.scope/.core/.missions/runs/[GOAL-ID]/round-[NNN]/` — **never in `scratch/`**.

### Round System (Persistent Goals)
When a persistent goal completes a cycle:
1. Set `progress: 100` on the goal.
2. Append a `round_history` entry with `completed_at`, `artifacts_path`, and `summary`.
3. When the next cycle begins, increment `round`, reset `progress: 0`, and create a new `round-[NNN]/` directory.

### Progress & Goals Tracking
After any goal status change, recalculate `session_status.goals_progress`:
- `total`: Count of all goals (active + completed).
- `done`: Count of goals with `status: done ✅`.
- `persistent_active`: Count of persistent goals.
- `overall_completion`: `done / total` as percentage.
