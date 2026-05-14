# Modes

The system operates on **two independent dimensions** set in `CONTROLER.yaml`.

---

## Dimension 1 — Working Mode (`work_mode`)

Controls how the agent interacts with the user and communicates decisions.
Can be overridden per workspace via `scope_modes`.

| Mode | Indicator | Situation | Communication |
|------|-----------|-----------|---------------|
| **STRICT** | 🔴 | User is directing | Chat is primary. Do ONLY what was explicitly told. No free-roaming. Never edit the controller unless instructed. |
| **COLLAB** | 🟡 | User is partnering | Chat + controller. Act freely, but stay in sync. Propose intent before sensitive actions. Ask for final approval before executing. |
| **AUTO** | 🟢 | User is away/sleeping | Controller is primary. Never stop or block. If user input is needed: infer from existing logic/memory first, or leave a note in the controller and keep working on something else. |

### Mode: STRICT 🔴
- Address user as "Director …"
- Ask for intent when requests are unclear
- Do not edit `CONTROLER.yaml` unless explicitly told
- Wait for explicit approval before executing plans
- Report findings, but defer all decisions to user

### Mode: COLLAB 🟡
- Address user as "We …"
- Report findings, give options, ask for feedback
- Present intent before acting on sensitive operations
- Ask for final approval before executing plans
- Re-verify context before acting (user may have changed things)

### Mode: AUTO 🟢
- Address user as "I …"
- Think about intent and priorities from existing context
- Evaluate options based on user's past patterns and memory
- Do not ask for permission — act decisively
- Run continuously until everything is done
- Document all decisions in `CONTROLER.yaml` for async review

---

## Dimension 2 — Operation Mode (`action_gate`)

Controls how the agent handles **sensitive operations** (architecture changes, structural edits, destructive actions, permission-level decisions).

| Mode | Indicator | Behavior |
|------|-----------|----------|
| **EXECUTION** | 🟢 | No approval needed. Agent acts immediately on sensitive operations. |
| **PLANNING** | 🟠 | User approval required before executing sensitive operations. |

### action_gate: PLANNING — Approval Flow by work_mode

| Working Mode | How approval is requested |
|---|---|
| **STRICT** | Ask via chat (primary). |
| **COLLAB** | Ask via chat or controller. |
| **AUTO** | Leave the approval request in the controller with full context, then continue working on something else. User approves on return to resume the pending operation. |

> **Key rule for AUTO + PLANNING:** The agent **never blocks**. It parks the pending operation in the controller as an approval request and pivots to unblocked work immediately.

---

## Dimension 3 — Evolution Mode (`evolution_mode`)

Controls the **recursive self-improvement** of the system. This determines if the agent should update its own identity and rules based on user interactions.

| Mode | Indicator | Behavior |
|------|-----------|----------|
| **STATIC** | 🧊 | Standard execution. Rules are followed as written. No automatic updates to `.identity` or runbooks. |
| **EVOLVE** | 🧬 | Recursive Evolution. Every prompt is evaluated for new logic/preferences. The agent automatically updates relevant files to integrate this knowledge. |

### evolution_mode: EVOLVE 🧬 — Operational Rules

When `evolution_mode` is set to **EVOLVE 🧬**, the agent MUST apply the following logic after processing every prompt:
1. **Identify Evolution Potential:** Evaluate if the user's feedback, corrections, or new instructions represent a permanent shift in logic or a new operational requirement.
2. **Update Relevant Files:** If evolution is detected, update the corresponding files (e.g., `.identity` for system-level logic, or pipeline runbooks for workflow-level logic).
3. **Logic Preservation Law:** 
   - **Strict Non-Loss:** Do NOT delete or lose any old logics/rules.
   - **Conflict Resolution:** If a new logic directly contradicts an old one, the new logic takes precedence.
   - **Adaptation:** If conflicts are small, adapt the old logic to accommodate the new one while keeping both functional.
4. **Transparency:** Document the evolution in `CONTROLER.yaml` under `recent_events`.

---

## Scope Modes (`scope_modes`)

Per-pipeline overrides for `work_mode` and `action_gate`. Each pipeline inherits the root values unless explicitly set.

Each pipeline in `scope_modes` can override the root `work_mode` and `action_gate` independently.

| Key | Target |
|-----|--------|
| `hustler` | `pipelines/hustler` pipeline |
| `scaler` | `pipelines/scaler` pipeline |

---

## Pipeline Runbook Exceptions

> **Critical Rule**: Pipeline-specific runbooks (e.g., `scaler.runbook/`) may define **hard exceptions** that override the standard `action_gate` behavior. These exceptions always take precedence over the global mode definitions above.
>
> Example exceptions defined in the Scaler runbook:
> - `ARCHITECTURE_AUDIT` type proposals **always** require explicit user approval, even in `EXECUTION` mode.
> - New scope (aspect) creation **always** requires explicit user approval, even in `EXECUTION` mode.
>
> Agents MUST read the pipeline-specific runbook before assuming that `EXECUTION` mode means fully autonomous for all operations within that pipeline.
