# 📜 Rules and Considerations (v5)

1. **The Brain is for Logic & Routing Only.**
   Never store execution files or transient outputs in `.meta_brain/`. It strictly holds `meta_router.yaml`, the `.meta_sync/` engine, `meta_identity/`, `toolboxes/`, and `milestones/`.
   
2. **The Runtime is for Infrastructure.**
   The `.meta_runtime/` directory holds your master `venv/`, `auth/` cookies, and `.meta_scratch/`.

3. **Execution Workspaces.**
   All executable code belongs in `_pipelines/` or `projects/`. Their operational instructions (runbooks, trackers) live inside hidden localized context folders (e.g., `.scaler_brain/`) within that execution space.

4. **Strict Session-to-Goal Hierarchy.**
   Every goal must be nested inside a Session. This applies to both the `CONTROLER.yaml` state file and the physical `.meta_brain/milestones/` directories.

5. **Naming — Pattern-First Inheritance.**
   When you create a new file, folder, session, or goal, **look at its siblings first** and mirror the closest matching pattern (casing, prefix, separator, pluralisation). Walk this list in order and stop at the first one that gives a clear answer:
   1. **Sibling lookup** — match the style of items in the same folder.
   2. **Parent declaration** — honour any `naming_pattern` or `routing_instructions` field declared by the parent router.
   3. **Domain philosophy** (fallback only) — see the machine-readable block in §11.
   
   The only **hard anti-patterns** (flagged by the sync engines):
   - Numeric suffix on a session or goal (`-001`, `-3`). Sessions and goals are named by their **functional role**, never by a counter. Pattern: `SES-[ENTITY]-[ROLE]-[SUBJECT]` for sessions, `GOAL-[NAME]` for goals.
   - Goal folder missing the `GOAL-` prefix; session folder missing the `SES-` prefix.
   - Names that collide with existing router paths (causes silent path drift).
   
   Everything else is style guidance, not a structural law. Patterns evolve faster than rules — mirror what already works and let the sync engines flag the few things that genuinely break automation.

6. **Engine Automation.**
   Do not manually update the `.yaml` mappings. Use `meta_sync.py` to automatically parse and catalog the workspaces.

7. **True Portability Execution.**
   NEVER use global OS packages or call interpreter binaries directly (`.venv\Scripts\python.exe` / `.venv/bin/python`). Execute tools through the cross-platform launcher: `meta_run.ps1 -m [tool]` on Windows, `meta_run.sh -m [tool]` on Linux/macOS. The launcher auto-bootstraps `.venv` on first boot and forwards args to the correct interpreter.

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

---

## 12. Naming — Domain Philosophy (Fallback Defaults)

Used only when sibling lookup and parent declarations give no clear answer.

```yaml
naming:
  philosophy: "pattern-first"
  fallback_defaults:
    substrate_prefix: "."        # e.g., .meta_brain/, .scaler_brain/  — immutable infrastructure
    workspace_prefix: "_"        # e.g., _pipelines/, _scaler/          — active execution
    collection_prefix: ""        # e.g., projects/, toolboxes/          — collections
    code_separator: "snake_case" # for things parsed by code or YAML keys
    human_separator: "kebab-case" # for human-facing slugs (GitHub repos, web paths)
    doc_casing: "Title-Case"     # only for human-facing markdown docs (Persona.md)
    contract_suffix: ".engine | .catalog.yaml"  # when the suffix communicates a strict execution contract
  hard_anti_patterns:
    - "Numeric suffix on sessions or goals (-001, -3, etc.)"
    - "Goal folders missing the 'GOAL-' prefix"
    - "Session folders missing the 'SES-' prefix"
    - "Names that collide with existing router paths"
  detected_by:
    - milestones_sync.py        # session/goal anti-patterns
    - meta_sync.py --validate   # router collisions
```

