# 📦 Projects Protocol (Agentic Sync)
> **Schema Version:** 1.0 | Canonical source of truth: `projects/` → `projects.router.yaml`

**Role:** Synchronize bounded application codebases from `projects/` into `projects.router.yaml`.

## When to Execute
- At the start of a Session affecting a project.
- Always via: `.\.venv\Scripts\python.exe .brain\meta.router\.sync_engine\sync_engine.py --target projects`

## Execution Steps

### 1. Discover Projects
Scan the `projects/` directory for discrete codebases.
If a directory represents a project, it must have an entry in `projects.router.yaml`.

### 2. Enforce Project Router Schema
Ensure `projects.router.yaml` conforms to the schema layout:
```yaml
projects:
  [PROJECT_ID]:
    path: "projects/{folder}/"
    readme: "projects/{folder}/README.md"
    entry_point: string
    type: string
    stack: [string]
    status: active | paused | completed | archived
```

### 3. Validate Paths
The engine guarantees that `path`, `readme`, and any dependencies (e.g., `requirements.txt`) mapped in the router accurately point to existing physical files in the workspace. Any broken links are flagged during the sync process.
