# SKILL: workflow_design

**Engine:** `agentic_engine` (Archon)
**Runtime:** TypeScript / Bun
**Trigger:** Manual YAML creation in `.archon/workflows/`

## What This Skill Does

Defines a reusable multi-step task as a YAML DAG (Directed Acyclic Graph).
The workflow defines execution order, dependencies, and bash/script node execution logic.
No AI prompt or loop nodes are permitted (LLM-free constraint).

## Execution

Write a YAML file to `.archon/workflows/<name>.yaml`.

## Node Types Allowed

1. `bash`: Executes shell commands directly in the worktree
2. `script`: Runs a script file (Python, Node, Bash, etc.)
3. `approval`: Pauses execution until user approves

## Example: Code Quality Check Workflow

```yaml
name: code-quality-check
description: Runs linter and tests in parallel
parameters:
  - name: path
    description: Path to run checks against
    required: false
    default: "."

nodes:
  - id: lint
    type: bash
    command: "npm run lint {{path}}"

  - id: typecheck
    type: bash
    command: "npx tsc --noEmit"

  - id: tests
    type: bash
    command: "npm run test"
    # Wait for lint/typecheck before running tests
    dependsOn:
      - lint
      - typecheck

  - id: notify
    type: script
    scriptPath: "scripts/notify.js"
    args: ["--status", "success"]
    dependsOn:
      - tests
```

## Anti-Patterns

- DO NOT use `type: prompt` (requires AI API).
- DO NOT use `type: loop` (requires AI API).
- Keep node commands focused — use `script` nodes for complex logic instead of massive inline `bash` commands.
