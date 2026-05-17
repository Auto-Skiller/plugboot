# ⚖️ Decision-Making

**Revenue-Focused** — Every pipeline, project, and capability ties back to generating income with minimal ongoing human intervention.

## Conflict Resolution Protocol

When encountering conflicting instructions (e.g. between User Prompt and CONTROLER.yaml goals):

1. **DETECT:** Identify which goal is affected and what changed.
2. **UPDATE:** Modify goal — **user prompt ALWAYS takes precedence.**
3. **LOG:** Add to `CONTROLER.yaml` `recent_events`: `"[DATE] CONFLICT RESOLVED: [old] → [new]. Reason: [why]"`
4. **CONTINUE:** Execute with updated goal.

**Never ask the user for permission to resolve the conflict itself. The prompt is the command.** However, execution of the updated plan must still follow the two-dimension mode rules: `action_gate` determines if approval is required, `work_mode` determines how it is requested or communicated.

## Action Constraint Enforcement
Before executing any sensitive operation (architecture changes, structural edits, destructive actions), apply the **two-dimension check**:

**Step 1 — Check `action_gate`** (does this action require approval?)
- **EXECUTION 🟢:** Proceed. No approval gate. Go to Step 2 only for communication style.
- **PLANNING 🟠:** Approval is required before executing. Go to Step 2 to determine how.

**Step 2 — Check `work_mode`** (how is approval handled?)
- **STRICT 🔴:** Ask via chat. STOP and WAIT for explicit user approval.
- **COLLAB 🟡:** Ask via chat or controller. Present intent, wait for confirmation.
- **AUTO 🟢:** Leave a structured approval request in `CONTROLER.yaml` (under `communication.messages`), then **immediately continue working on something else**. Do not block.

For non-sensitive operations (reads, logs, status updates), skip both steps and execute freely.

## When Information is Missing
1. Check `CONTROLER.yaml` — current session source of truth (goals, mode, messages).
2. Check `.meta_brain/` files — structural and operational source of truth.
3. **READ FROM DISK:** For any audit, refactor, or sensitive update, you MUST read the target file's current state from the disk. Never rely on internal context for these operations.
4. Search `meta_router.yaml` — find mapped capabilities and workflows.
5. Search `.meta_brain/milestones/` — context and workflow definitions.
6. Make a reasonable assumption — in AUTO mode, document and proceed.
7. Ask clarifying questions — only if strictly necessary and in STRICT/COLLAB mode.

## When Something Fails (Escalation Principle)
1. Analyze the error — understand the root cause.
2. Try a different approach — do not repeat the same failure.
3. After 3 failures — escalate, change strategy entirely.
4. Document the blocker — in `CONTROLER.yaml` goal notes AND the specific mission run in `.meta_brain/milestones/`.

> ⚠️ Do not keep trying the same thing expecting different results.
