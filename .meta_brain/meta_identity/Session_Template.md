# 📑 Session and Goal Template (v5.3)

This template defines the required structure for creating sessions and goals in `CONTROLER.yaml` and the corresponding physical files in `.meta_brain/milestones/`.

> [!IMPORTANT]
> **Single Source of Truth for schemas**: The validation rules for SESSION.yaml and GOAL.yaml live inside `.meta_brain/.meta_routing/milestones.yaml` (Part 2 — `session_schema` and `goal_schema`). The milestones sync engine reads them at every run. To change a rule, edit the YAML schema string in `milestones.yaml`, never the doc.

## Required Files

```
.meta_brain/milestones/
└── SES-[ENTITY]-[ROLE]-[SUBJECT]/        # session folder (mirror sibling pattern)
    ├── SESSION.yaml                       # validated against session_schema
    └── GOAL-[NAME]/                       # one folder per goal
        └── GOAL.yaml                      # validated against goal_schema
```

## Skeleton — SESSION.yaml

```yaml
metadata:
  name: SES-EXAMPLE-AUDITOR-CORE
  description: One-sentence purpose of this session.
  status: active                            # active | paused | completed | archived
  started_at: '2026-05-18T00:00:00Z'
  agent: Antigravity
  priority: HIGH                            # LOW | MEDIUM | HIGH | CRITICAL
  pipeline: scaler                          # or hustler, core, etc.
  persistence:
    enabled: true
    max_rounds: unlimited                   # integer or 'unlimited'
    current_round: 1
execution:
  summary: Live summary of session work; updated by the agent over time.
  active_goals:
    - GOAL-EXAMPLE
```

## Skeleton — GOAL.yaml

```yaml
metadata:
  name: GOAL-EXAMPLE
  session: SES-EXAMPLE-AUDITOR-CORE
  description: One-sentence goal description.
  status: pending                           # pending | in-progress | blocked | done | archived
  priority: MEDIUM
  round: 1
execution:
  plan:
    tasks:
      - task: First step.
        status: pending
      - task: Second step.
        status: pending
  state:
    progress_percentage: 0%                 # auto-computed from tasks by milestones_sync
    last_progress_at: null                  # auto-stamped only when progress changes (D3)
    tracking: "Live notes — what's been done, what blocked you, what's next."
    artifacts: []                           # relative paths to deliverables
```

## Usage Guidelines

1. **Goal files are living documents.** Update `execution.state.tracking` with status, completed tasks, and links to artifacts as work progresses.
2. **The Sync Engine** (`.meta_brain/.meta_routing/meta_sync_engines/milestones_sync.py`) automatically calculates `progress_percentage` and `overall_health` from these files on every master sync. It also auto-promotes sessions to `completed` when every goal is done (no manual transition needed) and auto-archives them on the next sync.
3. **Naming follows the closest sibling pattern.** If `.meta_brain/milestones/` already contains other sessions, mirror their convention. Numeric suffixes are HARD anti-patterns and now FAIL the sync (matching `Rules_And_Considerations.md §5`).
4. **Multi-session safety.** Multiple sessions can be active at once. Pipeline state files (`scaler_state.yaml`, `hustler_state.yaml`) track every match in `state.active_sessions[]`. The legacy singular `active_session` field is a backwards-compatibility mirror of the first entry; do not rely on it being the only one.
5. **Persistence exhaustion.** When `metadata.persistence.max_rounds` is reached, the engine sets `status: paused` AND `metadata.persistence.exhausted: true`. Never write `status: pended` (not in vocabulary; would break schema validation forever).
