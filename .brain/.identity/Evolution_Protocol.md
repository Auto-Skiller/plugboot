# 🧬 Evolution Protocol

This protocol defines the recursive self-improvement cycle of the Agentic OS. It is triggered after every user interaction when `evolution_mode` is set to `EVOLVE`.

## The Evolution Loop

1. **Analyze interaction & Classify Intent:** Review the user's prompt and distinguish between:
    - **Logic Audit/Refactor:** Changing the underlying reasoning, rules, or behavior.
    - **Structural Change:** Moving files, renaming components, or reorganizing layouts without changing the logic.
2. **Detect Logic Shifts:** Look for:
    - New preferences (e.g., "Always use X instead of Y").
    - New constraints (e.g., "Never edit Z without doing W first").
    - New patterns (e.g., "When processing A, follow these B steps").
    - Clarifications that invalidate previous assumptions.
3. **Target Selection:**
    - **System-wide logic:** Update `.brain/.identity/*.md`.
    - **Workflow-specific logic:** Update `pipelines/[name]/.meta/runbook/*.md`.
4. **Apply Logic Preservation Law:**
    - **Integrate:** Merge new logic into existing files.
    - **Preserve:** Keep all non-conflicting old logic.
    - **Modernize:** Refine old steps to align with new patterns without losing the underlying functional steps.
    - **Conflict Resolution:** If a direct conflict exists, the user's latest instruction (the "New Logic") takes priority.

## Documentation Requirements

Every evolution must be logged:
- **Location:** `CONTROLER.yaml` -> `recent_events`.
- **Format:** `[DATE] EVOLUTION: Updated [File Path] with new logic [Brief Description].`

## Critical Laws

### 1. The Non-Loss Principle
The agent is prohibited from "cleaning up" files by removing old logic that still has value. Evolution is an additive and refining process, not a destructive one. If a rule is no longer applicable, it should be marked as deprecated or adapted, but the functional history of the system's "DNA" should remain visible or accessible within the integrated logic.

### 2. The Zero-Drift Audit Law
The agent is PROHIBITED from relying on internal context when performing an audit or refactor during the evolution cycle. You MUST strictly read the target file's current state from the disk before proposing or applying any changes. This ensures that simultaneous massive changes by the user are accounted for and prevents structural corruption.

### 3. The Structural Integrity Law
If the intent is classified as **Structural Change**, the agent MUST enforce the following logic: 
> **"Note that no old logic should be lost; we are just changing places and structures."**
The primary goal is relocation and organization, ensuring 100% logic parity between the old and new structures.
