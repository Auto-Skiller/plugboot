---
name: "format-output"
description: "Transform raw content or agent output into a polished, audience-appropriate format."
triggers: ["format", "present", "write for", "summarize for", "convert to", "make readable", "package output"]
version: "1.0"
maturity: "functional"   # stub | functional | hardened | battle-tested
inputs: ["raw content or findings", "target audience", "output format", "tone"]
outputs: ["formatted output", "structured data (YAML/JSON)", "executive summary", "markdown artifact"]
cataloger_lock: false
---

# Format Output

This skill allows the agent to transform any raw content, analysis result, or synthesis into a polished, audience-appropriate deliverable. It handles format conversion, tone calibration, and structure selection based on the consumer of the output.

## Steps

1. **Identify the target audience.** Who receives this output?
   - `Agent` → machine-readable YAML/JSON, strict schema
   - `Developer` → markdown with code blocks, technical precision
   - `Business stakeholder` → executive summary, plain language, key metrics first
   - `System file` → format dictated by the file's schema contract
2. **Select the output format.** Based on audience:
   - Structured data: YAML, JSON
   - Prose document: markdown with proper heading hierarchy
   - Tabular: markdown table or CSV
   - Briefing: numbered list of key points + recommendation
3. **Calibrate tone.**
   - `Technical` → precise, minimal prose, examples preferred
   - `Executive` → high-level, outcome-focused, no jargon
   - `Instructional` → step-by-step, imperative voice, clear prerequisites
4. **Apply format standards.**
   - Single H1 per document
   - Code blocks for all commands/code
   - Alerts/callouts for warnings
   - Tables for comparative data
5. **Write the formatted output.**
6. **Self-check.** Is the format correct for the audience? Is the tone consistent? Is all content accurate?
7. **Output** the final formatted artifact.

## Format Reference

| Audience | Preferred Format | Tone |
|---|---|---|
| Agent/System | YAML or JSON | Strict schema |
| Developer | Markdown + code blocks | Technical |
| Business/Exec | Prose + bullet summary | Plain, outcome-first |
| End User | Step-by-step tutorial | Instructional |
| Archive/Log | Markdown with metadata | Neutral, precise |

## Notes
- Never guess the audience — derive it from context or ask if unclear.
- Format conversion does not change content — if something is wrong in the raw input, fix it before formatting, not during.
- Pair with `validation` toolbox to verify structured output conforms to schema before delivery.
