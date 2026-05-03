## Orchestration & The Engine Substrate

The Agentic OS is built on a Substrate of specialized execution engines, state boards, and structural maps located in `.runtime/`. Every agent operation follows this sequence:

### The Engine-Driven Execution Flow

**Step 1 — Detect & Trigger**
The system monitors the consolidated state in `.runtime`. When a change is detected in `.runtime/**/missions`, the appropriate workflow is triggered.

**Step 2 — Load Global & Structural Context (The Senses)**
The triggered agent reads the OS rules and the structural maps from the registry sub-folders in `.runtime`. 
- It queries `.brain_registry` for OS rules.
- It loads structural codebase maps from `.runtime/**/registry`.

**Step 3 — Routing & Execution (The Muscles)**
Depending on the task type, execution is routed to specialized agents or skills:
- Engines in `.runtime` manage the operational logic.
- Specialized skills are invoked from `.library/`.

**Step 4 — Update & Transition (The Memory)**
Once the task completes, the agent updates the relevant mission board inside `.runtime`, completing the loop.

### Pipeline-Specific Orchestration
While this file defines the **Core OS Flow**, specialized pipelines have their own localized orchestration rules:
- For Hustler: Read `.brain/pipelines-brain/hustler_brain/`
- For Scaler: Read `.brain/pipelines-brain/scaler_brain/`

### Substrate Documentation
For deep-dives on how to interface with or modify any of the underlying engines, see the documentation in `.runtime/`.

