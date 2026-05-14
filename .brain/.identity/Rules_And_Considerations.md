# 📜 Rules and Considerations

1. **The Brain is for Logic & Routing Only.**
   Never store context, execution files, or transient state in `.brain/`. It strictly holds `.router.yaml` maps, the `.sync_engine/`, system identity, and the execution muscles (`.toolbox_library/`).
   
2. **The Runtime is for State.**
   The `.runtime/` directory holds your dynamic execution memory. It tracks your `.mission_board/` sessions and your active authenticated cookies (`.notebooklm/`).

3. **Pipelines and Projects are for Execution.**
   All executable code, outputs, and deliverables belong in `pipelines/` or `projects/`. Their operational instructions (runbooks, trackers) must be hidden in localized `.meta/` folders within the execution directory.

4. **Strict Session-to-Goal Hierarchy.**
   There are no free-floating goals. Every goal must be nested inside a Session. This applies to both the `CONTROLER.yaml` state file and the physical `.runtime/.mission_board/` directories.

5. **Role-Based Naming.**
   Sessions and goals MUST be named by their **actual functional role** or **objective**. Numeric suffixes (e.g., `-001`, `003`) are strictly prohibited to ensure semantic clarity.

6. **Engine Automation.**
   Do not manually update the `.router.yaml` mappings unless necessary. Use the `.sync_engine/` scripts to automatically parse and catalog the workspaces.

7. **True Portability Execution.**
   NEVER use global OS packages. NEVER use `Activate.ps1`. You must execute tools using the centralized workspace engine (e.g., `.\.venv\Scripts\python.exe -m`). The `.venv`, `.env`, and caches are intentionally pushed to Git for 100% clone-and-play teleportation.

8. **Documentation Evolution & Logic Preservation Law.**
   When `evolution_mode` is active, the system undergoes recursive self-improvement. **Strict Non-Loss Rule:** No existing operational logic should be deleted if it does not conflict with new logic. Foundational "Step-by-Step" instructions must be modernized (integrated and refined) rather than replaced (erased). 
   - **Conflict Handling:** Direct conflicts favor the newest logic. 
   - **Adaptation:** Small conflicts should result in the adaptation of old logic to accommodate the new, preserving both where possible.

9. **Automatic Evolution Protocol.**
   Every user prompt is an opportunity for system evolution. If a prompt reveals a new preference, constraint, or logic, the agent MUST update the relevant `.identity` or pipeline runbook files immediately to codify this change for future sessions.
10. **Structural vs. Logic Evolution.**
    The system must distinguish between auditing logic and changing structures. If an operation is purely structural (e.g., reorganizing folders, moving runbooks), the system must explicitly ensure that **no old logic is lost**, maintaining total functional parity while adapting to the new architecture.

11. **Zero-Drift Audit & Refactor Law.**
    When auditing or refactoring a file, NEVER rely on your internal conversation context or previously cached data. You must STRICTLY read the target file's current content from the disk immediately before making any changes. This is mandatory because the user (or other automated processes) may perform massive simultaneous changes that are not reflected in your context. Failing to read the live state will result in structural corruption and lost data.
