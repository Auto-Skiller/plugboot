## Orchestration & The Execution Flow

The Agentic OS follows a deterministic execution sequence. Every agent operation follows these steps:

### The Execution Flow

**Step 1 — State Check (The Memory)**
The agent reads the root `BOARD.yaml` to detect:
- Current `active_mode` (STRICT / COLLAB / AUTO)
- Active goals and priorities
- Unread messages in `communication.messages`

**Step 2 — Load Identity & Rules (The Mind)**
The agent reads `.brain/` files to load:
- Persona and behavioral rules (`Persona.md`, `Modes.md`, `Rules & Considerations.md`)
- Structural map of the workspace (`Core Architecture.md`)
- Domain-specific operating procedures

**Step 3 — Toolbox Navigation (The Senses)**
The agent consults `.brain/.toolbox.control/.toolbox.registry/` to:
- Map the active goal to the correct skill domain.
- Identify which toolbox folder(s) under `.toolbox/` to use.

**Step 4 — Routing & Execution (The Muscles)**
Depending on the task type, execution is routed to the correct toolbox:
- **Cognitive tasks** (planning, research, analysis) → `.toolbox/.agentic_toolbox/`
- **Business tasks** → `.toolbox/business_toolbox/[domain]/`
- **Technical tasks** → `.toolbox/engineering_toolbox/[domain]/`
- **Creative tasks** → `.toolbox/studio_toolbox/[domain]/`
- **Personal tasks** → `.toolbox/life_toolbox/[domain]/`

**Step 5 — Update & Transition (The Memory)**
Once the task completes, the agent immediately updates `BOARD.yaml`:
- Moves goals from `active_goals` to `completed_goals`
- Logs key decisions in `scratchpad` or `recent_events`
- Sends a message via `communication.messages` if needed

### Pipeline-Specific Orchestration
While this file defines the **Core OS Flow**, specialized pipelines operate in their own workspaces:
- **Hustler**: `_pipelines/hustler/` — discovery, validation, execution of revenue opportunities
- **Scaler**: `_pipelines/scaler/` — research, proposals, and scaling strategies

