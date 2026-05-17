# 🧬 Evolution Protocol

This protocol defines the recursive self-improvement cycle of the Agentic OS. It is triggered after every user interaction when `evolution_mode` is set to `EVOLVE`.

## The Evolution Loop

1. **Analyze interaction & Classify Intent:** Review the user's prompt and distinguish between:
    - **Logic Audit/Refactor:** Changing the underlying reasoning, rules, or behavior.
    - **Structural Change:** Moving files, renaming components, or reorganizing layouts without changing the logic.
2.  **The Evolution Check (MANDATORY):** For every task completed, the agent MUST ask itself:
    > *"Are there any things in the Meta Identity that should be added or updated based on those things we just did?"*
3. **Detect Logic Shifts:** Look for:
    - New preferences (e.g., "Always use X instead of Y").
    - New constraints (e.g., "Never edit Z without doing W first").
    - New patterns (e.g., "When processing A, follow these B steps").
    - Clarifications that invalidate previous assumptions.
3. **Target Selection:**
    - **System-wide logic:** Update `.meta_brain/meta_identity/*.md`.
    - **Workflow-specific logic:** Update relevant pipeline runbooks.
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

### 4. The Marker Preservation Law
During any logic refactor or structural evolution, the agent MUST preserve all permanent structural markers (e.g., `# section` and `# note` comments in `CONTROLER.yaml`). These markers are considered immutable scaffolding for the OS substrate and must never be deleted or altered unless explicitly commanded by the user for a system-wide structural migration.

### 5. The Proactivity Law (Strict Enforcement)
The agent is PROHIBITED from waiting for a user prompt to initiate an evolution. If a task results in a new structural pattern, a new logic preference, or a systemic refinement, the agent MUST proactively propose or apply updates to the `meta_identity` or relevant runbooks as part of the same turn. Failure to evolve the system's "DNA" alongside its "State" is a protocol violation.

### 6. The Anti-Recurrence Law (Gap Closing)
Whenever a task involves fixing a bug, solving a logical gap, or correcting a system failure, the agent MUST treat this as a high-priority evolution trigger. The agent MUST ask: *"How do I ensure this NEVER happens again?"* and immediately codify the preventive logic into the `meta_identity` or relevant runbooks. A "fix" is not complete until the system's DNA has been hardened against the recurrence of the issue.

### 7. The Fresh Start Law (Auto-Archive)
If a session is `completed` AND all goals are `done/archived`:
- The session folder is moved to `.milestones_archive/` with a timestamp.
- A `SESSION_ARCHIVED` event is appended to `milestones_history.yaml`.
This ensures a fresh start for new cycles while preserving history.

### 8. The Router Audit Law
When a user requests auditing a router, the agent MUST make sure to audit its protocols, instructions, and schemas contained in Part 1 and Part 2 of the YAML file, in addition to the python script in `.meta_engines/` and the data map itself. This ensures that the engine's logic aligns with the data it manages.

### 9. The All-in-One Validation Law
Every domain sync engine (python script) MUST handle its own validation by reading the schema defined in Part 2 of the YAML file. It must fail-fast (exit with a non-zero code) if any validation warnings are found. This ensures that data maps are always strictly valid before the system proceeds. **Additionally, string fields must not be empty. If an engine reports an empty field, the agent MUST fill it with appropriate content or a sensible default to heal the system.**

### 10. The Bidirectional Local Sync Law
Sync engines must not act purely as passive read-only indexes. When synchronizing domains that contain localized state manifests (such as a session's `SESSION.yaml`, a goal's `GOAL.yaml`, or a toolbox's `[toolbox_name].yaml`), the engine MUST compute metrics (e.g., progress, health, capabilities) and write those values back to the local YAML file to ensure perfect consistency between localized nodes and global indexes.

