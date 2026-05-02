# SKILL: workflow_manage

**Engine:** `agentic_engine` (Archon)
**Runtime:** TypeScript / Bun
**Trigger:** `/workflow-manage <action>` or `bun run cli workflow <action>`

## What This Skill Does

Manages the lifecycle of workflow runs.
Allows listing, inspecting, resuming, and abandoning executions.

## Execution

Run these from the `agentic_engine` root:

```bash
# List all workflow runs:
bun run cli workflow list

# View status of a specific run:
bun run cli workflow status <run_id>

# Resume a failed or paused run:
bun run cli workflow resume <run_id>

# Abandon a failed or paused run (cleanup state):
bun run cli workflow abandon <run_id>
```

## When To Use

- A workflow failed midway and the underlying issue is fixed -> `resume`
- A workflow is stuck or no longer needed -> `abandon`
- To review history of executed missions -> `list`

## Integration

The `commander` agent uses these commands to monitor mission health and attempt recovery strategies when bash/script nodes fail.
