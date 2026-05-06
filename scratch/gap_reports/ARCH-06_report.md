# ARCH-06: Security & Constraint Enforcement Audit 🛡️

## Goal

Validate that mode strictness (e.g., STRICT vs AUTO) and permission boundaries are structurally enforced across the system.

## Findings

1. **Board Structure Discrepancy**: The `.brain/Modes.md` documentation mentions `sub_layer_control` for setting modes on sub-layers. However, `BOARD.yaml` currently uses `scope_modes` instead:

   ```yaml
   session_status:
     active_mode: "AUTO 🟢"
     active_sessions: []
     scope_modes:
       ".core": "AUTO 🟢"
       "pipelines/hustler": "STRICT 🔴"
       "pipelines/scaler": "STRICT 🔴"
       "projects": "STRICT 🔴"
   ```

   This mismatch means that the system's documented mode switching mechanism contradicts the actual implementation in Central Command. Agents looking for `sub_layer_control` will not find it, potentially breaking scope-specific mode enforcement.

2. **Absence of Strict Mode Check in Orchestration Flow**: The `.brain/Orchestration_And_Flow.md` and `.brain/Decision_Making.md` define execution behavior, but do not structurally enforce the mode bounds defined in `.brain/Modes.md`. For instance, in STRICT mode, an agent is not supposed to execute or edit without permission. This should be explicitly codified as a gate check.

3. **Absence of Action Constraint in Decision_Making.md**: `.brain/Decision_Making.md` defines how to handle missing information and conflict, but it doesn't clearly establish boundary enforcement based on execution modes when attempting to execute tasks.

## Proposed System-Level Code Fixes

1. **Update `.brain/Modes.md`**: Change the reference from `sub_layer_control` to `scope_modes` to align with the `BOARD.yaml` implementation.

   ```markdown
   <<<<<<< SEARCH
   **Mode Switching** — User changes `active_mode` in the root `BOARD.yaml`. Global modes (`FULL-`) take precedence over any individual settings in `sub_layer_control`.
   =======
   **Mode Switching** — User changes `active_mode` in the root `BOARD.yaml`. Global modes (`FULL-`) take precedence over any individual settings in `scope_modes`.
   >>>>>>> REPLACE
   ```

2. **Update `.brain/Orchestration_And_Flow.md`**: Add an explicit check in Step 9 (Execute) to enforce mode rules.

   ```markdown
   <<<<<<< SEARCH
   | **9. Execute** | `route{}` + context + mission | `result{}` | All `inputs` present before run. All `outputs` produced after run. | 🔄 RETRY (different approach). If 3 fails → block goal. |
   =======
   | **9. Execute** | `route{}` + context + mission | `result{}` | All `inputs` present before run. All `outputs` produced after run. **AND Mode allows execution (If STRICT/COLLAB, verify explicit user permission).** | 🔄 RETRY (different approach). If 3 fails → block goal. |
   >>>>>>> REPLACE
   ```

3. **Update `.brain/Decision_Making.md`**: Add an explicit section that defines that modes enforce boundaries on what actions can be taken.

   ```markdown
   <<<<<<< SEARCH
   ## When Information is Missing
   1. Check `BOARD.yaml` — current session source of truth (goals, mode, messages).
   =======
   ## Action Constraint Enforcement
   Before executing any write operations (file creation, modification, or deletion) or external commands, you MUST verify the active mode for the current scope.
   - **STRICT:** STOP. Present the exact proposed action to the user and WAIT for explicit approval.
   - **COLLAB:** Present intent to user, propose the exact action, ask for feedback/approval.
   - **AUTO:** Execute the action immediately, then log the result.

   ## When Information is Missing
   1. Check `BOARD.yaml` — current session source of truth (goals, mode, messages).
   >>>>>>> REPLACE
   ```
