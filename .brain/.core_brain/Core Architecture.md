
## Architecture

```
open-workspace/
├── .brain/                # IDENTITY & INSTRUCTIONS
│   ├── .core_brain/       # Always-On Identity (Persona, Global Rules)
│   ├── pipelines-brain/   # Pipelines Level Operating Logic
│   └── projects-brain/    # Projects Level Operating Logic
│
├── .library/              # CAPABILITIES (The Stack)
│   ├── .core_library/     # Always-On Capabilities (Analysis, Planning, etc.)
│   ├── .departements_libary/ # Specialized Domains (business, engineering, etc.)
│   ├── pipelines-library/ # Pipelines-specific Capabilities
│   └── projects-library/  # Projects-specific Capabilities
│
├── .runtime/              # ENGINES, STATE & LOGIC (The Substrate)
│   ├── .core_runtime/     # Core OS State and Logic
│   │   ├── .core_missions/# Central Dashboard (core_missions.yaml)
│   │   └── .core_registry/# Global Structural Maps
│   ├── pipelines_runtime/ # Pipeline-specific State and Logic
│   │   ├── .pipeline-missions/
│   │   └── .pipelines-registry/
│   └── projects_runtime/  # Project-specific State and Logic
│       ├── .projects-missions/
│       └── .projects-registry/
│
├── _pipelines/            # Pipeline Workspaces (Execution)
│   ├── hustler/           # Hustler Workspace
│   └── scaler/            # Scaler Workspace
├── _projects/             # Active Project Workspaces
├── archive/               # Archived missions and data
├── scratch/               # Temporary workspace for experiments
```

### Core Philosophy
- Autonomous Goals-powered workspace for AI agents to amplify human vision.
- This workspace is designed for **autonomous operation**. The **.runtime** acts as the deterministic engine that manages state and logic, while **.brain** provides the strategic intent.

### The Three Pillars
The architecture separates Identity, Capability, and Substrate (Runtime):

#### 🧠 IDENTITY (.brain)
- **Function:** Defines the tone, strategic constraints, and persona. The "Mind" of the system.

#### 📚 CAPABILITIES (.library)
- **Function:** Modular agents and skills. The "Muscles" of the system.

#### ⚙️ SUBSTRATE (.runtime)
- **Function:** Consolidates **State** (Missions) and **Logic** (Registry). The "Nervous System" that manages real-time tracking, maps, and engine execution.

### Operational Flow
1. **Global Scan**: Agents always start by scanning `.brain\.core_brain` for root context.
2. **Context Loading**: Agents load the state from `.runtime/*/missions` and logic from `.runtime/*/registry`.
3. **Execution**: Relevant agents and skills are picked from the `.library`.
4. **State Transition**: Progress is recorded back into the `.runtime` mission boards.


