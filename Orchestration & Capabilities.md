- Read `index.yaml` at session start to identify the necessary agents and skills for the current task.

defines the **Operational Phases** of the Auto-Skiller workspace. It guides the orchestration of agents and skills from ideation to revenue.


## 3. Orchestration Protocol

1. **Detect Current Phase**: Use `board.yaml` or session context to identify the active phase.
2. **Consult Index**: Cross-reference the phase number with `index.yaml` to identify the required Department.
3. **Load Department Guide**: Open `skills/{domain}/{dept}/{dept}.yaml` to load resources and skills.
4. **Execute & Transition**: Complete the goal and update the status in `board.yaml` for the next transition.