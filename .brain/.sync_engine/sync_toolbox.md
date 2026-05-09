# 🧭 Navigator Protocol (Agentic Sync)

**Role:** Synchronize `.core/toolbox_library/` and `toolbox_library.router.yaml`.

## When to Execute
- At the start of a Session.
- Whenever a new Toolbox, Skill, or Agent is added or modified in the library.

## Execution Steps

### 1. Enforce Physical Schemas
Scan `.core/toolbox_library/` (both `core.toolbox` and `extended.toolbox`).
Every toolbox YAML file MUST strictly adhere to the `expected_file_schemas` for `toolbox_file` defined in `meta.router.yaml`:
- Must contain `name`, `description`, `when_to_use`.
- Must contain `agents` (array of objects with `name`, `path`, `description`, `when_to_use`).
- Must contain `skills` (array of objects with `name`, `skill_file` object, and `extra_folders` array).
*Fix any toolbox files that do not match this schema.*

### 2. Update the Router Map
Open `.brain/meta.router/toolbox_library.router.yaml`.
Ensure the `core_toolboxes:` and `extended_toolboxes:` blocks perfectly map all physical paths.
It MUST adhere to the `expected_schema` defined in `meta.router.yaml` (including `path`, `yaml_path`, `description`, `when_to_use`, `agent_count`, and `skill_count`). Recalculate the counts if files were added.
