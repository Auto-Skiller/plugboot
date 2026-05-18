# 🪧 Event Vocabulary — OS-Wide Layer

## Objective
Single authoritative reference for the **OS-wide events** emitted at the meta layer (CONTROLER, milestones, sessions, modes). Pipeline-specific events live in their own per-pipeline vocabulary files; this file MUST NOT contain pipeline-internal vocabulary.

> **Isolation contract**: This vocabulary is referenced by both pipelines but does NOT couple them at runtime. Each pipeline reads it for tag interpretation only — neither pipeline writes to the other's logs, neither pipeline shares an event bus with the other. This file is the *passive* shared layer; the *active* event flow stays per-pipeline.

---

## 1. Scope of OS-Wide Events

An event belongs in this file if and only if it is emitted **outside** both `_pipelines/_scaler/` and `_pipelines/hustler/`. Concretely, that means events emitted by:
- `CONTROLER.yaml` lifecycle (modes, action_gate, scope suggestions)
- `.meta_brain/milestones/` (sessions, goals, milestones lifecycle)
- `.meta_brain/meta_identity/` evolution (Evolution Protocol triggers)
- `.meta_brain/meta_router.yaml` and `.meta_brain/.meta_routing/` syncs (`meta_sync.py` runs)

Events emitted *inside* a pipeline (cascade moves, card creations, ledger updates, audit runs) belong in that pipeline's own vocabulary file:
- Scaler events → `_pipelines/_scaler/.scaler_brain/scaler_runbooks/Scaler-Event-Vocabulary.md`
- Hustler events → `_pipelines/hustler/.hustler_brain/hustler_runbooks/Hustler-Event-Vocabulary.md`

---

## 2. OS-Wide Event Catalog

### 2.1 Session & Milestone Lifecycle

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `SESSION_OPENED` | milestones_sync on first goal of a session | `session_id`, `opened_at`, `mode_snapshot` | CONTROLER `recent_events`, `system_hub.recent_events` |
| `SESSION_CLOSED` | milestones_sync when all goals are `done` or `archived` | `session_id`, `closed_at`, `goal_count`, `outcome` | CONTROLER `recent_events`, `system_hub.recent_events` |
| `GOAL_OPENED` | milestones_sync when a `GOAL.yaml` is created with `status: pending` | `session_id`, `goal_id`, `opened_at` | CONTROLER `recent_events` |
| `GOAL_PROGRESSED` | any agent updating a goal's `progress` field | `goal_id`, `from_progress`, `to_progress`, `at` | CONTROLER `recent_events` |
| `GOAL_COMPLETED` | milestones_sync when `status: done` | `goal_id`, `completed_at`, `artifacts[]` | CONTROLER `recent_events`, both pipeline `audit_policy` (may queue Audit Pass) |
| `MILESTONE_ARCHIVED` | milestones_sync on session/goal archival | `archived_path`, `archived_at`, `reason` | CONTROLER `recent_events` |

### 2.2 Mode & Action-Gate Lifecycle

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `MODE_SWITCH` | controller updates `modes.<scope>.work_mode` | `scope` (`system|scaler|hustler`), `from`, `to`, `at` | both pipelines (next cycle reads new mode) |
| `ACTION_GATE_CHANGED` | controller updates `modes.<scope>.action_gate` (or per-profile) | `scope`, `profile_or_phase`, `from`, `to`, `at` | both pipelines |
| `SCOPE_SUGGESTION_POSTED` | scaler proposes a new aspect/scope | `scope_name`, `proposed_by_card_id`, `at` | CONTROLER `system_status.scope_suggestions[]` |
| `SCOPE_SUGGESTION_APPROVED` / `_REJECTED` | user response on a scope suggestion | `scope_name`, `outcome`, `at` | CONTROLER, scaler (proceeds or aborts) |

### 2.3 Sync & Health Lifecycle

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `META_SYNC_STARTED` | `meta_sync.py` boot | `triggered_by` (`session|manual|hook`), `at` | CONTROLER `last_sync` (preliminary) |
| `META_SYNC_COMPLETED` | `meta_sync.py` exit | `started_at`, `completed_at`, `sub_syncs_run[]`, `outcome` | CONTROLER `last_sync` (final) |
| `META_SYNC_FAILED` | `meta_sync.py` exception | `started_at`, `failed_at`, `error`, `partial_state[]` | CONTROLER `system_hub.messages` (severity: ERROR) |
| `EVOLUTION_TRIGGERED` | Evolution Protocol detects shift | `trigger_kind`, `target_artifact`, `at` | `.meta_brain/meta_identity/.pending_evolutions.yaml` |

### 2.4 Severity Vocabulary (shared across all OS events)

| Severity | Meaning | Routing |
|---|---|---|
| `INFO` | Normal operation; no user attention required | `recent_events` only |
| `WARN` | Non-blocking concern; surface for review | `recent_events` + relevant hub `messages` |
| `ERROR` | Operation failed; rollback may have triggered | `recent_events` + relevant hub `messages` + escalation |
| `CRITICAL` | Cross-cutting failure (e.g., `meta_sync` crash) | All three hubs (`system_hub`, `scaler_hub`, `hustler_hub`) |

---

## 3. Format Convention

OS-wide events written to `recent_events` use this canonical string format:
```
[<ISO-8601-timestamp>] <EVENT_NAME>: <one-line human summary>
```
Example:
```
[2026-05-18T14:33:00] GOAL_COMPLETED: GOAL-EVOLVE-PROMPT closed with 5 artifacts.
```

Events written to a hub's `messages[]` use the structured form:
```yaml
- event: GOAL_COMPLETED
  severity: INFO
  at: '2026-05-18T14:33:00'
  payload:
    goal_id: GOAL-EVOLVE-PROMPT
    artifacts: [...]
  ack_required: false
```

---

## 4. Rules

1. **No pipeline-internal events here.** If an event is emitted from inside `_pipelines/_scaler/` or `_pipelines/hustler/`, it belongs in that pipeline's own vocabulary file. Cross-contamination breaks the isolation contract.
2. **Append-only.** New events are added; existing entries are never renamed (downstream consumers parse the strings). To deprecate an event, mark it `@deprecated` in this file and keep emitting it for at least one quarter.
3. **No coupling via this file.** Both pipelines read this catalog to *interpret* events they observe in CONTROLER/hubs. Neither pipeline emits an event with another pipeline's name, and neither pipeline reads the other pipeline's vocabulary file.
4. **Versioning.** This file carries a single `schema_version` line at the top of any structured emit; the markdown itself is the source of truth for human readers. Bump the version when a new event is added in a way that consumers must opt into.
