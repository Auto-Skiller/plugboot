# 🗺️ Router Protocol (Agentic Sync)

**Role:** Synchronize `pipelines/` execution schemas and maintain `.brain/meta.router.yaml`.

## When to Execute
- At the start of a Session.
- Whenever a new Pipeline, Runbook, Scratch, or Tracker file is created or modified.

## Execution Steps

### 1. Enforce Pipeline Schemas
Scan the `pipelines/` directory (e.g., `hustler`, `scaler`).
Every execution file MUST strictly adhere to the `expected_file_schemas` for pipelines defined in `meta.router.yaml`:
- **Runbooks (`*.md`)**: Must follow the exact layout: `# Title`, then `## Objective`, then `## Steps`.
- **Trackers/Scratchpads (`*.md`)**: Must follow the exact tracker schemas defined in `meta.router.yaml`.
*Rewrite any files that break the schema without losing their logic.*

### 2. Update the Router Maps
Open the specialized pipeline routers (if they exist) or `.brain/meta.router/pipelines.router.yaml`.
Ensure the target paths and `files:` arrays perfectly match the physical files inside the pipeline `.meta/` directories.

### 3. Verify the Master Map
Read `.brain/meta.router.yaml`.
Verify that the `target_path` for `mission_board`, `toolbox_library`, and `pipelines` correctly resolves to the physical directories in the workspace. No broken links are permitted.

