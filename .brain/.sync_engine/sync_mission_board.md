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
*Fix any physical files that do not match these schemas.*

### 2. Sync CONTROLER.yaml
Ensure that every active Session and Goal found in the physical directories is perfectly mirrored in `CONTROLER.yaml`.
- The `status` in the physical file must match the `status` in `CONTROLER.yaml`.
- The physical files are the ultimate source of truth.

### 3. Update the Router Map
Open `.brain/meta.router/mission_board.router.yaml`.
Ensure the `sessions:` block perfectly maps all physical paths. It MUST adhere to the `expected_schema` defined in `meta.router.yaml` (including `folder_path`, `yaml_path`, `status`, `progress_percentage`, and `extra_files`).
