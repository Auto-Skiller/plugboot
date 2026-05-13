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

8. **Documentation Evolution & Logic Preservation.**
   No existing operational logic should be deleted if it does not conflict with new logic. When introducing complex hierarchies or advanced models, foundational logic must be **modernized** (integrated and refined) rather than **replaced** (erased). Preservation of foundational "Step-by-Step" instructions is mandatory to ensure reliability even when high-level synthesis is applied.
