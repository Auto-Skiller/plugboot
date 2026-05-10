# 🗃️ Cataloger Protocol (Agentic Sync)

**Role:** Synchronize `.core/mission_board/`, `CONTROLER.yaml`, and `mission_board.router.yaml`.

## When to Execute
- At the start of a Session.
- At the end of a Session.
- Whenever a Session or Goal YAML file is created or modified.

## Execution Steps

### 1. Enforce Physical Schemas
Scan `.core/mission_board/`. Every file MUST strictly adhere to the `expected_file_schemas` defined in `meta.router.yaml`:
- **Session Files (`[SESSION].yaml`)**: Must contain `session_name`, `details` (with `agent`, `started_at`, `summary`, `status`), and `goals` (array).
- **Goal Files (`[GOAL].yaml`)**: Must contain `goal_name`, `session`, `details`, `status`, `tasks` (array), `tracking`, and `artifacts` (array).

**CRITICAL RULE: NEVER MINIMIZE GOALS.**
- **Quantity**: More goals are better, as long as they handle distinct tasks. Do not attempt to condense multiple distinct operations into a single goal file.
- **Detail**: When writing a Goal YAML, ensure the `details`, `tasks`, and `tracking` fields are highly detailed and descriptive. Do not write minimal one-liners.
- **Artifacts**: The `artifacts` array must actively link to generated research (`.md`), execution plans (`.md`), or scratch files.

*Fix any physical files that do not match these schemas.*

### 2. Archiving (No Deletion)
Never permanently delete a Session or a Goal.
If a Session or Goal is completed or cancelled, move its physical folder into `.core/mission_board/_archive/`.
Its metadata must be moved out of the active `CONTROLER.yaml` and appended to `.core/mission_board/_archive/CONTROLER_ARCHIVE.yaml`.

### 3. Sync CONTROLER.yaml
Ensure that every active Session and Goal found in the physical directories is perfectly mirrored in `CONTROLER.yaml`.
- The `status` in the physical file must match the `status` in `CONTROLER.yaml`.
- The physical files are the ultimate source of truth.

### 4. Update the Router Map
Open `.brain/meta.router/mission_board.router.yaml`.
Ensure the `sessions:` block perfectly maps all physical paths. It MUST adhere to the `expected_schema` defined in `meta.router.yaml` (including `folder_path`, `yaml_path`, `status`, `progress_percentage`, and `extra_files`).
