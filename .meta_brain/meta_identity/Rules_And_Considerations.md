# 📜 Rules and Considerations (v5)

1. **The Brain is for Logic & Routing Only.**
   Never store execution files or transient outputs in `.meta_brain/`. It strictly holds `meta_router.yaml`, the `.meta_sync/` engine, `meta_identity/`, `toolboxes/`, and `milestones/`.
   
2. **The Runtime is for Infrastructure.**
   The `.meta_runtime/` directory holds your master `venv/`, `auth/` cookies, and `.meta_scratch/`.

3. **Execution Workspaces.**
   All executable code belongs in `_pipelines/` or `projects/`. Their operational instructions (runbooks, trackers) live inside hidden localized context folders (e.g., `.scaler_brain/`) within that execution space.

4. **Strict Session-to-Goal Hierarchy.**
   Every goal must be nested inside a Session. This applies to both the `CONTROLER.yaml` state file and the physical `.meta_brain/milestones/` directories.

5. **Naming Conventions.**
   Sessions and goals MUST be named by their **functional role**. Numeric suffixes are strictly prohibited. Folder names must follow `[ENTITY]-[ROLE]-[SUBJECT]`.

6. **Engine Automation.**
   Do not manually update the `.yaml` mappings. Use `meta_sync.py` to automatically parse and catalog the workspaces.

7. **True Portability Execution.**
   NEVER use global OS packages. Execute tools using the master workspace engine: `.\.meta_runtime\venv\.venv\Scripts\python.exe -m [tool]`.

8. **Documentation Evolution & Logic Preservation Law.**
   No existing operational logic should be deleted during evolution. Foundational "Step-by-Step" instructions must be modernized rather than replaced.

9. **Zero-Drift Audit & Refactor Law.**
   NEVER rely on cached data. STRICTLY read the target file's current content from the disk immediately before making any changes. 
10. **Zero Guessing Law.**
    Never guess file paths. All paths must come from a router or a physical directory listing.

11. **Controller Mode Adherence.**
    All agents MUST resolve the active operational profile from `CONTROLER.yaml` before executing any pipeline task.

---

## 11. Core Operational Laws (Machine-Readable)
```yaml
laws:
  - id: LAW-001-CANONICAL-NAMING
    name: "Canonical Directory Roles"
    description: "Folders must follow established naming: .meta_brain/ for logic, .meta_runtime/ for infrastructure, runbooks/ for documentation."
    enforced: true
  - id: LAW-002-ZERO-GUESS-PATHING
    name: "Path Transparency"
    description: "All agents must use absolute paths from WORKSPACE_ROOT provided in routers. No guessing or relative path extrapolation beyond the router scope."
    enforced: true
  - id: LAW-003-ENCAPSULATED-EXECUTION
    name: "Runtime Isolation"
    description: "All pipeline-local ephemeral data (scratch, archive, logs) must reside within the pipeline's localized .runtime/ folder."
    enforced: true
  - id: LAW-004-MODE-ADHERENCE
    name: "Controller Mode Adherence"
    description: "All agents MUST resolve the active operational profile from CONTROLER.yaml before executing any pipeline task and strictly follow the action_gate constraints."
    enforced: true
```
