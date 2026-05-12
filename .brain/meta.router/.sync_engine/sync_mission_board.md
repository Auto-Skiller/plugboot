# 🗃️ Cataloger Protocol (Agentic Sync)

**Role:** Synchronize `.runtime/.mission_board/`, `CONTROLER.yaml`, and `mission_board.router.yaml`.

## When to Execute
- At the start of a Session.
- At the end of a Session.
- Whenever a Session or Goal YAML file is created or modified.

## Execution Steps

### 1. Enforce Physical Schemas
Scan `.runtime/.mission_board/`. Every file MUST strictly adhere to the schemas below:

**Session Files (`[SESSION].yaml`):**
```yaml
# 🚀 SESSION: [SESSION_NAME]

metadata:
  name: [SESSION_NAME]
  description: string
  status: active | paused | abandoned
  started_at: datetime
  agent: string

execution:
  active_goals:
    - [GOAL_NAME]
  summary: string
```

**Goal Files (`[GOAL].yaml`):**
```yaml
# 🎯 GOAL: [GOAL_NAME]

metadata:
  name: [GOAL_NAME]
  session: [SESSION_NAME]
  description: string
  status: pending ⏳ | active 🟢 | in-progress 🔄 | done ✅
  priority: low | medium | high

execution:
  plan:
    tasks:
      - string
    checkpoints:
      - string
  state:
    tracking: string
    artifacts:
      - path/to/artifact
```

**CRITICAL RULE: NEVER MINIMIZE GOALS.**
- **Quantity**: More goals are better, as long as they handle distinct tasks. Do not attempt to condense multiple distinct operations into a single goal file.
- **Detail**: When writing a Goal YAML, ensure the `metadata.description`, `execution.plan.tasks`, and `execution.state.tracking` fields are highly detailed and descriptive. Do not write minimal one-liners.
- **Artifacts**: The `execution.state.artifacts` array must actively link to generated research (`.md`), execution plans (`.md`), or scratch files.

*Fix any physical files that do not match these schemas.*

### 2. Archiving (No Deletion)
Never permanently delete a Session or a Goal.
If a Session or Goal is completed or cancelled, move its physical folder into `.runtime/.mission_board/_archive/`.
Its metadata must be moved out of the active `CONTROLER.yaml` and appended to `.runtime/.mission_board/_archive/CONTROLER_ARCHIVE.yaml`.

### 3. Sync CONTROLER.yaml
Ensure that every active Session and Goal found in the physical directories is perfectly mirrored in `CONTROLER.yaml`.
- The `status` in the physical file must match the `status` in `CONTROLER.yaml`.
- The physical files are the ultimate source of truth.

### 4. Update the Router Map
Open `.brain/meta.router/mission_board.router.yaml`.
Ensure the `sessions:` block perfectly maps all physical paths. It MUST adhere to the `expected_schema` defined in `meta.router.yaml` (including `folder_path`, `yaml_path`, `status`, `progress_percentage`, and `extra_files`).
