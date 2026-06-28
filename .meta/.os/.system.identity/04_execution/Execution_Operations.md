---
metadata:
  name: execution-operations
  class: system/identity
  type: identity
  version: '1.0'
  schema_version: '1.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-06-27T00:00:00'
credentials:
  description: Operational guide for navigating, auditing, and executing work within
    toolboxes, projects, pipelines, and their respective milestones.
  when_to_use: Consult when deciding where to execute work, extending toolboxes, reading
    project routing schemas, or managing milestones and sessions.
  contains: execution_ops, task_management
---
priority: reference
contains: execution_ops, task_management, milestones, toolboxes, projects
---

# 🧰 Execution Operations

---

## Part 1: Toolboxes

### 1. Domain Routing
All toolboxes live under `.meta/toolboxes/`. The `.db/toolboxes.board.yaml` file is the index.

| Domain | Physical Path | DB Index Path |
|--------|--------------|---------------|
| **Agentic** | `.meta/toolboxes/agentic_toolboxes/` | `.db/toolboxes.rollups/agentic_toolboxes.rollups/` |
| **Business** | `.meta/toolboxes/business_toolboxes/` | `.db/toolboxes.rollups/business_toolboxes.rollups/` |
| **Engineering** | `.meta/toolboxes/engineering_toolboxes/` | `.db/toolboxes.rollups/engineering_toolboxes.rollups/` |
| **Life** | `.meta/toolboxes/life_toolboxes/` | `.db/toolboxes.rollups/life_toolboxes.rollups/` |
| **Studio** | `.meta/toolboxes/studio_toolboxes/` | `.db/toolboxes.rollups/studio_toolboxes.rollups/` |

### 2. Agent & Skill Schema
Agents and Skills are distinct. Agents define personas and workflows; Skills define discrete actions and tools.

- **Agents:** Sit under `.meta/toolboxes/<domain>/<toolbox>/agents/<AGENT_NAME>.md`
- **Skills:** Sit under `.meta/toolboxes/<domain>/<toolbox>/skills/<SKILL_NAME>/SKILL.md`

**SKILL.md Required Frontmatter:**
- `name`, `description`, `version`, `maturity`
- `triggers`: List of actions that invoke this skill.
- `inputs` & `outputs`: Data contract.

**AGENT.md Required Frontmatter:**
- `name`, `specialization`, `parent_toolbox`
- `capabilities`, `required_skills`

### 3. Capability Audit & Health
- The Python sync daemon (`.infra/engine.py`) reads the contents of `agents/` and `skills/` within each toolbox to compute `agent_count`, `skill_count`, `agent_names`, and `skill_names` in each toolbox's DB file.
- **Frontmatter Extraction**: The daemon extracts the rich YAML frontmatter (capabilities, triggers, inputs) from the markdown files and injects it directly into the DB.
- Agents should NOT hand-edit counts, names, or frontmatters in the DB — these are OUT fields written by the daemon.
- Cross-toolbox relationships are tracked in `.db/toolboxes.board.yaml` under `dependency_graph`. Add new edges when building agents that rely on multiple toolboxes.

### 4. Extending Toolboxes
To add a new capability:
1. Create the `skills/` files (`SKILL.md` + script) inside the appropriate `.meta/toolboxes/` subfolder. Ensure they include rich YAML frontmatter.
2. Create the `agents/` files (`<AGENT_NAME>.md`) with their required frontmatter.
3. The Python sync daemon will automatically detect, extract the frontmatter, and update the toolbox DB file on the next cycle.

---

## Part 2: Projects & Pipelines

### 5. Routing Instructions
- **Read First:** Read the projects DB (`.db/project_*.board.yaml`) before touching any file under `project_*/` to understand the project's stack and entry point.
- **Registration:** When creating a new project, add its entry to `config.yaml` under `modes.projects`.
- **No Guessing:** Never guess a project's stack or structure — read its DB entry first.

### 6. Project Structure Convention
Each project lives under `<project-folder>/` and MUST have:
- `README.md` — project overview, stack, and entry point.
- Dependencies manifest (`requirements.txt`, `package.json`, etc.).
- Local environment (`.venv`, `node_modules`). **Never use global OS installs.**

---

## Part 3: Milestones & Sessions

### 7. Separated Milestone Systems
We utilize distinct milestone systems to track execution locally within each environment:
- **Core OS:** `.meta/milestones/`
- **Scaler Pipeline:** `.meta/milestones/pipeline_scaler.milestones/`
- **Hustler Pipeline:** `.meta/milestones/pipeline_hustler.milestones/`
- **Projects:** `.meta/milestones/project_*.milestones/`

### 8. Sessions vs Milestones
A Milestone can have multiple session files, and each session can have multiple goals.
Each session and its goals are contained entirely within one YAML file.
- **Session & Goal Naming:** Named directly by their functional role (e.g., `OS-DEV-DASHBOARD`, `UPDATE-SCHEMAS`). `SES-` and `GOAL-` prefixes, as well as numeric suffixes (`-001`), are **forbidden**.

### 9. Session File Layout
Each session lives as `<SESSION_NAME>/<SESSION_NAME>.yaml` and contains:
- `metadata:` — name, pipeline, started_at
- `metadata:` — sessions array with goals (controlled via `(in)` / OUT tags)
- `[SESSION_NAME]:` — execution content block (tasks, tracking, artifacts, instructions)

### 10. Agent Execution Flow (Per Task)
1. **Boot**: Read `AGENTS.md` for boot sequence.
2. **State**: Read `.db/.system.board.yaml` to resolve current mode.
3. **Task Resolution**: Read prompt or active goals.
4. **Context Scan**: Read relevant `.db/` files and `.meta/.os/.system.identity/` files.
5. **Goal Mgmt**: Create or locate the session/goal folder.
6. **Context Deep**: Analyze goal history and prior tracking notes.
7. **Planning**: Formulate execution plan using core toolboxes.
8. **Execute**: Run tools, produce artifacts.
9. **Log**: Update `tracking`, `artifacts`, and `last_progress_at` in session YAML.
10. **Sync**: Run the Python Daemon (`.infra/engine.py --once`) to auto-propagate strict `metadata` changes upward to `.db/.system.board.yaml` without causing bloat.

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

## 13. Milestone ↔ Board Communication Protocol

### 13.1 IN (Board → Milestone)
The board pushes milestones to sessions via:
- `runtime.milestones_in` — list of milestone session YAML files the board monitors
- `milestones.[SESSION_NAME]` — per-session status block on the board (status, progress)

### 13.2 OUT (Milestone → Board)
Each milestone session reports back via its `communication:` field:
- `board_in` — what the board sends to the session (metrics, review queue)
- `board_out` — what the session sends to the board (milestone updates, events)
- `ledger_in` — ledger files the session reads from
- `ledger_out` — ledger files the session writes to

### 13.3 User Control Flow (Board as Dashboard)
The user can control the entire pipeline from the board:
1. **View Status** — board `state.metrics` shows aggregated ledger counts
2. **Review Items** — board `runtime.review_queue` shows pending user actions
3. **Approve/Reject** — user updates milestone status on board
4. **Monitor Progress** — board `milestones` shows per-session progress
5. **View Events** — board `state.recent_events` shows recent activity
6. **Check Health** — board `hub.messages` shows errors/warnings

### 13.4 Milestone Session Requirements
Every milestone session YAML MUST have:
- `metadata` — name, pipeline, version, freshness
- `sessions` — array with goals and status
- `communication` — IN/OUT declarations for board and ledger
- `artifacts` — list of physical files tracked by this session
