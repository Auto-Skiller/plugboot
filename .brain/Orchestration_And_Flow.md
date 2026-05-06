# 🔄 Orchestration & Flow — 10-Step Execution

This document outlines the strict deterministic 10-step execution flow for the Agentic OS v5, with rigorous verification gates and step contracts.

---

## 10-Step Contracts & Gates

Every step declares what it needs (inputs), what it produces (outputs), and what must be true to proceed (gate). If a gate fails, the step must fallback or escalate.

| Step | Inputs | Outputs | Gate (must be true to proceed) | On Fail |
|------|--------|---------|-------------------------------|---------|
| **1. Boot** | `.brain/` directory | `identity{}` | `Persona.md` exists, ≥1 engine protocol loaded | ❌ HALT — brain broken |
| **2. State** | `BOARD.yaml` | `state{}` | `active_mode` valid, `active_goals` exists | ❌ HALT — no state |
| **3. Task Resolution** | User prompt OR `state.goals[]` | `task{}` | `task.topic` is not empty, `task.scope` is valid | If prompt empty + no goals + not AUTO → ⏳ WAIT for user. If AUTO → run **Blocker Triage**, then create/pick. |
| **4. Context Scan** | `task{}` + `.catalogs.index.yaml` | `context_scan[]` | — | ✅ PROCEED even if empty (log warning) |
| **5. Goal Mgmt** | `task{}` + `context_scan[]` | `goal{}` | Goal exists in `BOARD.yaml` | ❌ RETRY goal creation. After 2 fails → ESCALATE |
| **6. Context Deep** | `goal{}` + scope | `context_deep[]` | — | ✅ PROCEED even if empty |
| **7. Mission** | `goal{}` + context | `mission{}` | Mission has ≥1 phase, `current_phase` is valid | 📝 CREATE mission. If fail → ESCALATE |
| **8. Route** | `mission.current_phase{}` + catalogs | `route{}` | ≥1 toolbox matched OR Native fallback | 🔍 EXPAND search. If 0 → NATIVE EXECUTION |
| **9. Execute** | `route{}` + context + mission | `result{}` | All `inputs` present before run. All `outputs` produced after run. | 🔄 RETRY (different approach). If 3 fails → block goal. |
| **10. Sync** | `result{}` | Sync actions | `BOARD.yaml` write succeeded. If goal is `persistent ♾️`, do NOT mark done, log cycle. Distillation applied. | ❌ RETRY. If fail → log to `scratch/` |

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

## Gate Logging

- **Events** → `BOARD.yaml` `recent_events`
- **Details** → `.scope/[scope]/.missions/runs/`

---

## Catalog Refresh Protocol

- **At boot:** Refresh ALL catalogs via `context_control.engine` (Navigator → Cataloger full chain)
- **After execution (Step 10):** Mark affected scope catalogs as `status: stale`
- **Next boot:** Stale catalogs get refreshed

---

## Post-Mission Distillation Protocol (Step 10)

When a mission is marked `completed`:
1. The agent reads the mission's execution logs in `.scope/[scope]/.missions/runs/`.
2. The agent identifies any reusable learnings (e.g., undocumented API behaviors, reusable workflows, domain insights).
3. The agent appends these learnings to `.scope/.core/.knowledge/knowledge.md` or `.scope/.core/.knowledge/workflows.md`.
4. This ensures local pipeline knowledge elevates to global system intelligence automatically.
