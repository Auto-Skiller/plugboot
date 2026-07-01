# 🧰 Execution Operations

---

## Part 1: Toolboxes

### 1. Domain Routing
Toolboxes are blueprints (capabilities) that live in either:
- **Shared Library:** `_shared/.shared-toolboxes/` (available to all entities)
- **Local Entity:** `.meta/.toolboxes/` (specific to the system or a project)

They are categorized into 5 domains: Agentic, Business, Engineering, Life, and Studio.

### 2. Agent & Skill Schema
Agents and Skills are distinct. Agents define personas and workflows; Skills define discrete actions and tools.
- **Agents:** Sit under `.../toolboxes/<domain>/<toolbox>/agents/<AGENT_NAME>.md`
- **Skills:** Sit under `.../toolboxes/<domain>/<toolbox>/skills/<SKILL_NAME>/SKILL.md`

**NO FRONTMATTER REQUIRED:**
Agent, skill, and reference files are plain markdown. Do NOT use YAML frontmatter. All metadata (description, when_to_use, triggers, inputs, outputs) is defined and presented in the entity's `board.yaml`. The engine will read the markdown files and populate the index with paths, but the board holds the control metadata.

### 3. Capability Audit & Health
- The engine (`.infra/backend/engine.py`) reads the contents of `agents/` and `skills/` within each toolbox.
- It maps their physical paths in the entity's `index.yaml`.
- It aggregates counts (total active toolboxes, agents, skills) into the `board.yaml`.
- The user controls which toolboxes are active via the `board.yaml` control plane.

### 4. Extending Toolboxes
To add a new capability:
1. Create the `skills/` or `agents/` markdown files inside the appropriate toolbox folder.
2. Ensure you document their metadata (description, triggers, etc.) in the relevant `board.yaml` file so the user can activate them.
3. The engine will detect the new files and index them automatically.

---

## Part 2: Projects & Pipelines

### 5. Routing Instructions
- **Read First:** Read the entity's `board.yaml` (Control) and `index.yaml` (Paths) before touching any files.
- **No Guessing:** Never guess a project's stack or structure — read its index first.

### 6. Pipeline Execution Model
Pipelines are **definitions** (blueprints), not execution folders. They live in:
- `_shared/.shared-pipelines/`
- `<entity>/.meta/.pipelines/`

When an entity (system or project) **uses** a pipeline, execution happens inside that entity's own `pipelines_runtime/` folder.
- Example: The system uses Scaler → executes in `_system/.system-pipelines_runtime/`

---

## Part 3: Missions & Tasks

### 7. Mission Routing
Missions dictate the execution goals for an entity. They live in the entity's `.missions/` folder.
- **Core System:** `_system/.system-missions/`
- **Projects:** `<project_name>/.project_name-missions/`

The **Control Plane** for missions is the `board.yaml`. The board dictates the mission status, goals, and task progress. 

### 8. Mission Control (Board vs Disk)
- **Board:** Defines the objectives, task lists, priority, and progress metrics.
- **Disk (`.missions/`):** Contains any large, persistent session files, research, or complex instructions associated with the mission.

### 9. Agent Execution Flow (Per Task)
1. **Boot**: Read `AGENTS.md` (which instructs you to read `index.yaml`, identity laws, and boards).
2. **State**: Read `system-board.yaml` or `<project>-board.yaml` to resolve current modes, active missions, and active pipelines.
3. **Task Resolution**: Read the prompt or the highest priority active task in the board.
4. **Planning**: Formulate execution plan using available active toolboxes.
5. **Execute**: Run tools, produce artifacts in `pipelines_runtime/` or `scratch/`.
6. **Log & Sync**: Update task status in the `board.yaml`. The Python Daemon will auto-compute rollups and metrics.

### 10. Lifecycle Rules
- Missions are advanced via the `board.yaml`.
- Change task status to `in-progress`, `blocked`, or `completed`.
- Update `last_progress_at` when substantive work is done.
