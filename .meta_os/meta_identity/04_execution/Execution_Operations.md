---
metadata:
  purpose: "Operational guide for navigating, auditing, and executing work within toolboxes, projects, pipelines, and their respective milestones."
  when_to_use: "Consult when deciding where to execute work, extending toolboxes, reading project routing schemas, or managing milestones and sessions."
---

# 🧰 Execution Operations

---

## Part 1: Toolboxes

### 1. Domain Routing
All toolboxes live under `.toolboxes/`. The `.meta_os/meta_db/.toolboxes.yaml` file is the index.

| Domain | Physical Path | DB Index Path |
|--------|--------------|---------------|
| **Core** | `.toolboxes/.core_toolboxes/` | `.meta_os/meta_db/toolboxes_db/.core_toolboxes_db/` |
| **Business** | `.toolboxes/business_toolboxes/` | `.meta_os/meta_db/toolboxes_db/business_toolboxes_db/` |
| **Engineering** | `.toolboxes/engineering_toolboxes/` | `.meta_os/meta_db/toolboxes_db/engineering_toolboxes_db/` |
| **Life** | `.toolboxes/life_toolboxes/` | `.meta_os/meta_db/toolboxes_db/life_toolboxes_db/` |
| **Studio** | `.toolboxes/studio_toolboxes/` | `.meta_os/meta_db/toolboxes_db/studio_toolboxes_db/` |

### 2. Agent & Skill Schema
Agents and Skills are distinct. Agents define personas and workflows; Skills define discrete actions and tools.

- **Agents:** Sit under `.toolboxes/<domain>/<toolbox>/agents/<AGENT_NAME>/AGENT.md`
- **Skills:** Sit under `.toolboxes/<domain>/<toolbox>/skills/<SKILL_NAME>/SKILL.md`

**SKILL.md Required Frontmatter:**
- `name`, `description`, `version`, `maturity`
- `triggers`: List of actions that invoke this skill.
- `inputs` & `outputs`: Data contract.

**AGENT.md Required Frontmatter:**
- `name`, `specialization`, `parent_toolbox`
- `capabilities`, `required_skills`

### 3. Capability Audit & Health
- The Python sync daemon (`meta_sync.py`) reads the contents of `agents/` and `skills/` within each toolbox to compute `agent_count`, `skill_count`, `agent_names`, and `skill_names` in each toolbox's DB file.
- **Frontmatter Extraction**: The daemon extracts the rich YAML frontmatter (capabilities, triggers, inputs) from the markdown files and injects it directly into the DB.
- Agents should NOT hand-edit counts, names, or frontmatters in the DB — these are OUT fields written by the daemon.
- Cross-toolbox relationships are tracked in `.meta_os/meta_db/.toolboxes.yaml` under `dependency_graph`. Add new edges when building agents that rely on multiple toolboxes.

### 4. Extending Toolboxes
To add a new capability:
1. Create the `skills/` files (`SKILL.md` + script) inside the appropriate `.toolboxes/` subfolder. Ensure they include rich YAML frontmatter.
2. Create the `agents/` files (`AGENT.md`) with their required frontmatter.
3. The Python sync daemon will automatically detect, extract the frontmatter, and update the toolbox DB file on the next cycle.

---

## Part 2: Projects & Pipelines

### 5. Routing Instructions
- **Read First:** Read the projects DB (`.meta_os/meta_db/projects_os.yaml`) before touching any file under `projects/` to understand the project's stack and entry point.
- **Registration:** When creating a new project, add its entry to `.meta_os/meta_db/projects_os.yaml` under `metadata.projects`.
- **No Guessing:** Never guess a project's stack or structure — read its DB entry first.

### 6. Project Structure Convention
Each project lives under `projects/<project-folder>/` and MUST have:
- `README.md` — project overview, stack, and entry point.
- Dependencies manifest (`requirements.txt`, `package.json`, etc.).
- Local environment (`.venv`, `node_modules`). **Never use global OS installs.**

---

## Part 3: Milestones & Sessions

### 7. Separated Milestone Systems
We utilize distinct milestone systems to track execution locally within each environment:
- **Core OS:** `.meta_os/meta_milestones/`
- **Scaler Pipeline:** `pipeline_scaler/.scaler_milestones/`
- **Hustler Pipeline:** `pipeline_hustler/.hustler_milestones/`
- **Projects:** `projects/.projects_milestones/`

### 8. Sessions vs Milestones
A Milestone can have multiple session files, and each session can have multiple goals.
Each session and its goals are contained entirely within one YAML file.
- **Session & Goal Naming:** Named directly by their functional role (e.g., `OS-DEV-DASHBOARD`, `UPDATE-SCHEMAS`). `SES-` and `GOAL-` prefixes, as well as numeric suffixes (`-001`), are **forbidden**.

### 9. Session File Layout
Each session lives as `<SESSION_NAME>/<SESSION_NAME>.yaml` and contains:
- `system_metadata:` — name, pipeline, started_at
- `metadata:` — sessions array with goals (controlled via `(in)` / OUT tags)
- `[SESSION_NAME]:` — execution content block (tasks, tracking, artifacts, instructions)

### 10. Agent Execution Flow (Per Task)
1. **Boot**: Read `AGENTS.md` for boot sequence.
2. **State**: Read `CONTROLER.yaml` to resolve current mode.
3. **Task Resolution**: Read prompt or active goals.
4. **Context Scan**: Read relevant `.meta_os/meta_db/` files and `.meta_os/meta_identity/` files.
5. **Goal Mgmt**: Create or locate the session/goal folder.
6. **Context Deep**: Analyze goal history and prior tracking notes.
7. **Planning**: Formulate execution plan using core toolboxes.
8. **Execute**: Run tools, produce artifacts.
9. **Log**: Update `tracking`, `artifacts`, and `last_progress_at` in session YAML.
10. **Sync**: Run the Python Daemon (`meta_sync.py`) to auto-propagate strict `metadata` changes upward to `CONTROLER.yaml` without causing bloat.

### 11. Lifecycle Rules
- **Auto-Promote:** When every goal in a session is `done` or `archived`, the daemon sets `status: completed` automatically.
- **Auto-Archive:** Completed sessions are moved to the domain's `.archived_milestones/` folder automatically.
- **Persistent Milestones:** **Do NOT Auto-Archive persistent milestones.** Persistent ones stay active as long-running hubs.
- **Persistence Exhaustion:** When `max_rounds` is reached, status moves to `paused`. Never use out-of-vocabulary statuses.
- **Health Computation:** The daemon subtracts health per blocked or stale-pending goal and writes the result to the parent DB's `health_history`.

### 12. Session & Milestone Lifecycle Events
Events written to `system.hub.recent_events` or pipeline hubs regarding milestones:

| Event | Emitted by | Payload (minimum) | Consumer |
|---|---|---|---|
| `SESSION_OPENED` | sync daemon on new session | `session_id`, `opened_at`, `pipeline` | `system.hub.recent_events` |
| `SESSION_CLOSED` | sync daemon when all goals done | `session_id`, `closed_at`, `goal_count` | `system.hub.recent_events` |
| `GOAL_OPENED` | sync daemon on new goal | `session_id`, `goal_id`, `opened_at` | `system.hub.recent_events` |
| `GOAL_PROGRESSED` | agent updating goal progress | `goal_id`, `from_progress`, `to_progress`, `at` | `system.hub.recent_events` |
| `GOAL_COMPLETED` | sync daemon when `status: done` | `goal_id`, `completed_at`, `artifacts[]` | `system.hub.recent_events` |
| `MILESTONE_ARCHIVED` | sync daemon on session archival | `archived_path`, `archived_at`, `reason` | `system.hub.recent_events` |
