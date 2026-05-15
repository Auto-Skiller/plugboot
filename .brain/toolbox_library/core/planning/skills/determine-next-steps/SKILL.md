---
name: "determine-next-steps"
description: "Determine and structure the immediate next steps before taking any action toward a goal."
triggers: ["plan", "roadmap", "next steps", "strategy", "how to", "approach", "what should I do"]
version: "1.1"
maturity: "functional"   # stub | functional | hardened | battle-tested
inputs: ["current state", "goal", "constraints", "action_gate mode"]
outputs: ["ordered action plan", "dependency map", "risk flags", "checkpoint list"]
cataloger_lock: false
---

# Determine Next Steps

This skill allows the agent to determine and structure the immediate next steps before executing anything. It ensures actions are ordered by dependency, gated by the current `action_gate` mode, and flagged for risks before execution begins.

## Steps

1. **Read current state fresh.** Apply Zero-Drift Audit Law — read `CONTROLER.yaml` and any relevant session/goal files live before planning.
2. **Clarify the goal.** State the objective in one sentence. If the goal is vague, apply `analyze-context` first to sharpen it.
3. **Check the action_gate.** Read the `action_gate` from `CONTROLER.yaml`:
   - `PLANNING` → produce the plan only, do NOT execute.
   - `EXECUTION` → produce the plan AND proceed to execute step 1 immediately.
4. **Map dependencies.** List what must be true or done BEFORE each step can start. Draw a simple dependency order.
5. **Order actions by dependency.** Steps that unblock others come first. Parallelizable steps are noted explicitly.
6. **Identify checkpoints.** Define verification points — moments where the agent must confirm state before proceeding.
7. **Flag risks.** Note any step that is irreversible, destructive, or uncertain. These become hard gates requiring confirmation.
8. **Output** the structured plan.

## Output Format

```yaml
action_plan:
  goal: "<single sentence goal>"
  action_gate: "PLANNING | EXECUTION"
  steps:
    - id: 1
      action: "<what to do>"
      depends_on: []
      reversible: true | false
      checkpoint: false
    - id: 2
      action: "<what to do>"
      depends_on: [1]
      reversible: false
      checkpoint: true   # Must verify before proceeding
  risk_flags:
    - step: 2
      risk: "<description>"
      mitigation: "<what to do if it fails>"
```

## Notes
- Never skip dependency mapping — executing steps out of order causes cascading failures.
- In `PLANNING` mode, this skill is the final output. Do not proceed to execution.
- In `EXECUTION` mode, return to `assess-quality` after each checkpoint step.
