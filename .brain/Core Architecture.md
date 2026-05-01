
## Architecture

```
open-workspace/
|
├── AGENTS.md              # Agent entry point — operational overview
├── BOARD.yaml             # Real-time session board: goals, mode, and comms (Master State)
├── INDEX.json             # Global library index: all Domains, Departments, and Structure
│
├── .brain/                # Global System Brain: system-level resource structure
│   ├── _context/          # The Worldview (Global facts, blueprints, reference data)
│   ├── _experience/       # The Laws & Lessons (Global constraints, learned rules)
│   ├── _playbooks/        # The Integrations (Global SOPs, execution flows)
│   └── _scripts/          # System Maintenance: index-sync.py
│
├── _departments/          # Cognitive Hubs: {domain}/{department}/
│   ├── {department}.md    # Agent Persona: Role, responsibilities, and resource map
│   ├── {department}.json  # Resource Index: All local files and sub-folders
│   ├── .brain/            # Local Brain: department-specific resource structure
│   │   ├── _context/
│   │   ├── _experience/
│   │   ├── _formats/      # The Boilerplates (standardized output templates)
│   │   ├── _playbooks/
│   │   ├── _tools/        # The Executables (automation logic, utility scripts)
│   │   └── _scripts/      # Local Maintenance: brain-sync.py
│   └── .../               # Optional specialized sub-skills
│
├── _core/                 # Standard operational phases (Research, Planning, etc.)
├── _tools/                # General utilities
├── custom_projects/       # Project-specific operations
└── AUTO_HUSTLER / SKILLER # Autonomous pipeline agents
```

### Core Philosophy
- Autonomous Goals-powered workspace for AI agents to amplify human vision so they can focus on strategy and direction.
- This workspace is designed for **autonomous operation**. Human operators set strategic direction and goals via [`BOARD.yaml`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/BOARD.yaml), while AI agents execute autonomously.

### The Triad: Identities, Resources, and Indices
The architecture separates Identity, Environment, and Management:

#### 🤖 AGENTS (Identity & Mindset)
- **Files:** `.md` files in `_departments/` (e.g., `devops.md`).
- **Function:** They define the tone, strategic constraints, and role. The Agent is the **Chef** — they have the expertise but need a kitchen.

#### 📚 RESOURCES (Environment & Context)
- **Folders:** The foundational `_` folders inside `.brain/` directories.
- **Function:** Persistent memory and environmental context. Exists globally (root `.brain/`) and locally (department `.brain/`). These are the **Kitchen and Ingredients**.

#### 📂 INDICES (State & Management)
- **Files:** [`INDEX.json`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/INDEX.json) and `{department}.json`.
- **Function:** Automated maps that tell agents where everything is. These are the **Kitchen Inventory**.

### Indexing System
An automated indexing system tracks all contents using a unified [`INDEX.json`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/INDEX.json) and local `{department}.json` files. 

**Maintenance Commands:**
- **Full Workspace**: `python .brain\_scripts\index-sync.py`
- **Local Brain**: `python .brain\_scripts\brain-sync.py` (within a specific agent/project folder)

Regenerate indexes after any structural change — never edit JSON maps manually.

