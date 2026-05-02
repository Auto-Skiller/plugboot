
## Architecture

```
open-workspace/
├── .brain/                # IDENTITY & INSTRUCTIONS
│   ├── .core_brain/       # Always-On Identity (Persona, Global Rules)
│   ├── pipelines-brain/   # Pipelines Level Operating Logic
│   └── projects-brain/    # Projects Level Operating Logic
│
├── .library/              # CAPABILITIES (The Stack)
│   ├── .core_library/      # Always-On Capabilities (Analysis, Planning, etc.)
│   │   └── [department]-library/ # Specialized Domains Capabilities (Engineering, Business, etc.)
│   ├── .engines_library/ # The engines Execution Runtimes (Substrate)
│   ├── pipelines-library/ # Pipelines-specific Capabilities
│   └── projects-library/  # Projects-specific Capabilities
│
├── .missions/             # STATE & TRACKING (The Flow)
│   ├── .core_missions/    # Central Dashboard for core Workspaces Execution(Non-pipeline Non-projects tasks)
│   ├── pipelines-missions/# Tracking for pipelines Workspaces Execution
│   └── projects-missions/ # Tracking for projects Workspaces Execution
│
├── .registry/             # LOGIC & MAPS (The Map)
│   ├── .core_registry/    # Graph/Registry for core Workspaces
│   ├── .brain_registry/
│   ├── .library_registry/
│   ├── .missions_registry/
│   ├── pipelines-registry/# Internal Graph/RAG for pipelines Workspaces
│   └── projects-registry/ # Internal Graph/RAG for projects Workspaces
│
├── _pipelines/            # Pipeline Workspaces (Execution)
│   ├── hustler/           # Hustler Workspace
│   └── scaler/            # Scaler Workspace
└── _projects/             # Active Project Workspaces
```

### Core Philosophy
- Autonomous Goals-powered workspace for AI agents to amplify human vision.
- This workspace is designed for **autonomous operation**. Human operators set strategic direction via the `.missions` boards, while AI agents execute autonomously.

### The Four Pillars
The architecture separates Identity, Power, State, and Logic:

#### 🧠 IDENTITY (.brain)
- **Function:** Defines the tone, strategic constraints, and persona. The "Mind" of the system.

#### 📚 CAPABILITIES (.library)
- **Function:** Modular agents and skills. The "Muscles" of the system.

#### 📊 STATE (.missions)
- **Function:** Real-time tracking, mission boards, and progress ledgers. The "Memory" of the system.

#### 🕸️ LOGIC (.registry)
- **Function:** Graphs, manifests, and mapping. The "Senses" that connect Capabilities to Missions.

### Operational Flow
1. **Global Scan**: Agents always start by scanning `.brain\.core_brain` for root context.
2. **Path Discovery**: Agents use `.registry` to find the correct path through `.library`.
3. **Execution**: Relevant agents and skills are picked from the `.library`.
4. **Tracking**: Progress is recorded and monitored via `.missions`.


