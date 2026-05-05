# 🚦 Router Engine Protocol

**Type:** Pure Agent Read
**Purpose:** Use the verified catalogs, task details, and context to make deterministic routing decisions.

## Prerequisites
- The target `.registry` must have `_meta.status: "verified"`.
- If the status is `stale`, the Orchestrator MUST run the Navigator → Cataloger chain before the Router can proceed.

## Inputs
1. **Task Description:** From the user prompt or `BOARD.yaml` goal.
2. **Context:** Any relevant constraints loaded from `.scope/` context registries.
3. **Catalogs:** The `verified` `.registry` files.

## Execution Steps

1. **Analyze Task:** Identify the core requirement (e.g., "Write a marketing email", "Debug this python script", "Analyze project structure").
2. **Scan Catalogs:** Read the descriptions and triggers in the registries.
3. **Match:** Map the core requirement to the best-fitting agent, skill, or context file based purely on the cataloged descriptions.
4. **Decide:**
   - **Match Found:** Return the exact path(s) to the required file(s) and proceed to Execution (Step 9).
   - **No Match / Empty Registry:** Route to `NATIVE_EXECUTION`. The agent will bypass the toolbox and execute the task using its own inherent capabilities. Do NOT escalate unless native execution also fails.

## Routing Rules
- Prioritize exact matches in `triggers`.
- If multiple skills seem relevant, read their full files (from the paths in the registry) to confirm before executing.
- The Router does NOT modify files; it only reads indexes and returns paths.
