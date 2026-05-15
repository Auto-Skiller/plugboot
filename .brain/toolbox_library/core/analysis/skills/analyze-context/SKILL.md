---
name: "analyze-context"
description: "Perceive and break down current state, context, user input, and data."
triggers: ["understand", "analyze", "assess", "breakdown", "review", "audit"]
version: "1.1"
maturity: "functional"   # stub | functional | hardened | battle-tested
inputs: ["current state", "context", "user input", "data"]
outputs: ["broken down context", "assessment", "identified constraints", "open questions"]
cataloger_lock: false
---

# Analyze Context

This skill allows the agent to perceive and break down the current state, context, user input, and data into a clear, structured assessment before taking any action.

## Steps

1. **Perform a fresh read.** Do NOT rely on cached context. Read the relevant files or inputs live from disk/user before proceeding.
2. **Identify the subject.** Determine what entity, system, or problem space is being analyzed.
3. **Map the components.** Break the input into its logical sub-parts (e.g., architecture layers, data fields, decision factors).
4. **Identify constraints & dependencies.** Note what is fixed, what is variable, and what other systems are affected.
5. **Surface open questions.** Flag any ambiguity that would block action and list them explicitly.
6. **Produce the assessment.** Output a structured summary with: Subject, Components, Constraints, Open Questions, Recommended Next Step.

## Output Format

```yaml
assessment:
  subject: "<what is being analyzed>"
  components:
    - "<component 1>"
    - "<component 2>"
  constraints:
    - "<constraint 1>"
  open_questions:
    - "<question 1>"
  recommended_next_step: "<single clear action>"
```

## Notes
- This skill is always the **first step** before any planning, execution, or refactoring task.
- If analyzing a file, invoke Zero-Drift Audit Law: read the file fresh before outputting any assessment.
- For documents > 100K tokens, escalate to the `notebooklm` toolbox.
