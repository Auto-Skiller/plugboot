---
metadata:
  name: scaler-event-vocabulary
  class: system/runbook
  type: runbook
  version: '2.0'
  schema_version: '2.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-07-04T00:00:00'
credentials:
  description: Scaler-only event catalog for discovery, run lifecycle, audit, and atomic recovery (aligned with Pipelines_Architecture.md v2.0)
  when_to_use: Read when logging events during Scaler sync
  contains: event_types, severity_levels, recovery_procedures
---

# 🪧 Scaler Event Vocabulary

## Objective
Single authoritative reference for the events emitted **inside** the Scaler pipeline. This file is private to Scaler scope: it is read by Scaler agents, Scaler sync engines, and the Audit Pass. It is NOT read by the Hustler pipeline. Cross-pipeline event names are not catalogued here.

> **Isolation contract**: Per the workspace's pipeline-isolation principle (see `Hustler-Operational-Rules.md §5` and `Scaler-Operational-Rules.md §3` Self-Evolution Protocol), the Scaler and Hustler do not share an event bus, do not share a log file, and do not reference each other's vocabularies. The OS-wide event vocabularies across the subgroups in `_system/.system-meta/.system-os_prompts/` cover events emitted *outside* both pipelines (.system.board, milestones, meta_sync) and are the only shared catalogs.

---

## 1. Scope

An event belongs in this file if and only if it is emitted from somewhere inside `entity-scaler-runtime/`. That includes:
- Scaler agents performing Phase 1–5 work
- `engine.py` and its sub-sync engines
- The Audit Pass (`Scaler-Workflows.md §8`)
- Atomic-trio recovery (P-LAW-019) emissions
- Provenance-marker writes (P-LAW-020)

Events that fire outside the Scaler (e.g., `META_SYNC_COMPLETED`, `GOAL_COMPLETED`) live in the OS-wide vocabulary.

---

## 2. Discovery & Gateway Delivery Events (Phase 1)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `DISCOVERY_INGESTED` | Phase 1 staging scan finds a new item in `INBOX-inboxing/` or `RESEARCH-researching/` | `source_path`, `source_folder` (`INBOX-inboxing`\|`RESEARCH-researching`), `hash`, `at` | `INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`, `scaler_hub.recent_events` |
| `GATEWAY_DELIVERED` | Agent COPIes item from inboxing/researching to gateway pillar subfolder | `source_path`, `from_folder`, `to_gateway_path`, `pillar`, `extracted_concern`, `multi_pillar_ref_id`, `at` | Tracker `delivered_to[]`, sub-ledger (optional) |
| `DISCOVERY_GROUP_RESOLVED` | Cluster Intake Protocol places item into a functional group | `item_name`, `group_path`, `pillar`, `at` | tracker |
| `DISCOVERY_GROUP_LAZILY_CREATED` | First item to land in a gateway pillar creates a new functional group folder | `pillar`, `group_name`, `triggering_item`, `at` | `scaler_hub.recent_events` (audit trail for lazy scaffolding) |
| `DISCOVERY_REJECTED` | Item fails all routing rules / strong-source-identity triggered | `source_path`, `reason`, `rejected_to_complex_inboxes`, `at` | `scaler_hub.messages` (severity: WARN), tracker `rejected_to_complex_inboxes: true` |
| `DISCOVERY_ARCHIVED` | All runs from this discovery are archived; group folder moves to archive | `group_path`, `archive_path`, `at` | sub-ledger `history[]` |

---

## 3. Mapping & Tracking Events (Phase 2)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `INTEGRATION_TYPE_RESOLVED` | Phase 2 Step 4 picks an `integration_type` | `item_name`, `chosen_type`, `tie_break_path` (if any), `at` | tracker, scratch draft |
| `TIE_BREAK_DEFERRED` | §3.4 rule 4 fires (human gate) | `item_name`, `candidate_types[]`, `at` | board `review_queue` (status: `TIE_PENDING_RESOLUTION`) |
| `CLUSTER_INTAKE_RAN` | Cluster Intake Protocol runs over a set (`Scaler-Discovery-Logic.md §3`) | `pillar`, `items_count`, `clusters_formed[]`, `at` | tracker |
| `ASPECT_MAP_UPDATED` | Phase 2 Step 5 sets `primary_aspect` + `aspects[]` | `item_name`, `primary`, `aspects[]`, `at` | tracker |
| `MATCH_TO_PENDING_FOLD` | New item folded into existing pending run via `MERGE_WITH_PENDING` | `new_item_name`, `pending_run_name`, `re_audit_outcome`, `at` | run YAML `merge_history[]`, tracker `processed_by_runs` |

---

## 4. Run Lifecycle Events (Phases 4–5)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `RUN_DRAFTED` | Phase 4 writes a planning run YAML in `<PROFILE>-PLANNING_runs/<run_name>/` | `run_name`, `profile` (`INTERNAL`\|`INBOX`\|`RESEARCH`), `focused_pillars[]`, `focused_objective`, `action_gates[]`, `source_gateway_items[]`, `target_files[]`, `path`, `at` | board `PLANNING_runs:`, run folder |
| `RUN_LEDGER_LINKED` | Tracker updated with `processed_by_runs` reference | `run_name`, `item_names[]`, `at` | tracker |
| `RUN_APPROVED` | `user_decision: approve` processed → status `EXECUTION` | `run_name`, `mode` (`auto`\|`manual`), `at` | board `EXECUTION_runs:`, run folder moved |
| `RUN_REJECTED` | `user_decision: reject` processed → status `rejected` | `run_name`, `reason`, `at` | board entry removed, run folder → `.archived_runs/` |
| `RUN_EXECUTION_STARTED` | Agent begins Phase 5 execution | `run_name`, `at` | board status `EXECUTION` |
| `RUN_COMPLETED` | Phase 5 finishes all `target_files` actions | `run_name`, `files_touched[]`, `execution_notes`, `at` | board status `completed` |
| `RUN_ARCHIVED` | `user_decision: archive` processed → status `archived` | `run_name`, `archive_path`, `at` | board entry removed, run folder → `.archived_runs/<PROFILE>-archived_runs/`, `run_name:` header promoted |

---

## 5. Atomic Trio & Recovery Events (P-LAW-001 / P-LAW-019)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `ATOMIC_TRIO_BEGIN` | First write of a multi-store transaction | `operation_type`, `stores[]`, `at` | scratch transaction log |
| `ATOMIC_TRIO_COMMITTED` | All writes succeeded | `operation_type`, `at` | `scaler_hub.recent_events` |
| `ATOMIC_TRIO_FAILED` | Any write in the trio failed | `operation_type`, `failed_store`, `error`, `at` | `scaler_hub.messages` (severity: ERROR) |
| `ROLLBACK_TRIGGERED` | P-LAW-019 step 1: ABORT fired | `operation_type`, `failed_store`, `successful_writes[]`, `at` | scratch transaction log |
| `ROLLBACK_COMPLETED` | P-LAW-019 step 3: all successful writes reverted | `operation_type`, `reverted_state[]`, `at` | `scaler_hub.recent_events` (audit trail) |
| `ROLLBACK_QUEUED_FOR_REVIEW` | P-LAW-019 step 6: never auto-retry | `operation_type`, `at` | board `review_queue` (status: `RECOVERED_PENDING_RETRY`) |

---

## 6. Provenance Events (P-LAW-020)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `PROVENANCE_WRITTEN` | New artifact created with provenance header | `run_name`, `artifact_path`, `format` (`md`\|`yaml`\|`py`), `at` | post-integration log |
| `PROVENANCE_APPENDED` | Subsequent INJECT adds a `Modified by` line | `run_name`, `artifact_path`, `at` | post-integration log |

---

## 7. Audit Pass Events (`Scaler-Workflows.md §8`)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `AUDIT_STARTED` | Audit Pass acquires the lock | `triggered_by` (`manual`\|`goal_complete`\|`drift_suspected`\|`quarter_rotation`), `at` | `system-board.yaml.audit_in_progress: true` |
| `AUDIT_CHECK_RAN` | One of the 7 checks completes | `check_id` (1..7), `findings_count`, `severity_breakdown`, `at` | `system-board.yaml.audit_findings[]` |
| `AUDIT_FINDING_DRIFT` | A check produced a `DRIFT` finding | `check_id`, `target`, `expected`, `observed`, `at` | aggregated into remediation run |
| `AUDIT_REMEDIATION_DRAFTED` | Audit Pass auto-drafted INTERNAL planning run | `run_name`, `findings_count`, `at` | board `review_queue` |
| `AUDIT_COMPLETED` | All 7 checks done; lock released | `outcome` (`CLEAN`\|`WARN`\|`DRIFT`\|`INCOMPLETE`), `at` | `scaler_hub.recent_events` |

---

## 8. Sync Events (Scaler-internal — distinct from OS-wide `META_SYNC_*`)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `STATE_SYNC` | `system-board.yaml` mirrors .system.board pre-cycle (P-LAW-007) | `mirrored_fields[]`, `at` | `system-board.yaml` |
| `LEDGER_ROLLUP_REASSEMBLED` | Auto-aggregator rebuilt `index.yaml` index rollups | `pillars_aggregated[]`, `at` | router |
| `RUNTIME_ROLLUP_REASSEMBLED` | Auto-aggregator rebuilt `system-board.yaml` | `at` | router |
| `RUNBOOK_READINESS_LOGGED` | P-LAW-008 acknowledgement (when enforced) | `runbook_file`, `content_hash`, `at` | `system-board.yaml.runbook_readiness` |

---

## 9. Severity & Format

Severities follow the OS-wide ladder (`INFO`\|`WARN`\|`ERROR`\|`CRITICAL` per `_system/.system-meta/.system-os_prompts/02_behavior-Agents.md §4`). Format also follows the OS-wide canonical string for `recent_events` and structured form for `messages[]`. Using the OS ladder keeps Scaler events readable when an external observer (the user, a future operator) scans the merged audit trail in `system-board.yaml`.

---

## 10. Rules

1. **Scaler-only events here.** Never list a Hustler event in this file. Never reference an event name from `Hustler-Event-Vocabulary.md` in Scaler code or runbooks.
2. **No emission to Hustler stores.** Scaler events are written to `system-board.yaml`, `scaler_hub` (inside .system.board's communication_hubs), or per-pillar ledgers. Never to `hustler_hub`, or any Hustler ledger.
3. **Append-only catalog.** New events are added; existing entries are never renamed (consumers parse the names). To deprecate, mark `@deprecated` and keep emitting for at least one quarter.
4. **One event per semantic action.** A gateway delivery that triggers tracker update + ledger update + group creation emits one `GATEWAY_DELIVERED`, not three sub-events. Sub-store granularity is captured by `ATOMIC_TRIO_*` events.
5. **Audit-Pass emissions are observation-only.** Audit events do not cause writes outside `system-board.yaml` and the audit-remediation run — they describe state, never change it.