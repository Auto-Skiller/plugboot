# 🪧 Hustler Event Vocabulary

## Objective
Single authoritative reference for the events emitted **inside** the Hustler pipeline. This file is private to Hustler scope: it is read by Hustler agents, Hustler sync engines, and the Audit Pass. It is NOT read by the Scaler pipeline. Cross-pipeline event names are not catalogued here.

> **Isolation contract**: Per the workspace's pipeline-isolation principle (see `Hustler-Operational-Rules.md §5` Self-Evolution Protocol), the Scaler and Hustler do not share an event bus, do not share a log file, and do not reference each other's vocabularies. The OS-wide event vocabulary at `.meta_os/meta_identity/Event_Vocabulary.md` covers events emitted *outside* both pipelines (CONTROLER, milestones, meta_sync) and is the only shared catalog.

---

## 1. Scope

An event belongs in this file if and only if it is emitted from somewhere inside `pipeline_hustler/`. That includes:
- Hustler agents performing Phase 1-5 cascade and processing work
- `_os/engine/meta_sync.py` and its global sub-sync engines
- The Audit Pass (`Hustler-Workflows.md §7`)
- Atomic-trio recovery (H-LAW-006) emissions
- Source-quality scoring (H-LAW-015) and re-scoping operations (H-LAW-014)

Events that fire outside the Hustler (e.g., `META_SYNC_COMPLETED`, `GOAL_COMPLETED`) live in the OS-wide vocabulary.

---

## 2. Ingestion Events (Phase 1)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `SOURCE_INGESTED` | Phase 1 staging scan finds a new file | `source_path`, `hash`, `inbox_kind` (`mixed|focus_typed|direct_drop`), `at` | `.hustler_mixed_inbox.ledger.yaml` (or focus-level sources_ledger), `hustler_hub.recent_events` |
| `SOURCE_QUALITY_SCORED` | H-LAW-015 5-criteria scoring runs | `hash`, `score` (0..5), `per_criterion` (boolean map), `verdict` (`PASS|BORDERLINE|REJECTED`), `at` | ledger `quality_scoring` block |
| `SOURCE_REJECTED_QUALITY` | Score ≤2/5 — does not count toward thresholds | `hash`, `failing_criteria[]`, `archive_path`, `at` | `.hustler_archive/YYYY-QQ/REJECTED-quality/`, `hustler_hub.messages` (severity: WARN) |
| `BUNDLE_DEFERRED_ASSETS` | Bundle Completeness rule fires; some files unreadable | `bundle_path`, `unread_count`, `reasons[]`, `at` | sources_ledger `unread_assets[]` |
| `DIRECT_DROP_TAGGED` | Item dropped directly into a feature's `00-data/` is tagged `[new-data]` | `feature_path`, `file`, `at` | feature `[feature].yaml.data_inventory` |

## 3. Cascading Events (Phase 2)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `CASCADE_FOCUS_MATCHED` | Source matches an existing focus per C1 | `hash`, `focus_id`, `signal` (C1..C5), `at` | sources_ledger |
| `CASCADE_PRODUCT_MATCHED` | Source matches an existing product per C2 | `hash`, `focus_id`, `product_id`, `signal`, `at` | sources_ledger |
| `CASCADE_FEATURE_MATCHED` | Source matches an existing feature per C3 | `hash`, `focus_id`, `product_id`, `feature_id`, `signal`, `at` | sources_ledger, feature `00-data/` |
| `CASCADE_HELD` | Threshold not yet met; source stays in holding | `hash`, `level` (`focus|product|feature`), `holding_path`, `count_so_far`, `at` | holding folder, sources_ledger |
| `CASCADE_CHECKLIST_FAILED` | A box in `Hustler-Cascading-Logic §6.0` could not be ticked | `level`, `failed_check`, `at` | `hustler_hub.messages` (severity: WARN) |
| `FOCUS_VALIDATED` | Focus threshold met; new focus folder + split ledgers created | `focus_id`, `triggering_sources[]`, `at` | central `.db/` rollups, `hustler_hub.recent_events` |
| `PRODUCT_VALIDATED` | Product threshold met under existing focus | `focus_id`, `product_id`, `triggering_sources[]`, `at` | `[focus]-PRODUCTS.yaml`, `[focus].focus_ledger.yaml`, lineage_graph |
| `FEATURE_VALIDATED` | Feature threshold met under existing product | `focus_id`, `product_id`, `feature_id`, `triggering_sources[]`, `at` | `[product]-FEATURES.yaml`, `[focus].focus_ledger.yaml`, lineage_graph |
| `LINEAGE_EDGE_APPENDED` | New edge written to `[focus].focus_ledger.yaml.lineage_graph.edges` | `focus_id`, `from`, `to`, `kind`, `at` | lineage_graph |

## 4. Tag Lifecycle Events (Phase 3-4)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `TAG_TRANSITION` | Any tag change on a `00-data/` file or in `[feature].yaml` | `target_path`, `from_tag`, `to_tag`, `at` | feature tracker, product tracker |
| `DEFINITION_CREATED` | Phase 3 Step 2.1 writes a `[new-def]` | `feature_id`, `def_id`, `derived_from[]`, `at` | `[feature].yaml.definitions[]`, `[product]-FEATURES.yaml` |
| `NEED_CREATED` | Phase 4 Step 4.1 writes a `[new-needs]` | `feature_id`, `need_id`, `def_id`, `at` | `[feature].yaml.needs[]` |
| `NEED_FULFILLED_EXTRACT` | Phase 4 Step 4.2 EXTRACT branch | `feature_id`, `need_id`, `requirement_assets[]`, `at` | `01-requirements/`, `[feature].yaml` |
| `NEED_FULFILLED_SCRAPE` | Phase 4 Step 4.2 SCRAPE branch | `feature_id`, `need_id`, `scraped_files[]`, `requirement_assets[]`, `at` | `00-data/[new-scraped]`, `01-requirements/`, `[feature].yaml` |
| `DEFINITION_SUPERSEDED` | H-LAW-014 No Logic Loss path | `feature_id`, `old_def_id`, `new_def_id`, `coverage_map`, `at` | `[feature].yaml.definitions[].supersedes` |

## 5. Productization Events (Phase 5)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `PRODUCTIZATION_READY` | Feature flagged ready (`status_summary.productization_ready: true`) | `focus_id`, `product_id`, `feature_id`, `at` | `[focus]-PRODUCTS.yaml`, lineage_graph |
| `HUSTLE_SESSION_OPENED` | New `HUSTLE-[Market]-[ID]` session opened (H-LAW-001) | `hustle_id`, `market`, `product_ref`, `roi_projection_ref`, `at` | central `.db/` rollups, milestones |
| `MARKET_SANITY_BLOCKED` | H-LAW-003 violation prevents productization | `feature_id`, `missing_step`, `at` | `hustler_hub.product_gaps_queue` |
| `ROI_BLOCKED` | H-LAW-002 violation prevents productization | `feature_id`, `at` | `hustler_hub.product_gaps_queue` |

## 6. Re-Scoping Events (H-LAW-014)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `RESCOPING_PROPOSED` | Re-scope candidate identified during cascade or audit | `level`, `before_id`, `proposed_after_id`, `reason`, `at` | `hustler_hub.messages` |
| `PARITY_AUDIT_RAN` | H-LAW-014 step 1 completed for a retiring product/feature | `level`, `before_id`, `dependent_artifacts[]`, `at` | `.meta_os/meta_db/pipeline_hustler_os.yaml.state.rescoping_history[]` |
| `RESCOPING_COMMITTED` | Re-scope finalized and folder moved per Deprecation Bridge | `level`, `before_id`, `after_id`, `archive_path`, `successor_id`, `at` | `.hustler_archive/RETIRED-*/`, lineage_graph (`SUPERSEDED_BY` edge) |
| `RESCOPING_REJECTED` | User declined the proposed re-scope | `level`, `before_id`, `reason`, `at` | `hustler_hub.recent_events` |

## 7. Atomic Trio & Recovery Events (H-LAW-006)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `ATOMIC_TRIO_BEGIN` | First write of a multi-store transaction | `operation_type`, `stores[]`, `at` | scratch transaction log |
| `ATOMIC_TRIO_COMMITTED` | All writes succeeded | `operation_type`, `at` | `hustler_hub.recent_events` |
| `ATOMIC_TRIO_FAILED` | Any write in the trio failed | `operation_type`, `failed_store`, `error`, `at` | `hustler_hub.messages` (severity: ERROR) |
| `RECOVERY_TRIGGERED` | H-LAW-006 step 1: ABORT fired | `operation_type`, `failed_store`, `successful_writes[]`, `at` | scratch transaction log |
| `RECOVERY_COMPLETED` | H-LAW-006 step 3: rollback finished | `operation_type`, `reverted_state[]`, `at` | `hustler_hub.recent_events` |
| `RECOVERY_QUEUED_FOR_REVIEW` | H-LAW-006 step 6: never auto-retry | `operation_type`, `at` | `hustler_hub.messages` (severity: ERROR) |

## 8. Audit Pass Events (`Hustler-Workflows.md §7`)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `AUDIT_STARTED` | Audit Pass acquires the lock | `triggered_by` (`manual|goal_complete|drift_suspected|quarter_rotation`), `at` | `.meta_os/meta_db/pipeline_hustler_os.yaml.state.audit_in_progress: true` |
| `AUDIT_CHECK_RAN` | One of the 6 checks completes | `check_id` (1..6), `findings_count`, `severity_breakdown`, `at` | `.meta_os/meta_db/pipeline_hustler_os.yaml.state.audit_findings[]` |
| `AUDIT_FINDING_DRIFT` | A check produced a `DRIFT` finding | `check_id`, `target`, `expected`, `observed`, `at` | aggregated into remediation message |
| `AUDIT_REMEDIATION_POSTED` | Audit Pass posted a remediation message | `severity`, `findings_count`, `escalation_target` (`next_cycle|scaler_internal`), `at` | `hustler_hub.messages` |
| `AUDIT_COMPLETED` | All 6 checks done; lock released | `outcome` (`CLEAN|WARN|DRIFT|INCOMPLETE`), `at` | `hustler_hub.recent_events` |

## 9. Sync Events (Hustler-internal — distinct from OS-wide `META_SYNC_*`)

| Event | Emitted by | Payload | Consumer |
|---|---|---|---|
| `STATE_SYNC` | `.meta_os/meta_db/pipeline_hustler_os.yaml` mirrors CONTROLER pre-cycle | `mirrored_fields[]`, `at` | `.meta_os/meta_db/pipeline_hustler_os.yaml` |
| `LEDGER_ROLLUP_REASSEMBLED` | Auto-aggregator rebuilt central `.db/` rollups | `focuses_aggregated[]`, `at` | router |
| `RUNTIME_ROLLUP_REASSEMBLED` | Auto-aggregator rebuilt central `.db/` rollups | `at` | router |
| `RUNBOOK_READINESS_LOGGED` | H-LAW-010 acknowledgement (when enforced) | `runbook_file`, `content_hash`, `at` | `.meta_os/meta_db/pipeline_hustler_os.yaml.runbook_readiness` |

---

## 10. Severity & Format

Severities follow the OS-wide ladder (`INFO|WARN|ERROR|CRITICAL` per `.meta_os/meta_identity/Event_Vocabulary.md §2.4`). Format also follows the OS-wide canonical string for `recent_events` and structured form for `messages[]`. Using the OS ladder keeps Hustler events readable when an external observer scans the merged audit trail in `CONTROLER.yaml`.

---

## 11. Rules

1. **Hustler-only events here.** Never list a Scaler event in this file. Never reference an event name from `Scaler-Event-Vocabulary.md` in Hustler code or runbooks.
2. **No emission to Scaler stores.** Hustler events are written to `.meta_os/meta_db/pipeline_hustler_os.yaml`, `hustler_hub` (inside CONTROLER's communication_hubs), or per-focus ledgers/trackers. Never to `pipeline_scaler_os.yaml`, `scaler_hub`, or any Scaler ledger.
3. **Append-only catalog.** New events are added; existing entries are never renamed (consumers parse the names). To deprecate, mark `@deprecated` and keep emitting for at least one quarter.
4. **One event per semantic action.** A cascade move that triggers tag transition + ledger update + lineage edge emits one `CASCADE_*_MATCHED` (or `*_VALIDATED`), not three sub-events. Sub-store granularity is captured by `ATOMIC_TRIO_*` events.
5. **Audit-Pass emissions are observation-only.** Audit events do not cause writes outside `.meta_os/meta_db/pipeline_hustler_os.yaml` and the remediation message — they describe state, never change it.
6. **Self-evolution events (Hustler runbook changes) are not Hustler events.** They are emitted by the Scaler INTERNAL pipeline when a Hustler-targeted Mega-YAML is integrated. The Hustler observes those via the OS-wide `META_SYNC_COMPLETED` event when the runbook touch propagates.
