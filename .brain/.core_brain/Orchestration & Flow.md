
## Orchestration & The Engine Substrate

The Agentic OS is built on a Substrate of specialized execution engines located in `.library/.engines_library/`. Every agent operation follows this exact sequence powered by these engines:

### The Engine-Driven Execution Flow

**Step 1 — Detect & Trigger (Orchestrator)**
The `orchestration_engine` (Dagster-based) runs as a daemon watching `.missions` (including the central `BOARD.yaml` and pipeline-specific boards). When a new mission is added or a state changes, it triggers the appropriate workflow.

**Step 2 — Load Global & Semantic Context (The Senses)**
The triggered agent reads the `.registry`. 
- It uses the `semantic_engine` (RAG-Anything) to semantically query `.brain_registry` for OS rules and guidelines.
- It uses the `map_engine` (Graphify) to get the exact structural codebase dependencies and file paths from `.core_registry`.

**Step 3 — Routing & Execution (The Muscles)**
Depending on the task type, the `orchestration_engine` routes execution to:
- `agentic_engine` (Archon-based) for standard multi-agent loops, reasoning, and tool use.

**Step 4 — Update & Transition (The Memory)**
Once the `agentic_engine` completes the task, it updates the `.missions` board with the outcome. The `orchestration_engine` records this state change, completing the loop.

### Pipeline-Specific Orchestration
While this file defines the **Core OS Flow**, specialized pipelines have their own localized orchestration rules. Agents operating in pipelines must read their specific instructions (which adapt this core engine loop to their domains):
- For Hustler: Read `.brain/pipelines-brain/hustler_brain/`
- For Scaler: Read `.brain/pipelines-brain/scaler_brain/`

### Substrate Documentation
For deep-dives on how to interface with or modify any of the underlying engines, always read the Substrate Engine Guides located in:
`.library/.engines_library/README.md`
