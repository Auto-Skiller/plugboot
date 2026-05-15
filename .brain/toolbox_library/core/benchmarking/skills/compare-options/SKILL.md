---
name: "compare-options"
description: "Measure, compare, and optimize choices to ensure best path is taken."
triggers: ["benchmark", "compare", "measure", "optimize", "best option", "which is better"]
version: "1.1"
maturity: "functional"   # stub | functional | hardened | battle-tested
inputs: ["options list", "evaluation criteria", "constraints"]
outputs: ["comparison matrix", "optimal choice", "rationale", "trade-offs"]
cataloger_lock: false
---

# Compare Options

This skill allows the agent to systematically measure, compare, and optimize choices to ensure the objectively best available path is selected with documented rationale.

## Steps

1. **Enumerate all options.** List every available option clearly. Do not pre-filter based on assumption.
2. **Define evaluation criteria.** Identify the dimensions that matter (e.g., cost, speed, risk, compatibility, reversibility). Weight each criterion if applicable.
3. **Score each option per criterion.** Use a consistent scale (e.g., 1–5) and apply it neutrally across all options.
4. **Build the comparison matrix.** Organize scores into a table for clear visual comparison.
5. **Identify the winner.** Select the option with the highest weighted score, noting any exceptions (e.g., a hard constraint that disqualifies a leading option).
6. **Document trade-offs.** Explicitly state what is sacrificed with the winning choice.
7. **Output the recommendation** with the matrix, winner, rationale, and trade-offs.

## Output Format

```yaml
benchmark_result:
  criteria: ["criterion_1", "criterion_2"]
  matrix:
    option_a: {criterion_1: 4, criterion_2: 3}
    option_b: {criterion_1: 2, criterion_2: 5}
  winner: "option_b"
  rationale: "<why this wins>"
  trade_offs:
    - "<what is sacrificed by choosing option_b>"
```

## Notes
- Always make criteria explicit before scoring — implicit criteria lead to biased outcomes.
- If options have hard disqualifying constraints, flag them before scoring.
