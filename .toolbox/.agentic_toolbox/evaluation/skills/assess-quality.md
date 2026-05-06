---
name: "assess-quality"
description: "Assess outcomes and quality of executed steps."
triggers: ["evaluate", "assess quality", "does it work", "test", "validate result", "review output"]
version: "1.0"
inputs: ["execution output", "expected results"]
outputs: ["quality assessment", "feedback"]
cataloger_lock: false
---

# Assess Quality

This skill allows the agent to assess the outcomes and quality of executed steps.

## Steps

1. Gather the execution output.
2. Compare the output against expected results.
3. Identify discrepancies or areas for improvement.
4. Output a quality assessment and actionable feedback.
