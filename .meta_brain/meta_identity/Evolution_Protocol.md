# 🧬 Evolution Protocol

**Purpose:** Defines the recursive self-improvement cycle: when to evolve, what to evolve, and the laws (non-loss, zero-drift, marker-preservation, anti-recurrence, etc.) that govern every change.
**When to use:** Consult after every user interaction in `evolution_mode: EVOLVE`, after any bug fix or gap closure, and whenever proposing changes to `meta_identity/` or pipeline runbooks.

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
The agent is PROHIBITED from waiting for a user prompt to initiate an evolution. If a task results in a new structural pattern, a new logic preference, or a systemic refinement, the agent MUST proactively record an evolution proposal as part of the same turn.

**The proposal goes into `pending_evolutions.yaml` at the workspace root** under the `pending` list. The file lives at root because it's a peer first-class system-state mailbox — both substrate agents and Scaler (internal/external) read and write to it via the bidirectional trigger relationship. Same shape as `CONTROLER.yaml`. The reviewer (user or next session) accepts, rejects, or supersedes proposals. Direct edits to identity files for non-urgent evolutions are discouraged — use the queue so the audit trail stays intact and conflicts surface before they land.

**Atomic-append contract (multi-session safety).** Two parallel agents queueing proposals at the same time would clobber each other if they used naive read → mutate → write. Append MUST go through `_shared/state_helpers.append_pending_evolution(proposal)`, which:
1. Acquires the master sync lock (`SYNC_LOCK_PATH`) with the standard `sync_lock_timeout_seconds` budget — or skips re-acquisition when `META_SYNC_LOCK_HELD=1` indicates the master is already holding it.
2. Reads the current queue with `load_yaml`.
3. Mutates the local `pending` list.
4. Writes back via `atomic_write_yaml` (tmp file + `os.replace`).
5. Releases the lock.

Hand-rolled append code is forbidden (would silently break the contract). The full multi-session safety model is documented in `Concurrency_Model.md`.

Failure to evolve the system's "DNA" alongside its "State" — by either applying the change or queueing a proposal — is a protocol violation.

### 6. The Anti-Recurrence Law (Gap Closing)
Whenever a task involves fixing a bug, solving a logical gap, or correcting a system failure, the agent MUST treat this as a high-priority evolution trigger. The agent MUST ask: *"How do I ensure this NEVER happens again?"* and immediately codify the preventive logic into the `meta_identity` or relevant runbooks. A "fix" is not complete until the system's DNA has been hardened against the recurrence of the issue.

The full audit contract for any "look for gaps" task — at the meta layer or inside any pipeline — is:
1. **Look at everything related.** Read every file, router, ledger, sync engine, identity doc, and CONTROLER field that touches the target. No partial scans, no assuming a gap is contained.
2. **Find gaps and enhancement opportunities together.** Don't stop at the visible defect; surface adjacent improvements that share the same root cause.
3. **Identify the cause, not just the symptom.** For each gap, name the underlying mechanism that produced it (drift in a hand-edited field, missing schema, race condition, dead path, hardcoded value, doc/code disagreement). The fix MUST address the cause so the same class of gap cannot recur.
4. **Verify everything is correctly linked end-to-end.** After the fix lands, every cross-reference (router → disk, doc → code, schema → data) MUST resolve cleanly with zero orphan paths and zero schema drift. Run `meta_sync.py --validate` — 0 warnings, 0 errors.
5. **Prove multi-session safety.** The fix MUST hold under multi-hour autonomous operation with multiple agents running in parallel. Anything that depends on agent memory, sequential ordering, or non-atomic writes is not done.

### 7. The Fresh Start Law (Auto-Archive)
If a session is `completed` AND all goals are `done/archived`:
- The session folder is moved to `.milestones_archive/` with a timestamp.
- A `SESSION_ARCHIVED` event is appended to `milestones_history.yaml`.
This ensures a fresh start for new cycles while preserving history.

### 8. The Router Audit Law
When a user requests auditing a router, the agent MUST audit its protocols, instructions, and schemas contained in Part 1 and Part 2 of the YAML file, in addition to the python script in `.meta_routing/meta_sync_engines/` and the data map itself. This ensures that the engine's logic aligns with the data it manages.

### 9. The All-in-One Validation Law
Every domain sync engine (python script) MUST handle its own validation by reading the schema defined in Part 2 of the YAML file. It must fail-fast (exit with a non-zero code) if any validation warnings are found. This ensures that data maps are always strictly valid before the system proceeds. **Additionally, string fields must not be empty. If an engine reports an empty field, the agent MUST fill it with appropriate content or a sensible default to heal the system.**

### 10. The Bidirectional Local Sync Law
Sync engines must not act purely as passive read-only indexes. When synchronizing domains that contain localized state manifests (such as a session's `SESSION.yaml`, a goal's `GOAL.yaml`, or a toolbox's `[toolbox_name].yaml`), the engine MUST compute metrics (e.g., progress, health, capabilities) and write those values back to the local YAML file to ensure perfect consistency between localized nodes and global indexes.

### 11. The Multi-Session Concurrency Law
Under multi-hour autonomous operation, more than one agent may trigger the master sync at overlapping times. To prevent state corruption:
- **Lock before mutate.** The master sync acquires an advisory file lock at `.meta_brain/.meta_routing/.sync.lock` before running. Concurrent agents wait or back off — they never run two re-assemblies in parallel.
- **Atomic writes only.** All YAML writes use the shared `atomic_io.atomic_write_yaml` helper (tmp file + `os.replace`). A killed or crashed sync can never leave a half-written router.
- **Multi-session linkage.** Pipeline state files MUST track sessions in an `active_sessions: []` list, not a singular `active_session` field. Singular fields are kept only as a backwards-compatibility mirror of the first entry. Engines that resolve "the active session" must continue to find ALL matches, not the first.

### 12. The Vocabulary Discipline Law
Every status string an engine writes back to disk MUST be a member of the vocabulary declared in the corresponding router schema (`milestones.yaml#session_schema` and `#goal_schema`). Persistence-exhausted sessions go to `paused` with `metadata.persistence.exhausted: true`, never an out-of-vocabulary value like `pended`. If an engine ever needs a state outside the vocabulary, the schema MUST be amended first.

### 13. The Auto-Promotion Law
A session whose every goal is `done` or `archived` MUST be auto-promoted by the milestones engine to `metadata.status: completed`. Manual promotion was the prior contract; agents forgot it routinely, and `should_auto_archive` would never fire. The engine now does this on every cycle, eliminating the human-memory dependency entirely.

### 14. The Progress Provenance Law
Stale-pending detection MUST use a stamped `execution.state.last_progress_at` timestamp that updates ONLY when actual progress changes. File mtime is a lossy proxy because the engine itself rewrites the goal file every cycle, masking real staleness.

