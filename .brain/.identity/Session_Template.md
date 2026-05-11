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
    - goal_name: [SUBJECT]-[ROLE] (e.g., SCALER-EXECUTION-STANDBY)
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
session_name: [SESSION_NAME]
details:
  agent: '[Agent Name]'
  started_at: 'YYYY-MM-DDTHH:MM:SS'
  summary: 'Brief description of the session.'
  status: 'active'
goals:
- [GOAL_NAME_1]
- [GOAL_NAME_2]
```

### Goal File (`.runtime/.mission_board/[SESSION_NAME]/[GOAL_NAME]/[GOAL_NAME].yaml`)
```yaml
goal_name: [GOAL_NAME]
session: [SESSION_NAME]
details: 'Description of what this goal aims to achieve.'
status: "pending ⏳"
tasks:
- Task 1 to complete
- Task 2 to complete
tracking: 'Updates and notes on progress go here.'
artifacts: []
```

