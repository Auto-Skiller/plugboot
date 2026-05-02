# SKILL: workflow_isolate

**Engine:** `agentic_engine` (Archon)
**Runtime:** TypeScript / Bun
**Trigger:** `/workflow-isolate <action>` or `bun run cli isolation <action>`

## What This Skill Does

Creates and manages git worktrees for safe, parallel execution.
Instead of modifying the main working directory, workflows can run in an isolated worktree branch.

## Execution

Run these from the `agentic_engine` root:

```bash
# Create an isolated worktree for a workflow run:
bun run cli isolation create <run_id> --branch <branch_name>

# List active worktrees:
bun run cli isolation list

# Clean up a worktree after completion:
bun run cli isolation cleanup <run_id>
```

## When To Use

- When multiple agents or workflows are editing code simultaneously.
- When running destructive tests or scripts that shouldn't touch uncommitted changes.
- To sandbox experimental features before merging back.

## How it integrates

The `isolator` agent uses this before handing off environment paths to the `commander` agent. Workflows are then instructed to run in the worktree path instead of the main repo root.
