
## Orchestration

### Agent Execution Flow
Every agent operation follows this exact sequence:

**Step 1 — Read `INDEX.json`**
Identify the required **domains** and **departments** for the current task, and locate the root `system_brain` paths.

**Step 2 — Load Global Context**
Load the global system index ([`INDEX.json`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/INDEX.json)).
This reveals workspace-wide constraints (`_experience`), templates (`_formats`), scripts (`_scripts`), and global data (`_context`) that apply universally across all departments.

**Step 3 — Load Agent Personas**
For each identified department, load its agent file (`_departments/{domain}/{dept}/{dept}.md`).
This establishes the agent's role, responsibilities, and resource map for the task.

**Step 4 — Read Resource Indexes**
Load the department's resource index (`_departments/{domain}/{dept}/{dept}.json`).
This reveals all available department-specific resources (context, experience, playbooks, tools, scripts).

**Step 5 — Load Resource Files for Context**
From the global system index AND the department resource index, read the relevant resource files:
- `_experience/` — constraints and mandatory protocols to follow.
- `_context/` — facts, blueprints, and reference data.
- `_playbooks/` — step-by-step processes for the task type.
- `_formats/` — output formats and boilerplates.
- `_scripts/` or `_tools/` — utilities and automation scripts.

**Step 6 — Execute & Update**
Complete the task following the instructions in the loaded resources, then update [`BOARD.yaml`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/BOARD.yaml) with the outcome and next transition.

### Orchestration Loop
Every turn, the agent must run through this loop before taking action:

1. **Detect** — Read `session_status` in `BOARD.yaml` to identify the active mode and current focus.
2. **Consult** — Check `active_goals` and `user_notes_to_agent` to see what is in progress or newly requested.
3. **Execute** — Work on sub-tasks following the Agent Execution Flow above. If a failure occurs, document the blocker in the goal's `notes` field.
4. **Transition** — When a goal is finished:
   - Move it to `completed_goals`.
   - Add a summary of strategies, approach shifts, and rules learned during execution to the `notes`.

