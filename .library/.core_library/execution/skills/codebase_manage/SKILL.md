# SKILL: codebase_manage

**Engine:** `agentic_engine` (Archon)
**Runtime:** TypeScript / Bun
**Trigger:** Archon REST API or direct CLI/DB modification

## What This Skill Does

Registers multiple repositories into the engine so workflows can act on them.
Manages environment variables specific to each codebase.

## Concept

Archon tracks codebases in its database. A workflow run can be bound to a specific codebase, injecting the appropriate paths and environment variables.

## Execution

*(Assuming API server is running or using CLI wrappers)*

```bash
# Register a codebase (hypothetical CLI command based on Archon architecture):
bun run cli codebase add --name "backend-api" --path "/absolute/path/to/repo"

# Set environment variables for a codebase:
bun run cli codebase set-env "backend-api" "DB_URL=postgres://..."
```

## Sub-repos Support

Adapted from GSD discoveries:
For workspaces with separate git repos (e.g., `backend/`, `frontend/`), register each as a distinct codebase in Archon. The `isolator` agent will manage which workflow targets which codebase.
