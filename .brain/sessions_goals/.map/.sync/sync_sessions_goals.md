# 🗃️ Cataloger Protocol (Agentic Sync)
> **Schema Version:** 2.1 | Canonical source of truth: `meta.router.yaml` → `brain.mission_board`

**Role:** Synchronize `.brain/.mission_board/`, `CONTROLER.yaml`, and `mission_board.router.yaml`.

## When to Execute
- At the start of every Session.
- At the end of every Session.
- Whenever a Session or Goal YAML file is created or modified.
- Always via: `.\.venv\Scripts\python.exe .brain\meta.router\.sync_engine\sync_engine.py`

---

## Canonical Status Vocabulary

> [!IMPORTANT]
> These are the ONLY valid values. Any other value will trigger a `[WARN]` from the sync engine and may cause validation failures.

**Session statuses:** `active` | `paused` | `completed` | `archived`
**Goal statuses:** `pending` | `in-progress` | `blocked` | `done` | `archived`
**Priority levels:** `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

---

## Physical Directory Root

All session and goal folders live under:
```
.brain/.mission_board/
├── SES-{PIPELINE}-{PURPOSE}/
│   ├── SESSION.yaml
│   ├── .scratch/         ← ephemeral agent workspace, never archived
│   └── GOAL-{NAME}/
│       ├── GOAL.yaml
│       └── artifacts/    ← produced deliverables, archived with goal
└── _archive/
    ├── MISSION_LOG.yaml
    └── {SESSION_NAME}_{YYYYMMDD}/
```

---

## Execution Steps

### 1. Enforce Physical Schemas

Scan `.brain/.mission_board/`. Every file MUST strictly adhere to the schemas below.

**Session Files (`SESSION.yaml`):**
```yaml
# 🚀 SESSION: [SESSION_NAME]
metadata:
  id: SES-{PIPELINE}-{PURPOSE}     # matches folder name exactly
  pipeline: core | scaler | hustler
  description: string
  status: active | paused | completed | archived
  priority: LOW | MEDIUM | HIGH | CRITICAL
  started_at: "YYYY-MM-DDTHH:MM:SS+HH:MM"
  agent: string

execution:
  active_goals: [GOAL-NAME-1, GOAL-NAME-2]
  completed_goals: []
  blocked_goals: []
  summary: string

context:
  pipeline_router: ".brain/meta.router/pipelines.router/{pipeline}.router.yaml"
  notes: string
```

**Goal Files (`GOAL.yaml`):**
```yaml
# 🎯 GOAL: [GOAL_NAME]
metadata:
  id: GOAL-{NAME}                  # matches folder name exactly
  session: SES-{PIPELINE}-{PURPOSE}
  pipeline: core | scaler | hustler
  description: string
  status: pending | in-progress | blocked | done | archived
  priority: LOW | MEDIUM | HIGH | CRITICAL
  deadline: "YYYY-MM-DDTHH:MM:SSZ" | null

execution:
  plan:
    tasks:
      - id: T-01
        description: string
        status: pending | in-progress | done
        tool: string | null
        depends_on: []
    checkpoints:
      - name: string
        status: pending | in-progress | completed
  state:
    progress_percentage: "0%"      # auto-computed by sync engine from tasks
    tracking: string               # human-readable current state narrative
    blockers: []
    artifacts:
      - name: string
        path: "relative/to/goal/folder"
```

**CRITICAL RULES:**
- **Never minimize goals.** More goals with distinct scopes are better than one mega-goal.
- **Detail is mandatory.** `metadata.description`, `execution.plan.tasks`, and `execution.state.tracking` must be highly descriptive — never one-liners.
- **Artifacts must be linked.** The `execution.state.artifacts` array must actively reference all generated research `.md`, plans, and scratch files.
- **`GOAL-` prefix is mandatory** on all goal folder names.
- **`.scratch/` is never archived** — it is ephemeral agent working space only.

*Fix any physical files that do not match these schemas before proceeding.*

---

### 2. Archiving (No Deletion)

Never permanently delete a Session or a Goal.

- When a session is `completed` AND all goals are `done` or `archived`, the sync engine will **auto-archive** it.
- Auto-archive copies the folder to `.brain/.mission_board/_archive/{SESSION_NAME}_{YYYYMMDD}/` and removes the original.
- Archive events are logged to `.brain/.mission_board/_archive/MISSION_LOG.yaml`.
- The session entry in `CONTROLER.yaml` is preserved in the `archived_sessions` block.

---



### 3. Update the Router Map

The sync engine automatically updates `.brain/meta.router/mission_board.router.yaml`.

Ensure the `sessions:` block maps all physical paths per the schema in `meta.router.yaml`:
- `folder_path` — relative workspace path to the session directory
- `yaml_path` — relative workspace path to `SESSION.yaml`
- `pipeline`, `status`, `priority`, `progress_percentage`
- `goals[]` — each entry with `name`, `folder_path`, `yaml_path`, `status`, `priority`, `progress_percentage`, `blocked`, `extra_files`
