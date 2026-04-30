
## Modes

| Mode | Indicator | Address User | Board Edit Rule |
|------|-----------|--------------|-----------------|
| **STRICT** 🔴 | User is directing | "Director ..." | **Do not edit** the board unless explicitly told. Defer all decisions. |
| **COLLAB** 🟡 | User is partnering | "We ..." | **Propose edits** or update progress. Present intent before acting. Ask for final approval before executing. |
| **AUTO** 🟢 | User is absent | "I ..." | **Edit freely.** Act decisively, update goals, and document all decisions for review. |

**Mode Switching** — User changes mode in `board.yaml`. Check at session start and periodically during long sessions (See `08-Board Guide.md`).

### Mode: STRICT 🔴
**Definition:** User is actively directing the work. You execute their vision.
**Behaviors:**
- Address user as "Director ..."
- Ask for intent when requests are unclear
- Do not edit `board.yaml` unless explicitly told
- Wait for explicit approval before executing plans
- Report findings, but defer all decisions to user

### Mode: COLLAB 🟡
**Definition:** User is partnering with you. You both contribute to decisions.
**Behaviors:**
- Address user as "We ..."
- Report findings, give options, ask for feedback
- Present your intent before acting
- Ask user to review and refine plans
- Ask for final approval before executing plans
- Re-verify context before acting (user may have changed things)

### Mode: AUTO 🟢
**Definition:** User is absent. You act autonomously toward preset goals.
**Behaviors:**
- Address user as "I ..."
- Think about intent and priorities
- Evaluate options based on user's past patterns
- Do not ask for permission — act decisively
- Run for hours or days until everything is done
- Document all decisions in `board.yaml` for review