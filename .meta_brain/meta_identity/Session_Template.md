# 📑 Session and Goal Template (v5)

This template defines the required structure for creating sessions and goals in `CONTROLER.yaml` and the corresponding physical files in `.meta_brain/milestones/`.

## 1. CONTROLER.yaml Entry Template

```yaml
  - session_name: [ENTITY]-[ROLE]-[SUBJECT] (e.g., SES-CORE-ARCHITECT-BRAIN)
    session_status: active
    agent: '[Agent Name]'
    started_at: 'YYYY-MM-DDTHH:MM:SS'
    session_summary: 'Brief description of the session.'
    goals:
    - goal_name: [SUBJECT]-[ROLE] (e.g., SYNC-ENFORCEMENT)
      goal_status: pending
      goal_summary: 'Description of what this goal aims to achieve.'
      tasks_tracking: 'Updates and notes on progress go here.'
      artifacts:
      - path/to/generated/artifact.md
```

## 2. Physical File Templates

### Session File (`.meta_brain/milestones/[SESSION_NAME]/SESSION.yaml`)
```yaml
# 🚀 SESSION: [SESSION_NAME]


metadata:
  name: [SESSION_NAME]
  description: 'Brief description of the session purpose.'
  status: active
  started_at: 'YYYY-MM-DDTHH:MM:SS'
  agent: '[Agent Name]'
  priority: MEDIUM
  pipeline: [SCALER|HUSTLER|CORE]
  persistence:
    enabled: true
    max_rounds: unlimited # or a number like 3
    current_round: 1


execution:
  summary: 'High-level summary of what this session is doing.'
  active_goals:
    - [GOAL_NAME_1]
    - [GOAL_NAME_2]
```

### Goal File (`.meta_brain/milestones/[SESSION_NAME]/[GOAL_NAME]/GOAL.yaml`)
```yaml
# 🎯 GOAL: [GOAL_NAME]

metadata:
  name: [GOAL_NAME]
  session: [SESSION_NAME]
  description: 'Detailed description of what this goal aims to achieve.'
  status: pending  # pending, in-progress, blocked, done
  priority: MEDIUM   # LOW, MEDIUM, HIGH, CRITICAL

execution:
  plan:
    tasks:
      - Task 1 to complete
      - Task 2 to complete
  state:
    progress_percentage: '0%' # Auto-calculated by sync engine
    tracking: 'Live updates and notes on progress go here. Be detailed.'
    artifacts:
      - path/to/generated/artifact.md
```

> [!IMPORTANT]
> **Goal files are living documents.** As work progresses, update `execution.state.tracking` with current status, add completed tasks, and link newly generated artifacts. The **Sync Engine v5** will automatically calculate progress and health based on these files.
