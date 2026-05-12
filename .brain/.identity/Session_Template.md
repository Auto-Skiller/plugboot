# 📑 Session and Goal Template

This template defines the required structure for creating sessions and goals in `CONTROLER.yaml` and the corresponding physical files in `.runtime/.mission_board/`.

## 1. CONTROLER.yaml Entry Template

```yaml
  - session_name: [ENTITY]-[ROLE]-[SUBJECT] (e.g., SES-EXECUTION-SCALER)
    details:
      agent: '[Agent Name]'
      started_at: 'YYYY-MM-DDTHH:MM:SS'
      summary: 'Brief description of the session.'
      status: 'active' # active, template, history
    goals:
    - goal_name: [SUBJECT]-[ROLE] (e.g., SCALER-ARCHITECTURE-DESIGN)
      details: 'Description of what this goal aims to achieve.'
      status: 'pending ⏳' # pending ⏳, in-progress 🔄, done ✅
      tasks:
      - Task 1 to complete
      - Task 2 to complete
      tracking: 'Updates and notes on progress go here.'
      artifacts:
      - path/to/generated/artifact.md
```

## 2. Physical File Templates

### Session File (`.runtime/.mission_board/[SESSION_NAME]/[SESSION_NAME].yaml`)
```yaml
# 🚀 SESSION: [SESSION_NAME]

metadata:
  name: [SESSION_NAME]
  description: 'Brief description of the session purpose.'
  status: active
  started_at: 'YYYY-MM-DDTHH:MM:SS'
  agent: '[Agent Name]'

execution:
  active_goals:
    - [GOAL_NAME_1]
    - [GOAL_NAME_2]
  summary: 'High-level summary of what this session is doing.'
```

### Goal File (`.runtime/.mission_board/[SESSION_NAME]/[GOAL_NAME]/[GOAL_NAME].yaml`)
```yaml
# 🎯 GOAL: [GOAL_NAME]

metadata:
  name: [GOAL_NAME]
  session: [SESSION_NAME]
  description: 'Detailed description of what this goal aims to achieve.'
  status: pending ⏳  # pending ⏳, active 🟢, in-progress 🔄, done ✅
  priority: medium   # low, medium, high

execution:
  plan:
    tasks:
      - Task 1 to complete
      - Task 2 to complete
    checkpoints:
      - Phase/Checkpoint name [STATUS]
  state:
    tracking: 'Live updates and notes on progress go here. Be detailed.'
    artifacts:
      - path/to/generated/artifact.md
```

> [!IMPORTANT]
> **Goal files are living documents.** As work progresses, update `execution.state.tracking` with current status, add completed checkpoints, and link newly generated artifacts. An empty goal file is only acceptable at creation — it must grow as the goal progresses.
