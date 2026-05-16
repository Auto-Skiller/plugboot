# 🎯 Milestones Sync Protocol (Agentic OS v5)
> **Schema Version:** 1.0 | Canonical source of truth: `.meta_brain/milestones/` → `milestones.yaml`

**Role:** Synchronize the active mission state (Sessions and Goals) from the physical mission board into the `milestones.yaml` router and provide summaries for `CONTROLER.yaml`.

## 📦 File Schemas (Enforced)

### 1. SESSION.yaml
Located in `.meta_brain/milestones/[SESSION_NAME]/SESSION.yaml`
```yaml
metadata:
  name: string
  description: string
  status: active | paused | completed | archived
  started_at: timestamp
  agent: string
  priority: LOW | MEDIUM | HIGH | CRITICAL
  pipeline: string             # e.g., SCALER, HUSTLER

execution:
  summary: string              # Live summary of the session work
  active_goals: [string]       # List of goal folder names
```

### 2. GOAL.yaml
Located in `.meta_brain/milestones/[SESSION_NAME]/[GOAL_NAME]/GOAL.yaml`
```yaml
metadata:
  name: string
  session: string              # Parent session name
  description: string
  status: pending | in-progress | blocked | done
  priority: LOW | MEDIUM | HIGH | CRITICAL

execution:
  plan:
    tasks: [string | dict]     # List of tasks with status
  state:
    progress_percentage: string # Auto-calculated (0-100%)
    tracking: string           # Live updates and notes
    artifacts: [string]        # Relative paths to deliverables
```

---

## ⚙️ Execution Steps (Protocol)

### 1. Session & Goal Discovery
- Scan `.meta_brain/milestones/` for session folders.
- For each session, validate `SESSION.yaml` exists.
- Scan for goal folders (e.g., `GOAL-OPTIMIZE-SYNC`).

### 2. State Extraction & Validation
- **Status:** Validate status against allowed vocabularies.
- **Progress:** Recalculate `progress_percentage` for goals by scanning the tasks.
- **Artifacts:** Collect all file paths listed in the `artifacts` array.

### 3. Naming Enforcement (Zero-Drift Law)
- **Sessions:** Must start with `SES-` and follow `[ENTITY]-[ROLE]-[SUBJECT]`.
- **Goals:** Must start with `GOAL-` and follow `[SUBJECT]-[ROLE]`.
- **Numeric Suffixes:** Prohibited (e.g., `-001`, `01` are flagged as violations).
- **Lowercase:** Systemic YAML files must be named `SESSION.yaml` and `GOAL.yaml` (Uppercase for entrypoints, but the folder names must be clean).

### 4. Health Computation
- **Blocked Penalty:** -10% health for every blocked goal.
- Output `overall_health` to the router index.

### 4. Auto-Archive (Fresh Start Law)
- If a session is `completed` AND all goals are `done/archived`:
  - Move folder to `.milestones_archive/` with a timestamp.
  - Append a `SESSION_ARCHIVED` event to `milestones_history.yaml`.
