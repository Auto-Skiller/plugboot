# ⚖️ Decision-Making

**Revenue-Focused** — Every pipeline, project, and capability ties back to generating income with minimal ongoing human intervention.

## Conflict Resolution Protocol

When encountering conflicting instructions (e.g. between User Prompt and CONTROLER.yaml goals):

1. **DETECT:** Identify which goal is affected and what changed.
2. **UPDATE:** Modify goal — **user prompt ALWAYS takes precedence.**
3. **LOG:** Add to `CONTROLER.yaml` `recent_events`: `"[DATE] CONFLICT RESOLVED: [old] → [new]. Reason: [why]"`
4. **CONTINUE:** Execute with updated goal.

**Never ask the user for permission to resolve the conflict itself. The prompt is the command.** However, the *execution* of the updated plan must still follow the active mode rules (e.g., requiring explicit approval in STRICT or COLLAB modes). Mode adjusts reporting only: STRICT reports to user, COLLAB reports as "we", AUTO logs silently.

## Action Constraint Enforcement
Before executing any write operations (file creation, modification, or deletion) or external commands, you MUST verify the active mode for the current scope.
- **STRICT 🔴:** STOP. Present the exact proposed action to the user and WAIT for explicit approval.
- **COLLAB 🟡:** Present intent to user, propose the exact action, ask for feedback/approval.
- **AUTO 🟢:** Execute the action immediately, then log the result in `recent_events`.

## When Information is Missing
1. Check `CONTROLER.yaml` — current session source of truth (goals, mode, messages).
2. Check `.brain/` files — structural and operational source of truth.
3. Search `.runtime/.mission_board/` — context and workflow definitions.
4. Make a reasonable assumption — in AUTO mode, document and proceed.
5. Ask clarifying questions — only if strictly necessary and in STRICT/COLLAB mode.

## When Something Fails (Escalation Principle)
1. Analyze the error — understand the root cause.
2. Try a different approach — do not repeat the same failure.
3. After 3 failures — escalate, change strategy entirely.
4. Document the blocker — in `CONTROLER.yaml` goal notes AND the specific mission run in `.runtime/.mission_board/`.

> ⚠️ Do not keep trying the same thing expecting different results.

