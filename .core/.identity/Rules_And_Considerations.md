# 📜 Rules and Considerations

1. **The Brain is for Routing Only.**
   Never store context, execution files, or capabilities in `.brain/`. It strictly holds `.router.yaml` maps and the `.sync_engine/` that generates them.
   
2. **The Core is Always-On.**
   The `.core/` directory holds your foundational capabilities (`toolbox_library/`), identity (`.identity/`), and operational tracking (`mission_board/`). It does not hold project-specific code.

3. **Pipelines and Projects are for Execution.**
   All executable code, outputs, and deliverables belong in `pipelines/` or `projects/`. Their operational instructions (runbooks, trackers) must be hidden in localized `.meta/` folders within the execution directory.

4. **Strict Session-to-Goal Hierarchy.**
   There are no free-floating goals. Every goal must be nested inside a Session. This applies to both the `CONTROLER.yaml` state file and the physical `.core/mission_board/` directories.

5. **Engine Automation.**
   Do not manually update the `.router.yaml` mappings unless necessary. Use the `.sync_engine/` scripts to automatically parse and catalog `.core/` and the workspaces.
