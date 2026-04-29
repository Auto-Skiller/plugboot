
---

## Orchestration

### Agent Execution Flow
Every agent operation follows this exact sequence:

**Step 1 — Read `index.yaml`**
Identify the required **domains** and **departments** for the current task, and locate the `system_brain` paths.

**Step 2 — Load Global Context**
Load the global system index (`_agents_brain/system_brain.json`).
This reveals workspace-wide constraints (`_experience`), templates (`_formats`), scripts (`_tools`), and global data (`_context`) that apply universally across all departments.

**Step 3 — Load Agent Personas**
For each identified department, load its agent file (`agents/{domain}/{dept}.md`).
This establishes the agent's role, responsibilities, and resource map for the task.

**Step 4 — Read Skill Indexes**
Load the department's skill index (`skills/{domain}/{dept}/{dept}.json`).
This reveals all available department-specific resources inside and optional skills.

**Step 5 — Load Resource Files for Context**
From the global system index AND the department skill index, read the relevant resource files:
- `_experience/` — constraints and mandatory protocols to follow
- `_context/` — facts, blueprints, and reference data
- `_playbooks/` — step-by-step processes for the task type
- `_formats/` — output formats and boilerplates

**Step 6 — Load & Execute Skills**
If the task requires a specific skill, navigate to `skills/{domain}/{dept}/{skill-name}/` and load its `SKILL.md` for specialized execution instructions.
Complete the task, then update `board.yaml` with the outcome and next transition.

### Orchestration Loop
Every turn, the agent must run through this loop before taking action:

1. **Detect** — Read `session_status` in `board.yaml` to identify the active mode and current focus.
2. **Consult** — Check `active_goals` and `user_notes_to_agent` to see what is in progress or newly requested.
3. **Execute** — Work on sub-tasks following the Agent Execution Flow above. If a failure occurs, document the blocker in the goal's `notes` field.
4. **Transition** — When a goal is finished:
   - Move it to `completed_goals`.
   - Add a summary of strategies, approach shifts, and rules learned during execution to the `notes`.

### Agentic Cognitive Loop
To maintain efficiency and focus, agents must differentiate how they use `agentic` capabilities (as defined in `index.yaml`):

#### 🔄 Core/Periodic (Always On)
Agents must loop through these instinctively during every operation, task transition, and state update:
- **Analysis**: Continually perceive current state, `board.yaml`, context, and user input.
- **Planning**: Determine or adjust the immediate next steps before taking action.
- **Research**: Resolve knowledge gaps, find external information, or read relevant docs.
- **Brainstorming**: Generate ideas and explore multiple approaches whenever a path isn't clear.
- **Evaluation**: Assess outcomes of executed steps (e.g., Did it work? Is the quality high?).
- **Benchmarking**: Measure, compare, and optimize choices to ensure the best path is taken.
- **Documentation**: Produce all written knowledge artifacts (user guides, tutorials, READMEs, API specs, etc.).