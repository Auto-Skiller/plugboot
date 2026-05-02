# SKILL: workflow_run

**Engine:** `agentic_engine` (Archon)
**Runtime:** TypeScript / Bun
**Trigger:** `/workflow-run <name> [args...]` or `bun run cli workflow run <name>`

## What This Skill Does

Executes a YAML workflow defined by `workflow_design`.
Handles parallel execution of independent nodes, dependency resolution, and output capture.

## When To Use

- Running a defined multi-step process (e.g., build, test, deploy).
- Running a scheduled pipeline task (triggered by `scheduler` agent).

## Execution

```bash
# From workspace root:
cd .library/.engines_library/temp_repos/agentic_engine
bun run cli workflow run <workflow_name> "arg1=value1" "arg2=value2"

# If codebase context is needed:
bun run cli workflow run <workflow_name> --codebase-id <id>
```

## Resiliency

- If a workflow fails, state is preserved in the database.
- It can be resumed using `workflow_manage`.
- Completed nodes are skipped on resume.

## Output

- CLI output of node execution progress.
- Artifacts written to `.missions/<run_id>/` (if configured by the workflow).
- Run ID returned for management.
