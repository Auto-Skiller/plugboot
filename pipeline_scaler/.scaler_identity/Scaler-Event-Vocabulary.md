# 🪧 Scaler Event Vocabulary

## Objective
Single authoritative reference for the events emitted **inside** the Scaler pipeline. This file is private to Scaler scope: it is read by Scaler agents, Scaler sync engines, and the Audit Pass. It is NOT read by the Hustler pipeline. Cross-pipeline event names are not catalogued here.

> **Isolation contract**: Per the workspace's pipeline-isolation principle (see `Hustler-Operational-Rules.md §5` and `Scaler-Operational-Rules.md §3` Self-Evolution Protocol), the Scaler and Hustler do not share an event bus, do not share a log file, and do not reference each other's vocabularies. The OS-wide event vocabulary at `.identity/Event_Vocabulary.md` covers events emitted *outside* both pipelines (CONTROLER, milestones, meta_sync) and is the only shared catalog.

---

## 1. Scope

An event belongs in this file if and only if it is emitted from somewhere inside `pipeline_scaler/`. That includes:
- Scaler agents performing Phase 1-5 work
- `scaler_sync.py` and its sub-sync engines
- The Audit Pass (`Scaler-Workflows.md §7`)
- Atomic-trio recovery (P-LAW-019) emissions
- Provenance-marker writes (P-LAW-020)

Events that fire outside the Scaler (e.g., `META_SYNC_COMPLETED`, `GOAL_COMPLETED`) live in the OS-wide vocabulary.

---

## 2. Discovery & Routing Events (Phase 1)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `DISCOVERY_INGESTED` | Phase 1 staging scan finds a new item in any inbox | `source_path`, `pillar_resolved` (or `mixed`), `hash`, `at` | `[Pillar].sources_ledger.yaml`, `scaler_hub.recent_events` |
| `DISCOVERY_ROUTED_FROM_MIXED` | Item moved out of `.scaler_mixed_inbox/` to a typed hub | `source_path`, `from`, `to`, `group_resolved`, `at` | `.scaler_mixed_inbox.ledger.yaml`, sub-ledger |
| `DISCOVERY_GROUP_RESOLVED` | Cluster Intake Protocol places item into a functional group | `discovery_id`, `group_path`, `pillar`, `at` | sub-ledger |
| `DISCOVERY_GROUP_LAZILY_CREATED` | First item to land in a hub creates a new functional group folder | `pillar`, `group_name`, `triggering_source`, `at` | `scaler_hub.recent_events` (audit trail for §7.3 lazy scaffolding) |
| `DISCOVERY_REJECTED` | Item fails all routing rules | `source_path`, `reason`, `at` | `scaler_hub.messages` (severity: WARN) |
| `DISCOVERY_ARCHIVED` | All proposals/cards from this discovery are integrated; discovery moves to `.scaler_archive/` | `discovery_id`, `archive_path`, `at` | sub-ledger `history[]` |

## 3. Mapping & Tracking Events (Phase 2)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `INTEGRATION_TYPE_RESOLVED` | Phase 2 Step 4 picks an Integration_Type | `discovery_id`, `chosen_type`, `tie_break_path` (if any), `at` | sub-ledger, scratch draft |
| `TIE_BREAK_DEFERRED` | §3.4 rule 4 fires (human gate) | `discovery_id`, `candidate_types[]`, `at` | `scaler_review_queue` (status: TIE_PENDING_RESOLUTION) |
| `CLUSTER_INTAKE_RAN` | Cluster Intake Protocol runs over a set (`Scaler-Discovery-Logic.md §3`) | `pillar`, `items_count`, `clusters_formed[]`, `at` | sub-ledger |
| `ASPECT_MAP_UPDATED` | Phase 2 Step 5 sets `primary_aspect` + `aspects[]` | `discovery_id`, `primary`, `aspects[]`, `at` | sub-ledger |

## 4. Card Lifecycle Events (Phase 4)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `CARD_DRAFTED` | Phase 4 writes a Proposal Card or Internal Mega-YAML | `card_id`, `card_kind` (`PROPOSAL|INTERNAL`), `pillar`, `path`, `at` | gateway folder, ledger |
| `CARD_LEDGER_LINKED` | Atomic-trio second write (ledger entry tied to card) | `card_id`, `ledger_path`, `at` | ledger |
| `CARD_NOTES_RECEIVED` | User wrote `NOTES:` in `user_decision` | `card_id`, `notes_summary`, `at` | `scaler_review_queue` (status: PENDING after re-post) |
| `CARD_APPROVED` | `user_decision: APPROVED` (manual or auto in EXECUTION) | `card_id`, `mode` (`auto|manual`), `at` | gateway, ledger |
| `CARD_REJECTED` | `user_decision: REJECTED` | `card_id`, `reason`, `at` | gateway, ledger |
| `CARD_INTEGRATED` | Phase 5 finishes all `files_involved` actions | `card_id`, `files_touched[]`, `at` | ledger, `.db/pipeline_scaler.yaml.metrics` |
| `CARD_ARCHIVED` | Step 7 moves card to `.scaler_archive/YYYY-QQ/` | `card_id`, `archive_path`, `at` | gateway empties, archive populates |

## 5. Atomic Trio & Recovery Events (P-LAW-001 / P-LAW-019)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `ATOMIC_TRIO_BEGIN` | First write of a multi-store transaction | `operation_type`, `stores[]`, `at` | scratch transaction log |
| `ATOMIC_TRIO_COMMITTED` | All writes succeeded | `operation_type`, `at` | `scaler_hub.recent_events` |
| `ATOMIC_TRIO_FAILED` | Any write in the trio failed | `operation_type`, `failed_store`, `error`, `at` | `scaler_hub.messages` (severity: ERROR) |
| `ROLLBACK_TRIGGERED` | P-LAW-019 step 1: ABORT fired | `operation_type`, `failed_store`, `successful_writes[]`, `at` | scratch transaction log |
| `ROLLBACK_COMPLETED` | P-LAW-019 step 3: all successful writes reverted | `operation_type`, `reverted_state[]`, `at` | `scaler_hub.recent_events` (audit trail) |
| `ROLLBACK_QUEUED_FOR_REVIEW` | P-LAW-019 step 6: never auto-retry | `operation_type`, `at` | `scaler_review_queue` (status: RECOVERED_PENDING_RETRY) |

## 6. Provenance Events (P-LAW-020)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `PROVENANCE_WRITTEN` | New artifact created with provenance header | `card_id`, `artifact_path`, `format` (`md|yaml|py`), `at` | post-integration log |
| `PROVENANCE_APPENDED` | Subsequent INJECT adds a `Modified by` line | `card_id`, `artifact_path`, `at` | post-integration log |

## 7. Audit Pass Events (`Scaler-Workflows.md §7`)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `AUDIT_STARTED` | Audit Pass acquires the lock | `triggered_by` (`manual|goal_complete|drift_suspected|quarter_rotation`), `at` | `.db/pipeline_scaler.yaml.audit_in_progress: true` |
| `AUDIT_CHECK_RAN` | One of the 7 checks completes | `check_id` (1..7), `findings_count`, `severity_breakdown`, `at` | `.db/pipeline_scaler.yaml.audit_findings[]` |
| `AUDIT_FINDING_DRIFT` | A check produced a `DRIFT` finding | `check_id`, `target`, `expected`, `observed`, `at` | aggregated into remediation Mega-YAML |
| `AUDIT_REMEDIATION_DRAFTED` | Audit Pass auto-drafted `MEGA-INT-AUDIT-REMEDIATION-*` | `card_id`, `findings_count`, `at` | gateway, `scaler_review_queue` |
| `AUDIT_COMPLETED` | All 7 checks done; lock released | `outcome` (`CLEAN|WARN|DRIFT|INCOMPLETE`), `at` | `scaler_hub.recent_events` |

## 8. Sync Events (Scaler-internal — distinct from OS-wide `META_SYNC_*`)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `STATE_SYNC` | `.db/pipeline_scaler.yaml` mirrors CONTROLER pre-cycle (P-LAW-007) | `mirrored_fields[]`, `at` | `.db/pipeline_scaler.yaml` |
| `LEDGER_ROLLUP_REASSEMBLED` | Auto-aggregator rebuilt `.db/` index rollups | `pillars_aggregated[]`, `at` | router |
| `RUNTIME_ROLLUP_REASSEMBLED` | Auto-aggregator rebuilt `.db/.core.yaml` | `at` | router |
| `RUNBOOK_READINESS_LOGGED` | P-LAW-008 acknowledgement (when enforced) | `runbook_file`, `content_hash`, `at` | `.db/pipeline_scaler.yaml.runbook_readiness` |

---

## 9. Severity & Format

Severities follow the OS-wide ladder (`INFO|WARN|ERROR|CRITICAL` per `.identity/Event_Vocabulary.md §2.4`). Format also follows the OS-wide canonical string for `recent_events` and structured form for `messages[]`. Using the OS ladder keeps Scaler events readable when an external observer (the user, a future operator) scans the merged audit trail in `CONTROLER.yaml`.

---

## 10. Rules

1. **Scaler-only events here.** Never list a Hustler event in this file. Never reference an event name from `Hustler-Event-Vocabulary.md` in Scaler code or runbooks.
2. **No emission to Hustler stores.** Scaler events are written to `.db/pipeline_scaler.yaml`, `scaler_hub` (inside CONTROLER's communication_hubs), or per-pillar ledgers. Never to `hustler_state.yaml`, `hustler_hub`, or any Hustler ledger.
3. **Append-only catalog.** New events are added; existing entries are never renamed (consumers parse the names). To deprecate, mark `@deprecated` and keep emitting for at least one quarter.
4. **One event per semantic action.** A cascade move that triggers tag transition + ledger update + provenance write emits one `CARD_INTEGRATED` (or equivalent), not three sub-events. Sub-store granularity is captured by `ATOMIC_TRIO_*` events.
5. **Audit-Pass emissions are observation-only.** Audit events do not cause writes outside `.db/pipeline_scaler.yaml` and the audit-remediation Mega-YAML — they describe state, never change it.
